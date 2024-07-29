const request = require('supertest')

describe('File Controller Tests', () => {
  const baseUrl = 'http://localhost:3001/api/files'

  it('should create a new file and patient', async () => {
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
      const response = await request(baseUrl).post('/create').send(fileData)

      expect(response.statusCode).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe('File created successfully')
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
      const response = await request(baseUrl)
        .put('/update/testfile')
        .send(updatedFileData)

      expect(response.statusCode).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.category).toBe('yes or no')
      expect(response.body.data.pages).toBe(4)
    } catch (error) {
      console.error('Error during test:', error)
      throw error
    }
  })

  it('should list files with default parameters', async () => {
    try {
      const response = await request(baseUrl)
        .get('/listFiles')
        .query({ limit: 10, sortBy: 'created_at', order: 'asc' })

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
    } catch (error) {
      console.error('Error during test:', error)
      throw error
    }
  })

  it('should get a file by name', async () => {
    try {
      const response = await request(baseUrl).get('/file/testfile')

      console.log('Response:', response.body)

      const fileId = response.body._id
      expect(response.statusCode).toBe(200)
      expect(response.body._id).toBe(fileId)
      expect(response.body.name).toBe('testfile')
    } catch (error) {
      console.error('Error during test:', error)
      throw error
    }
  })

  it('should delete an existing file', async () => {
    try {
      const response = await request(baseUrl).delete('/delete/testfile')

      expect(response.statusCode).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe('File deleted successfully')
    } catch (error) {
      console.error('Error during test:', error)
      throw error
    }
  })
})
