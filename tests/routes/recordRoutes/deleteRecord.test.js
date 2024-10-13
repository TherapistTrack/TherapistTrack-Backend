const axios = require('axios')
const { BASE_URL } = require('../../jest.setup')

describe('Delete Records Tests', () => {
  // TODO:
  test('should fail with 400 if recordId is not passed', async () => {})

  // TODO:
  test('should fail with 400 if doctorId is not passed', async () => {})

  // TODO:
  test('should fail with 403 if doctor is not owner of record', async () => {})

  // TODO:
  test('should fail with 403 if doctor is not owner of record', async () => {})

  // TODO:
  test('should fail with 404 if doctorId is from a non-existent/active user', async () => {})

  // TODO:
  test('should fail with 404 if recordId is from a non-existent record', async () => {})

  // TODO:
  test('should fail with 409 if recordId has files stored within', async () => {
    // can only be implemented when endpoints for file managemente are created.
  })

  // TODO:
  test('should suceed with 200 ', async () => {})
})
