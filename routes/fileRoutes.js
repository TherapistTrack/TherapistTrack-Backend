const express = require('express')
const router = express.Router()
const fileController = require('../controllers/fileController')
const upload = require('../utils/multerConfig')

router.post('/upload', upload.single('pdf'), fileController.uploadFile)
router.get('/pdf/:filename', fileController.getFile)

router.post('/create', fileController.createFile)
router.put('/update/:id', fileController.updateFile)
router.delete('/delete/:id', fileController.deleteFile)
router.get('/listFiles', fileController.listFiles)
router.get('/file/:id', fileController.getFileById)

module.exports = router
