const express = require('express')
const router = express.Router()
const patientTemplateController = require('../controllers/patientTemplateController')

router.post('/PatientTemplate', patientTemplateController.createTemplate)
router.patch('/PatientTemplate', patientTemplateController.renameTemplate)
router.delete('/PatientTemplate', patientTemplateController.deleteTemplate)
router.get('/PatientTemplate', patientTemplateController.getTemplate)
router.get('/PatientTemplate/list', patientTemplateController.getTemplates)
