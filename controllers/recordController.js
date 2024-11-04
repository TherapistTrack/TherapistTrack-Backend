const Record = require('../models/recordModel')
const PatientTemplate = require('../models/patientTemplateModel')
const mongoose = require('mongoose')
const { validateAndFormatFieldValue } = require('../utils/validatorConfig')
const { options } = require('../routes/recordRoutes')
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
  checkExistingField,
  doctorActive
} = require('../utils/requestCheckers')

function buildFilterExpression(filters) {
  let expressions = []
  let currentLogic = '$and'
  let logicStack = []

  filters.forEach((filter, index) => {
    const { name, type, operation, values, logicGate = 'and' } = filter

    // Construir la expresión de condición para el filtro actual
    const condition = buildFilterCondition(name, type, operation, values, index)

    // Añadir la condición al arreglo de expresiones
    expressions.push(condition)

    // Manejar el logicGate
    if (logicGate.toLowerCase() === 'or') {
      // Si es 'or', combinar las últimas dos expresiones
      if (expressions.length >= 2) {
        const expr1 = expressions.pop()
        const expr2 = expressions.pop()
        expressions.push({ $or: [expr2, expr1] })
      }
    } else {
      // Si es 'and', las expresiones se combinarán naturalmente en $and
    }
  })

  // Si solo hay una expresión, devolverla directamente
  if (expressions.length === 1) {
    return expressions[0]
  } else if (expressions.length > 1) {
    // Combinar todas las expresiones restantes con $and
    return { $and: expressions }
  } else {
    return {}
  }
}

// Función para construir la condición de un filtro individual
function buildFilterCondition(name, type, operation, values, index) {
  const fieldPath = `$patient.fields`
  const fieldAlias = `field_${index}`
  const valueAlias = `value_${index}`

  // Crear una expresión para extraer el campo
  const fieldExpr = {
    $arrayElemAt: [
      {
        $filter: {
          input: fieldPath,
          as: 'field',
          cond: { $eq: ['$$field.name', name] }
        }
      },
      0
    ]
  }

  // Convertir el valor según el tipo
  let convertedValue
  if (type === 'NUMBER' || type === 'FLOAT') {
    convertedValue = {
      $convert: {
        input: `$${fieldAlias}.value`,
        to: 'double',
        onError: null,
        onNull: null
      }
    }
  } else if (type === 'DATE') {
    convertedValue = {
      $toDate: `$${fieldAlias}.value`
    }
  } else {
    // Otros tipos
    convertedValue = `$${fieldAlias}.value`
  }

  // Construir la condición basada en la operación
  let condition = {}

  switch (operation) {
    case 'less_than':
      condition = { $lt: [convertedValue, parseValue(type, values[0])] }
      break
    case 'equal_than':
      condition = { $eq: [convertedValue, parseValue(type, values[0])] }
      break
    case 'greater_than':
      condition = { $gt: [convertedValue, parseValue(type, values[0])] }
      break
    case 'between':
      condition = {
        $and: [
          { $gte: [convertedValue, parseValue(type, values[0])] },
          { $lte: [convertedValue, parseValue(type, values[1])] }
        ]
      }
      break
    case 'contains':
      condition = {
        $regexMatch: {
          input: convertedValue,
          regex: values[0],
          options: 'i'
        }
      }
      break
    case 'starts_with':
      condition = {
        $regexMatch: {
          input: convertedValue,
          regex: `^${values[0]}`,
          options: 'i'
        }
      }
      break
    case 'ends_with':
      condition = {
        $regexMatch: {
          input: convertedValue,
          regex: `${values[0]}$`,
          options: 'i'
        }
      }
      break
    case 'is':
      condition = { $eq: [convertedValue, values[0]] }
      break
    case 'is_not':
      condition = { $ne: [convertedValue, values[0]] }
      break
    case 'is_not_empty':
      condition = { $ne: [convertedValue, null] }
      break
    case 'after':
      condition = { $gt: [convertedValue, parseValue(type, values[0])] }
      break
    case 'before':
      condition = { $lt: [convertedValue, parseValue(type, values[0])] }
      break
    default:
      throw new Error(`Operación de filtro no soportada: ${operation}`)
  }

  // Crear la expresión $let para utilizar alias
  const filterCondition = {
    $let: {
      vars: {
        [fieldAlias]: fieldExpr,
        [valueAlias]: convertedValue
      },
      in: condition
    }
  }

  return filterCondition
}

