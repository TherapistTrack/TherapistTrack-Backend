const axios = require('axios')
const { BASE_URL } = require('../../jest.setup')

describe('Search Files endpoint', () => {
  // TODO:
  test('should suceed with 200 searching a list of files with no sorting or filtering', async () => {})

  // ===================
  // ==== SORTING
  // ===================
  // TODO:
  test('should suceed with 200 searching a list of files with sorting on SHORT_TEXT field', async () => {})

  // TODO:
  test('should suceed with 200 searching a list of files with sorting on TEXT field', async () => {})

  // TODO:
  test('should suceed with 200 searching a list of files with sorting on NUMBER field', async () => {})

  // TODO:
  test('should suceed with 200 searching a list of files with sorting on FLOAT field', async () => {})

  // TODO:
  test('should suceed with 200 searching a list of files with sorting on DATE field', async () => {})

  // TODO:
  test('should suceed with 200 searching a list of files with sorting on CHOICE field', async () => {})

  // ===================
  // ==== FILTERING
  // ===================
  // TODO:
  test("should suceed with 200 filtering by TEXT field with 'contains'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by TEXT field with 'starts_with'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by TEXT field with 'ends_with'", async () => {})

  // TODO:
  test("should suceed with 200 filtering by SHORT_TEXT field with 'contains'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by SHORT_TEXT field with 'starts_with'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by SHORT_TEXT field with 'ends_with'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by NUMBER field with 'less_than'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by NUMBER field with 'greater_than'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by NUMBER field with 'equal_than'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by FLOAT field with 'less_than'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by FLOAT field with 'less_than'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by FLOAT field with 'less_than'", async () => {})

  // TODO:
  test("should suceed with 200 filtering by DATE field with 'after'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by DATE field with 'before'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by DATE field with 'between'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by CHOICE field with 'is'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by CHOICE field with 'is_not'", async () => {})
  // TODO:
  test("should suceed with 200 filtering by CHOICE field with 'is_not_empty'", async () => {})

  // ====================
  // == ERRORS
  // ===================

  // TODO:
  test('should fail with 400 if doctorId is not sent', async () => {})

  // TODO:
  test("should fail with 400 if 'limit' is not sent", async () => {})

  // TODO:
  test("should fail with 400 if 'page' is not sent", async () => {})

  // TODO:
  test("should fail with 400 if 'fields' array is not sent", async () => {})

  // TODO:
  test("should fail with 400 if 'sorts' array is not sent", async () => {})

  // TODO:
  test("should fail with 400 if 'filters' array is not sent", async () => {})

  // TODO:
  test("should fail with 400 if 'fields' items have missing fields", async () => {})

  // TODO:
  test("should fail with 400 if 'sorts' items have missing fields", async () => {})

  test("should fail with 400 if 'filters' items is have missing fields", async () => {})

  // ==================
  // === TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER value for TEXT field in filters', async () => {})

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for TEXT field in filters', async () => {})

  // ==================
  // === SHORT_TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER value for SHORT_TEXT field in filters', async () => {})

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for SHORT_TEXT field in filters', async () => {})

  // ==================
  // === SHORT_TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for NUMBER field in filters', async () => {})
  // TODO:
  test('should fail with 405 when passing BOOLEAN value for NUMBER field in filters', async () => {})

  // ==================
  // === NUMBER ===
  // ==================
  // TODO:
  test('should fail with 405 when passing FLOAT value for NUMBER field in filters', async () => {
    // Number field just accept integers
  })
  // TODO:
  test('should fail with 405 when passing TEXT value for NUMBER field in filters', async () => {})
  // TODO:
  test('should fail with 405 when passing BOOLEAN value for NUMBER field in filters', async () => {})

  // ==================
  // === FLOAT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for FLOAT field in filters', async () => {})
  // TODO:
  test('should fail with 405 when passing BOOLEAN value for FLOAT field in filters', async () => {})

  // ==================
  // === CHOICE =======
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER values to CHOICE', async () => {})

  // TODO:
  test('should fail with 405 when passing BOOLEAN values to CHOICE', async () => {})

  // ==================
  // === DATE =======
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for DATE field in filters', async () => {})
  // TODO:
  test('should fail with 405 when passing BOOLEAN value for DATE field in filters', async () => {})
  // TODO:
  test('should fail with 405 when passing NUMBER value for DATE field in filters', async () => {})
  // TODO:
  test('should fail with 405 when passing a start date bigger than end date in a in_between DATE filter', async () => {})
  // TODO:
  test('should fail with 405 if date is not on format ISO8601', async () => {})
})
