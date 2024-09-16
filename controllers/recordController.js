const Record = require('../models/recordModel')
const { options } = require('../routes/recordRoutes')

// Create a new record
exports.createRecord = async (req, res) => {
  const { doctor, template, patient } = req.body

  /*
    const isValidObjectId = mongoose.Types.ObjectId.isValid(doctor)
    const isValidtemplateId = mongoose.Types.ObjectId.isValid(template)
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

    if (record.doctor.toString() !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const updatedRecord = await Record.findByIdAndUpdate(
      recordId,
      { patient },
      { new: true }
    )

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

    if (record.doctor.toString() !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await Record.findByIdAndDelete(recordId)

    res.status(200).json({ message: 'Record deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting the record' })
  }
}

// List records
exports.listRecords = async (req, res) => {
  const { doctorId, limit, offset, sorts, filters } = req.body

  try {
    let query = { doctor: doctorId }

    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        const { name, operation, value, logicGate } = filter
        const filterQuery = {}

        //TEXT and LARGE TEXT
        if (operation === 'contains') {
          filterQuery[`patient.fields`] = {
            $elemMatch: { name, value: { $regex: value, $options: 'i' } }
          }
        } else if (operation === 'starts_with') {
          filterQuery[`patient.fields`] = {
            $elemMatch: { name, value: { $regex: `^${value}`, $options: 'i' } }
          }
        } else if (operation === 'ends_with') {
          filterQuery[`patient.fields`] = {
            $elemMatch: { name, value: { $regex: `${value}$`, $options: 'i' } }
          }
        }

        // DATE
        if (operation === 'after') {
          // Verificar si el value es un valor de tipo Date válido
          if (!isNaN(Date.parse(value))) {
            filterQuery['patient.fields'] = {
              $elemMatch: { name, value: { $gte: new Date(value) } }
            }
          } else {
            throw new Error(
              `Invalid date format for 'after' operation: ${value}`
            )
          }
        } else if (operation === 'before') {
          // Verificar si el value es un valor de tipo Date válido
          if (!isNaN(Date.parse(value))) {
            filterQuery['patient.fields'] = {
              $elemMatch: { name, value: { $lt: new Date(value) } }
            }
          } else {
            throw new Error(
              `Invalid date format for 'before' operation: ${value}`
            )
          }
        } else if (operation === 'between') {
          // Verificar si ambos valores son de tipo Date válido
          if (
            Array.isArray(value) &&
            value.length === 2 &&
            !isNaN(Date.parse(value[0])) &&
            !isNaN(Date.parse(value[1]))
          ) {
            filterQuery['patient.fields'] = {
              $elemMatch: {
                name,
                value: { $gt: new Date(value[0]), $lt: new Date(value[1]) }
              }
            }
          } else {
            throw new Error(
              `Invalid date format for 'between' operation: ${value}`
            )
          }
        }

        // NUMBER and FLOAT
        if (operation === 'greater_than') {
          // Verificar si el value es un número válido
          if (!isNaN(Number(value))) {
            filterQuery[`patient.fields`] = {
              $elemMatch: { name, value: { $gte: Number(value) } }
            }
          } else {
            throw new Error(
              `Invalid number format for 'greater_than' operation: ${value}`
            )
          }
        } else if (operation === 'less_than') {
          // Verificar si el value es un número válido
          if (!isNaN(Number(value))) {
            filterQuery[`patient.fields`] = {
              $elemMatch: { name, value: { $lt: Number(value) } }
            }
          } else {
            throw new Error(
              `Invalid number format for 'less_than' operation: ${value}`
            )
          }
        } else if (operation === 'equal_than') {
          // Verificar si el value es un número válido
          if (!isNaN(Number(value))) {
            filterQuery[`patient.fields`] = {
              $elemMatch: { name, value: { $eq: Number(value) } }
            }
          } else {
            throw new Error(
              `Invalid number format for 'equal_than' operation: ${value}`
            )
          }
        }

        // CHOICE
        if (operation === 'is') {
          filterQuery[`patient.fields`] = {
            $elemMatch: { name, value: value, options: { $in: [value] } }
          }
        } else if (operation === 'is_not') {
          filterQuery[`patient.fields`] = {
            $elemMatch: {
              name,
              value: { $ne: value, options: { $in: [value] } }
            }
          }
        } else if (operation === 'is_not_empty') {
          filterQuery[`patient.fields`] = {
            $elemMatch: {
              name,
              value: { $ne: '' },
              options: { $exists: true, $ne: [] }
            }
          }
        }

        //LOGIC GATE
        if (logicGate === 'or') {
          query = { $or: [query, filterQuery] }
        } else {
          //default to AND logic
          query = { ...query, ...filterQuery }
        }
      })
    }

    let sort = {}
    if (sorts && sorts.length > 0) {
      sorts.forEach((sortCriteria) => {
        const { name, mode } = sortCriteria
        sort[`patient.fields.${name}.value`] = mode === 'asc' ? 1 : -1
      })
    }

    const records = await Record.find(query)
      .sort(sort)
      .skip(parseInt(offset))
      .limit(parseInt(limit))

    if (!records || records.length === 0) {
      return res.status(404).json({ error: 'Records not found' })
    }

    const total = await Record.countDocuments(query)

    res.status(200).json({ records, total })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get a record by its ID
exports.getRecordById = async (req, res) => {
  const { doctorId, recordId } = req.query

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
    if (record.doctor.toString() !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    res.status(200).json({ record })
  } catch (error) {
    res.status(500).json({ error: 'Error getting the record' })
  }
}
