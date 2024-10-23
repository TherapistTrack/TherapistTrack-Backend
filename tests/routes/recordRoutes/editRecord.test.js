const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const {
  createTestDoctor,
  createTestPatientTemplate,
  createTestRecord,
  deleteUser,
  checkFailRequest
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
        },
        {
          name: 'Estado Civil',
          type: 'CHOICE',
          required: true,
          options: ['Soltero', 'Casado'],
          description: 'Estado civil del paciente'
        },
        {
          name: 'Notas adicionales',
          type: 'TEXT',
          required: false,
          description: 'Notas adicionales del paciente'
        },
        {
          name: 'Observaciones cortas',
          type: 'SHORT_TEXT',
          required: true,
          description: 'Observaciones breves del paciente'
        },
        {
          name: 'Peso en kg',
          type: 'FLOAT',
          required: true,
          description: 'Peso del paciente en kilogramos'
        },
        {
          name: 'Número de hijos',
          type: 'NUMBER',
          required: false,
          description: 'Número de hijos del paciente'
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
            type: 'DATE',
            value: '2025-01-01'
          },
          {
            name: 'Estado Civil',
            type: 'CHOICE',
            value: 'Soltero'
          },
          {
            name: 'Notas adicionales',
            type: 'TEXT',
            value: 'Observaciones adicionales del paciente'
          },
          {
            name: 'Observaciones cortas',
            type: 'SHORT_TEXT',
            value: 'Sin cambios'
          },
          {
            name: 'Peso en kg',
            type: 'FLOAT',
            value: '75.5'
          },
          {
            name: 'Número de hijos',
            type: 'NUMBER',
            value: 3
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
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Observaciones del paciente'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Sin cambios'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Observaciones del paciente'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Sin cambios'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Observaciones del paciente'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Sin cambios'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            }
            // Missing the 'Número de hijos' field here
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
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Observaciones del paciente'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Sin cambios'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Observaciones del paciente'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Sin cambios'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
              type: 'DATE',
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 123
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Sin cambios'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: true
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Sin cambios'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: ['Observación 1', 'Observación 2']
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Sin cambios'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 123
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: true
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: ['texto1', 'texto2']
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 3
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 'veinticinco'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: true
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: [23, 24]
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
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
    // Number field just accepts integers
    await checkFailEditRequest(
      {
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 23.5
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: '75.5'
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 'sesenta y cinco'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: true
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: [65.5, 66.0]
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 123
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: true
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
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
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
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
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: 'invalid-date-string'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: true
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: 1234567890
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
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
        recordId: recordId,
        doctorId: doctorId,
        patient: {
          names: 'Juan',
          lastnames: 'Pérez García',
          fields: [
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: ['2024-09-01', '2024-09-02']
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas relevantes'
            },
            {
              name: 'Observaciones cortas',
              type: 'SHORT_TEXT',
              value: 'Observación breve'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Número de hijos',
              type: 'NUMBER',
              value: 2
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })
})
