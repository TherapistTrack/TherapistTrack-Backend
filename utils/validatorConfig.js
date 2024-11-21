const validateAndFormatFieldValue = (field) => {
  const { type, value, options } = field

  switch (type) {
    case 'NUMBER':
      if (typeof value === 'number') return value
      if (!isNaN(value)) return Number(value)
      throw new Error(`Invalid NUMBER value for field ${field.name}`)

    case 'FLOAT':
      if (typeof value === 'number') return value
      if (!isNaN(value)) return parseFloat(value)
      throw new Error(`Invalid FLOAT value for field ${field.name}`)

    case 'DATE':
      if (new Date(value).toISOString() === value) return value
      throw new Error(
        `Invalid DATE format for field ${field.name}. Must be in ISO8601 format.`
      )

    case 'CHOICE':
      if (!options || !Array.isArray(options) || !options.includes(value)) {
        throw new Error(
          `Invalid CHOICE value for field ${field.name}. Must be one of ${options.join(', ')}`
        )
      }
      return value

    case 'SHORT_TEXT':
    case 'TEXT':
      if (typeof value !== 'string') {
        throw new Error(`Invalid TEXT value for field ${field.name}`)
      }
      return value

    default:
      throw new Error(`Unsupported field type ${type} for field ${field.name}`)
  }
}

const isValidValue = (value, type, options = []) => {
  switch (type) {
    case 'TEXT':
    case 'SHORT_TEXT':
      return typeof value === 'string'

    case 'NUMBER':
      return typeof value === 'number' && Number.isInteger(value)

    case 'FLOAT':
      return typeof value === 'number'

    case 'BOOLEAN':
      return typeof value === 'boolean'

    case 'DATE':
      return typeof value === 'string' && !isNaN(Date.parse(value))

    case 'CHOICE':
      return typeof value === 'string' && options.includes(value)

    default:
      return false
  }
}

module.exports = { validateAndFormatFieldValue, isValidValue }
