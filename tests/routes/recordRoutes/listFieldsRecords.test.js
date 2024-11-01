const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const {
  createTestDoctor,
  createTestPatientTemplate,
  createTestRecord,
  deleteUser,
  checkFailRequest,
  validateResponse
} = require('../../testHelpers')
const COMMON_MSG = require('../../../utils/errorMsg')

describe('List possible fields', () => {
  let doctorId, userId, templateId, recordId

  const REQUEST_URL = `${BASE_URL}/records/search`

  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  async function checkFailListRequest(body, expectedCode, expectedMsg) {
    return checkFailRequest(
      'get',
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

    templateId = await createTestPatientTemplate(
      doctorId,
      'Plantilla de Prueba',
      ['General'],
      [
        {
          name: 'Age',
          type: 'NUMBER',
          required: true,
          description: 'Edad del paciente'
        }
      ]
    )

    recordId1 = await createTestRecord(doctorId, templateId, {
      names: 'Juan',
      lastnames: 'Pérez García',
      fields: [
        {
          name: 'Age',
          value: 30
        }
      ]
    })

    recordId2 = await createTestRecord(doctorId, templateId, {
      names: 'Ana',
      lastnames: 'López Martínez',
      fields: [
        {
          name: 'Age',
          value: 25
        }
      ]
    })

    recordId3 = await createTestRecord(doctorId, templateId, {
      names: 'Carlos',
      lastnames: 'Ramírez Díaz',
      fields: [
        {
          name: 'Age',
          value: 45
        }
      ]
    })
  })

  afterAll(async () => {
    await deleteUser(userId)
  })

  // TODO:
  test('Should succeed with 200 in retreiving available record fields', async () => {
    try {
      const response = await axios.get(REQUEST_URL, {
        headers: HEADERS,
        params: {
          doctorId: doctorId
        }
      })

      expect(response.status).toBe(200)
      expect(response.data.message).toBe(COMMON_MSG.REQUEST_SUCCESS)

      // Validar que el campo 'fields' contiene los datos esperados
      expect(response.data.fields).toBeDefined()
      expect(Array.isArray(response.data.fields)).toBe(true)
      expect(response.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Age',
            type: 'NUMBER'
          })
        ])
      )
    } catch (error) {
      console.error(
        'Error retrieving available record fields:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // TODO:
  test('Should fail with 400 if doctorId is not sent', async () => {
    await checkFailListRequest({}, 400, COMMON_MSG.MISSING_FIELDS)
  })

  // TODO:
  test('Should fail with 404 if doctorId not correspond to and existent/valid user', async () => {
    const nonExistentDoctorId = 'nonExistentDoctorId12345'

    await checkFailListRequest(
      { doctorId: nonExistentDoctorId },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // TODO:
  test('Should fail with 404 if doctorId is blank', async () => {
    await checkFailListRequest(
      { doctorId: '' },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })
})
