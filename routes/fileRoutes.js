const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer()
const fileController = require('../controllers/fileController')
const {
  requiredPermissions,
  checkJwt
} = require('../middlewares/auth0Middleware')

//Crear un archivo
router.post(
  '/',
  checkJwt,
  requiredPermissions(['create:files']),
  upload.single('file'),
  fileController.createFile
)
router.put(
  '/',
  checkJwt,
  requiredPermissions(['update:files']),
  fileController.updateFile
)
router.delete(
  '/',
  checkJwt,
  requiredPermissions(['delete:files']),
  fileController.deleteFile
)
router.get(
  '/listFiles',
  checkJwt,
  requiredPermissions(['read:files']),
  fileController.listFiles
)
router.post(
  '/file',
  checkJwt,
  requiredPermissions(['read:files']),
  fileController.getFileById
)

module.exports = router
