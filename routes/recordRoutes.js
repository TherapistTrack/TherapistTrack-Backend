const express = require('express')
const router = express.Router()
const recordController = require('../controllers/recordController')

router.post('/', recordController.createRecord)
router.put('/', recordController.editRecord)
router.delete('/', recordController.deleteRecord)
router.post('/list', recordController.listRecords)
router.get('/records', recordController.getRecordById)

module.exports = router
