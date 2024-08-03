const path = require('path')
const mongoose = require('mongoose')
const File = require('../models/fileModel')
const Usuario = require('../models/userModel').Usuario

exports.uploadFile = (req, res) => {
  res.send('Archivo subido correctamente')
}

exports.getFile = (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, '..', 'uploads', filename)

  res.sendFile(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.status(404).send('Archivo no encontrado')
      } else {
        res.status(500).send('Error al procesar la solicitud')
      }
    }
  })
}

//create a new file and a new patient
exports.createFile = async (req, res) => {
  const { record, name, category, location, pages, metadata } = req.body

  try {
    //TODO: determinate how are we going to create the patient in a file endpoint
    /*const newPatient = new Usuario(patient);
    await newPatient.save();*/

    const isValidObjectId = mongoose.Types.ObjectId.isValid(record)
    const fileData = {
      record: isValidObjectId ? new mongoose.Types.ObjectId(record) : record,
      name,
      category,
      location,
      pages,
      metadata
    }

    const file = new File(fileData)
    await file.save()

    res
      .status(201)
      .send({
        status: 'success',
        message: 'File created successfully',
        data: { _id: file._id }
      })
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}

//Edit a file
exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params
    const file = await File.findByIdAndUpdate(id, req.body, { new: true })
    if (!file) {
      return res
        .status(404)
        .send({ status: 'error', message: 'File not found' })
    }
    res.status(200).send({ status: 'success', data: file })
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}

//Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params
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
    const { id } = req.params
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
