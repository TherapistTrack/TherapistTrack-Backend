const express = require('express')
const router = express.Router()
const {
  checkJwt,
  requiredPermissions
} = require('../middlewares/auth0Middleware')
const fileTemplateController = require('../controllers/fileTemplateController')

router.post(
  '/FileTemplate',
  checkJwt,
  requiredPermissions(['create:template']),
  fileTemplateController.createTemplate
)
router.patch(
  '/FileTemplate',
  checkJwt,
  requiredPermissions(['update:template']),
  fileTemplateController.renameTemplate
)
router.delete(
  '/FileTemplate',
  checkJwt,
  requiredPermissions(['delete:template']),
  fileTemplateController.deleteTemplate
)
router.get(
  '/FileTemplate',
  checkJwt,
  requiredPermissions(['read:template']),
  fileTemplateController.getTemplate
)
router.get(
  '/FileTemplate/list',
  checkJwt,
  requiredPermissions(['read:template']),
  fileTemplateController.getTemplatesDoctor
)
router.post(
  '/FileTemplate/fields',
  checkJwt,
  requiredPermissions(['update:template']),
  fileTemplateController.createField
)
router.put(
  '/FileTemplate/fields',
  checkJwt,
  requiredPermissions(['update:template']),
  fileTemplateController.updateField
)
router.delete(
  '/FileTemplate/fields',
  checkJwt,
  requiredPermissions(['update:field']),
  fileTemplateController.deleteField
)

module.exports = router
