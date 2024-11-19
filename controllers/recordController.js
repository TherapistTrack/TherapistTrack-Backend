const Record = require('../models/recordModel')
const PatientTemplate = require('../models/patientTemplateModel')
const mongoose = require('mongoose')
const { validateAndFormatFieldValue } = require('../utils/validatorConfig')
const COMMON_MSG = require('../utils/errorMsg')
const {
  emptyFields,
  validArrays,
  validFields,
  validMongoId,
  validField,
  checkFieldType
} = require('../utils/fieldCheckers')
const {
  checkExistenceName,
  checkExistenceId,
  checkDoctor,
  checkExistingField,
  doctorActive
} = require('../utils/requestCheckers')
const {
  buildFilterExpression,
  buildSortStage,
  buildProjection
} = require('../utils/filterUtils')
const File = require('../models/fileModel')

exports.createRecord = async (req, res) => {
  const { doctorId, templateId, patient } = req.body

  try {
    if (!emptyFields(res, doctorId, templateId, patient)) {
      return
    }

    if (!emptyFields(res, patient.fields)) return

    if (!emptyFields(res, patient.names, patient.lastnames)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return
    if (!validMongoId(res, templateId, COMMON_MSG.TEMPLATE_NOT_FOUND)) return

    if (!(await doctorActive(res, doctorId))) return

    const template = await PatientTemplate.findById(templateId)
    if (!template) {
      return res.status(404).json({
        status: 404,
        message: COMMON_MSG.TEMPLATE_NOT_FOUND
      })
    }

    const formattedFields = template.fields.map((templateField) => {
      const patientField = patient.fields.find(
        (field) => field.name === templateField.name
      )

      if (!patientField) {
        return res.status(404).json({
          status: 404,
          message: COMMON_MSG.MISSING_FIELDS_IN_TEMPLATE
        })
      }

      let value = patientField ? patientField.value : null

      if (
        !checkFieldType(res, templateField.type, value, templateField.options)
      )
        return

      if (value !== null && value !== undefined) {
        switch (templateField.type) {
          case 'DATE': {
            if (
              typeof value === 'number' ||
              typeof value === 'boolean' ||
              Array.isArray(value)
            ) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_DATE
              })
            }

            value = new Date(value)
            if (isNaN(value.getTime())) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_DATE
              })
            }
            break
          }
          case 'NUMBER': {
            if (
              typeof value === 'string' ||
              typeof value === 'boolean' ||
              Array.isArray(value) ||
              isNaN(parseFloat(value)) ||
              !Number.isInteger(parseFloat(value))
            ) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
              })
            }
            value = parseInt(value, 10)
            break
          }
          case 'FLOAT': {
            if (
              typeof value === 'string' ||
              typeof value === 'boolean' ||
              Array.isArray(value) ||
              isNaN(parseFloat(value))
            ) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_FLOAT
              })
            }
            value = parseFloat(value)
            break
          }
          case 'CHOICE': {
            if (typeof value !== 'string' && typeof value !== 'number') {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
              })
            }
            if (typeof value === 'number') {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
              })
            }
            if (!templateField.options.includes(value)) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_VALUE_CHOICE
              })
            }
            break
          }
          case 'TEXT':
          case 'SHORT_TEXT': {
            if (typeof value !== 'string') {
              return res.status(405).json({
                status: 405,
                message:
                  templateField.type === 'TEXT'
                    ? COMMON_MSG.INVALID_FIELD_TYPE_TEXT
                    : COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
              })
            }
            break
          }
          default: {
            return res.status(405).json({
              status: 405,
              message: `Tipo de campo "${templateField.type}" no reconocido.`
            })
          }
        }
      }

      return {
        name: templateField.name,
        type: templateField.type,
        options: Array.isArray(templateField.options)
          ? templateField.options
          : [],
        value,
        required: templateField.required
      }
    })

    for (const field of formattedFields) {
      if (
        field.required &&
        (field.value === null || field.value === undefined)
      ) {
        return res.status(400).json({
          status: 400,
          message: `El campo "${field.name}" es requerido y no tiene un valor asignado.`
        })
      }
    }

    const record = new Record({
      doctor: doctorId,
      template: templateId,
      patient: {
        names: patient.names,
        lastNames: patient.lastnames,
        fields: formattedFields
      }
    })

    const recordSaved = await record.save()

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      recordId: recordSaved._id
    })
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: 500, message: error.message })
    }
  }
}

