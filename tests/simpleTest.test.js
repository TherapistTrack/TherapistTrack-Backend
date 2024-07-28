const axios = require('axios')
const { BASE_URL } = require('./jest.setup')

describe('Check API health', () => {
  it('Should return 200 code', async () => {
    const response = await axios.get(`${BASE_URL}/health`)
    expect(response.status).toBe(200)
  })
})
