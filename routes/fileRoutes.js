const express = require('express')
const router = express.Router()
const fileController = require('../controllers/fileController')

router.post('/create', fileController.createFile)
router.put('/', fileController.updateFile)
router.delete('/', fileController.deleteFile)
router.get('/listFiles', fileController.listFiles)
router.post('/file', fileController.getFileById)

module.exports = router
