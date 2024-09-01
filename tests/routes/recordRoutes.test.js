const axios = require('axios')
const { BASE_URL } = require('../jest.setup')

describe('Record Controller Tests', () => {
  const baseUrl = BASE_URL + '/records'
  let testrecordID
  const recordData = {
    doctor: '66b453a2601a8e9fb46d8884',
    template: '66b453a2601a8e9fb46d8885',
    patient: {
      names: 'Joe',
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

  it('should create a new record', async () => {
    try {
      const response = await axios.post(`${baseUrl}/`, recordData)
      expect(response.status).toBe(201)
      /*
      expect(response.data.status).toBe('success')
      expect(response.data.message).toBe('Record created successfully')
      testrecordID = response.data.recordId */
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })
})
