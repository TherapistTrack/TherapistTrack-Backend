const {
  s3Upload,
  s3Delete,
  s3Download
} = require('../controllers/s3ClientController')
const mongoose = require('mongoose')
const File = require('../models/fileModel')
const COMMON_MSG = require('../utils/errorMsg')
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
const FileTemplate = require('../models/fileTemplateModel')
const Usuario = require('../models/userModel').Usuario

//create a new file and a new patient
exports.createFile = async (req, res) => {
  const { record, template, name, category, pages, created_at, metadata } =
    req.body
  const uploadfile = req.file
  let newmetadata

  // Validate the request of a file in the body
  if (!uploadfile || !uploadfile.buffer) {
    return res
      .status(400)
      .send({ status: 'error', message: 'No file provided' })
  }

  try {
    newmetadata = JSON.parse(metadata)
  } catch (error) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Invalid metadata format' })
  }

  try {
    const fileExtension = uploadfile.originalname.split('.').pop()
    const key = `${record}/${uploadfile.originalname}.${fileExtension}`
    const s3Response = await s3Upload(key, uploadfile.buffer)
    const location = s3Response.Location.split('.com/')[1]

    //const isValidObjectId = mongoose.Types.ObjectId.isValid(record)
    //const isValidtemplateId = mongoose.Types.ObjectId.isValid(template)
    // if (!isValidObjectId || !isValidtemplateId) {
    //   return res.status(400).send({ status: 'error', message: 'Invalid record or template ID' });
    // }
    const fileData = {
      record,
      template,
      name,
      category,
      location,
      pages,
      created_at: created_at || new Date(),
      newmetadata
    }

    console.log(fileData)

    const file = new File(fileData)
    await file.save()

    res.status(201).send({
      status: 'success',
      message: 'File created successfully',
      data: file._id
    })
  } catch (error) {
    console.error('Error during file creation:', error) // Log the full error object
    res.status(400).send({ status: 'error', message: error.message })
  }
}

//Edit a file
exports.updateFile = async (req, res) => {
  const { id, record, template, name, category, location, pages, metadata } =
    req.body

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id)
  if (!isValidObjectId) {
    return res
      .status(400)
      .send({ status: 'error', message: 'Invalid ID format' })
  }

  const file = await File.findByIdAndUpdate(
    id,
    { record, name, category, location, pages, metadata },
    { new: true }
  )
  if (!file) {
    return res.status(404).send({ status: 'error', message: 'File not found' })
  }
  res.status(200).send({ status: 'success', data: file })
}

//Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.body
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id)
    if (!isValidObjectId) {
      return res
        .status(400)
        .send({ status: 'error', message: 'Invalid ID format' })
    }
    const file = await File.findById(id)
    if (!file) {
      return res
        .status(404)
        .send({ status: 'error', message: 'File not found' })
    }

    if (file.location) {
      try {
        await s3Delete(file.location)
      } catch (s3Error) {
        return res
          .status(500)
          .send({ status: 'error', message: 'Failed to delete file from S3' })
      }
    }

    await File.findByIdAndDelete(id)

    res
      .status(200)
      .send({ status: 'success', message: 'File deleted successfully' })
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}

//List all possible fields
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

//Get file by id
exports.getFileById = async (req, res) => {
  try {
    const { id } = req.body
    const file = await File.findById(id).populate('record')
    if (!file) {
      return res
        .status(404)
        .send({ status: 'error', message: 'File not found' })
    }
    if (file.location) {
      try {
        const s3Response = await s3Download(file.location)
        const fileBuffer = s3Response.Body

        res.setHeader('Content-Type', s3Response.ContentType)
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${file.name}"`
        )

        res
          .status(200)
          .json({ s3file: fileBuffer.toString('base64'), file: file })
      } catch (s3Error) {
        return res
          .status(500)
          .send({ status: 'error', message: 'Failed to download file from S3' })
      }
    } else {
      res.status(200).json(file)
    }
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}

//Serch files by sorts, filters and fields
exports.searchAndFilterFiles = async (req, res) => {
  const {
    doctorId,
    recordId,
    limit = 10,
    page = 1,
    fields,
    sorts,
    filters
  } = req.body

  try {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'Invalid doctor ID' })
    }

    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({ error: 'Invalid doctor ID' })
    }

    if (!checkDoctor(res, Record, doctorId, recordId)) return

    const limitNum = parseInt(limit)
    const pageNum = parseInt(page) > 0 ? parseInt(page) - 1 : 0

    let pipeline = []

    // Stage 1: Match recordId
    pipeline.push({
      $match: {
        record: new mongoose.Types.ObjectId(recordId)
      }
    })

    // Stage 2: Add sort fields
    if (sorts && sorts.length > 0) {
      const { addFields: sortAddFields, sort } = buildSortStage(sorts)

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
    const projection = buildProjection(fields, filters)
    pipeline.push({ $project: projection })

    console.log('Pipeline:', JSON.stringify(pipeline, null, 2))
    // Execute the query
    const files = await File.aggregate(pipeline)

    // Count pipeline
    const countPipeline = [
      {
        $match: {
          record: new mongoose.Types.ObjectId(recordId)
        }
      },
      { $count: 'total' }
    ]

    const totalResult = await File.aggregate(countPipeline)
    const totalCount = totalResult.length > 0 ? totalResult[0].total : 0

    res.status(200).json({
      status: 200,
      message: 'Search successful',
      files,
      total: totalCount
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}
