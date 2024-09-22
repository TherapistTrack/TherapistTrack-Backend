const axios = require('axios')
const { BASE_URL } = require('../../jest.setup')

describe('PUT /records/ endpoint', () => {
  it('should edit a record', async () => {
    const recordData = {
      doctorId: '66b453a2601a8e9fb46d8884',
      recordId: testrecordID,
      patient: {
        names: 'Joe',
        lastNames: 'Doe',
        fields: [
          {
            name: 'Civil Status',
            type: 'CHOICE',
            options: ['single', 'married', 'separate'],
            value: 'married',
            required: true
          },
          {
            name: 'Age',
            type: 'NUMBER',
            value: '30',
            required: true
          }
        ]
      }
    }

    try {
      const response = await axios.put(`${baseUrl}/`, recordData, { headers })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Record updated successfully')
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })

  /*Este test sirve una vez tengamos la coleccion de dcotros y templates
  it('should return 400 when trying to edit a record with invalid record ID', async () => {
    const invalidEditData = {
      doctorId: '66b453a2601a8e9fb46d8884', // ID válido de doctor
      recordId: 'invalidRecordId',
      patient: 'Updated Patient Info'
    }
  
    try {
      await axios.put(`${baseUrl}/`, invalidEditData, { headers })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Invalid record ID')
    }
  })*/

  it('should return 403 when doctor is unauthorized to edit a record', async () => {
    const unauthorizedEditData = {
      doctorId: 'anotherDoctorId', // Un doctor diferente al del registro
      recordId: testrecordID,
      patient: {
        names: 'Joe',
        lastNames: 'Doe',
        fields: [
          {
            name: 'Civil Status',
            type: 'CHOICE',
            options: ['single', 'married', 'separate'],
            value: 'married',
            required: true
          },
          {
            name: 'Age',
            type: 'NUMBER',
            value: '30',
            required: true
          }
        ]
      }
    }

    try {
      await axios.put(`${baseUrl}/`, unauthorizedEditData, { headers })
    } catch (error) {
      expect(error.response.status).toBe(403)
      expect(error.response.data.error).toBe('Unauthorized')
    }
  })
})
