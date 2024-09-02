const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const {
  requiredPermissions,
  checkJwt
} = require('../middlewares/auth0Middleware')

router.get(
  '/list',
  checkJwt,
  requiredPermissions(['read:users']),
  userController.listUser
)
router.get(
  '/:id',
  checkJwt,
  requiredPermissions(['read:users']),
  userController.getUser
)
// TODO: when auth0 fully implemented just check the userID within the token.
router.post('/@me', checkJwt, userController.getMe)
router.post(
  '/register',
  checkJwt,
  requiredPermissions(['create:users']),
  userController.registerUser
)
router.delete(
  '/delete',
  checkJwt,
  requiredPermissions(['delete:users']),
  userController.deleteUser
)
router.put(
  '/update',
  checkJwt,
  requiredPermissions(['update:users']),
  userController.updateUser
)

module.exports = router
