const axios = require('axios')
const { BASE_URL } = require('./jest.setup')

describe('Check API health', () => {
  it('Should return 200 code', async () => {
    console.log(BASE_URL)
    const response = await axios.get(`${BASE_URL}/health`)
    // console.log(response)
    expect(200).toBe(200)
  })
})
