const COMMON_MSG = require('./errorMsg')
const mongoose = require('mongoose')

const ISO_8601_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?)?$/

const emptyFields = (res, ...fields) => {
  for (let field of fields) {
    if (!field) {
      res.status(400).json({ status: 400, message: COMMON_MSG.MISSING_FIELDS })
      return false
    }
  }
  return true
}

const validArrays = (res, ...fields) => {
  for (let field of fields) {
    if (!Array.isArray(field) || field.length === 0) {
      res.status(400).json({ status: 400, message: COMMON_MSG.MISSING_FIELDS })
      return false
    }
  }
  return true
}

const validFields = (res, fields) => {
  // Check for duplicate field names
  const fieldNames = fields.map((field) => field.name)
  const duplicateFields = fieldNames.filter(
    (name, index) => fieldNames.indexOf(name) !== index
  )
  if (duplicateFields.length > 0) {
    res
      .status(400)
      .json({ status: 400, message: COMMON_MSG.DUPLICATE_FIELD_NAMES })
    return false
  }

  // Check for reserved field names and missing options on CHOICE fields
  for (const field of fields) {
    validField(res, field)
  }
  return true
}

const validField = (res, field) => {
  // Check for reserved field names and missing options on CHOICE fields
  const reservedNames = ['Nombres', 'Apellidos']

  if (reservedNames.includes(field.name)) {
    res
      .status(400)
      .json({ status: 400, message: COMMON_MSG.RESERVED_FIELD_NAMES })
    return false
  }

  if (field.type === 'CHOICE' && !field.options) {
    res.status(400).json({ status: 400, message: COMMON_MSG.MISSING_FIELDS })
    return false
  }
  return true
}

const validMongoId = (res, id, message) => {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id)
  if (!isValidObjectId) {
    res.status(404).json({ status: 404, message: message })
    return false
  }
  return true
}

/**
 * Checks that the values given for each field corresponds
 * and are valid to the type specified. If not apply a error
 * to the response.
 * @param {} res
 * @param {*} id
 * @param {*} fields
 */
const checkFieldType = (res, type, value, options) => {
  if (!type || !value) {
    res.status(400).send({ status: 405, message: COMMON_MSG.MISSING_FIELDS })
    return false
  }

  switch (type) {
    case 'NUMBER':
      if (typeof value === 'number' && !isNaN(value) && Number.isInteger(value))
        return true
      res
        .status(405)
        .send({ status: 405, message: COMMON_MSG.INVALID_FIELD_TYPE_NUMBER })
      return false

    case 'FLOAT':
      if (typeof value === 'number' && !isNaN(value)) return true
      res
        .status(405)
        .send({ status: 405, message: COMMON_MSG.INVALID_FIELD_TYPE_FLOAT })
      return false

    case 'DATE':
      if (ISO_8601_REGEX.test(value)) return true
      res
        .status(405)
        .send({ status: 405, message: COMMON_MSG.INVALID_FIELD_TYPE_DATE })
      return false

    case 'CHOICE':
      if (options && Array.isArray(options) && options.includes(value))
        return true
      res
        .status(405)
        .send({ status: 405, message: COMMON_MSG.INVALID_FIELD_TYPE_CHOICE })
      return false

    case 'SHORT_TEXT':
      if (typeof value === 'string') return true
      res.status(405).send({
        status: 405,
        message: COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
      })
      return false

    case 'TEXT':
      if (typeof value === 'string') return true
      res
        .status(405)
        .send({ status: 405, message: COMMON_MSG.INVALID_FIELD_TYPE_TEXT })
      return false

    default:
      res.status(405).send({ status: 405, message: COMMON_MSG.INVALID_TYPE })
      return false
  }
}

module.exports = {
  emptyFields,
  validArrays,
  validFields,
  validMongoId,
  validField,
  checkFieldType
}
