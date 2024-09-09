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

  /*Este test sirve una vez tengamos la coleccion de dcotros y templates
  it('should return 400 when trying to create a record with invalid doctor or template ID', async () => {
    const invalidRecordData = {
      doctor: 'invalidDoctorId',
      template: 'invalidTemplateId',
      patient: 'Patient ID'
    }

    try {
      await axios.post(`${baseUrl}/`, invalidRecordData, { headers })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Invalid record or template ID')
    }
  })

  */

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
      expect(response.status).toBe(200)
      expect(response.data.records.length).toBeGreaterThan(0)
      expect(response.data.total).toBeGreaterThan(0)
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })

  it('should return 404 when trying to list records with a doctorId that has no records', async () => {
    const emptyListData = {
      doctorId: 'validDoctorIdWithNoRecords',
      limit: 5,
      offset: 0
    }

    try {
      await axios.get(`${baseUrl}/list`, { params: emptyListData, headers })
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.error).toBe('Records not found')
    }
  })

  it('should return 403 when doctor is unauthorized to delete a record', async () => {
    const unauthorizedDeleteData = {
      doctorId: 'anotherDoctorId', // Un doctor diferente al del registro
      recordId: testrecordID
    }

    try {
      await axios.delete(`${baseUrl}/`, {
        data: unauthorizedDeleteData,
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(403)
      expect(error.response.data.error).toBe('Unauthorized')
    }
  })

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
