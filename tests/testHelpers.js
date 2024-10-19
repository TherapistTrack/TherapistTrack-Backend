const axios = require('axios')
const { BASE_URL, getAuthToken } = require('./jest.setup')
const yup = require('yup')

/**
 * Makes a request using the specified axios method, and checks if it fails with the expected status and message.
 *
 * @param {string} axiosMethod - The axios method to use (e.g., axios.post, axios.get).
 * @param {string} url - The API endpoint URL to send the request to.
 * @param {headers} [body] - Request headers
 * @param {Object} [params={}] - An object representing query parameters to be included in the request.
 * @param {Object} [body=null] - The request body to be sent (null for GET or HEAD requests).
 * @param {number} expectedCode - The expected HTTP status code for the failure (e.g., 404, 401).
 * @param {string} expectedMsg - The expected error message in the response.
 *
 * @returns {Promise<void>} - Resolves if the response matches expectations, otherwise throws an error.
 */
async function checkFailRequest(
  method,
  url,
  headers,
  params,
  body,
  expectedCode,
  expectedMsg
) {
  try {
    const response = await axios.request({
      method,
      url,
      headers,
      params,
      data: body
    })
    if (response.status >= 200 && response.status < 300) {
      throw new Error(
        `Expected a failure, but got response with status: ${response.status}`
      )
    }
  } catch (error) {
    if (error.response) {
      expect(error.response.status).toBe(expectedCode)
      expect(error.response.data.message).toBe(expectedMsg)
    } else {
      throw error
    }
  }
}

/**
 * Generates a valid 24-character ObjectId.
 * The ID consists of an 8-character hexadecimal timestamp and
 * a 16-character random hexadecimal string.
 *
 * @returns {string} Doctor object data.
 */
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0')
  const randomPart = Math.random().toString(16).slice(2, 18).padEnd(16, '0')
  return timestamp + randomPart
}

/**
 * Creates a test doctor by sending a POST request to the user API.
 *
 * @returns {Promise<Object>} A promise that resolves to the created doctor user object.
 * @throws Will throw an error if the request fails.
 */
async function createTestDoctor() {
  try {
    const token = await getAuthToken()

    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Origin: 'http://localhost'
    }

    doctorUser = {
      id: generateObjectId(),
      names: 'Dummy',
      lastNames: 'User',
      phones: ['12345678'],
      rol: 'Doctor',
      mails: ['test-doctor@example.com'],
      roleDependentInfo: {
        collegiateNumber: '12345',
        specialty: 'testSpecialty'
      }
    }

    const response = await axios.post(
      `${BASE_URL}/users/register`,
      doctorUser,
      { headers }
    )
    doctorUser.roleDependentInfo.id = response.data.roleId // Adding role specific id
    return doctorUser
  } catch (error) {
    if (error.response) {
      console.log(
        `Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
      )
    } else {
      console.error(`Error: ${error.message || error}`)
    }
    throw new Error('Test failed')
  }
}

/**
 * Deletes a user by sending a DELETE request to the user deletion API.
 *
 * @param {string} userID - The ID of the user to be deleted.
 * @returns {Promise<void>} A promise that resolves when the user is deleted.
 * @throws Will throw an error if the request fails.
 */
async function deleteUser(userID) {
  try {
    await axios.delete(`${BASE_URL}/users/delete`, {
      data: { id: userID },
      headers
    })
    return
  } catch (error) {
    console.log(
      `Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
    )
    throw new Error('Test failed')
  }
}

/**
 * Creates a patient template for a doctor.
 *
 * @param {string} userID - Doctor ID to create the template for.
 * @param {object} template - tempalte structure.
 * @returns {Promise<string>} a Promise to the templateId created.
 * @throws Will throw an error if the request fails.
 */
