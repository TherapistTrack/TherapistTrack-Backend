const axios = require('axios')
const { BASE_URL } = require('../../jest.setup')

describe('PUT /records/ endpoint', () => {
  // TODO:
  test('should fail with 400 if recordId is not passed', async () => {})

  // TODO:
  test('should fail with 400 if doctorId is not passed', async () => {})

  // TODO:
  test('should fail with 400 if patient is not passed', async () => {})

  // TODO:
  test('should fail with 400 if patient is passed malformed (missing fields)', async () => {})

  // TODO:
  test('should fail with 400 if patient does not include all the fields', async () => {})

  // TODO:
  test('should fail with 404 if doctorId is from a non-existent/active user', async () => {})

  // TODO:
  test('should fail with 404 if recordId is from a non-existent record', async () => {})

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
