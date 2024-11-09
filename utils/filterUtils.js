/**
 * Parses values based on their type
 * @param {string} type - The field type (NUMBER, FLOAT, DATE, etc)
 * @param {*} value - The value to parse
 * @returns {number|Date|*} Parsed value
 */
function parseValue(type, value) {
  if (type === 'NUMBER' || type === 'FLOAT') {
    return Number(value)
  } else if (type === 'DATE') {
    return new Date(value)
  } else {
    return value
  }
}

/**
 * Builds MongoDB filter expression from filter conditions
 * @param {Array} filters - Array of filter objects
 * @returns {Object} Contains addFields and filterExpr
 */
exports.buildFilterExpression = (filters) => {
  let expressions = []
  let addFields = {}

  filters.forEach((filter, index) => {
    const {
      addFields: conditionAddFields,
      condition,
      logicGate
    } = buildFilterCondition(filter, index)

    // Merge addFields
    addFields = { ...addFields, ...conditionAddFields }

    // Handle logic gates between conditions
    if (logicGate.toLowerCase() === 'or' && expressions.length > 0) {
      const prevCondition = expressions.pop()
      expressions.push({ $or: [prevCondition, condition] })
    } else {
      // Default is 'and'
      expressions.push(condition)
    }
  })

  // Combine expressions
  let filterExpr = {}

  if (expressions.length === 1) {
    filterExpr = expressions[0]
  } else if (expressions.length > 1) {
    filterExpr = { $and: expressions }
  }

  return { addFields, filterExpr }
}

/**
 * Builds condition for individual filter
 * @param {Object} filter - Filter object with name, type, operation, values, and logicGate
 * @param {number} index - Filter index
 * @returns {Object} Contains addFields, condition, and logicGate
 */
function buildFilterCondition(filter, index) {
  const { operation, values, name, type, logicGate } = filter
  const fieldAlias = `filterField_${index}`
  const valueAlias = `filterValue_${index}`

  // Create an expression to extract the field
  const fieldExpr = {
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

  // Initialize addFields
  const addFields = {}

  // Add the field extraction
  addFields[fieldAlias] = fieldExpr

  // Convert the value according to the type and store in valueAlias
  if (type === 'NUMBER' || type === 'FLOAT') {
    addFields[valueAlias] = { $toDouble: `$${fieldAlias}.value` }
  } else if (type === 'DATE') {
    addFields[valueAlias] = { $toDate: `$${fieldAlias}.value` }
  } else {
    // Default to string
    addFields[valueAlias] = `$${fieldAlias}.value`
  }

  // Build the condition based on the operation
  let condition = {}

  const compareValue = parseValue(type, values[0])

  switch (operation) {
    case 'less_than':
      condition = { $lt: [`$${valueAlias}`, compareValue] }
      break
    case 'equal_than':
      condition = { $eq: [`$${valueAlias}`, compareValue] }
      break
    case 'greater_than':
      condition = { $gt: [`$${valueAlias}`, compareValue] }
      break
    case 'between':
      condition = {
        $and: [
          { $gte: [`$${valueAlias}`, parseValue(type, values[0])] },
          { $lte: [`$${valueAlias}`, parseValue(type, values[1])] }
        ]
      }
      break
    // Include other cases as needed
    default:
      throw new Error(`Unsupported filter operation: ${operation}`)
  }

  return { addFields, condition, logicGate }
}

/**
 * Builds projection stage for query results
 * @param {Array} fields - Array of field objects with name and type
 * @param {Array} filters - Applied filters
 * @returns {Object} Projection configuration
 */
exports.buildProjection = (fields, filters) => {
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

  // Determine the field names to project
  let fieldNames = []

  if (fields && fields.length > 0) {
    fieldNames = fields.map((field) => field.name)
  }

  // Include fields from filters if not already included
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
        cond: {
          $in: ['$$field.name', fieldNames]
        }
      }
    }
  } else {
    projection['patient.fields'] = 1 // Project all fields
  }

  return projection
}

/**
 * Builds MongoDB sort stage
 * @param {Array} sorts - Array of sort objects
 * @returns {Object} Contains addFields and sort
 */
exports.buildSortStage = (sorts) => {
  let addFields = {}
  let sort = {}

  sorts.forEach((sortObj, index) => {
    const { name, type, mode } = sortObj
    const valueAlias = `sortValue_${index}`

    // Extract the field value
    const fieldValueExpr = {
      $getField: {
        field: 'value',
        input: {
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
      }
    }

    // Convert the value according to the type
    let convertedValueExpr

    if (type === 'NUMBER' || type === 'FLOAT') {
      convertedValueExpr = { $toDouble: fieldValueExpr }
    } else if (type === 'DATE') {
      convertedValueExpr = { $toDate: fieldValueExpr }
    } else if (type === 'SHORT_TEXT' || type === 'TEXT' || type === 'CHOICE') {
      convertedValueExpr = { $toString: fieldValueExpr }
    } else {
      // Default to string
      convertedValueExpr = { $toString: fieldValueExpr }
    }

    // Add the converted value to addFields
    addFields[valueAlias] = convertedValueExpr

    // Add to sort
    sort[valueAlias] = mode === 'asc' ? 1 : -1
  })

  return { addFields, sort }
}