async function createTestPatientTemplate(
  doctorId,
  templateName,
  categories,
  fields
) {
  const testTemplate = {
    doctorId: doctorId,
    name: templateName,
    categories: categories,
    fields: fields
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/doctor/PatientTemplate`,
      testTemplate,
      { headers }
    )
    return response.data.data.patientTemplateId // Guardar el ID de la plantilla creada
  } catch (error) {
    console.error(
      'Error creating template:',
      error.response ? error.response.data : error.message
    )
    throw error
  }
}

/**
 * Creates a patient template for a doctor.
 *
 * @param {string} userID - Doctor ID to create the template for.
 * @param {object} template - tempalte structure.
 * @returns {Promise<string>} a Promise to the templateId created.
 * @throws Will throw an error if the request fails.
 */
async function createTestFileTemplate(doctorId, templateName, fields) {
  const testTemplate = {
    doctorId: doctorId,
    name: templateName,
    fields: fields
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/doctor/FileTemplate`,
      testTemplate,
      { headers }
    )
    return response.data.data.fileTemplateId // Guardar el ID de la plantilla creada
  } catch (error) {
    console.error(
      'Error creating template:',
      error.response ? error.response.data : error.message
    )
    throw error
  }
}

/**
 * Creates a record for a patient based on a template.
 *
 * @param {string} doctorId - Doctor ID to create the record for.
 * @param {string} templateId - The template ID that the record is based on.
 * @param {object} patientData - Patient data including names, lastnames, and fields.
 * @returns {Promise<string>} a Promise to the recordId created.
 * @throws Will throw an error if the request fails.
 */
async function createTestRecord(doctorId, templateId, patientData) {
  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  const recordData = {
    doctorId: doctorId,
    templateId: templateId,
    patient: patientData
  }

  try {
    const response = await axios.post(`${BASE_URL}/records/`, recordData, {
      headers: HEADERS
    })
    return response.data.data.recordId
  } catch (error) {
    console.error(
      'Error creating record:',
      error.response ? error.response.data : error.message
    )
    throw error
  }
}

/**
 * Validates the structure of a Create Record response.
 * Ensures it follows the correct schema according to the documentation.
 *
 * @param {object} responseData - The response data to validate.
 * @throws Will throw an error if the validation fails.
 */
async function validateCreateRecordResponse(responseData) {
  const recordSchema = yup.object().shape({
    doctorId: yup.string().required(),
    templateId: yup.string().required(),
    patient: yup
      .object()
      .shape({
        names: yup.string().required(),
        lastnames: yup.string().required(),
        fields: yup
          .array()
          .of(
            yup.object().shape({
              name: yup.string().required(),
              options: yup.array().of(yup.string()).required(),
              value: yup.string().required()
            })
          )
          .required()
      })
      .required()
  })

  try {
    // Validar si la estructura sigue el esquema
    await recordSchema.validate(responseData, {
      strict: true,
      abortEarly: false
    })
    console.log('Record response structure is valid.')
  } catch (error) {
    console.error('Invalid response structure:', error.errors)
    throw error
  }
}

/**
 * Validates the structure of a Get Record response.
 * Ensures it follows the correct schema according to the documentation.
 *
 * @param {object} responseData - The response data to validate.
 * @throws Will throw an error if the validation fails.
 */
async function validateGetRecordResponse(responseData) {
  const recordSchema = yup.object().shape({
    status: yup.number().required().oneOf([0]),
    message: yup.string().required().oneOf(['Operation success!']),
    recordId: yup.string().required(),
    templateId: yup.string().required(),
    categories: yup.array().of(yup.array().of(yup.string())).required(),
    createdAt: yup.string().required(),
    patient: yup
      .object()
      .shape({
        names: yup.string().required(),
        lastnames: yup.string().required(),
        fields: yup
          .array()
          .of(
            yup.object().shape({
              name: yup.string().required(),
              type: yup
                .string()
                .required()
                .oneOf([
                  'TEXT',
                  'SHORT_TEXT',
                  'NUMBER',
                  'FLOAT',
                  'CHOICE',
                  'DATE'
                ]),
              options: yup.array().of(yup.string()).optional(),
              value: yup.string().required(),
              required: yup.boolean().required()
            })
          )
          .required()
      })
      .required()
  })

  try {
    // Validar si la estructura sigue el esquema
    await recordSchema.validate(responseData, {
      strict: true,
      abortEarly: false
    })
    console.log('Record response structure is valid.')
  } catch (error) {
    console.error('Invalid response structure:', error.errors)
    throw error
  }
}

module.exports = {
  checkFailRequest,
  generateObjectId,
  createTestDoctor,
  deleteUser,
  createTestPatientTemplate,
  createTestFileTemplate,
  createTestRecord,
  validateCreateRecordResponse,
  validateGetRecordResponse
}
