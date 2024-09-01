const axios = require('axios')
const { BASE_URL } = require('./jest.setup')

describe('Check API health', () => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer your_token_here',
    Origin: 'http://localhost'
  }

  it('Should return 200 code', async () => {
    console.log(BASE_URL)
    const response = await axios.get(`${BASE_URL}/health`, { headers })
    console.log(response.data)
    // console.log(response)
    expect(response.status).toBe(200)
  })
})
