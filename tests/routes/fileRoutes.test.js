const axios = require('axios')
const { BASE_URL } = require('../jest.setup')

describe('File Controller Tests', () => {
  let testFileId

  it('should create a new file for a  patient', async () => {
    const fileData = {
      record: '64c1e2c8a5d4a8f8b3b9e1e3',
      name: 'testfile',
      category: 'test',
      location: './uploads/testfile.pdf',
      pages: 3,
      metadata: [
        {
          name: 'difficulty',
          type: 'SHORT_TEXT',
          options: ['easy', 'medium', 'hard'],
          value: 'easy',
          required: true
        }
      ]
    }

    try {
      const response = await axios.post(`${BASE_URL}/files/create`, fileData)
      expect(response.status).toBe(201)
      expect(response.data.status).toBe('success')
      expect(response.data.message).toBe('File created successfully')
      testFileId = response.data.data._id
      console.log('Test file id:', testFileId)
    } catch (error) {
      console.error('Error during test:', error)
      throw error
    }
  })

  it('should update an existing file', async () => {
    const updatedFileData = {
      category: 'yes or no',
      pages: 4
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/files/update/${testFileId}`,
        updatedFileData
      )
      expect(response.status).toBe(200)
      expect(response.data.status).toBe('success')
      expect(response.data.data.category).toBe('yes or no')
      expect(response.data.data.pages).toBe(4)
    } catch (error) {
      console.error('Error during test:', error)
      throw error
    }
  })

  it('should list files with default parameters', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/files/listFiles`, {
        params: { limit: 10, sortBy: 'created_at', order: 'asc' }
      })

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data.length).toBeGreaterThan(0)
    } catch (error) {
      console.error('Error during test:', error)
      throw error
    }
  })

  it('should get a file by id', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/files/file/${testFileId}`)
      console.log('Response:', response.data)

      const fileId = response.data._id
      expect(response.status).toBe(200)
      expect(response.data._id).toBe(fileId)
      expect(response.data.name).toBe('testfile')
    } catch (error) {
      console.error('Error during test:', error)
      throw error
    }
  })

  it('should delete an existing file', async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/files/delete/${testFileId}`
      )

      expect(response.status).toBe(200)
      expect(response.data.status).toBe('success')
      expect(response.data.message).toBe('File deleted successfully')
    } catch (error) {
      console.error('Error during test:', error)
      throw error
    }
  })
})
