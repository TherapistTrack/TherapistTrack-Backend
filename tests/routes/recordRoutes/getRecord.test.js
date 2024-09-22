const axios = require('axios')
const { BASE_URL } = require('../../jest.setup')

describe('GET /records endpoint', () => {
  it('should get a record with a valid Id', async () => {
    const recordData = {
      recordId: testrecordID,
      doctorId: '66b453a2601a8e9fb46d8884'
    }
    try {
      const response = await axios.get(`${baseUrl}/records`, {
        params: recordData,
        headers
      })
      expect(response.status).toBe(200)
      expect(response.data.record._id).toBe(testrecordID)
      expect(response.data.record.patient.names).toBe('Joe')
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })

  /*Este test sirve una vez tengamos la coleccion de dcotros y templates
  it('should return 400 when trying to get a record with invalid record ID', async () => {
    const invalidGetData = {
      doctorId: '66b453a2601a8e9fb46d8884',
      recordId: 'invalidRecordId'
    }
  
    try {
      await axios.get(`${baseUrl}/records`, { params: invalidGetData, headers })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Invalid record ID')
    }
  })*/

  it('should return 403 when doctor is unauthorized to get a record', async () => {
    const unauthorizedGetData = {
      doctorId: 'anotherDoctorId', // Un doctor diferente al del registro
      recordId: testrecordID
    }

    try {
      await axios.get(`${baseUrl}/records`, {
        params: unauthorizedGetData,
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(403)
      expect(error.response.data.error).toBe('Unauthorized')
    }
  })
})
