const axios = require('axios')
const mongoose = require('mongoose')
const FormData = require('form-data')
const path = require('path')
const fs = require('fs')
const { BASE_URL, getAuthToken } = require('../jest.setup')

describe('File Controller Tests', () => {
  const baseUrl = BASE_URL + '/files'
  let testfileID
  let headers

  beforeAll(async () => {
    const token = await getAuthToken()
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Origin: 'http://localhost'
    }
  })

  it('should create a new file for a patient', async () => {
    const form = new FormData()

    const filePath = path.join(__dirname, 'testFile.pdf')
    const fileName = 'testFile.pdf'

    form.append('record', '66b453a2601a8e9fb46d8884')
    form.append('template', '66b453a2601a8e9fb46d8885')
    form.append('name', 'test1')
    form.append('category', 'test')
    form.append('pages', 3)
    form.append('file', fs.createReadStream(filePath), { fileName: fileName })
    const metadata = JSON.stringify([
      {
        name: 'Difficulty',
        type: 'CHOICE',
        options: ['easy', 'medium', 'hard'],
        value: 'easy',
        required: true
      }
    ])
    form.append('metadata', metadata)

    try {
      const response = await axios.post(`${baseUrl}/create`, form, {
        headers: {
          ...headers,
          ...form.getHeaders()
        }
      })

      expect(response.status).toBe(201)
      expect(response.data.status).toBe('success')
      expect(response.data.message).toBe('File created successfully')
      testfileID = response.data.data
      console.log('Test file ID:', testfileID)
    } catch (error) {
      console.error(
        'Error during test:',
        error.response ? error.response.data : error
      )
      throw error // Rethrow the error to fail the test
    }
  })

  it('should return an error for creating a file with missing required fields', async () => {
    const fileData = {
      category: 'test',
      pages: 3,
      metadata: [
        {
          name: 'Difficulty',
          type: 'CHOICE',
          options: ['easy', 'medium', 'hard'],
          value: 'easy',
          required: true
        }
      ]
    }

    try {
      await axios.post(`${baseUrl}/create`, fileData, { headers })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.status).toBe('error')
      expect(error.response.data.message).toMatch('No file provided')
    }
  })

  it('should update an existing file', async () => {
    const updatedFileData = {
      id: testfileID,
      category: 'yes or no',
      pages: 4
    }

    try {
      const response = await axios.put(`${baseUrl}/`, updatedFileData, {
        headers
      })

      expect(response.status).toBe(200)
      expect(response.data.status).toBe('success')
      expect(response.data.data.category).toBe('yes or no')
      expect(response.data.data.pages).toBe(4)
    } catch (error) {
      console.error(
        'Error during test:',
        error.response ? error.response.data : error
      )
      throw error
    }
  })

  it('should return an error for updating a file with an invalid ID format', async () => {
    const updatedFileData = {
      id: 'invalid-id-format',
      category: 'updated category',
      pages: 5
    }

    try {
      await axios.put(`${baseUrl}/`, updatedFileData, { headers })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.status).toBe('error')
      expect(error.response.data.message).toMatch(/invalid ID format/i)
    }
  })

  it('should return an error for updating a non-existent file', async () => {
    const updatedFileData = {
      id: '66b453a2601a8e9fb46d8885',
      category: 'updated category',
      pages: 5
    }

    try {
      await axios.put(`${baseUrl}/`, updatedFileData, { headers })
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.status).toBe('error')
      expect(error.response.data.message).toBe('File not found')
    }
  })

  it('should list files with default parameters', async () => {
    try {
      const response = await axios.get(`${baseUrl}/listFiles`, {
        headers,
        params: { limit: 10, sortBy: 'created_at', order: 'asc' }
      })

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      // expect(response.data.length).toBeGreaterThan(0);
    } catch (error) {
      console.error(
        'Error during test:',
        error.response ? error.response.data : error
      )
      throw error
    }
  })

  it('should get a file by id', async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/file`,
        { id: testfileID },
        { headers }
      )

      // console.log('Response:', response.data)

      expect(response.status).toBe(200)
      expect(response.data.file.name).toBe('test1')
      expect(response.data.file._id).toBe(testfileID)
    } catch (error) {
      console.error(
        'Error during test:',
        error.response ? error.response.data : error
      )
      throw error
    }
  })

  it('should return an error for getting a file with a non-existent ID', async () => {
    try {
      await axios.post(
        `${baseUrl}/file`,
        { id: '66b453a2601a8e9fb46d8885' },
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.status).toBe('error')
      expect(error.response.data.message).toBe('File not found')
    }
  })

  it('should delete an existing file', async () => {
    try {
      const response = await axios.delete(`${baseUrl}/`, {
        headers,
        data: { id: testfileID }
      })

      expect(response.status).toBe(200)
      expect(response.data.status).toBe('success')
      expect(response.data.message).toBe('File deleted successfully')
    } catch (error) {
      console.error(
        'Error during test:',
        error.response ? error.response.data : error
      )
      throw error
    }
  })

  it('should return an error for deleting a file with an invalid ID format', async () => {
    try {
      await axios.delete(`${baseUrl}/`, {
        headers,
        data: { id: 'invalid-id-format' }
      })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.status).toBe('error')
      expect(error.response.data.message).toMatch(/invalid ID format/i)
    }
  })

  it('should return an error for deleting a non-existent file', async () => {
    try {
      await axios.delete(`${baseUrl}/`, {
        headers,
        data: { id: '66b453a2601a8e9fb46d8885' }
      })
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.status).toBe('error')
      expect(error.response.data.message).toBe('File not found')
    }
  })
})
