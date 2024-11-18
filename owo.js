const yup = require('yup')
const { iso8601Regex } = require('./tests/testHelpers')
const COMMON_MSG = require('./utils/errorMsg')

const LIST_FIELDS_SCHEMA = yup.object().shape({
  status: yup.number().required().oneOf([200]),
  message: yup.string().required().oneOf([COMMON_MSG.REQUEST_SUCCESS]),
  fields: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required(),
        type: yup
          .string()
          .required()
          .oneOf(['TEXT', 'SHORT_TEXT', 'NUMBER', 'FLOAT', 'CHOICE', 'DATE'])
      })
    )
    .required()
})

let response = LIST_FIELDS_SCHEMA.validate({
  status: 200,
  message: 'Request succesful.',
  fields: [{}]
})

console.log(response)
