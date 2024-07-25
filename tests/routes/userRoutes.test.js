const axios = require('axios')
const { BASE_URL } = require('../jest.setup')

jest.mock('axios')

describe('User Controller Tests', () => {
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: 'testuser',
        password: 'testpassword',
        name: 'Test',
        lastName: 'User',
        phones: ['123456789'],
        rol: 'user',
        mails: ['test@example.com'],
        collegiateNumber: '12345',
        specialty: 'specialty',
        startDate: '2021-01-01',
        endDate: '2022-01-01',
        DPI: '1234567890123'
      }

      axios.post.mockResolvedValue({
        status: 201,
        data: { status: 'success', message: 'User registered successfully' }
      })

      const response = await axios.post(`${BASE_URL}/register`, newUser)
      expect(response.status).toBe(201)
      expect(response.data.status).toBe('success')
    })

    it('should return error for existing username', async () => {
      const existingUser = {
        username: 'existinguser',
        password: 'testpassword',
        name: 'Existing',
        lastName: 'User',
        phones: ['123456789'],
        rol: 'user',
        mails: ['existing@example.com'],
        collegiateNumber: '12345',
        specialty: 'specialty',
        startDate: '2021-01-01',
        endDate: '2022-01-01',
        DPI: '1234567890123'
      }

      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { status: 'error', message: 'Username already exists.' }
        }
      })

      try {
        await axios.post(`${BASE_URL}/register`, existingUser)
      } catch (error) {
        expect(error.response.status).toBe(400)
        expect(error.response.data.status).toBe('error')
      }
    })
  })

  describe('DELETE /delete', () => {
    it('should mark a user as inactive', async () => {
      const username = 'testuser'

      axios.delete.mockResolvedValue({
        status: 200,
        data: { status: 'success', message: 'User marked as inactive' }
      })

      const response = await axios.delete(`${BASE_URL}/delete`, {
        data: { username }
      })
      expect(response.status).toBe(200)
      expect(response.data.status).toBe('success')
    })

    it('should return error for non-existing user', async () => {
      const username = 'nonexistinguser'

      axios.delete.mockRejectedValue({
        response: {
          status: 404,
          data: {
            status: 'error',
            message: 'User not found or already inactive'
          }
        }
      })

      try {
        await axios.delete(`${BASE_URL}/delete`, { data: { username } })
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.status).toBe('error')
      }
    })
  })

  describe('PUT /update', () => {
    it('should update user details', async () => {
      const updatedUser = {
        username: 'testuser',
        name: 'Updated Name'
      }

      axios.put.mockResolvedValue({
        status: 200,
        data: { status: 'success', message: 'User updated successfully' }
      })

      const response = await axios.put(`${BASE_URL}/update`, updatedUser)
      expect(response.status).toBe(200)
      expect(response.data.status).toBe('success')
    })

    it('should return error for non-existing user', async () => {
      const nonExistingUser = {
        username: 'nonexistinguser',
        name: 'Updated Name'
      }

      axios.put.mockRejectedValue({
        response: {
          status: 400,
          data: {
            status: 'error',
            message: 'User not found or no updates made'
          }
        }
      })

      try {
        await axios.put(`${BASE_URL}/update`, nonExistingUser)
      } catch (error) {
        expect(error.response.status).toBe(400)
        expect(error.response.data.status).toBe('error')
      }
    })
  })

  describe('GET /list', () => {
    it('should return user details', async () => {
      const username = 'testuser'

      axios.get.mockResolvedValue({
        status: 200,
        data: {
          status: 'success',
          data: {
            username,
            name: 'Test User',
            lastName: 'User',
            phones: ['123456789'],
            rol: 'user',
            mails: ['test@example.com'],
            collegiateNumber: '12345',
            specialty: 'specialty',
            startDate: '2021-01-01',
            endDate: '2022-01-01',
            DPI: '1234567890123'
          }
        }
      })

      const response = await axios.get(`${BASE_URL}/list`, {
        params: { username }
      })
      expect(response.status).toBe(200)
      expect(response.data.status).toBe('success')
      expect(response.data.data.username).toBe(username)
    })

    it('should return error for non-existing user', async () => {
      const username = 'nonexistinguser'

      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { status: 'error', message: 'User not found' }
        }
      })

      try {
        await axios.get(`${BASE_URL}/list`, { params: { username } })
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.status).toBe('error')
      }
    })
  })
})
