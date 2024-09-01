const { auth, requiredScopes } = require('express-oauth2-jwt-bearer')
require('dotenv').config()

if (!process.env.ISSUER_BASE_URL || !process.env.AUDIENCE) {
  throw 'Make sure you have ISSUER_BASE_URL, and AUDIENCE in your .env file'
}

const checkJwt = auth()

module.exports = {
  checkJwt,
  requiredScopes
}
