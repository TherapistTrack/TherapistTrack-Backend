const {
  s3Upload,
  s3Delete,
  s3Download
} = require('../controllers/s3ClientController')
const mongoose = require('mongoose')
const File = require('../models/fileModel')
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
