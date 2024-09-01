const Record = require('../models/recordModel')

// Create a new record
exports.createRecord = async (req, res) => {
  const { doctor, template, patient } = req.body

  /*
    const isValidObjectId = mongoose.Types.ObjectId.isValid(doctorId)
    const isValidtemplateId = mongoose.Types.ObjectId.isValid(templateId)
    if (!isValidObjectId || !isValidtemplateId) {
       return res.status(400).send({ status: 'error', message: 'Invalid record or template ID' });
    }
    */

  try {
    const newRecord = new Record({
      doctor,
      template,
      patient
    })

    const savedRecord = await newRecord.save()

    res.status(201).json({
      recordId: savedRecord._id,
      message: 'Record created successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}

// Edit a record
exports.editRecord = async (req, res) => {
  const { doctorId, recordId, patient } = req.body

  /*
    const isValidObjectId = mongoose.Types.ObjectId.isValid(recordId)
    if (!isValidObjectId) {
       return res.status(400).send({ status: 'error', message: 'Invalid record ID' });
    }
    */

  try {
    const record = await Record.findById(recordId)

    const updatedRecord = await Record.findByIdAndUpdate(
      recordId,
      { patient },
      { new: true }
    )

    if (record.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (!updatedRecord) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.status(200).json({ message: 'Record updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Error updating the record' })
  }
}

// Delete a record
exports.deleteRecord = async (req, res) => {
  const { doctorId, recordId } = req.body

  /*
    const isValidObjectId = mongoose.Types.ObjectId.isValid(recordId)
    if (!isValidObjectId) {
       return res.status(400).send({ status: 'error', message: 'Invalid record ID' });
    }
    */

  try {
    const record = await Record.findById(recordId)
    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }
    if (record.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    await record.remove()
    res.status(200).json({ message: 'Record deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting the record' })
  }
}

// List records
exports.listRecords = async (req, res) => {
  const { doctorId, limit, offset } = req.body

  try {
    const records = await Record.find({ doctorId }).skip(offset).limit(limit)

    const total = await Record.countDocuments({ doctorId })

    res.status(200).json({
      records,
      total
    })
  } catch (error) {
    res.status(500).json({ error: 'Error listing the records' })
  }
}

// Get a record by its ID
exports.getRecordById = async (req, res) => {
  const { doctorId, recordId } = req.body

  /*
    const isValidObjectId = mongoose.Types.ObjectId.isValid(recordId)
    if (!isValidObjectId) {
       return res.status(400).send({ status: 'error', message: 'Invalid record ID' });
    }
    */

  try {
    const record = await Record.findById(recordId)

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }
    if (record.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    res.status(200).json({ record })
  } catch (error) {
    res.status(500).json({ error: 'Error getting the record' })
  }
}
