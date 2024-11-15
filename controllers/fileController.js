const {
  s3Upload,
  s3Delete,
  generateS3PreSignedUrl
} = require('../controllers/s3ClientController')
const mongoose = require('mongoose')
const File = require('../models/fileModel')
const Record = require('../models/recordModel')
const FileTemplate = require('../models/fileTemplateModel')
const COMMON_MSG = require('../utils/errorMsg')
const pdf = require('pdf-parse')
const {
  emptyFields,
  validArrays,
  validFields,
  validMongoId,
  validField
} = require('../utils/fieldCheckers')
const {
  checkExistenceName,
  checkExistenceId,
  checkDoctor,
  checkExistingField,
  doctorActive
} = require('../utils/requestCheckers')

exports.createFile = async (req, res) => {
  const { metadata } = req.body
  const uploadfile = req.file
  let parsedMetadata

  if (!uploadfile || !uploadfile.buffer) {
    return res.status(400).send({
      status: 400,
      message: COMMON_MSG.MISSING_FIELDS
    })
  }

  try {
    parsedMetadata = JSON.parse(metadata)
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid metadata format. Please provide valid JSON.'
    })
  }

  try {
    const { doctorId, recordId, templateId, name, category, fields } =
      parsedMetadata

    if (
      !doctorId ||
      !recordId ||
      !templateId ||
      !name ||
      !category ||
      !fields
    ) {
      return res.status(400).send({
        status: 400,
        message: COMMON_MSG.MISSING_FIELDS
      })
    }

    if (
      !mongoose.Types.ObjectId.isValid(recordId) ||
      !mongoose.Types.ObjectId.isValid(templateId)
    ) {
      return res.status(400).send({
        status: 400,
        message: COMMON_MSG.INVALID_ID_FORMAT
      })
    }

    const fileTemplate = await FileTemplate.findById(templateId)
    if (!fileTemplate) {
      return res.status(404).send({
        status: 404,
        message: COMMON_MSG.TEMPLATE_NOT_FOUND
      })
    }

    const record = await Record.findById(recordId)
    if (!record) {
      return res.status(404).send({
        status: 404,
        message: COMMON_MSG.RECORD_NOT_FOUND
      })
    }

    if (
      fileTemplate.doctor.toString() !== doctorId ||
      record.doctor.toString() !== doctorId
    ) {
      return res.status(403).send({
        status: 403,
        message: COMMON_MSG.DOCTOR_IS_NOT_OWNER
      })
    }

    const templateFieldsMap = {}
    for (const field of fileTemplate.fields) {
      templateFieldsMap[field.name] = field
    }

    const metadataArray = []
    for (const field of fields) {
      const templateField = templateFieldsMap[field.name]
      if (!templateField) {
        return res.status(400).send({
          status: 400,
          message: `Field "${field.name}" not found in template.`
        })
      }
      const metadataField = {
        name: field.name,
        type: templateField.type,
        options: templateField.options || [],
        value: field.value,
        required: templateField.required
      }
      metadataArray.push(metadataField)
    }

    let numberOfPages = 0
    if (uploadfile.mimetype === 'application/pdf') {
      try {
        const data = await pdf(uploadfile.buffer)
        numberOfPages = data.numpages
      } catch (error) {
        return res.status(400).send({
          status: 400,
          message: 'Unable to read PDF pages.'
        })
      }
    }

    const timestamp = Date.now()
    const key = `${doctorId}/${recordId}/${timestamp}-${uploadfile.originalname}`
    const s3Response = await s3Upload(key, uploadfile.buffer)
    const location = s3Response.Location.split('.com/')[1]

    const fileData = {
      record: new mongoose.Types.ObjectId(recordId),
      template: new mongoose.Types.ObjectId(templateId),
      name,
      category,
      location,
      pages: numberOfPages,
      created_at: new Date(),
      metadata: metadataArray
    }

    const file = new File(fileData)
    await file.save()

    return res.status(201).send({
      status: 201,
      message: COMMON_MSG.REQUEST_SUCCESS,
      fileId: file._id
    })
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: error.message
    })
  }
}