// Función para construir la etapa de ordenamiento
function buildSortStage(sorts) {
  let addFields = {}
  let sort = {}

  const MAX_NUMBER = Number.MAX_SAFE_INTEGER
  const MIN_NUMBER = -Number.MAX_SAFE_INTEGER

  sorts.forEach((sortObj, index) => {
    const { name, type, mode } = sortObj
    const fieldAlias = `sortField_${index}`
    const valueAlias = `sortValue_${index}`
    const sortValueAlias = `sortValueForSort_${index}`
    const order = mode === 'asc' ? 1 : -1

    // Extraer el campo
    addFields[fieldAlias] = {
      $arrayElemAt: [
        {
          $filter: {
            input: '$patient.fields',
            as: 'field',
            cond: { $eq: ['$$field.name', name] }
          }
        },
        0
      ]
    }

    // Convertir el valor según el tipo
    if (type === 'NUMBER' || type === 'FLOAT') {
      addFields[valueAlias] = {
        $toDouble: `$${fieldAlias}.value`
      }
    } else if (type === 'DATE') {
      addFields[valueAlias] = {
        $toDate: `$${fieldAlias}.value`
      }
    } else {
      addFields[valueAlias] = `$${fieldAlias}.value`
    }

    // Manejar valores nulos en el ordenamiento
    addFields[sortValueAlias] = {
      $ifNull: [`$${valueAlias}`, order === 1 ? MAX_NUMBER : MIN_NUMBER]
    }

    // Definir el criterio de ordenamiento
    sort[sortValueAlias] = order
  })

  return { addFields, sort }
}

// Función para construir la proyección final
function buildProjection(fields, filters) {
  let projection = {
    _id: 0,
    recordId: { $toString: '$_id' },
    templateId: { $toString: '$template' },
    createdAt: {
      $dateToString: { format: '%Y/%m/%d', date: '$createdAt' }
    },
    'patient.names': 1,
    'patient.lastNames': 1
  }

  // Determinar los campos a proyectar
  let fieldNames = []

  if (fields && fields.length > 0) {
    fieldNames = fields.map((field) => field.name)
  }

  // Incluir campos de filtros si no están ya en fieldNames
  if (filters && filters.length > 0) {
    filters.forEach((filter) => {
      if (!fieldNames.includes(filter.name)) {
        fieldNames.push(filter.name)
      }
    })
  }

  if (fieldNames.length > 0) {
    projection['patient.fields'] = {
      $filter: {
        input: '$patient.fields',
        as: 'field',
        cond: { $in: ['$$field.name', fieldNames] }
      }
    }
  } else {
    projection['patient.fields'] = 1 // Proyectar todos los campos
  }

  return projection
}

// Función para parsear los valores según el tipo
function parseValue(type, value) {
  if (type === 'NUMBER' || type === 'FLOAT') {
    return Number(value)
  } else if (type === 'DATE') {
    return new Date(value)
  } else {
    return value
  }
}

exports.createRecord = async (req, res) => {
  const { doctorId, templateId, patient } = req.body

  try {
    if (
      !emptyFields(
        res,
        doctorId,
        templateId,
        patient,
        patient.names,
        patient.lastNames
      )
    )
      return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return
    if (!validMongoId(res, templateId, COMMON_MSG.TEMPLATE_NOT_FOUND)) return
    if (!doctorActive(res, doctorId)) return

    const formattedFields = patient.fields.map((field) => {
      return {
        ...field,
        value: validateAndFormatFieldValue(field)
      }
    })

    console.log(f)

    const record = new Record({
      doctor: doctorId,
      template: templateId,
      patient: {
        ...patient,
        fields: formattedFields
      }
    })

    const recordSaved = await record.save()

    return res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      recordId: recordSaved._id
    })
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

exports.editRecord = async (req, res) => {
  const { recordId, doctorId, patient } = req.body

  try {
    if (!emptyFields(res, doctorId, recordId, patient)) return

    if (!validArrays(res, patient.fields)) return

    if (!validMongoId(res, recordId, COMMON_MSG.INVALID_RECORD_ID)) return
    if (!validMongoId(res, doctorId, COMMON_MSG.INVALID_DOCTOR_ID)) return

    if (
      !(await checkExistenceId(
        res,
        Record,
        recordId,
        COMMON_MSG.TEMPLATE_NOT_FOUND
      ))
    )
      return

    if (!(await checkDoctor(res, Record, doctorId, recordId))) return

    const record = await Record.findById(recordId)
    const template = await PatientTemplate.findById(record.template)
    const templateFields = template.fields

    let updatedPatient = { ...record.patient }

    for (let field of patient.fields) {
      for (let existingField of updatedPatient.fields) {
        if (field.name === existingField.name) {
          existingField.value = field.value
        }
      }
    }

    for (let field of updatedPatient.fields) {
      for (let templateField of templateFields) {
        if (field.name === templateField.name) {
          if (
            (templateField.type === 'TEXT' ||
              templateField.type === 'SHORT_TEXT') &&
            isNaN(String(field.value))
          ) {
            return res
              .status(405)
              .json({ error: `Invalid value for field ${field.name}` })
          }
          if (
            (templateField.type === 'NUMBER' ||
              templateField.type === 'FLOAT') &&
            isNaN(Number(field.value))
          ) {
            return res
              .status(405)
              .json({ error: `Invalid value for field ${field.name}` })
          }
          if (templateField.type === 'CHOICE' && !field.options) {
            return res
              .status(405)
              .json({ error: `Invalid value for field ${field.name}` })
          }
          if (
            templateField.type === 'CHOICE' &&
            !templateField.options.includes(field.value)
          ) {
            return res
              .status(405)
              .json({ error: `Invalid value for field ${field.name}` })
          }
          if (templateField.type === 'DATE' && isNaN(Date.parse(field.value))) {
            return res
              .status(405)
              .json({ error: `Invalid value for field ${field.name}` })
          }
        }
      }
    }

    await Record.findByIdAndUpdate(
      recordId,
      { patient: updatedPatient },
      { new: true }
    )
    res.status(200).json({ status: 200, message: COMMON_MSG.RECORD_UPDATED })
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message })
  }
}

