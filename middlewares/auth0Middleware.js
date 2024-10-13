const {
  auth,
  claimCheck,
  InsufficientScopeError
} = require('express-oauth2-jwt-bearer')
require('dotenv').config()

if (!process.env.AUTH_ISSUER_BASE_URL || !process.env.AUTH_AUDIENCE) {
  throw 'Make sure you have AUTH_ISSUER_BASE_URL, and AUTH_AUDIENCE in your .env file'
}

let checkJwt
let requiredPermissions

if (process.env.RUNNING_MODE === 'TEST') {
  checkJwt = (req, res, next) => {
    next()
  }

  requiredPermissions = (requiredPermissions) => {
    return (req, res, next) => {
      next()
    }
  }
} else {
  checkJwt = auth({
    issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
    audience: process.env.AUTH_AUDIENCE
  })

  requiredPermissions = (requiredPermissions) => {
    return (req, res, next) => {
      const permissionCheck = claimCheck((payload) => {
        const permissions = payload.permissions || []

        const hasPermissions = requiredPermissions.every((requiredPermission) =>
          permissions.includes(requiredPermission)
        )

        if (!hasPermissions) {
          throw new InsufficientScopeError()
        }

        return hasPermissions
      })

      permissionCheck(req, res, next)
    }
  }
}

module.exports = {
  checkJwt,
  requiredPermissions
}
