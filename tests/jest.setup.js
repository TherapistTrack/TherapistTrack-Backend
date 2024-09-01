require('dotenv').config()
const axios = require('axios')

const BASE_URL = `http://127.0.0.1:${process.env.API_PORT}`

let accessToken = null

async function getAuthToken() {
  try {
    const response = await axios.post(
      `${process.env.ISSUER_BASE_URL}oauth/token`,
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        audience: process.env.AUDIENCE,
        grant_type: 'client_credentials'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    console.log(response.data)
    return response.data.access_token
  } catch (error) {
    console.error('Error obtaining token:', error.message)
    throw error
  }
}

module.exports = {
  BASE_URL,
  getAuthToken
}
