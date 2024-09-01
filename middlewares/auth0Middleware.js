const { auth, requiredScopes } = require('express-oauth2-jwt-bearer')
require('dotenv').config()

if (!process.env.AUTH_ISSUER_BASE_URL || !process.env.AUTH_AUDIENCE) {
  throw 'Make sure you have AUTH_ISSUER_BASE_URL, and AUTH_AUDIENCE in your .env file'
}

const checkJwt = auth({
  issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
  audience: process.env.AUTH_AUDIENCE
})

module.exports = {
  checkJwt,
  requiredScopes
}
