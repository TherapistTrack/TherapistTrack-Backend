const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { requiredScopes } = require('../middlewares/auth0Middleware')

router.get('/list', requiredScopes(['read:users']), userController.listUser)
router.get('/:id', requiredScopes(['read:users']), userController.getUser)
// TODO: when auth0 fully implemented just check the userID within the token.
router.post('/@me', userController.getMe)
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

module.exports = router
