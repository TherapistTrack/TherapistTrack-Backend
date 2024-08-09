const path = require('path')
const mongoose = require('mongoose')
const File = require('../models/fileModel')
const Usuario = require('../models/userModel').Usuario

//create a new file and a new patient
exports.createFile = async (req, res) => {
  //TODO: with the S3 services done, we need to change this to the correct path and add the file to the S3 bucket
  const location = 'path/to/file'

  const { record, template, name, category, pages, created_at, metadata } =
    req.body

  try {
    //TODO: determinate how are we going to create the patient in a file endpoint
    /*const newPatient = new Usuario(patient);
    await newPatient.save();*/

    //const isValidObjectId = mongoose.Types.ObjectId.isValid(record)
    //const isValidtemplateId = mongoose.Types.ObjectId.isValid(template)
    const fileData = {
      record,
      template,
      name,
      category,
      location,
      pages,
      created_at: created_at || new Date(),
      metadata
    }

    console.log(fileData)

    const file = new File(fileData)
    await file.save()

    res
      .status(201)
      .send({
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
    const file = await File.findByIdAndDelete(id)
    if (!file) {
      return res
        .status(404)
        .send({ status: 'error', message: 'File not found' })
    }
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
    res.status(200).json(file)
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}
