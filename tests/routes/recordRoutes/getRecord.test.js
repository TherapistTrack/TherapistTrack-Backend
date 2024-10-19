const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  createTestRecord,
  checkFailRequest,
  validateGetRecordResponse
} = require('../../testHelpers')
const COMMON_MSG = require('../../../utils/errorMsg')

describe('Get Record by ID', () => {
  let userId, doctorId, recordId

  const REQUEST_URL = `${BASE_URL}/records/`

  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  async function checkFailGetRequest(params, expectedCode, expectedMsg) {
    return checkFailRequest(
      'get',
      REQUEST_URL,
      HEADERS,
      params,
      null,
      expectedCode,
      expectedMsg
    )
  }

  beforeAll(async () => {
    const doctor = await createTestDoctor()
    userId = doctor.id
    doctorId = doctor.roleDependentInfo.id

    recordId = await createTestRecord(doctorId, 'templateId123', {
      names: 'Juan',
      lastnames: 'Pérez García',
      fields: [
        {
          name: 'Fecha de nacimiento',
          type: 'DATE',
          options: ['Opción 1', 'Opción 2'],
          value: '2024-09-01',
          required: true
        }
      ]
    })
  })

  afterAll(async () => {
    await deleteUser(userId)
  })

  // TODO:
  test('should succeed with 200 fetching a valid record', async () => {
    try {
      const response = await axios.get(REQUEST_URL, {
        headers: HEADERS,
        params: {
          recordId: recordId,
          doctorId: doctorId
        }
      })

      expect(response.status).toBe(200)
      expect(response.data.message).toBe(COMMON_MSG.REQUEST_SUCCESS)
      await validateGetRecordResponse(response.data)
    } catch (error) {
      console.error(
        'Error fetching record:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // TODO:
  test('should fail with 400 if doctorId is not sent', async () => {
    await checkFailRequest(
      'get',
      REQUEST_URL,
      HEADERS,
      { recordId },
      null,
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if recordId is not sent', async () => {
    await checkFailRequest(
      'get',
      REQUEST_URL,
      HEADERS,
      { doctorId }, // Faltando recordId
      null,
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 403 if doctor is not the owner of the template', async () => {
    const otherDoctorId = generateObjectId()

    await checkFailRequest(
      'get',
      REQUEST_URL,
      HEADERS,
      {
        recordId,
        doctorId: otherDoctorId
      },
      null,
      403,
      COMMON_MSG.DOCTOR_IS_NOT_OWNER
    )
  })

  // TODO:
  test('should fail with 404 if doctorId is from a non-existent/disable user', async () => {
    const nonExistentDoctorId = generateObjectId()

    await checkFailRequest(
      'get',
      REQUEST_URL,
      HEADERS,
      {
        recordId,
        doctorId: nonExistentDoctorId
      },
      null,
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // TODO:
  test('should fail with 404 if recordId is from a non-existent record', async () => {
    const nonExistentRecordId = generateObjectId()

    await checkFailRequest(
      'get',
      REQUEST_URL,
      HEADERS,
      {
        recordId: nonExistentRecordId,
        doctorId: doctorId
      },
      null,
      404,
      COMMON_MSG.RECORD_NOT_FOUND
    )
  })
})
