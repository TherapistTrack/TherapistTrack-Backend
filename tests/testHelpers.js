const axios = require('axios')
const { BASE_URL, getAuthToken } = require('./jest.setup')

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
      fail(
        `Expected a failure, but got response with status: ${response.status}`
      )
    }
  } catch (error) {
    expect(error.response.status).toBe(expectedCode)
    expect(error.response.data.message).toBe(expectedMsg)
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
async function createTestPatientTemplate(doctorId, templateName, fields) {
  const testTemplate = {
    doctorId: doctorId,
    name: templateName,
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

module.exports = {
  checkFailRequest,
  generateObjectId,
  createTestDoctor,
  deleteUser,
  createTestPatientTemplate
}
