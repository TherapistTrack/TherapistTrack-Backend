const express = require('express')
const router = express.Router()
const recordController = require('../controllers/recordController')

router.post('/', recordController.createRecord)
router.put('/', recordController.editRecord)
router.delete('/', recordController.deleteRecord)
router.get('/search', recordController.listRecords)
router.get('/', recordController.getRecordById)
router.post('/search', recordController.searchAndFilterRecords)

module.exports = router