exports.editRecord = async (req, res) => {
  const { recordId, doctorId, patient } = req.body

  try {
    if (!emptyFields(res, doctorId, recordId, patient)) return
    if (!validArrays(res, patient.fields)) return
    if (!validMongoId(res, recordId, COMMON_MSG.INVALID_RECORD_ID)) return
    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    if (
      !(await checkExistenceId(
        res,
        Record,
        recordId,
        COMMON_MSG.RECORD_NOT_FOUND
      ))
    )
      return
    if (!(await checkDoctor(res, Record, doctorId, recordId))) return

    const record = await Record.findById(recordId)
    const template = await PatientTemplate.findById(record.template)
    const templateFields = template.fields

    let updatedPatient = { ...record.patient }

    for (let field of patient.fields) {
      const existingField = updatedPatient.fields.find(
        (f) => f.name === field.name
      )
      if (existingField) {
        existingField.value = field.value
      }
    }

    for (let templateField of templateFields) {
      const patientField = patient.fields.find(
        (field) => field.name === templateField.name
      )

      if (!patientField) {
        return res.status(404).json({
          status: 404,
          message: COMMON_MSG.MISSING_FIELDS_IN_TEMPLATE
        })
      }

      const fieldInRequest = updatedPatient.fields.find(
        (field) => field.name === templateField.name
      )

      if (templateField.required) {
        if (
          !fieldInRequest ||
          fieldInRequest.value === undefined ||
          fieldInRequest.value === null
        ) {
          return res.status(400).json({
            status: 400,
            message: `Missing required field: ${templateField.name}`
          })
        }
      }

      if (fieldInRequest) {
        const value = fieldInRequest.value

        switch (templateField.type) {
          case 'TEXT':
          case 'SHORT_TEXT': {
            if (typeof value !== 'string') {
              return res.status(405).json({
                status: 405,
                message:
                  templateField.type === 'TEXT'
                    ? COMMON_MSG.INVALID_FIELD_TYPE_TEXT
                    : COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
              })
            }
            if (
              typeof value === 'number' ||
              typeof value === 'boolean' ||
              Array.isArray(value)
            ) {
              return res.status(405).json({
                status: 405,
                message:
                  templateField.type === 'TEXT'
                    ? COMMON_MSG.INVALID_FIELD_TYPE_TEXT
                    : COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
              })
            }
            break
          }

          case 'NUMBER': {
            if (
              typeof value === 'string' ||
              typeof value === 'boolean' ||
              Array.isArray(value) ||
              isNaN(parseFloat(value)) ||
              !Number.isInteger(parseFloat(value))
            ) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
              })
            }
            break
          }

          case 'FLOAT': {
            if (
              typeof value === 'string' ||
              typeof value === 'boolean' ||
              Array.isArray(value) ||
              isNaN(parseFloat(value))
            ) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_FLOAT
              })
            }
            break
          }

          case 'CHOICE': {
            if (
              typeof value !== 'string' &&
              typeof value !== 'number' // Solo permite cadenas o números
            ) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
              })
            }
            if (typeof value === 'number') {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
              })
            }
            const normalizedValue = value.toString()
            const normalizedOptions = templateField.options.map((option) =>
              option.toString()
            )
            if (!normalizedOptions.includes(normalizedValue)) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_CHOICE_VALUE
              })
            }
            break
          }

          case 'DATE': {
            const date = new Date(value)
            if (
              typeof value === 'number' ||
              typeof value === 'boolean' ||
              Array.isArray(value) ||
              isNaN(date.getTime())
            ) {
              return res.status(405).json({
                status: 405,
                message: COMMON_MSG.INVALID_FIELD_TYPE_DATE
              })
            }
            break
          }

          default: {
            return res.status(405).json({
              status: 405,
              message: `Unrecognized field type: ${templateField.type}`
            })
          }
        }
      }
    }

    await Record.findByIdAndUpdate(
      recordId,
      {
        patient: {
          ...updatedPatient,
          names: patient.names || updatedPatient.names,
          lastnames: patient.lastnames || updatedPatient.lastnames
        }
      },
      { new: true }
    )

    res.status(200).json({ status: 200, message: COMMON_MSG.REQUEST_SUCCESS })
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

exports.deleteRecord = async (req, res) => {
  const { doctorId, recordId } = req.body

  try {
    if (!emptyFields(res, doctorId, recordId)) return

    if (!validMongoId(res, recordId, COMMON_MSG.INVALID_RECORD_ID)) return
    if (!validMongoId(res, doctorId, COMMON_MSG.INVALID_DOCTOR_ID)) return

    if (!(await doctorActive(res, doctorId))) return

    if (!(await checkDoctor(res, Record, doctorId, recordId))) return

    const files = await File.find({ record: recordId })

    if (files.length > 0) {
      return res
        .status(409)
        .json({ status: 409, message: COMMON_MSG.OPERATION_REJECTED })
    }

    await Record.findByIdAndDelete(recordId)

    res.status(200).json({ status: 200, message: COMMON_MSG.REQUEST_SUCCESS })
  } catch (error) {
    console.error('Error deleting record:', error)
    res.status(500).json({ status: 500, error: error.message })
  }
}

