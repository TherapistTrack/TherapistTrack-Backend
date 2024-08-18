const express = require('express')
const router = express.Router()
const recordController = require('../controllers/recordController')

router.post('/create', recordController.createRecord)
router.put('/', recordController.editRecord)
router.delete('/', recordController.deleteRecord)
router.get('/listRecords', recordController.listRecords)
router.post('/record', recordController.getRecordById)

module.exports = router
