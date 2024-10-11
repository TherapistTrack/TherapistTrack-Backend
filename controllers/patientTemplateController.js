const PatientTemplate = require('../models/patientTemplateModel')
const { findUserByRoleID } = require('../models/userModel')
//const Record = require('../models/Record')
const COMMON_MSG = require('../utils/errorMsg')
const mongoose = require('mongoose')

exports.createTemplate = async (req, res) => {
  const { doctor, name, categories, fields } = req.body
  try {
    if (!doctor || !name || !categories || !fields) {
      return res
        .status(400)
        .json({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    if (
      !Array.isArray(fields) ||
      fields.length === 0 ||
      !Array.isArray(categories) ||
      categories.length === 0
    ) {
      return res
        .status(400)
        .json({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    const reservedNames = ['Nombres', 'Apellidos']
    for (const field of fields) {
      if (reservedNames.includes(field.name)) {
        return res
          .status(400)
          .json({ status: 'error', message: COMMON_MSG.RESERVED_FIELD_NAMES })
      }

      if (field.type === 'CHOICE' && !field.options) {
        return res
          .status(400)
          .json({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
      }
    }

    const existingTemplate = await PatientTemplate.findOne({ name })
    if (existingTemplate) {
      return res
        .status(406)
        .json({ status: 'error', message: COMMON_MSG.RECORDS_USING })
    }

    const isValidObjectId = mongoose.Types.ObjectId.isValid(doctor)
    if (!isValidObjectId) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_NOT_FOUND })
    }

    const template = new PatientTemplate({
      doctor,
      name,
      categories,
      fields
    })
    const patientTemplate = await template.save()
    res.status(201).json({
      status: 0,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: { patientTemplateId: patientTemplate._id }
    })
  } catch (error) {
    res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
  }
}

exports.renameTemplate = async (req, res) => {
  const { doctorId, templateId, name } = req.body

  try {
    if (!doctorId || !templateId || !name) {
      return res
        .status(400)
        .send({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    const isValidObjectId = mongoose.Types.ObjectId.isValid(doctorId)
    if (!isValidObjectId) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_NOT_FOUND })
    }

    const isValidTemplateId = mongoose.Types.ObjectId.isValid(templateId)
    if (!isValidTemplateId) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    const patientemplate = await PatientTemplate.findById(templateId)

    if (!patientemplate) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    if (patientemplate.doctor.toString() !== doctorId) {
      return res
        .status(403)
        .send({ status: 'error', message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
    }

    const updatedTemplate = await PatientTemplate.findByIdAndUpdate(
      templateId,
      { name },
      { new: true }
    )

    res.status(200).json({
      status: 0,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: [updatedTemplate.doctor, updatedTemplate._id]
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: error.message })
  }
}

exports.deleteTemplate = async (req, res) => {
  const { doctorId, templateId } = req.body

  try {
    if (!doctorId || !templateId) {
      return res
        .status(400)
        .json({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    const isValidObjectId2 = mongoose.Types.ObjectId.isValid(templateId)
    if (!isValidObjectId2) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    const patientemplate = await PatientTemplate.findById(templateId)

    if (!patientemplate) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    const isValidObjectId = mongoose.Types.ObjectId.isValid(doctorId)
    if (!isValidObjectId) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_NOT_FOUND })
    }

    if (patientemplate.doctor.toString() !== doctorId) {
      return res
        .status(403)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
    }

    /* Cuando se tenga Record, se utilizara esta programacion defensiva
        const patientUsingTemplate = await Record.findOne({ 'template': templateId })

        if (patientUsingTemplate) {
            return res.status(409).send({ status: 'error', message: 'Cannot delete template: it is being used by a patient.' });
        }*/

    await PatientTemplate.findByIdAndDelete(templateId)

    res.status(200).json({
      status: 0,
      message: COMMON_MSG.REQUEST_SUCCESS
    })
  } catch (error) {
    res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
  }
}

exports.getTemplate = async (req, res) => {
  const { doctorId, templateId } = req.query

  try {
    if (!doctorId || !templateId) {
      return res
        .status(400)
        .send({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    const isValidObjectId = mongoose.Types.ObjectId.isValid(doctorId)
    if (!isValidObjectId) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_NOT_FOUND })
    }

    const isValidObjectId2 = mongoose.Types.ObjectId.isValid(templateId)
    if (!isValidObjectId2) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    const patientemplate = await PatientTemplate.findById(templateId)

    if (!patientemplate) {
      return res
        .status(404)
        .send({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    if (patientemplate.doctor.toString() !== doctorId) {
      return res
        .status(403)
        .send({ status: 'error', message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
    }

    res.status(200).json({
      status: 0,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: patientemplate
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getTemplatesDoctor = async (req, res) => {
  const { doctorId } = req.query

  try {
    if (!doctorId) {
      return res
        .status(400)
        .send({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    const isValidObjectId = mongoose.Types.ObjectId.isValid(doctorId)
    if (!isValidObjectId) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_NOT_FOUND })
    }

    const patientemplates = await PatientTemplate.find({
      doctor: doctorId
    }).lean()

    if (!patientemplates || patientemplates.length === 0) {
      return res
        .status(404)
        .send({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    for (let i = 0; i < patientemplates.length; i++) {
      if (patientemplates[i].doctor.toString() !== doctorId) {
        return res
          .status(403)
          .send({ status: 'error', message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
      }
    }

    const total = await PatientTemplate.countDocuments({ doctorId })

    res.status(200).json({
      status: 0,
      message: COMMON_MSG.REQUEST_SUCCESS,
      templates: patientemplates,
      total: total
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.createField = async (req, res) => {
  const { doctorId, templateId, field } = req.body

  console.log(req.body)

  try {
    if (!doctorId || !templateId || !field) {
      return res
        .status(400)
        .send({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_NOT_FOUND })
    }

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    const doctor = await findUserByRoleID(doctorId)
    if (!doctor) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_NOT_FOUND })
    }

    if (!doctor.isActive) {
      return res
        .status(403)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_INACTIVE })
    }

    const patientemplate = await PatientTemplate.findById(templateId)
    if (!patientemplate) {
      return res
        .status(404)
        .send({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    if (patientemplate.doctor.toString() !== doctorId) {
      return res
        .status(403)
        .send({ status: 'error', message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
    }

    const reservedNames = ['Nombres', 'Apellidos']
    if (reservedNames.includes(field.name)) {
      return res
        .status(400)
        .json({ status: 'error', message: COMMON_MSG.RESERVED_FIELD_NAMES })
    }

    if (field.type === 'CHOICE' && !field.options) {
      return res
        .status(400)
        .json({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    const fieldExists = patientemplate.fields.some(
      (existingField) => existingField.name === field.name
    )
    if (fieldExists) {
      return res
        .status(406)
        .send({ status: 'error', message: COMMON_MSG.RECORDS_USING })
    }

    const updatedTemplate = await PatientTemplate.findByIdAndUpdate(
      templateId,
      { $push: { fields: field } },
      { new: true }
    )

    res.status(200).json({
      status: 0,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: updatedTemplate
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deleteField = async (req, res) => {
  const { doctorId, templateId, name } = req.body

  try {
    if (!doctorId || !templateId || !name) {
      return res
        .status(400)
        .json({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_NOT_FOUND })
    }

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    const patientemplate = await PatientTemplate.findById(templateId)

    if (!patientemplate) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    if (patientemplate.doctor.toString() !== doctorId) {
      return res
        .status(403)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
    }

    const fieldExists = patientemplate.fields.some(
      (field) => field.name === name
    )
    if (!fieldExists) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.FIELD_NOT_FOUND })
    }

    const updatedTemplate = await PatientTemplate.findByIdAndUpdate(
      templateId,
      { $pull: { fields: { name } } },
      { new: true }
    )

    res.status(200).json({
      status: 0,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: updatedTemplate
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateField = async (req, res) => {
  const { doctorId, templateId, oldFieldName, fieldData } = req.body

  try {
    if (!doctorId || !templateId || !oldFieldName || !fieldData) {
      return res
        .status(400)
        .json({ status: 'error', message: COMMON_MSG.MISSING_FIELDS })
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_NOT_FOUND })
    }

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    const patientemplate = await PatientTemplate.findById(templateId)

    if (!patientemplate) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    if (patientemplate.doctor.toString() !== doctorId) {
      return res
        .status(403)
        .json({ status: 'error', message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
    }

    const fieldIndex = patientemplate.fields.findIndex(
      (existingField) => existingField.name === oldFieldName
    )

    if (fieldIndex === -1) {
      return res
        .status(404)
        .json({ status: 'error', message: COMMON_MSG.FIELD_NOT_FOUND })
    }

    const reservedNames = ['Nombres', 'Apellidos']
    if (reservedNames.includes(fieldData.name)) {
      return res
        .status(400)
        .json({ status: 'error', message: COMMON_MSG.RESERVED_FIELD_NAMES })
    }

    const nameConflict = patientemplate.fields.some(
      (existingField) =>
        existingField.name === fieldData.name &&
        existingField.name !== oldFieldName
    )
    if (nameConflict) {
      return res
        .status(406)
        .json({ status: 'error', message: COMMON_MSG.RECORDS_USING })
    }

    console.log(patientemplate.fields[fieldIndex].name)
    console.log(fieldData.name)

    patientemplate.fields[fieldIndex].name = fieldData.name
    patientemplate.fields[fieldIndex].type = fieldData.type
    patientemplate.fields[fieldIndex].options = fieldData.options
    patientemplate.fields[fieldIndex].required = fieldData.required
    patientemplate.fields[fieldIndex].description = fieldData.description

    const updatedTemplate = await patientemplate.save()

    res.status(200).json({
      status: 0,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: updatedTemplate
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
