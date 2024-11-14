const {
  s3Upload,
  s3Delete,
  s3Download
} = require('../controllers/s3ClientController')
const mongoose = require('mongoose')
const File = require('../models/fileModel')
const FileTemplate = require('../models/fileTemplateModel')
const Record = require('../models/recordModel')
const COMMON_MSG = require('../utils/errorMsg')
const Usuario = require('../models/userModel')
const pdf = require('pdf-parse')
const {
  checkExistenceName,
  checkExistenceId,
  checkDoctor,
  checkExistingField,
  doctorActive
} = require('../utils/requestCheckers')
const {
  emptyFields,
  validArrays,
  validFields,
  validMongoId,
  validField,
  checkFieldType
} = require('../utils/fieldCheckers')

exports.createFile = async (req, res) => {
  const { metadata } = req.body
  const uploadfile = req.file
  let parsedMetadata

  if (!uploadfile || !uploadfile.buffer) {
    return res
      .status(403)
      .send({ status: 'error', message: 'No file provided' })
  }

  try {
    parsedMetadata = JSON.parse(metadata)
    console.log(parsedMetadata)
  } catch (error) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Invalid metadata format' })
  }

  try {
    const { recordId, templateId, name, category, fields } = parsedMetadata

    if (
      !mongoose.Types.ObjectId.isValid(recordId) ||
      !mongoose.Types.ObjectId.isValid(templateId)
    ) {
      return res.status(400).send({
        status: 'error',
        message: 'Invalid recordId or templateId format'
      })
    }

    const fileTemplate = await FileTemplate.findById(templateId)
    if (!fileTemplate) {
      return res.status(400).send({
        status: 'error',
        message: 'FileTemplate not found'
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
          status: 'error',
          message: `Field ${field.name} not found in template`
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
          status: 'error',
          message: 'Unable to read PDF pages'
        })
      }
    } else {
      numberOfPages = 0
    }

    const timestamp = Date.now()
    const doctorId = fileTemplate.doctor
    const key = `${doctorId}/${recordId}/${timestamp}-${uploadfile.originalname}`
    console.log(key)
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

    res.status(201).send({
      status: 'success',
      message: 'File created successfully',
      filedId: file._id
    })
  } catch (error) {
    res.status(500).send({ status: 'error', message: error.message })
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

    if (record.doctor.toString() !== doctorId) {
      res
        .status(403)
        .send({ status: 403, message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
      return
    }

    // 406
    if (fileWithNameExist.name && fileWithNameExist.name !== name) {
      res.status(406).send({ status: 406, message: COMMON_MSG.RECORDS_USING })
      return
    }

    // 405
    const baseFields = file.metadata
    // console.log(baseFields)
    // console.log("===============")
    // console.log(fields)

    for (const baseField of baseFields) {
      for (const newField of fields) {
        let { name, value } = newField
        let { type, options } = baseField
        if (name === baseField.name) {
          console.log(
            `name: ${name}, type: ${type}, value :${value}, options: ${options}`
          )
          if (!checkFieldType(res, type, value, options)) {
            console.log(newField.name)
            return
          } else {
            baseField.value = value
            break
          }
        }
      }
    }

    file.name = name
    file.category = category
    file.metadata = baseFields
    await file.save()

    // send response
    res.status(200).json({ status: 200, message: COMMON_MSG.REQUEST_SUCCESS })
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 500, message: error.message })
    }
  }
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

//List of the last 10 files
exports.listFiles = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'created_at', order = 'asc' } = req.query
    const files = await File.find()
      .populate('record')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit, 10))

    res.status(200).json(files)
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
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
