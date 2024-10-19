const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const {
  createTestDoctor,
  createTestRecord,
  deleteUser,
  checkFailRequest
} = require('../../testHelpers')
const COMMON_MSG = require('../../../utils/errorMsg')

describe('Delete Records Tests', () => {
  let userId, doctorId, recordId

  const REQUEST_URL = `${BASE_URL}/records/`

  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  async function checkFailDeleteRequest(body, expectedCode, expectedMsg) {
    return checkFailRequest(
      'delete',
      REQUEST_URL,
      HEADERS,
      {},
      body,
      expectedCode,
      expectedMsg
    )
  }

  beforeAll(async () => {
    const doctor = await createTestDoctor()
    userId = doctor.id
    doctorId = doctor.roleDependentInfo.id

    const patientData = {
      names: 'Juan',
      lastnames: 'Pérez García',
      fields: [
        {
          name: 'Estado Civil',
          value: 'Soltero'
        }
      ]
    }
    recordId = await createTestRecord(doctorId, 'templateId123', patientData)
  })

  afterAll(async () => {
    await deleteUser(userId)
  })

  // TODO:
  test('should succeed with 200 deleting a record', async () => {
    const deleteBody = {
      recordId: recordId,
      doctorId: doctorId
    }

    try {
      const response = await axios.delete(REQUEST_URL, {
        headers: HEADERS,
        data: deleteBody
      })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe(COMMON_MSG.REQUEST_SUCCESS)
    } catch (error) {
      console.error(
        'Error deleting record:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // TODO:
  test('should fail with 400 if recordId is not passed', async () => {
    await checkFailCreateRequest(
      {
        doctorId: doctorId
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if doctorId is not passed', async () => {
    await checkFailCreateRequest(
      {
        recordId: recordId
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 403 if doctor is not owner of record', async () => {
    await checkFailCreateRequest(
      {
        recordId: recordId,
        doctorId: 'anotherDoctorId'
      },
      403,
      COMMON_MSG.DOCTOR_IS_NOT_OWNER
    )
  })

  // TODO:
  test('should fail with 404 if doctorId is from a non-existent/active user', async () => {
    await checkFailCreateRequest(
      {
        recordId: recordId,
        doctorId: 'nonExistentDoctorId'
      },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // TODO:
  test('should fail with 404 if recordId is from a non-existent record', async () => {
    await checkFailCreateRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId
      },
      404,
      COMMON_MSG.RECORD_NOT_FOUND
    )
  })

  // TODO:
  test('should fail with 409 if recordId has files stored within', async () => {
    // can only be implemented when endpoints for file managemente are created.
    await checkFailCreateRequest(
      {
        recordId: recordId,
        doctorId: doctorId
      },
      409,
      COMMON_MSG.OPERATION_REJECTED
    )
  })
})
