const axios = require('axios')
const { BASE_URL } = require('../../jest.setup')

describe('DELETE /records/ endpoint', () => {
  /*Este test sirve una vez tengamos la coleccion de dcotros y templates
  it('should return 400 when trying to delete a record with invalid record ID', async () => {
    const invalidDeleteData = {
      doctorId: '66b453a2601a8e9fb46d8884', // ID válido de doctor
      recordId: 'invalidRecordId'
    }
  
    try {
      await axios.delete(`${baseUrl}/`, { data: invalidDeleteData, headers })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Invalid record ID')
    }
  })*/

  it('should delete a record', async () => {
    const recordData = {
      doctorId: '66b453a2601a8e9fb46d8884',
      recordId: testrecordID
    }
    try {
      const response = await axios.delete(
        `${baseUrl}/`,
        { data: recordData },
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Record deleted successfully')
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })
})
