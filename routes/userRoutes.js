const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/list', userController.listUser)
router.get('/:id', userController.getUser)
// TODO: when auth0 fully implemented just check the userID within the token.
router.post('/@me', userController.getMe)
router.post('/register', userController.registerUser)
router.delete('/delete', userController.deleteUser)
router.put('/update', userController.updateUser)

module.exports = router