exports.listRecords = async (req, res) => {
  const { doctorId } = req.query

  try {
    if (!emptyFields(res, doctorId)) return
    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    const records = await PatientTemplate.find({ doctor: doctorId })

    let allFields = records.flatMap((record) => record.fields)

    const uniqueFields = []
    const seenFields = new Set()

    allFields.forEach((field) => {
      const fieldIdentifier = `${field.name}_${field.type}`
      if (!seenFields.has(fieldIdentifier)) {
        seenFields.add(fieldIdentifier)
        uniqueFields.push({
          name: field.name,
          type: field.type
        })
      }
    })

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      fields: uniqueFields
    })
  } catch (error) {
    res.status(500).json({ error: 'Error getting the records' })
  }
}

exports.getRecordById = async (req, res) => {
  const { doctorId, recordId } = req.query

  try {
    if (!emptyFields(res, doctorId, recordId)) {
      return
    }

    if (!doctorId || !recordId) {
      return res.status(400).json({
        status: 400,
        message: COMMON_MSG.MISSING_FIELDS
      })
    }

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return
    if (!validMongoId(res, recordId, COMMON_MSG.RECORD_NOT_FOUND)) return

    if (!(await doctorActive(res, doctorId))) return

    if (
      !(await checkExistenceId(
        res,
        Record,
        recordId,
        COMMON_MSG.RECORD_NOT_FOUND
      ))
    )
      if (!(await checkDoctor(res, Record, doctorId, recordId))) return

    const record = await Record.findById(recordId)
    if (!record) {
      return res.status(404).json({
        status: 404,
        message: COMMON_MSG.RECORD_NOT_FOUND
      })
    }

    const patientTemplate = await PatientTemplate.findById(record.template)
    if (!patientTemplate) {
      return res.status(404).json({
        status: 404,
        message: COMMON_MSG.TEMPLATE_NOT_FOUND
      })
    }

    const { _id, template, createdAt, patient } = record

    const filteredFields = patient.fields.map(
      ({ _id, name, type, options, value, required }) => ({
        _id,
        name,
        type,
        options,
        value,
        required
      })
    )

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      recordId: _id,
      templateId: template,
      categories: patientTemplate.categories,
      createdAt,
      patient: {
        names: patient.names,
        lastnames: patient.lastNames,
        fields: filteredFields
      }
    })
  } catch (error) {
    console.error('Error fetching record:', error)
    res.status(500).json({ status: 500, error: 'Error getting the record' })
  }
}

exports.searchAndFilterRecords = async (req, res) => {
  const { doctorId, limit = 10, page = 1, fields, sorts, filters } = req.body

  try {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'Invalid doctor ID' })
    }

    const limitNum = parseInt(limit)
    const pageNum = parseInt(page) > 0 ? parseInt(page) - 1 : 0

    let pipeline = []

    // Stage 1: Match doctorId
    pipeline.push({
      $match: {
        doctor: new mongoose.Types.ObjectId(doctorId)
      }
    })

    // Stage 2: Add sort fields
    if (sorts && sorts.length > 0) {
      const { addFields: sortAddFields, sort } = buildSortStage(sorts)

      // Add fields for sorting
      if (Object.keys(sortAddFields).length > 0) {
        pipeline.push({ $addFields: sortAddFields })
      }

      // Add sort stage
      if (Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort })
      }
    }

    // Stage 3: Pagination
    pipeline.push({ $skip: pageNum * limitNum }, { $limit: limitNum })

    // Stage 4: Projection
    const projection = buildProjection(fields, filters)
    pipeline.push({ $project: projection })

    console.log('Pipeline:', JSON.stringify(pipeline, null, 2))
    // Execute the query
    const records = await Record.aggregate(pipeline)

    // Count pipeline
    const countPipeline = [
      {
        $match: {
          doctor: new mongoose.Types.ObjectId(doctorId)
        }
      },
      { $count: 'total' }
    ]

    const totalResult = await Record.aggregate(countPipeline)
    const totalCount = totalResult.length > 0 ? totalResult[0].total : 0

    res.status(200).json({
      status: 200,
      message: 'Search successful',
      records,
      total: totalCount
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}
