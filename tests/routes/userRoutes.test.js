const axios = require('axios')
const { BASE_URL } = require('../jest.setup')

describe('User Endpoints', () => {
  let doctorUser = {
    id: '6662a2c3048b11de0381db6b',
    names: 'Test',
    lastNames: 'User',
    phones: ['12345678'],
    rol: 'Doctor',
    mails: ['test@example.com'],
    rolDependentInfo: {
      collegiateNumber: '12345',
      specialty: 'testSpecialty'
    }
  }

  let assistantUser = {
    id: '6632a2c3048b11de0381db6b',
    names: 'Test',
    lastNames: 'User',
    phones: ['12345678'],
    rol: 'Doctor',
    mails: ['test@example.com'],
    rolDependentInfo: {
      collegiateNumber: '12345',
      specialty: 'testSpecialty'
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer your_token_here',
    Origin: 'http://localhost'
  }

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
      const response = await axios.get(`${BASE_URL}/users/${doctorUser.id}`)
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
      const response = await axios.post(`${BASE_URL}/users/@me`, {
        id: doctorUser.id
      })
      expect(response.status).toBe(200)
    } catch (error) {
      console.log(
        `Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
      )
      throw new Error('Test failed')
    }
  })

  it('should give a list of files with the two already registered users', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/list`)
      expect(response.status).toBe(200)
      expect(response.data.users.length).toBe(2)
    } catch (error) {
      throw new Error(
        `Test Failed:\n Status: ${error.response.status} \nBody: ${JSON.stringify(error.response.data)}`
      )
    }
  })

  /*
  it('should list the registered user', async () => {
    const response = await axios.get(`${BASE_URL}/users/list`, {
      params: { username: testUsername },
      headers
    })
    expect(response.status).toBe(200)
    expect(response.data.status).toBe('success')
    expect(response.data.data.username).toBe(testUsername)
  })

  it('should update the user information', async () => {
    const updateData = { username: testUsername, name: 'UpdatedName' }
    const response = await axios.put(`${BASE_URL}/users/update`, updateData, {
      headers
    })
    expect(response.status).toBe(200)
    expect(response.data.status).toBe('success')
    expect(response.data.message).toBe('User updated successfully')
  })

  it('should fail to update non-existent user', async () => {
    const updateData = { username: 'nonexistentuser', name: 'UpdatedName' }
    const response = await axios
      .put(`${BASE_URL}/users/update`, updateData, { headers })
      .catch((err) => err.response)
    expect(response.status).toBe(400)
    expect(response.data.status).toBe('error')
    expect(response.data.message).toBe('User not found or no updates made')
  })

  it('should delete the user', async () => {
    const response = await axios.delete(`${BASE_URL}/users/delete`, {
      data: { username: testUsername },
      headers
    })
    expect(response.status).toBe(200)
    expect(response.data.status).toBe('success')
    expect(response.data.message).toBe('User marked as inactive')
  })

  it('should fail to delete a non-existent user', async () => {
    const response = await axios
      .delete(`${BASE_URL}/users/delete`, {
        data: { username: 'nonexistentuser' },
        headers
      })
      .catch((err) => err.response)
    expect(response.status).toBe(404)
    expect(response.data.status).toBe('error')
    expect(response.data.message).toBe('User not found or already inactive')
  })
  */
})