exports.deleteRecord = async (req, res) => {
  const { doctorId, recordId } = req.body

  try {
    if (!emptyFields(res, doctorId, recordId)) return

    if (!validMongoId(res, recordId, COMMON_MSG.INVALID_RECORD_ID)) return
    if (!validMongoId(res, doctorId, COMMON_MSG.INVALID_DOCTOR_ID)) return

    if (!(await checkDoctor(res, Record, doctorId, recordId))) return

    /* when endpoints for file management are created
    const files = await File.find({ record: recordId })

    if (files.length > 0) {
      return res
        .status(409)
        .json({ status: 409, message: COMMON_MSG.RECORD_HAS_FILES })
    }*/

    await Record.findByIdAndDelete(recordId)

    res.status(200).json({ status: 200, message: COMMON_MSG.RECORD_DELETED })
  } catch (error) {
    res.status(500).json({ status: 500, error: COMMON_MSG.SERVER_ERROR })
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
    if (!emptyFields(res, doctorId, recordId)) return

    if (!validMongoId(res, doctorId, COMMON_MSG.DOCTOR_NOT_FOUND)) return

    if (!validMongoId(res, recordId, COMMON_MSG.RECORD_NOT_FOUND)) return

    const record = await Record.findById(recordId)

    if (!record) {
      return res
        .status(404)
        .json({ status: 404, message: COMMON_MSG.RECORD_NOT_FOUND })
    }

    const patientTemplate = await PatientTemplate.findById(record.template)
    const { _id, template, createdAt, patient } = record

    const filteredFields = patient.fields.map(({ _id, ...rest }) => rest)

    res.status(200).json({
      status: 200,
      message: COMMON_MSG.REQUEST_SUCCESS,
      recordId: _id,
      templateId: template,
      categories: patientTemplate.categories,
      createdAt,
      patient: {
        ...patient,
        fields: filteredFields
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Error getting the record' })
  }
}

exports.searchAndFilterRecords = async (req, res) => {
  const { doctorId, limit = 10, page = 1, fields, sorts, filters } = req.body

  try {
    // Validar doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'ID de doctor inválido' })
    }

    // Convertir limit y page a números
    const limitNum = parseInt(limit)
    const pageNum = parseInt(page) > 0 ? parseInt(page) - 1 : 0

    // Construir el pipeline de agregación
    let pipeline = []

    // Etapa 1: Filtrar por doctorId
    pipeline.push({
      $match: {
        doctor: new mongoose.Types.ObjectId(doctorId)
      }
    })

    // Etapa 2: Procesar filtros
    if (filters && filters.length > 0) {
      // Crear una expresión $expr para combinar condiciones
      let filterExpr = buildFilterExpression(filters)

      if (Object.keys(filterExpr).length > 0) {
        pipeline.push({
          $match: {
            $expr: filterExpr
          }
        })
      }
    }

    // Etapa 3: Procesar ordenamientos
    if (sorts && sorts.length > 0) {
      let sortStage = buildSortStage(sorts)
      if (sortStage.addFields) {
        pipeline.push({ $addFields: sortStage.addFields })
      }
      if (sortStage.sort) {
        pipeline.push({ $sort: sortStage.sort })
      }
    }

    // Etapa 4: Paginación
    pipeline.push({ $skip: pageNum * limitNum })
    pipeline.push({ $limit: limitNum })

    // Etapa 5: Proyección final
    let projection = buildProjection(fields, filters)
    pipeline.push({ $project: projection })

    // Ejecutar la consulta
    const records = await Record.aggregate(pipeline)

    // Obtener el total de documentos que cumplen las condiciones (sin paginación)
    const countPipeline = pipeline.filter(
      (stage) => !('$skip' in stage || '$limit' in stage)
    )
    countPipeline.push({ $count: 'total' })
    const totalResult = await Record.aggregate(countPipeline)
    const totalCount = totalResult.length > 0 ? totalResult[0].total : 0

    // Responder con los resultados
    res.status(200).json({
      status: 200,
      message: 'Búsqueda de expedientes exitosa',
      records,
      total: totalCount
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}
