const axios = require('axios')
const { BASE_URL } = require('../jest.setup')

function sum(a, b) {
  return a + b
}

test('dummy test', async () => {
  const url = BASE_URL + 'login/'
  const data = {
    username: 'dummy',
    password: '1234'
  }
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  try {
    const response = await axios.post(url, data, config)

    console.log(response.data)
    expect(response.status).toBe(200)
  } catch (error) {
    console.error('Error making POST request:', error)
    throw error
  }
})

test('second dummy test', async () => {
  const url = BASE_URL + 'login/'
  const data = {
    username: 'dummy',
    password: '1234'
  }
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  try {
    const response = await axios.post(url, data, config)

    console.log(response.data)
    expect(response.status).toBe(200)
  } catch (error) {
    console.error('Error making POST request:', error)
    throw error
  }
})
