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

module.exports = { validateAndFormatFieldValue }
