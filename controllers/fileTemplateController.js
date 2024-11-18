const FileTemplate = require('../models/fileTemplateModel')
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
  const { doctorId, name, fields } = req.body

  try {
    if (!emptyFields(res, doctorId, name, fields)) return

    if (!validArrays(res, fields)) return

    if (!validFields(res, fields)) return

    if (
      !(await checkExistenceName(
        res,
        FileTemplate,
        name,
        COMMON_MSG.RECORDS_USING
      ))
    )
      return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    const template = new FileTemplate({
      doctor: doctorId,
      name,
      fields
    })
    const fileTemplate = await template.save()

    res.status(201).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: { doctorId: fileTemplate.doctor, fileTemplateId: fileTemplate._id }
    })
  } catch (error) {
    // Rollback: Eliminar la plantilla creada si ocurre un error
    await FileTemplate.deleteOne({ name: req.body.name })

    if (!res.headersSent) {
      res.status(500).json({ error: error.message })
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
        FileTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, FileTemplate, doctorId, templateId),
      checkExistenceName(res, FileTemplate, name, COMMON_MSG.RECORDS_USING)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner || !nameExists) return

    const updatedTemplate = await FileTemplate.findByIdAndUpdate(
      templateId,
      { name },
      { new: true }
    )

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: {
        doctorId: updatedTemplate.doctor,
        fileTemplateId: updatedTemplate._id
      }
    })
  } catch (error) {
    res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
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
        FileTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, FileTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    /* Cuando se tenga File, se utilizara esta programacion defensiva
        const fileUsingTemplate = await File.findOne({ 'template': templateId })

        if (fileUsingTemplate) {
            return res.status(409).send({ status: 'error', message: 'Cannot delete template: it is being used by a patient.' });
        }*/

    await FileTemplate.findByIdAndDelete(templateId)

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS
    })
  } catch (error) {
    res.status(500).json({ error: COMMON_MSG.INTERNAL_SERVER_ERROR })
  }
}

exports.getTemplate = async (req, res) => {
  const { doctorId, templateId } = req.query

  try {
    if (!emptyFields(res, doctorId, templateId)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    if (!validMongoId(res, templateId, COMMON_MSG.TEMPLATE_NOT_FOUND)) return

    const filetemplate = await FileTemplate.findById(templateId).lean()

    // Ejecutar las dos validaciones en paralelo
    const [templateExists, doctorIsOwner] = await Promise.all([
      checkExistenceId(
        res,
        FileTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, FileTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    const { _id, doctor, __v, ...filteredTemplate } = filetemplate

    res.status(200).json({
      status: 200,
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
    if (!emptyFields(res, doctorId)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    const filetemplates = await FileTemplate.find({
      doctor: doctorId
    }).lean()

    if (!filetemplates || filetemplates.length === 0) {
      return res
        .status(404)
        .send({ status: 404, message: COMMON_MSG.TEMPLATE_NOT_FOUND })
    }

    for (let i = 0; i < filetemplates.length; i++) {
      if (filetemplates[i].doctor.toString() !== doctorId) {
        return res
          .status(403)
          .send({ status: 403, message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
      }
    }

    // Mapear los templates eliminando los campos _id y __v
    const templatesWithId = filetemplates.map((template) => {
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
        FileTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, FileTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    if (!validField(res, field)) return

    if (!(await checkExistingField(res, FileTemplate, templateId, field)))
      return

    const updatedTemplate = await FileTemplate.findByIdAndUpdate(
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
    await FileTemplate.findByIdAndUpdate(templateId, {
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
        FileTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, FileTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    const filetemplate = await FileTemplate.findById(templateId)

    const fieldExists = filetemplate.fields.some((field) => field.name === name)
    if (!fieldExists) {
      return res
        .status(404)
        .json({ status: 404, message: COMMON_MSG.FIELD_NOT_FOUND })
    }

    const updatedTemplate = await FileTemplate.findByIdAndUpdate(
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
    await FileTemplate.findByIdAndUpdate(templateId, {
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

    const filetemplate = await FileTemplate.findById(templateId)

    // Ejecutar las dos validaciones en paralelo
    const [templateExists, doctorIsOwner] = await Promise.all([
      checkExistenceId(
        res,
        FileTemplate,
        templateId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ),
      checkDoctor(res, FileTemplate, doctorId, templateId)
    ])

    // Verificar si alguna validación ha fallado
    if (!templateExists || !doctorIsOwner) return

    const fieldIndex = filetemplate.fields.findIndex(
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

    const nameConflict = filetemplate.fields.some(
      (existingField) =>
        existingField.name === fieldData.name &&
        existingField.name !== oldFieldName
    )
    if (nameConflict) {
      return res
        .status(406)
        .json({ status: 406, message: COMMON_MSG.RECORDS_USING })
    }

    filetemplate.fields[fieldIndex].name = fieldData.name
    filetemplate.fields[fieldIndex].type = fieldData.type
    filetemplate.fields[fieldIndex].options = fieldData.options
    filetemplate.fields[fieldIndex].required = fieldData.required
    filetemplate.fields[fieldIndex].description = fieldData.description

    const updatedTemplate = await filetemplate.save()

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      data: updatedTemplate
    })
  } catch (error) {
    // Rollback: Revertir el campo a su estado original si hay un error
    filetemplate.fields[fieldIndex] = originalField
    await filetemplate.save()

    res.status(500).json({ error: error.message })
  }
}
