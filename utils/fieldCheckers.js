const COMMON_MSG = require('./errorMsg')
const mongoose = require('mongoose')

const emptyFields = (res, ...fields) => {
  for (let field of fields) {
    if (!field) {
      res.status(400).json({ status: 400, message: COMMON_MSG.MISSING_FIELDS })
      return false
    }
  }
  return true
}

const validArrays = (res, fields, categories) => {
  if (
    !Array.isArray(fields) ||
    fields.length === 0 ||
    !Array.isArray(categories) ||
    categories.length === 0
  ) {
    res.status(400).json({ status: 400, message: COMMON_MSG.MISSING_FIELDS })
    return false
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
  const reservedNames = ['Nombres', 'Apellidos']
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

module.exports = {
  emptyFields,
  validArrays,
  validFields,
  validMongoId,
  validField
}
