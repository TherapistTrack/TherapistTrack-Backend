const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  createTestPatientTemplate,
  checkFailRequest
} = require('../../testHelpers')
const COMMON_MSG = require('../../../utils/errorMsg')

describe('Manage Records Tests', () => {
  // TODO:
  test('should succeed with 200 creating a record', async () => {})

  // TODO:
  test('should fail with 400 if doctorId not passed', async () => {})

  // TODO:
  test('should fail with 400 if templateId not passed', async () => {})

  // TODO:
  test('should fail with 400 if patient not passed', async () => {})

  // TODO:
  test('should fail with 400 if patient names not passed', async () => {})

  // TODO:
  test('should fail with 400 if patient lastnames not passed', async () => {})

  // TODO:
  test('should fail with 400 if patient fields not passed', async () => {})

  // TODO:
  test('should fail with 400 if patient fields not passed', async () => {})

  // TODO:
  test('should fail with 404 if doctorId is from a not active/existent doctor', async () => {})

  // TODO:
  test('should fail with 404 if templateId is from a not-existent template', async () => {})

  // TODO:
  test('should fail with 404 if not all fields defined by the template are not sent', async () => {
    // create a new message for that in COMMON_MSG
  })

  // ==================
  // === TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER value for TEXT field', async () => {})

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for TEXT field', async () => {})

  // TODO:
  test('should fail with 405 when passing ARRAY value for TEXT field', async () => {})

  // ==================
  // === SHORT_TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER value for SHORT_TEXT field', async () => {})

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for SHORT_TEXT field', async () => {})

  // TODO:
  test('should fail with 405 when passing ARRAY value for SHORT_TEXT field', async () => {})

  // ==================
  // === SHORT_TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for NUMBER field', async () => {})
  // TODO:
  test('should fail with 405 when passing BOOLEAN value for NUMBER field', async () => {})

  // TODO:
  test('should fail with 405 when passing ARRAY value for NUMBER field', async () => {})

  // ==================
  // === NUMBER ===
  // ==================
  // TODO:
  test('should fail with 405 when passing FLOAT value for NUMBER field', async () => {
    // Number field just accept integers
  })
  // TODO:
  test('should fail with 405 when passing TEXT value for NUMBER field', async () => {})
  // TODO:
  test('should fail with 405 when passing BOOLEAN value for NUMBER field', async () => {})
  // TODO:
  test('should fail with 405 when passing ARRAY value for FLOAT field', async () => {})

  // ==================
  // === FLOAT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for FLOAT field', async () => {})
  // TODO:
  test('should fail with 405 when passing BOOLEAN value for FLOAT field', async () => {})
  // TODO:
  test('should fail with 405 when passing ARRAY value for FLOAT field', async () => {})

  // ==================
  // === CHOICE =======
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER values to CHOICE', async () => {})

  // TODO:
  test('should fail with 405 when passing BOOLEAN values to CHOICE', async () => {})

  // TODO:
  test('should fail with 405 when passing VALUE that is not within CHOICE value', async () => {})
  // TODO:
  test('should fail with 405 when passing ARRAY value for CHOICE field', async () => {})
  // ==================
  // === DATE =======
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for DATE field', async () => {})
  // TODO:
  test('should fail with 405 when passing BOOLEAN value for DATE field', async () => {})
  // TODO:
  test('should fail with 405 when passing NUMBER value for DATE field', async () => {})

  // TODO:
  test('should fail with 405 when passing ARRAY value for DATE field', async () => {})
})
