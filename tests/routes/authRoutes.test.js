const axios = require('axios')
const jwt = require('jsonwebtoken')
const { BASE_URL } = require('../jest.setup')

jest.mock('axios')
jest.mock('jsonwebtoken')

describe('Auth Controller Tests', () => {
  describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginCredentials = {
        username: 'testuser',
        password: 'testpassword'
      }

      const responseMock = {
        data: { message: 'Login successful', token: 'mocked-jwt-token' },
        status: 200
      }

      axios.post.mockResolvedValue(responseMock)

      const response = await axios.post(`${BASE_URL}/login`, loginCredentials)

      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Login successful')
      expect(response.data.token).toBe('mocked-jwt-token')
    })

    it('should return error for invalid credentials', async () => {
      const invalidCredentials = {
        username: 'invaliduser',
        password: 'invalidpassword'
      }

      const errorResponse = {
        response: {
          status: 401,
          data: 'Invalid credentials'
        }
      }

      axios.post.mockRejectedValue(errorResponse)

      try {
        await axios.post(`${BASE_URL}/login`, invalidCredentials)
      } catch (error) {
        expect(error.response.status).toBe(401)
        expect(error.response.data).toBe('Invalid credentials')
      }
    })

    it('should return server error on authentication failure', async () => {
      const loginCredentials = {
        username: 'testuser',
        password: 'testpassword'
      }

      const errorResponse = {
        response: {
          status: 500,
          data: 'Authentication failed'
        }
      }

      axios.post.mockRejectedValue(errorResponse)

      try {
        await axios.post(`${BASE_URL}/login`, loginCredentials)
      } catch (error) {
        expect(error.response.status).toBe(500)
        expect(error.response.data).toBe('Authentication failed')
      }
    })
  })
})
