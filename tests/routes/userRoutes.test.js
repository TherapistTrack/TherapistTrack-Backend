const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../jest.setup')

describe('User Endpoints', () => {
  let doctorUser
  let assistantUser
  let headers

  beforeAll(async () => {
    const token = await getAuthToken()
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Origin: 'http://localhost'
    }

    // Generar IDs válidos de 24 caracteres
    const generateObjectId = () => {
      const timestamp = Math.floor(Date.now() / 1000)
        .toString(16)
        .padStart(8, '0')
      const randomPart = Math.random()
        .toString(16)
        .substr(2, 16)
        .padEnd(16, '0')
      return timestamp + randomPart
    }

    doctorUser = {
      id: generateObjectId(),
      names: 'Test',
      lastNames: 'User',
      phones: ['12345678'],
      rol: 'Doctor',
      mails: ['test-doctor@example.com'],
      roleDependentInfo: {
        collegiateNumber: '12345',
        specialty: 'testSpecialty'
      }
    }

    assistantUser = {
      id: generateObjectId(),
      names: 'Test',
      lastNames: 'User',
      phones: ['12345678'],
      rol: 'Assistant',
      mails: ['test-assistant@example.com'],
      roleDependentInfo: {
        startDate: '08/14/2024',
        endDate: '08/15/2024',
        DPI: '2340934'
      }
    }
  })

  it('should register a new Doctor', async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/register`,
        doctorUser,
        { headers }
      )
      expect(response.status).toBe(201)
      expect(response.data.status).toBe('success')
      expect(response.data.message).toBe('User registered successfully')
    } catch (error) {
      console.log(
        `Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
      )
      throw new Error('Test failed')
    }
  })

  it('should register a new Assistant', async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/register`,
        assistantUser,
        { headers }
      )
      expect(response.status).toBe(201)
      expect(response.data.status).toBe('success')
      expect(response.data.message).toBe('User registered successfully')
    } catch (error) {
      throw new Error(
        `Test Failed: \nStatus: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
      )
    }
  })

  it('should update the user information', async () => {
    try {
      const updateData = { ...assistantUser }
      updateData.names = 'NEW NAME'
      await axios.put(`${BASE_URL}/users/update`, updateData, {
        headers
      })
      const newUser = await axios.get(`${BASE_URL}/users/${assistantUser.id}`, {
        headers
      })

      expect(newUser.data.data.names).toBe('NEW NAME')
    } catch (error) {
      throw new Error(
        `Test Failed:\n Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)} \n}}`
      )
    }
  })

  it('should not register an existent user', async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/register`,
        doctorUser,
        { headers }
      )
      expect(true).toBe(false) // Request should fail, but it didnt
    } catch (error) {
      console.log(
        `Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
      )
      expect(error.response.status).toBe(400)
      expect(error.response.data.status).toBe('error')
    }
  })

  it('should retrieve a User info by ID', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/${doctorUser.id}`, {
        headers
      })
      expect(response.status).toBe(200)
    } catch (error) {
      console.log()
      throw new Error(
        `Test Failed: \nStatus: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
      )
    }
  })

  it('should retrieve info from the User requesting', async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/@me`,
        { id: doctorUser.id },
        { headers }
      )
      expect(response.status).toBe(200)
    } catch (error) {
      console.log(
        `Status: ${error.response?.status} \nBody: ${JSON.stringify(error.response?.data)}`
      )
      throw new Error('Test failed')
    }
  })

  it('should give a list of files with the two already registered users', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/list`, { headers })
      expect(response.status).toBe(200)
      expect(response.data.users.length).toBe(2)
    } catch (error) {
      throw new Error(
        `Test Failed:\n Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
      )
    }
  })

  it('should delete Doctor and assistant', async () => {
    try {
      const response1 = await axios.delete(`${BASE_URL}/users/delete`, {
        data: { id: doctorUser.id },
        headers
      })
      const response2 = await axios.delete(`${BASE_URL}/users/delete`, {
        data: { id: assistantUser.id },
        headers
      })
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
    } catch (error) {
      throw new Error(
        `Test Failed:\n Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
      )
    }
  })

  /*
  it('should fail to update non-existent user', async () => {
    const updateData = { username: 'nonexistentuser', name: 'UpdatedName' }
    const response = await axios
      .put(`${BASE_URL}/users/update`, updateData, { headers })
      .catch((err) => err.response)
    expect(response.status).toBe(400)
    expect(response.data.status).toBe('error')
    expect(response.data.message).toBe('User not found or no updates made')
  })

  */
})
