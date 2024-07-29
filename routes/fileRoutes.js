const express = require('express')
const router = express.Router()
const fileController = require('../controllers/fileController')
const upload = require('../utils/multerConfig')

router.post('/upload', upload.single('pdf'), fileController.uploadFile)
router.get('/pdf/:filename', fileController.getFile)

router.post('/create', fileController.createFile)
router.put('/update/:name', fileController.updateFile)
router.delete('/delete/:name', fileController.deleteFile)
router.get('/listFiles', fileController.listFiles)
router.get('/file/:name', fileController.getFileById)

module.exports = router