exports.updateFile = async (req, res) => {
  const { doctorId, fileId, name, category, fields } = req.body

  try {
    // 400 : check if is not missing data.
    if (!emptyFields(res, doctorId, fileId, name, category, fields)) return
    if (!validMongoId(res, doctorId, COMMON_MSG.INVALID_DOCTOR_ID)) return
    if (!validMongoId(res, fileId, COMMON_MSG.INVALID_FILE_ID)) return
    if (!validFields(res, fields)) return

    // 404 : check if doctor and file exist
    const [isDoctorActive, fileExist] = await Promise.all([
      doctorActive(res, doctorId),
      checkExistenceId(res, File, fileId, COMMON_MSG.FILE_NOT_FOUND)
    ])

    if (!isDoctorActive) {
      res
        .status(404)
        .send({ status: 404, message: COMMON_MSG.DOCTOR_NOT_FOUND })
      return
    }
    if (!fileExist) {
      res.status(404).send({ status: 404, message: COMMON_MSG.FILE_NOT_FOUND })
      return
    }

    // 403 : Check if doctor is the owner of the file
    const file = await File.findById(fileId)
    const [record, fileWithNameExist] = await Promise.all([
      Record.findById(file.record),
      File.findOne({ name: name })
    ])

    if (record.doctor !== doctorId) {
      res
        .status(403)
        .send({ status: 403, message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
      return
    }

    // 406
    if (fileWithNameExist) {
      res.status(406).send({ status: 406, message: COMMON_MSG.RECORDS_USING })
      return
    }

    // 405
    const baseFields = file.fields

    for (const baseField in baseFields) {
      for (const newField in fields) {
        let { type, value, options } = newField
        if (newField.name === baseField.name) {
          if (!checkFieldType(res, type, value, options)) return
          else {
            baseField.value = value
            break
          }
        }
      }
    }

    // Update the file
    await File.updateOne(
      { _id: fileId },
      {
        $set: {
          name,
          category,
          fields: baseFields
        }
      }
    )

    // send response

    res.status(200).json({ status: 500, error: COMMON_MSG.REQUEST_SUCCESS })
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message })
  }
}

exports.deleteFile = async (req, res) => {
  try {
    const { doctorId, fileId } = req.body

    if (!fileId || !doctorId) {
      return res.status(400).send({
        status: 400,
        message: COMMON_MSG.MISSING_FIELDS
      })
    }

    const file = await File.findById(fileId)
    if (!file) {
      return res.status(404).send({
        status: 404,
        message: COMMON_MSG.FILE_NOT_FOUND
      })
    }

    const record = await Record.findById(file.record)
    if (!record) {
      return res.status(404).send({
        status: 404,
        message: COMMON_MSG.RECORD_NOT_FOUND
      })
    }

    if (record.doctor.toString() !== doctorId) {
      return res.status(403).send({
        status: 403,
        message: COMMON_MSG.DOCTOR_IS_NOT_OWNER
      })
    }

    if (file.location) {
      try {
        await s3Delete(file.location)
      } catch (s3Error) {
        return res.status(500).send({
          status: 500,
          message: 'Failed to delete file from S3'
        })
      }
    }

    await File.findByIdAndDelete(fileId)

    return res.status(200).send({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS
    })
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: error.message
    })
  }
}

exports.listFiles = async (req, res) => {
  const { doctorId } = req.query

  try {
    if (!emptyFields(res, doctorId)) return
    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return
    if (!(await doctorActive(res, doctorId))) return

    const fileTemplates = await FileTemplate.find(
      { doctor: doctorId },
      'fields'
    )

    if (!fileTemplates.length) {
      return res.status(404).json({
        status: 404,
        message: COMMON_MSG.DOCTOR_NOT_FOUND
      })
    }

    const fieldsSet = new Set()

    fileTemplates.forEach((template) => {
      template.fields.forEach((field) => {
        const fieldKey = `${field.name}-${field.type}`
        fieldsSet.add(fieldKey)
      })
    })

    const fields = Array.from(fieldsSet).map((fieldKey) => {
      const [name, type] = fieldKey.split('-')
      return { name, type }
    })

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      fields
    })
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: COMMON_MSG.SERVER_ERROR + ': ' + error.message
    })
  }
}

exports.getFileById = async (req, res) => {
  try {
    const { doctorId, fileId } = req.query

    if (!fileId || !doctorId) {
      return res.status(400).send({
        status: 400,
        message: COMMON_MSG.MISSING_FIELDS
      })
    }

    const file = await File.findById(fileId)
    if (!file) {
      return res.status(404).send({
        status: 404,
        message: COMMON_MSG.FILE_NOT_FOUND
      })
    }

    const record = await Record.findById(file.record)
    if (!record || record.doctor.toString() !== doctorId) {
      return res.status(403).send({
        status: 403,
        message: COMMON_MSG.DOCTOR_IS_NOT_OWNER
      })
    }

    if (!file.location) {
      return res.status(500).send({
        status: 500,
        message: 'File location not found in S3.'
      })
    }

    try {
      const preSignedUrl = await generateS3PreSignedUrl(file.location)

      const fields = file.metadata.map((field) => ({
        name: field.name,
        type: field.type,
        options: field.options || [],
        value: field.value,
        required: field.required
      }))

      return res.status(200).json({
        status: 200,
        message: COMMON_MSG.REQUEST_SUCCESS,
        fileId: file._id,
        recordId: file.record,
        templateId: file.template,
        name: file.name,
        category: file.category,
        createdAt: file.created_at,
        pages: file.pages,
        fields: fields,
        fileURL: preSignedUrl
      })
    } catch (s3Error) {
      return res.status(500).send({
        status: 500,
        message: 'Failed to generate pre-signed URL for the file'
      })
    }
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: error.message
    })
  }
}

