require('dotenv').config()

const BASE_URL = `http://localhost:${process.env.API_PORT}`

module.exports = { BASE_URL }
