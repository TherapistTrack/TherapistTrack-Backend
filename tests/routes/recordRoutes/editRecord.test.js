const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const {
  createTestDoctor,
  createTestPatientTemplate,
  createTestRecord,
  deleteUser,
  checkFailRequest,
  validateCreateRecordResponse
} = require('../../testHelpers')
const COMMON_MSG = require('../../../utils/errorMsg')

describe('Edit Records Tests', () => {
  let userId, doctorId, templateId, recordId

  const REQUEST_URL = `${BASE_URL}/records/`

  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  async function checkFailEditRequest(body, expectedCode, expectedMsg) {
    return checkFailRequest(
      'put',
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

    // Create a patient template for the doctor.
    templateId = await createTestPatientTemplate(
      doctorId,
      `testTemplate_${Date.now()}`,
      ['General'],
      [
        {
          name: 'Fecha de nacimiento',
          type: 'DATE',
          required: true,
          description: 'Fecha de nacimiento del paciente'
        }
      ]
    )

    // Create a test record using the created template.
    recordId = await createTestRecord(doctorId, templateId, {
      names: 'Juan',
      lastnames: 'Pérez García',
      fields: [
        {
          name: 'Fecha de nacimiento',
          options: ['Opción 1', 'Opción 2'],
          value: '2024-09-01'
        }
      ]
    })
  })

  afterAll(async () => {
    await deleteUser(userId)
  })

  // TODO:
  test('should succeed with 200 editing a record', async () => {
    const recordEditBody = {
      recordId: recordId,
      doctorId: doctorId,
      patient: {
        names: 'Juan Editado',
        lastnames: 'Pérez García',
        fields: [
          {
            name: 'Fecha de nacimiento',
            options: ['Opción 1', 'Opción 2'],
            value: '2025-01-01'
          }
        ]
      }
    }

    try {
      const response = await axios.put(REQUEST_URL, recordEditBody, {
        headers: HEADERS
      })

      expect(response.status).toBe(200)
      expect(response.data.message).toBe(COMMON_MSG.REQUEST_SUCCESS)
      await validateCreateRecordResponse(response.data.data)
    } catch (error) {
      console.error(
        'Error editing record:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // TODO:
  test('should fail with 400 if recordId is not passed', async () => {
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              options: ['Opción 1', 'Opción 2'],
              value: '2024-09-01'
            }
          ]
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if doctorId is not passed', async () => {
    await checkFailCreateRequest(
      {
        recordId: recordId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              options: ['Opción 1', 'Opción 2'],
              value: '2024-09-01'
            }
          ]
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if patient is not passed', async () => {
    await checkFailCreateRequest(
      {
        recordId: recordId,
        doctorId: doctorId
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if patient is passed malformed (missing fields)', async () => {
    await checkFailCreateRequest(
      {
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan'
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if patient does not include all the fields', async () => {
    await checkFailCreateRequest(
      {
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              options: ['Opción 1', 'Opción 2']
              // Missing the 'value' field here
            }
          ]
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 404 if doctorId is from a non-existent/active user', async () => {
    await checkFailCreateRequest(
      {
        recordId: recordId,
        doctorId: generateObjectId(),
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              options: ['Opción 1', 'Opción 2'],
              value: '2024-09-01'
            }
          ]
        }
      },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // TODO:
  test('should fail with 404 if recordId is from a non-existent record', async () => {
    await checkFailCreateRequest(
      {
        recordId: generateObjectId(),
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              options: ['Opción 1', 'Opción 2'],
              value: '2024-09-01'
            }
          ]
        }
      },
      404,
      COMMON_MSG.TEMPLATE_NOT_FOUND
    )
  })

  // TODO:
  test('should fail with 404 if not all fields defined by the template are not sent', async () => {
    await checkFailCreateRequest(
      {
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              value: '2024-09-01'
            }
          ]
        }
      },
      404,
      COMMON_MSG.MISSING_FIELDS_IN_TEMPLATE
    )
  })

  // ==================
  // === TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER value for TEXT field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'TEXT',
              value: 123
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_TEXT
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for TEXT field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'TEXT',
              value: true
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_TEXT
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for TEXT field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'TEXT',
              value: ['Soltero', 'Casado']
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_TEXT
    )
  })

  // ==================
  // === SHORT_TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER value for SHORT_TEXT field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Descripción',
              type: 'SHORT_TEXT',
              value: 123
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for SHORT_TEXT field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Descripción',
              type: 'SHORT_TEXT',
              value: true
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for SHORT_TEXT field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Descripción',
              type: 'SHORT_TEXT',
              value: ['texto1', 'texto2']
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
    )
  })

  // ==================
  // === NUMBER ===
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for NUMBER field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 'veinticinco'
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for NUMBER field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Edad',
              type: 'NUMBER',
              value: true
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for NUMBER field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Edad',
              type: 'NUMBER',
              value: [23, 24]
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
    )
  })

  // TODO:
  test('should fail with 405 when passing FLOAT value for NUMBER field', async () => {
    // Number field just accept integers
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 23.5
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
    )
  })

  // ==================
  // === FLOAT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for FLOAT field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Peso',
              type: 'FLOAT',
              value: 'sesenta y cinco'
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_FLOAT
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for FLOAT field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Peso',
              type: 'FLOAT',
              value: true
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_FLOAT
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for FLOAT field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Peso',
              type: 'FLOAT',
              value: [65.5, 66.0]
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_FLOAT
    )
  })

  // ==================
  // === CHOICE =======
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER values to CHOICE', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 123
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN values to CHOICE', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: true
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
    )
  })

  // TODO:
  test('should fail with 405 when passing VALUE that is not within CHOICE value', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              options: ['Soltero', 'Casado'],
              value: 'Divorciado'
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_CHOICE_VALUE
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for CHOICE field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              options: ['Soltero', 'Casado'],
              value: ['Soltero', 'Casado']
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
    )
  })

  // ==================
  // === DATE =======
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for DATE field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: 'invalid-date-string'
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for DATE field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: true
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })

  // TODO:
  test('should fail with 405 when passing NUMBER value for DATE field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: 1234567890
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for DATE field', async () => {
    await checkFailEditRequest(
      {
        recordId: 'nonExistentRecordId',
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: ['2024-09-01', '2024-09-02']
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })
})
