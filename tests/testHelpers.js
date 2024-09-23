const axios = require('axios')
const { BASE_URL, getAuthToken } = require('./jest.setup')

/**
 * Generates a valid 24-character ObjectId.
 * The ID consists of an 8-character hexadecimal timestamp and
 * a 16-character random hexadecimal string.
 *
 * @returns {string} A 24-character hexadecimal string representing an ObjectId.
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
      rolDependentInfo: {
        collegiateNumber: '12345',
        specialty: 'testSpecialty'
      }
    }

    await axios.post(`${BASE_URL}/users/register`, doctorUser, { headers })
    return doctorUser
  } catch (error) {
    console.log(
      `Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
    )
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

module.exports = { generateObjectId, createTestDoctor, deleteUser }
