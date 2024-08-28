const express = require('express')
const router = express.Router()
const templateController = require('../controllers/templateController')

// Rutas para gestionar plantillas de paciente
router.post('/create', templateController.createTemplate)
router.post('/:templateID/campos', templateController.addFieldToTemplate)
router.put('/:templateID/campos', templateController.editTemplateFields)
router.delete(
  '/:templateID/campos/:fieldId',
  templateController.deleteFieldFromTemplate
)
router.patch('/', templateController.renameTemplate)
router.delete('/', templateController.deleteTemplate)
router.get('/list', templateController.listTemplates)
router.get('/', templateController.getTemplateById)

module.exports = router
