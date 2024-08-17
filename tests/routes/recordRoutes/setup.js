
const axios = require('axios')
const { BASE_URL} = require('../../jest.setup')

// Generar IDs válidos de 24 caracteres
function generateObjectId () {
    const timestamp = Math.floor(Date.now() / 1000)
      .toString(16)
      .padStart(8, '0')
    const randomPart = Math.random()
      .toString(16)
      .slice(2, 18)
      .padEnd(16, '0')
    return timestamp + randomPart
  }

async function createTestDoctor(){
    try {

        const token = await getAuthToken()

        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Origin: 'http://localhost'
        }
        doctorUser = {
            id: generateObjectId(),
            names: 'Test',
            lastNames: 'User',
            phones: ['12345678'],
            rol: 'Doctor',
            mails: ['test-doctor@example.com'],
            rolDependentInfo: {
              collegiateNumber: '12345',
              specialty: 'testSpecialty'
            }
        }

        await axios.post(
          `${BASE_URL}/users/register`,
          doctorUser,
          { headers }
        )
        return doctorUser
      } catch (error) {
        console.log(
          `Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
        )
        throw new Error('Test failed')
      }

}

async function deleteDoctor(doctorID){
}

module.exports = {createTestDoctor, deleteDoctor}