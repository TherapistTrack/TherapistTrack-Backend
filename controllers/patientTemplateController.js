const PatientTemplate = require('../models/patientTemplateModel')
//const Record = require('../models/Record')
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
  checkExistingField
  // doctorActive
} = require('../utils/requestCheckers')
const mongoose = require('mongoose')

exports.createTemplate = async (req, res) => {
  const { doctorId, name, categories, fields } = req.body

  try {
    if (!emptyFields(res, doctorId, name, categories, fields)) return

    if (!validArrays(res, fields, categories)) return

    if (!validFields(res, fields)) return

    if (
      !(await checkExistenceName(
        res,
        PatientTemplate,
        name,
        COMMON_MSG.RECORDS_USING
      ))
    )
      return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    const template = new PatientTemplate({
      doctor: doctorId,
      name,
      categories,
      fields
    })
    const patientTemplate = await template.save()

    res.status(201).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: { patientTemplateId: patientTemplate._id }
    })
  } catch (error) {
    // Rollback: Eliminar la plantilla creada si ocurre un error
    await PatientTemplate.deleteOne({ name: req.body.name })

    if (!res.headersSent) {
      res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
    }
  }
}

exports.renameTemplate = async (req, res) => {
  const { doctorId, templateId, name } = req.body

  try {
    if (!emptyFields(res, doctorId, templateId, name)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    if (!validMongoId(res, templateId, COMMON_MSG.TEMPLATE_NOT_FOUND)) return

    // Ejecutar las tres validaciones en paralelo
    const [templateExists, doctorIsOwner, nameExists] = await Promise.all([
      checkExistenceId(
        res,
        PatientTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, PatientTemplate, doctorId, templateId),
      checkExistenceName(res, PatientTemplate, name, COMMON_MSG.RECORDS_USING)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner || !nameExists) return

    const updatedTemplate = await PatientTemplate.findByIdAndUpdate(
      templateId,
      { name },
      { new: true }
    )

    if (!res.headersSent) {
      res.status(200).json({
        status: 200,
        message: COMMON_MSG.REQUEST_SUCCESS,
        data: [updatedTemplate.doctor, updatedTemplate._id]
      })
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
    }
  }
}

exports.deleteTemplate = async (req, res) => {
  const { doctorId, templateId } = req.body

  try {
    if (!emptyFields(res, doctorId, templateId)) return

    if (!validMongoId(res, templateId, COMMON_MSG.TEMPLATE_NOT_FOUND)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    // Ejecutar las dos validaciones en paralelo
    const [templateExists, doctorIsOwner] = await Promise.all([
      checkExistenceId(
        res,
        PatientTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, PatientTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    /* Cuando se tenga Record, se utilizara esta programacion defensiva
        const patientUsingTemplate = await Record.findOne({ 'template': templateId })

        if (patientUsingTemplate) {
            return res.status(409).send({ status: 'error', message: 'Cannot delete template: it is being used by a patient.' });
        }*/

    await PatientTemplate.findByIdAndDelete(templateId)

    if (!res.headersSent) {
      res.status(200).json({
        status: 200,
        message: COMMON_MSG.REQUEST_SUCCESS
      })
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
    }
  }
}

exports.getTemplate = async (req, res) => {
  const { doctorId, templateId } = req.query

  try {
    if (!emptyFields(res, doctorId, templateId)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    if (!validMongoId(res, templateId, COMMON_MSG.TEMPLATE_NOT_FOUND)) return

    const patientemplate = await PatientTemplate.findById(templateId).lean()

    // Ejecutar las dos validaciones en paralelo
    const [templateExists, doctorIsOwner] = await Promise.all([
      checkExistenceId(
        res,
        PatientTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, PatientTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    const { _id, doctor, __v, ...filteredTemplate } = patientemplate

    if (!res.headersSent) {
      res.status(200).json({
        status: 200,
        message: COMMON_MSG.REQUEST_SUCCESS,
        data: filteredTemplate
      })
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
    }
  }
}

exports.getTemplatesDoctor = async (req, res) => {
  const { doctorId } = req.query

  try {
    if (!emptyFields(res, doctorId)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    const patientemplates = await PatientTemplate.find({
      doctor: doctorId
    }).lean()

    if (!patientemplates || patientemplates.length === 0) {
      return res
        .status(404)
        .send({ status: 404, message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    for (let i = 0; i < patientemplates.length; i++) {
      if (patientemplates[i].doctor.toString() !== doctorId) {
        return res
          .status(403)
          .send({ status: 403, message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
      }
    }

    // Mapear los templates eliminando los campos _id y __v
    const templatesWithId = patientemplates.map((template) => {
      const { _id, __v, doctor, ...rest } = template // Extraer _id y __v, dejando el resto
      return { ...rest, templateId: _id } // Retornar el objeto con templateId en lugar de _id
    })

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      templates: templatesWithId,
      total: templatesWithId.length
    })
  } catch (error) {
    res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
  }
}

exports.createField = async (req, res) => {
  const { doctorId, templateId, field } = req.body

  try {
    if (!emptyFields(res, doctorId, templateId)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    if (!validMongoId(res, templateId, COMMON_MSG.TEMPLATE_NOT_FOUND)) return

    // if (!doctorActive(res, doctorId)) return

    // Ejecutar las dos validaciones en paralelo
    const [templateExists, doctorIsOwner] = await Promise.all([
      checkExistenceId(
        res,
        PatientTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, PatientTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    if (!validField(res, field)) return

    if (!(await checkExistingField(res, PatientTemplate, templateId, field)))
      return

    const updatedTemplate = await PatientTemplate.findByIdAndUpdate(
      templateId,
      { $push: { fields: field } },
      { new: true }
    )

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: updatedTemplate
    })
  } catch (error) {
    // Rollback: Eliminar el campo recién agregado si hay un error
    await PatientTemplate.findByIdAndUpdate(templateId, {
      $pull: { fields: { name: field.name } }
    })

    if (!res.headersSent) {
      res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
    }
  }
}

exports.deleteField = async (req, res) => {
  const { doctorId, templateId, name } = req.body

  try {
    if (!emptyFields(res, doctorId, templateId, name)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    if (!validMongoId(res, templateId, COMMON_MSG.TEMPLATE_NOT_FOUND)) return

    // Ejecutar las dos validaciones en paralelo
    const [templateExists, doctorIsOwner] = await Promise.all([
      checkExistenceId(
        res,
        PatientTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, PatientTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    const patientemplate = await PatientTemplate.findById(templateId)

    const fieldExists = patientemplate.fields.some(
      (field) => field.name === name
    )
    if (!fieldExists) {
      return res
        .status(404)
        .json({ status: 404, message: COMMON_MSG.FIELD_NOT_FOUND })
    }

    const updatedTemplate = await PatientTemplate.findByIdAndUpdate(
      templateId,
      { $pull: { fields: { name } } },
      { new: true }
    )

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: updatedTemplate
    })
  } catch (error) {
    // Rollback: Volver a agregar el campo si hay un error
    await PatientTemplate.findByIdAndUpdate(templateId, {
      $push: { fields: fieldToRemove }
    })

    res.status(500).json({ error: error.message })
  }
}

exports.updateField = async (req, res) => {
  const { doctorId, templateId, oldFieldName, fieldData } = req.body

  try {
    if (!emptyFields(res, doctorId, templateId, oldFieldName, fieldData)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    if (!validMongoId(res, templateId, COMMON_MSG.TEMPLATE_NOT_FOUND)) return

    const patientemplate = await PatientTemplate.findById(templateId)

    // Ejecutar las dos validaciones en paralelo
    const [templateExists, doctorIsOwner] = await Promise.all([
      checkExistenceId(
        res,
        PatientTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, PatientTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    const fieldIndex = patientemplate.fields.findIndex(
      (existingField) => existingField.name === oldFieldName
    )
    if (fieldIndex === -1) {
      return res
        .status(404)
        .json({ status: 404, message: COMMON_MSG.FIELD_NOT_FOUND })
    }

    const reservedNames = ['Nombres', 'Apellidos']
    if (reservedNames.includes(fieldData.name)) {
      return res
        .status(400)
        .json({ status: 400, message: COMMON_MSG.RESERVED_FIELD_NAMES })
    }

    const nameConflict = patientemplate.fields.some(
      (existingField) =>
        existingField.name === fieldData.name &&
        existingField.name !== oldFieldName
    )
    if (nameConflict) {
      return res
        .status(406)
        .json({ status: 406, message: COMMON_MSG.RECORDS_USING })
    }

    patientemplate.fields[fieldIndex].name = fieldData.name
    patientemplate.fields[fieldIndex].type = fieldData.type
    patientemplate.fields[fieldIndex].options = fieldData.options
    patientemplate.fields[fieldIndex].required = fieldData.required
    patientemplate.fields[fieldIndex].description = fieldData.description

    const updatedTemplate = await patientemplate.save()

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: updatedTemplate
    })
  } catch (error) {
    // Rollback: Revertir el campo a su estado original si hay un error
    patientemplate.fields[fieldIndex] = originalField
    await patientemplate.save()

    res.status(500).json({ error: error.message })
  }
}
