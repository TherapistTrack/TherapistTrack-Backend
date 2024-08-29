const axios = require('axios')
const { BASE_URL } = require('../jest.setup')

describe('User Endpoints', () => {
  let testUsername = `testuser_${Date.now()}`
  let testPassword = 'testpassword'
  let testUser = {
    username: testUsername,
    password: testPassword,
    name: 'Test',
    lastName: 'User',
    phones: ['12345678'],
    rol: 'testRole',
    mails: ['test@example.com'],
    collegiateNumber: '12345',
    specialty: 'testSpecialty',
    startDate: new Date(),
    endDate: new Date(),
    DPI: '123456789'
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer your_token_here',
    Origin: 'http://localhost'
  }

  it('should register a new user', async () => {
    const response = await axios.post(`${BASE_URL}/users/register`, testUser, {
      headers
    })
    expect(response.status).toBe(201)
    expect(response.data.status).toBe('success')
    expect(response.data.message).toBe('User registered successfully')
  })

  it('should fail to register a user with existing username', async () => {
    const response = await axios
      .post(`${BASE_URL}/users/register`, testUser, { headers })
      .catch((err) => err.response)
    expect(response.status).toBe(400)
    expect(response.data.status).toBe('error')
    expect(response.data.message).toBe('Username already exists.')
  })

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
})
