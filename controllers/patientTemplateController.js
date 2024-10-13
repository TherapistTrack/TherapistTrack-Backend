const PatientTemplate = require('../models/patientTemplateModel')
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

    const fieldNames = fields.map((field) => field.name)
    const duplicateFields = fieldNames.filter(
      (name, index) => fieldNames.indexOf(name) !== index
    )
    if (duplicateFields.length > 0) {
      return res
        .status(400)
        .json({ status: 'error', message: COMMON_MSG.DUPLICATE_FIELD_NAMES })
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
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: [updatedTemplate.doctor, updatedTemplate._id]
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
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

    const patientemplate = await PatientTemplate.findById(templateId).lean()

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

    const { _id, doctor, __v, ...filteredTemplate } = patientemplate

    res.status(200).json({
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: filteredTemplate
    })
  } catch (error) {
    res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
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

    // Mapear los templates eliminando los campos _id y __v
    const templatesWithId = patientemplates.map((template) => {
      const { _id, __v, ...rest } = template // Extraer _id y __v, dejando el resto
      return { ...rest, templateId: _id } // Retornar el objeto con templateId en lugar de _id
    })

    const total = await PatientTemplate.countDocuments({ doctorId })

    res.status(200).json({
      message: COMMON_MSG.REQUEST_SUCCESS,
      templates: templatesWithId,
      total: total
    })
  } catch (error) {
    res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
  }
}
