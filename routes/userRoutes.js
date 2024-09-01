const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { requiredScopes } = require('../middlewares/auth0Middleware')

router.post(
  '/register',
  requiredScopes(['create:users']),
  userController.registerUser
)
router.delete(
  '/delete',
  requiredScopes(['delete:users']),
  userController.deleteUser
)
router.put(
  '/update',
  requiredScopes(['update:users']),
  userController.updateUser
)
router.get('/list', requiredScopes(['read:users']), userController.listUser)

module.exports = router
