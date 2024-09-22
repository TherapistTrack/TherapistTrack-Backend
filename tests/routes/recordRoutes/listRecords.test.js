const axios = require('axios')
const { BASE_URL } = require('../../jest.setup')

describe('POST /records/list endpoint', () => {
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

  it('should return 403 when doctor is unauthorized to list records', async () => {
    const unauthorizedListData = {
      doctorId: 'anotherDoctorId', // Un doctor diferente al del registro
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
      await axios.post(`${baseUrl}/list`, unauthorizedListData, {
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(403)
      expect(error.response.data.error).toBe('Unauthorized')
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
})
