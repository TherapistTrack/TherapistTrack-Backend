const Plantilla = require('../models/plantillaModel');

// Crear una nueva plantilla de paciente
exports.createTemplate = async (req, res) => {
  try {
    const { doctorId, name, patientTemplate } = req.body;
    // Verificar si el doctor existe
    const doctor = await Usuario.findById(doctorId);
    if (!doctor) {
      return res.status(404).send({ status: 404, message: 'Doctor no encontrado' });
    }

    const nuevaPlantilla = new Plantilla({ doctorId, name, patientTemplate });
    await nuevaPlantilla.save();

    res.status(200).send({
      status: 200,
      message: 'Plantilla de paciente creada exitosamente',
      data: { doctorId, patientTemplateId: nuevaPlantilla._id }
    });
  } catch (error) {
    res.status(500).send({ status: 500, message: 'Error interno del servidor: No se puede crear la plantilla de paciente.' });
  }
};

// Agregar un campo a la plantilla de paciente
exports.addFieldToTemplate = async (req, res) => {
  try {
    const { doctorId, patientTemplate } = req.body;
    const { templateID } = req.params;

    const doctor = await Usuario.findById(doctorId);
    if (!doctor) {
      return res.status(404).send({ status: 404, message: 'Doctor no encontrado' });
    }

    const plantilla = await Plantilla.findById(templateID);
    if (!plantilla) {
      return res.status(404).send({ status: 404, message: 'Plantilla no encontrada' });
    }

    plantilla.patientTemplate.fields.push(patientTemplate);
    await plantilla.save();

    res.status(200).send({
      status: 200,
      message: 'Campo añadido a la plantilla de paciente exitosamente',
      data: plantilla.patientTemplate
    });
  } catch (error) {
    res.status(500).send({ status: 500, message: 'Error interno del servidor: No se puede añadir el campo a la plantilla de paciente.' });
  }
};

// Editar campos en la plantilla de paciente
exports.editTemplateFields = async (req, res) => {
  try {
    const { doctorId, updatedFields } = req.body;
    const { templateID } = req.params;

    const doctor = await Usuario.findById(doctorId);
    if (!doctor) {
      return res.status(404).send({ status: 404, message: 'Doctor no encontrado' });
    }

    const plantilla = await Plantilla.findById(templateID);
    if (!plantilla) {
      return res.status(404).send({ status: 404, message: 'Plantilla no encontrada' });
    }

    updatedFields.forEach(updatedField => {
      const field = plantilla.patientTemplate.fields.id(updatedField.fieldId);
      if (field) {
        Object.assign(field, updatedField);
      }
    });

    await plantilla.save();

    res.status(200).send({
      status: 200,
      message: 'Campos de la plantilla de paciente actualizados exitosamente',
      data: plantilla.patientTemplate.fields
    });
  } catch (error) {
    res.status(500).send({ status: 500, message: 'Error interno del servidor: No se pueden actualizar los campos de la plantilla de paciente.' });
  }
};

// Eliminar un campo de la plantilla de paciente
exports.deleteFieldFromTemplate = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const { templateID, fieldId } = req.params;

    const doctor = await Usuario.findById(doctorId);
    if (!doctor) {
      return res.status(404).send({ status: 404, message: 'Doctor no encontrado' });
    }

    const plantilla = await Plantilla.findById(templateID);
    if (!plantilla) {
      return res.status(404).send({ status: 404, message: 'Plantilla no encontrada' });
    }

    const field = plantilla.patientTemplate.fields.id(fieldId);
    if (!field) {
      return res.status(404).send({ status: 404, message: 'Campo no encontrado' });
    }

    field.remove();
    await plantilla.save();

    res.status(200).send({
      status: 200,
      message: 'Campo de la plantilla de paciente eliminado exitosamente',
      data: { doctorId, fieldId }
    });
  } catch (error) {
    res.status(500).send({ status: 500, message: 'Error interno del servidor: No se puede eliminar el campo de la plantilla de paciente.' });
  }
};
