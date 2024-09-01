const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer()
const fileController = require('../controllers/fileController')
const { requiredScopes } = require('../middlewares/auth0Middleware')

router.post(
  '/create',
  requiredScopes(['create:files']),
  upload.single('file'),
  fileController.createFile
)
router.put('/', requiredScopes(['update:files']), fileController.updateFile)
router.delete('/', requiredScopes(['delete:files']), fileController.deleteFile)
router.get(
  '/listFiles',
  requiredScopes(['read:files']),
  fileController.listFiles
)
router.post('/file', requiredScopes(['read:files']), fileController.getFileById)

module.exports = router
