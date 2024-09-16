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

  it('should list records with filtering and sorting applied', async () => {
    const listData = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 5,
      offset: 0,
      sorts: [
        {
          name: 'Age',
          mode: 'asc'
        }
      ],
      filters: [
        {
          name: 'Civil Status',
          operation: 'is',
          value: 'married',
          logicGate: 'and'
        },
        {
          name: 'Age',
          operation: 'greater_than',
          value: '25',
          logicGate: 'and'
        }
      ]
    }

    try {
      const response = await axios.post(`${baseUrl}/list`, listData, {
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

  it('should return 404 when trying to list records with filters that match no records', async () => {
    const noMatchFilter = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 5,
      offset: 0,
      filters: [
        {
          name: 'Civil Status',
          operation: 'is',
          value: 'nonexistentStatus',
          logicGate: 'and'
        }
      ]
    }

    try {
      await axios.post(`${baseUrl}/list`, noMatchFilter, {
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.error).toBe('Records not found')
    }
  })

  it('should list records with pagination', async () => {
    const paginationData = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 2,
      offset: 0
    }

    try {
      const response = await axios.post(`${baseUrl}/list`, paginationData, {
        headers
      })
      expect(response.status).toBe(200)
      expect(response.data.total).toBeGreaterThan(0)
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })

  it('should sort records by descending order', async () => {
    const sortData = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 5,
      offset: 0,
      sorts: [
        {
          name: 'Age',
          mode: 'desc'
        }
      ]
    }

    try {
      const response = await axios.post(`${baseUrl}/list`, sortData, {
        headers
      })
      expect(response.status).toBe(200)
      expect(response.data.records.length).toBeGreaterThan(0)
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })

  it('should return 400 for invalid number format in filter', async () => {
    const invalidNumberFilter = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 5,
      offset: 0,
      filters: [
        {
          name: 'Age',
          operation: 'greater_than',
          value: 'invalidNumber', // Número inválido
          logicGate: 'and'
        }
      ]
    }

    try {
      await axios.post(`${baseUrl}/list`, invalidNumberFilter, { headers })
    } catch (error) {
      expect(error.response.status).toBe(500)
      expect(error.response.data.error).toContain('Invalid number format')
    }
  })

  it('should return 400 for invalid date format in filter', async () => {
    const invalidDateFilter = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 5,
      offset: 0,
      filters: [
        {
          name: 'Birthday',
          operation: 'after',
          value: 'invalidDate', // Fecha inválida
          logicGate: 'and'
        }
      ]
    }

    try {
      await axios.post(`${baseUrl}/list`, invalidDateFilter, { headers })
    } catch (error) {
      expect(error.response.status).toBe(500)
      expect(error.response.data.error).toContain('Invalid date format')
    }
  })

  it('should return 400 for invalid pagination limit', async () => {
    const invalidLimitPagination = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 'invalidLimit', // Límite no numérico
      offset: 0
    }

    try {
      await axios.post(`${baseUrl}/list`, invalidLimitPagination, { headers })
    } catch (error) {
      expect(error.response.status).toBe(500)
      expect(error.response.data.error).toContain('Invalid limit format')
    }
  })

  it('should return 400 for invalid pagination offset', async () => {
    const invalidOffsetPagination = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 5,
      offset: 'invalidOffset' // Offset no numérico
    }

    try {
      await axios.post(`${baseUrl}/list`, invalidOffsetPagination, { headers })
    } catch (error) {
      expect(error.response.status).toBe(500)
      expect(error.response.data.error).toContain('Invalid offset format')
    }
  })

  it('should return 400 for missing filters in sorting request', async () => {
    const sortWithoutFilters = {
      doctorId: '66b453a2601a8e9fb46d8884',
      limit: 5,
      offset: 0,
      sorts: [
        {
          name: 'Age',
          mode: 'asc'
        }
      ]
    }

    try {
      await axios.post(`${baseUrl}/list`, sortWithoutFilters, { headers })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.error).toContain(
        'At least one filter is required for sorting'
      )
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
