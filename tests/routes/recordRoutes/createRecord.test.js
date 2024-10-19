const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  checkFailRequest,
  validateCreateRecordResponse
} = require('../../testHelpers')
const COMMON_MSG = require('../../../utils/errorMsg')

describe('Manage Records Tests', () => {
  let userId, doctorId, templateId

  const REQUEST_URL = `${BASE_URL}/records/`

  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  async function checkFailCreateRequest(body, expectedCode, expectedMsg) {
    return checkFailRequest(
      'post',
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
  })

  afterAll(async () => {
    await deleteUser(userId)
  })

  // TODO:
  test('should succeed with 200 creating a record', async () => {
    const recordBody = {
      doctorId: doctorId,
      templateId: 'templateId123',
      patient: {
        names: 'Juan',
        lastnames: 'Pérez García',
        fields: [
          {
            name: 'Estado Civil',
            options: ['Soltero', 'Casado'],
            value: 'Soltero'
          }
        ]
      }
    }

    try {
      const response = await axios.post(REQUEST_URL, recordBody, {
        headers: HEADERS
      })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe(COMMON_MSG.REQUEST_SUCCESS)
      await validateCreateRecordResponse(response.data.data)
    } catch (error) {
      console.error(
        'Error creating record:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // TODO:
  test('should fail with 400 if doctorId not passed', async () => {
    await checkFailCreateRequest(
      {
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            }
          ]
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if templateId not passed', async () => {
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            }
          ]
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if patient not passed', async () => {
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if patient names not passed', async () => {
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            }
          ]
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if patient lastnames not passed', async () => {
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          fields: [
            {
              name: 'Estado Civil',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            }
          ]
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 400 if patient fields not passed', async () => {
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García'
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // TODO:
  test('should fail with 404 if doctorId is from a not active/existent doctor', async () => {
    await checkFailCreateRequest(
      {
        doctorId: 'nonExistentDoctorId',
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            }
          ]
        }
      },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // TODO:
  test('should fail with 404 if templateId is from a not-existent template', async () => {
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: 'nonExistentTemplateId',
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
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
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              value: 'Soltero'
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'SHORT_TEXT',
              value: ['Soltero', 'Casado']
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 'treinta'
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Edad',
              type: 'NUMBER',
              value: [1, 2, 3]
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30.5
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Peso',
              type: 'FLOAT',
              value: 'sesenta'
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Peso',
              type: 'FLOAT',
              value: [60.5, 65.2]
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
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
      COMMON_MSG.INVALID_FIELD_VALUE_CHOICE
    )
  })
  // TODO:
  test('should fail with 405 when passing ARRAY value for CHOICE field', async () => {
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'CHOICE',
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de Nacimiento',
              type: 'DATE',
              value: 'not-a-date'
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de Nacimiento',
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de Nacimiento',
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
    await checkFailCreateRequest(
      {
        doctorId: doctorId,
        templateId: templateId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de Nacimiento',
              type: 'DATE',
              value: ['2023-01-01']
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })
})
