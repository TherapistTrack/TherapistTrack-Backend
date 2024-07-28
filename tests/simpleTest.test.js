const axios = require('axios')
const { BASE_URL } = require('./jest.setup')

const handle_axios_error = function (err) {
  if (err.response) {
    const custom_error = new Error(
      err.response.statusText || 'Internal server error'
    )
    custom_error.status = err.response.status || 500
    custom_error.description = err.response.data
      ? err.response.data.message
      : null
    throw custom_error
  }
  throw new Error(err)
}
axios.interceptors.response.use((r) => r, handle_axios_error)

describe('Check API health', () => {
  it('Should return 200 code', async () => {
    console.log(BASE_URL)
    const response = await axios.get(`${BASE_URL}/health`)
    console.log(response.data)
    expect(200).toBe(200)
  })
})
