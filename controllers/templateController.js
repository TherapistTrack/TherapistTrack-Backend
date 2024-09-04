const mongoose = require('mongoose')
const Plantilla = require('../models/plantillaModel')
const { User } = require('../models/userModel')

// Crear una nueva plantilla de paciente
exports.createTemplate = async (req, res) => {
  console.log('HELLO FROM ENDPOINT')
  try {
    const { doctorId, name, patientTemplate } = req.body

    // Validar el formato del doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res
        .status(400)
        .json({ error: 'Formato de ID de doctor inválido.' })
    }

    // Verificar si el doctor existe
    console.log('Before find doctor')
    const doctor = await User.findById(doctorId).exec()
    console.log('Find doctor')
    if (!doctor || doctor.rol !== 'Doctor') {
      console.log('There is no doctor!')
      return res
        .status(404)
        .json({ error: 'Doctor no encontrado o rol inválido.' })
    }

    // Crear la plantilla
    const nuevaPlantilla = new Plantilla({ doctorId, name, patientTemplate })
    console.log('Before saving template!')
    await nuevaPlantilla.save()
    console.log('Create template')

    res.status(201).json({
      message: 'Plantilla de paciente creada exitosamente',
      data: { doctorId, patientTemplateId: nuevaPlantilla._id }
    })
  } catch (error) {
    console.error('Error creating template:', error)
    res.status(500).json({ error: 'Error al crear la plantilla de paciente.' })
  }
}

// Agregar un campo a la plantilla de paciente
exports.addFieldToTemplate = async (req, res) => {
  try {
    const { doctorId, patientTemplate } = req.body
    const { templateID } = req.params

    const doctor = await Usuario.findById(doctorId)
    if (!doctor) {
      return res
        .status(404)
        .send({ status: 404, message: 'Doctor no encontrado' })
    }

    const plantilla = await Plantilla.findById(templateID)
    if (!plantilla) {
      return res
        .status(404)
        .send({ status: 404, message: 'Plantilla no encontrada' })
    }

    plantilla.patientTemplate.fields.push(patientTemplate)
    await plantilla.save()

    res.status(200).send({
      status: 200,
      message: 'Campo añadido a la plantilla de paciente exitosamente',
      data: plantilla.patientTemplate
    })
  } catch (error) {
    res.status(500).send({
      status: 500,
      message:
        'Error interno del servidor: No se puede añadir el campo a la plantilla de paciente.'
    })
  }
}

// Editar campos en la plantilla de paciente
exports.editTemplateFields = async (req, res) => {
  try {
    const { doctorId, updatedFields } = req.body
    const { templateID } = req.params

    const doctor = await Usuario.findById(doctorId)
    if (!doctor) {
      return res
        .status(404)
        .send({ status: 404, message: 'Doctor no encontrado' })
    }

    const plantilla = await Plantilla.findById(templateID)
    if (!plantilla) {
      return res
        .status(404)
        .send({ status: 404, message: 'Plantilla no encontrada' })
    }

    updatedFields.forEach((updatedField) => {
      const field = plantilla.patientTemplate.fields.id(updatedField.fieldId)
      if (field) {
        Object.assign(field, updatedField)
      }
    })

    await plantilla.save()

    res.status(200).send({
      status: 200,
      message: 'Campos de la plantilla de paciente actualizados exitosamente',
      data: plantilla.patientTemplate.fields
    })
  } catch (error) {
    res.status(500).send({
      status: 500,
      message:
        'Error interno del servidor: No se pueden actualizar los campos de la plantilla de paciente.'
    })
  }
}

// Eliminar un campo de la plantilla de paciente
exports.deleteFieldFromTemplate = async (req, res) => {
  try {
    const { doctorId } = req.body
    const { templateID, fieldId } = req.params

    const doctor = await Usuario.findById(doctorId)
    if (!doctor) {
      return res
        .status(404)
        .send({ status: 404, message: 'Doctor no encontrado' })
    }

    const plantilla = await Plantilla.findById(templateID)
    if (!plantilla) {
      return res
        .status(404)
        .send({ status: 404, message: 'Plantilla no encontrada' })
    }

    const field = plantilla.patientTemplate.fields.id(fieldId)
    if (!field) {
      return res
        .status(404)
        .send({ status: 404, message: 'Campo no encontrado' })
    }

    field.remove()
    await plantilla.save()

    res.status(200).send({
      status: 200,
      message: 'Campo de la plantilla de paciente eliminado exitosamente',
      data: { doctorId, fieldId }
    })
  } catch (error) {
    res.status(500).send({
      status: 500,
      message:
        'Error interno del servidor: No se puede eliminar el campo de la plantilla de paciente.'
    })
  }
}

// Renombrar una plantilla
exports.renameTemplate = async (req, res) => {
  const { doctorId, Id, newName } = req.body

  try {
    const plantilla = await Plantilla.findOne({ _id: Id, doctorId })
    if (!plantilla) {
      return res
        .status(404)
        .json({ error: 'No se pudo encontrar la plantilla' })
    }

    plantilla.name = newName
    await plantilla.save()

    res.json({
      message: 'El nombre de la plantilla ha sido actualizado exitosamente'
    })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'No se pudo actualizar el nombre de la plantilla' })
  }
}

// Eliminar una plantilla
exports.deleteTemplate = async (req, res) => {
  const { doctorId, Id } = req.body

  try {
    const plantilla = await Plantilla.findOneAndDelete({ _id: Id, doctorId })
    if (!plantilla) {
      return res
        .status(404)
        .json({ error: 'No se pudo encontrar la plantilla' })
    }

    res.json({ message: 'Plantilla eliminada exitosamente' })
  } catch (error) {
    res.status(500).json({
      error: 'No se pudo eliminar la plantilla porque tiene archivos asociados'
    })
  }
}

// Listar plantillas por doctor
exports.listTemplates = async (req, res) => {
  const { doctorId } = req.query

  try {
    const plantillas = await Plantilla.find({ doctorId }).select('_id name')
    res.json(plantillas)
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener la lista de plantillas' })
  }
}

// Buscar una plantilla por su ID
exports.getTemplateById = async (req, res) => {
  const { templateId } = req.query

  try {
    const plantilla = await Plantilla.findById(templateId)
    if (!plantilla) {
      return res
        .status(404)
        .json({ error: 'No se pudo encontrar la plantilla solicitada' })
    }

    res.json(plantilla)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'No se pudo encontrar la plantilla solicitada' })
  }
}
