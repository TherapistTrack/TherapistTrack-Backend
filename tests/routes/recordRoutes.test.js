const axios = require('axios')
const { BASE_URL } = require('../jest.setup')

describe('Record Controller Tests', () => {
  const baseUrl = BASE_URL + '/records'
  let testrecordID
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer your_token_here',
    Origin: 'http://localhost'
  }

  it('should create a new record', async () => {
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

    try {
      const response = await axios.post(`${baseUrl}/`, recordData, { headers })
      expect(response.status).toBe(201)
      expect(response.data.message).toBe('Record created successfully')
      testrecordID = response.data.recordId
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })

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

  it('should get a record with a valid Id', async () => {
    const recordData = {
      recordId: testrecordID,
      doctorId: '66b453a2601a8e9fb46d8884'
    }
    try {
      const response = await axios.post(`${baseUrl}/records`, recordData, {
        headers
      })
      expect(response.status).toBe(200)
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })

  it('should list records of a doctor', async () => {
    const recordData = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 5,
      offset: 0
    }
    try {
      const response = await axios.get(`${baseUrl}/list`, recordData, {
        headers
      })
      console.log(response.data)
      expect(response.status).toBe(200)
      expect(response.data.records.length).toBeGreaterThan(0)
      expect(response.data.total).toBeGreaterThan(0)
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })

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
