const {
  s3Upload,
  s3Delete,
  s3Download
} = require('../controllers/s3ClientController')
const mongoose = require('mongoose')
const File = require('../models/fileModel')
const Record = require('../models/recordModel')
const FileTemplate = require('../models/fileTemplateModel')
const COMMON_MSG = require('../utils/errorMsg')
const Usuario = require('../models/userModel')
const pdf = require('pdf-parse')

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
      status: 200,
      message: 'File created successfully',
      fileId: file._id
    })
  } catch (error) {
    res.status(500).send({ status: 500, message: error.message })
  }
}

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
      status: 'success',
      message: COMMON_MSG.REQUEST_SUCCESS
    })
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: error.message
    })
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