//TODO: Deben implementarse los errores dados por la documentación, ahora mismo la implementación es delicada.
exports.searchAndFilterFiles = async (req, res) => {
  const {
    doctorId,
    recordId,
    limit = 10,
    page = 0,
    category,
    fields,
    sorts,
    filters
  } = req.body

  try {
    if (!doctorId || !recordId || !category || !fields || !sorts || !filters) {
      return res.status(400).json({ error: COMMON_MSG.MISSING_FIELDS })
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'Invalid doctor ID' })
    }

    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({ error: 'Invalid record ID' })
    }

    // Check if the doctor has access to the record
    if (!(await checkDoctor(res, Record, doctorId, recordId))) return

    const limitNum = parseInt(limit)
    const pageNum = parseInt(page) > 0 ? parseInt(page) - 1 : 0

    let pipeline = []

    // Stage 1: Match recordId and category
    pipeline.push({
      $match: {
        record: new mongoose.Types.ObjectId(recordId),
        category: category
      }
    })

    // Stage 2: Add sort fields only if they are present in 'fields'
    if (sorts && sorts.length > 0 && fields && fields.length > 0) {
      const { addFields: sortAddFields, sort } = buildSortStage(sorts, fields)

      // Add fields for sorting
      if (Object.keys(sortAddFields).length > 0) {
        pipeline.push({ $addFields: sortAddFields })
      }

      // Add sort stage
      if (Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort })
      }
    }

    // Stage 3: Pagination
    pipeline.push({ $skip: pageNum * limitNum }, { $limit: limitNum })

    // Stage 4: Projection
    pipeline.push({
      $project: buildProjection(fields)
    })

    // Execute the querys
    const files = await File.aggregate(pipeline)

    // Count total documents without pagination
    const countPipeline = [
      {
        $match: {
          record: new mongoose.Types.ObjectId(recordId),
          category: category
        }
      },
      { $count: 'total' }
    ]

    const totalResult = await File.aggregate(countPipeline)
    const totalCount = totalResult.length > 0 ? totalResult[0].total : 0

    res.status(200).json({
      status: 200,
      message: 'Request Successful',
      files,
      total: totalCount
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

//TODO: Estas funciones deberían de ir en un archivo aparte, o considerarlas unificarlas con filterUtils.js (Realizar después de 22/11/2024)
/**
 * Builds MongoDB sort stage for files based on specified fields
 * @param {Array} sorts - Array of sort objects
 * @param {Array} fields - Array of fields allowed for sorting
 * @returns {Object} Contains addFields and sort
 */
function buildSortStage(sorts, fields) {
  let addFields = {}
  let sort = {}

  sorts.forEach((sortObj, index) => {
    const { name, type, mode } = sortObj

    // Only allow sorting if the field is in the fields array
    const fieldExists = fields.find((field) => field.name === name)
    if (!fieldExists) return

    const valueAlias = `sortValue_${index}`

    // Extract the field value from metadata
    const fieldValueExpr = {
      $getField: {
        field: 'value',
        input: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$metadata',
                as: 'field',
                cond: { $eq: ['$$field.name', name] }
              }
            },
            0
          ]
        }
      }
    }

    let convertedValueExpr

    if (type === 'NUMBER' || type === 'FLOAT') {
      convertedValueExpr = { $toDouble: fieldValueExpr }
    } else if (type === 'DATE') {
      convertedValueExpr = { $toDate: fieldValueExpr }
    } else {
      convertedValueExpr = { $toString: fieldValueExpr }
    }

    // Add the converted value to addFields
    addFields[valueAlias] = convertedValueExpr

    // Add to sort
    sort[valueAlias] = mode === 'asc' ? 1 : -1
  })

  return { addFields, sort }
}

/**
 * Builds projection stage based on fields array
 * @param {Array} fields - Array of field objects with name and type
 * @returns {Object} Projection configuration
 */
function buildProjection(fields) {
  let projection = {
    _id: 0,
    fileId: { $toString: '$_id' },
    templateId: { $toString: '$template' },
    name: 1,
    createdAt: {
      $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
    },
    pages: 1
  }

  if (fields && fields.length > 0) {
    projection['fields'] = {
      $filter: {
        input: '$metadata',
        as: 'field',
        cond: {
          $in: ['$$field.name', fields.map((field) => field.name)]
        }
      }
    }
  } else {
    projection['fields'] = 1
  }

  return projection
}
