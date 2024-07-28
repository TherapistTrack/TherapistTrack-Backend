require('dotenv').config()

const BASE_URL = `http://0.0.0.0:${process.env.API_PORT}`

module.exports = { BASE_URL }
