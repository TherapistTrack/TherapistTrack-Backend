const express = require('express')
const router = express.Router()
const {
  checkJwt,
  requiredPermissions
} = require('../middlewares/auth0Middleware')
const patientTemplateController = require('../controllers/patientTemplateController')

router.post(
  '/PatientTemplate',
  checkJwt,
  requiredPermissions(['create:template']),
  patientTemplateController.createTemplate
)
router.patch(
  '/PatientTemplate',
  checkJwt,
  requiredPermissions(['update:template']),
  patientTemplateController.renameTemplate
)
router.delete(
  '/PatientTemplate',
  checkJwt,
  requiredPermissions(['delete:template']),
  patientTemplateController.deleteTemplate
)
router.get(
  '/PatientTemplate',
  checkJwt,
  requiredPermissions(['read:template']),
  patientTemplateController.getTemplate
)
router.get(
  '/PatientTemplate/list',
  checkJwt,
  requiredPermissions(['read:template']),
  patientTemplateController.getTemplatesDoctor
)
router.post(
  '/PatientTemplate/fields',
  checkJwt,
  requiredPermissions(['update:template']),
  patientTemplateController.createField
)
router.put(
  '/PatientTemplate/fields',
  checkJwt,
  requiredPermissions(['update:template']),
  patientTemplateController.updateField
)
router.delete(
  '/PatientTemplate/fields',
  checkJwt,
  requiredPermissions(['update:field']),
  patientTemplateController.deleteField
)

module.exports = router
