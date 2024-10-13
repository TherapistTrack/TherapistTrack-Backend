const axios = require('axios')
const { BASE_URL } = require('../../jest.setup')

describe('Get Record by ID', () => {
  // TODO:
  test('should succeed with 200 fetching a valid record', async () => {})

  // TODO:
  test('should fail with 400 if doctorId is not sent', async () => {})

  // TODO:
  test('should fail with 400 if recordId is not sent', async () => {})

  // TODO:
  test('should fail with 403 if doctor is not the owner of the template', async () => {})

  // TODO:
  test('should fail with 404 if doctorId is from a non-existent/disable user', async () => {})

  // TODO:
  test('should fail with 404 if recordId is from a non-existent record', async () => {})
})
