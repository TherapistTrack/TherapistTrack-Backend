const PatientTemplate = require('../models/patientTemplateModel')
//const Record = require('../models/Record')

exports.createTemplate = async (req, res) => {
  const { doctorId, name, fields } = req.body
  try {
    /*
        const isValidObjectId = mongoose.Types.ObjectId.isValid(doctorId)
        if (!isValidObjectId) {
            return res.status(404).send({ status: 'error', message: 'Invalid doctor ID' });
        }
        */

    if (!doctorId || !name || !fields) {
      return res
        .status(400)
        .send({ status: 'error', message: 'Missing required fields' })
    }

    const template = new PatientTemplate({
      doctorId,
      name,
      fields
    })
    const patientemplate = await template.save()
    res.status(201).json({
      status: 0,
      message: 'Template created successfully',
      data: [patientemplate.doctorId, patientemplate._id]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.renameTemplate = async (req, res) => {
  const { doctorId, templateId, name } = req.body

  try {
    if (!doctorId || !templateId || !name) {
      return res
        .status(400)
        .send({ status: 'error', message: 'Missing required fields' })
    }

    const patientemplate = PatientTemplate.findById(templateId)

    if (!patientemplate) {
      return res
        .status(404)
        .send({ status: 'error', message: 'Template not found' })
    }

    if (patientemplate.doctorId.toString() !== doctorId) {
      return res.status(403).send({ status: 'error', message: 'Unauthorized' })
    }

    const updatedTemplate = await PatientTemplate.findByIdAndUpdate(
      templateId,
      { name },
      { new: true }
    )

    res.status(200).json({
      status: 0,
      message: 'Template renamed successfully',
      data: [updatedTemplate.doctorId, updatedTemplate._id]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deleteTemplate = async (req, res) => {
  const { doctorId, templateId } = req.body

  try {
    if (!doctorId || !templateId) {
      return res
        .status(400)
        .send({ status: 'error', message: 'Missing required fields' })
    }

    const patientemplate = PatientTemplate.findById(templateId)

    if (patientemplate.doctorId.toString() !== doctorId) {
      return res.status(403).send({ status: 'error', message: 'Unauthorized' })
    }

    if (!patientemplate) {
      return res
        .status(404)
        .send({ status: 'error', message: 'Template not found' })
    }

    /* Cuando se tenga Record, se utilizara esta programacion defensiva
        const patientUsingTemplate = await Record.findOne({ 'template': templateId })

        if (patientUsingTemplate) {
            return res.status(409).send({ status: 'error', message: 'Cannot delete template: it is being used by a patient.' });
        }*/

    await PatientTemplate.findByIdAndDelete(templateId)

    res.status(200).json({
      status: 0,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getTemplate = async (req, res) => {
  const { doctorId, templateId } = req.query

  try {
    if (!doctorId || !templateId) {
      return res
        .status(400)
        .send({ status: 'error', message: 'Missing required fields' })
    }

    const patientemplate = PatientTemplate.findById(templateId)

    if (patientemplate.doctorId.toString() !== doctorId) {
      return res.status(403).send({ status: 'error', message: 'Unauthorized' })
    }

    if (!patientemplate) {
      return res
        .status(404)
        .send({ status: 'error', message: 'Template not found' })
    }

    res.status(200).json({
      status: 0,
      message: 'Template found',
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
        .send({ status: 'error', message: 'Missing required fields' })
    }

    const patientemplates = PatientTemplate.find({ doctorId })

    for (let i = 0; i < patientemplates.length; i++) {
      if (patientemplates[i].doctorId.toString() !== doctorId) {
        return res
          .status(403)
          .send({ status: 'error', message: 'Unauthorized' })
      }
    }

    const total = PatientTemplate.countDocuments({ doctorId })

    res.status(200).json({
      status: 0,
      message: 'Templates found',
      data: [patientemplates, total]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
