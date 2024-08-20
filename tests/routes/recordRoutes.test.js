const axios = require('axios')
const { BASE_URL } = require('../jest.setup')

describe('Record Controller Tests', () => {
  const baseUrl = BASE_URL + '/records'
  let testrecordID

  it('should create a new record', async () => {
    const recordData = {
      doctorId: '66b453a2601a8e9fb46d8884',
      templateId: '66b453a2601a8e9fb46d8885',
      patient: {
        name: 'Joe',
        lastNames: 'Doe',
        fields: [
          {
            name: 'Civil Status',
            type: 'CHOICE',
            options: ['single', 'married', 'separate'],
            value: 'single',
            required: true
          }
        ]
      }
    }

    try {
      const response = await axios.post(`${baseUrl}/create`, recordData)
      expect(response.status).toBe(201)
      expect(response.data.status).toBe('success')
      expect(response.data.message).toBe('Record created successfully')
      testrecordID = response.data.recordId
    } catch (error) {
      console.error(
        'Error during test:',
        error.response ? error.response.data : error
      )
      throw error
    }
  })
})
