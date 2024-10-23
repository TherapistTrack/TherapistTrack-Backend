const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  createTestPatientTemplate,
  checkFailRequest,
  validateResponse
} = require('../../testHelpers')
const COMMON_MSG = require('../../../utils/errorMsg')
const yup = require('yup')

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

    templateId = await createTestPatientTemplate(
      doctorId,
      'Plantilla de Identificación',
      ['General', 'Consultas'],
      [
        {
          name: 'Estado Civil',
          type: 'CHOICE',
          options: ['Soltero', 'Casado'],
          required: true,
          description: 'Estado civil del paciente'
        },
        {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del paciente'
        },
        {
          name: 'Peso en kg',
          type: 'FLOAT',
          required: true,
          description: 'Peso del paciente'
        },
        {
          name: 'Notas adicionales',
          type: 'TEXT',
          required: false,
          description: 'Notas adicionales del paciente'
        },
        {
          name: 'Observaciones breves',
          type: 'SHORT_TEXT',
          required: true,
          description: 'Observaciones rápidas'
        },
        {
          name: 'Fecha de nacimiento',
          type: 'DATE',
          required: true,
          description: 'Fecha de nacimiento del paciente'
        }
      ]
    )
  })

  const recordSchema = yup.object().shape({
    status: yup.number().required().oneOf([0]),
    message: yup.string().required().oneOf(['Operation success!']),
    recordId: yup.string().required(),
    templateId: yup.string().required(),
    categories: yup.array().of(yup.array().of(yup.string())).required(),
    createdAt: yup.string().required(),
    patient: yup
      .object()
      .shape({
        names: yup.string().required(),
        lastnames: yup.string().required(),
        fields: yup
          .array()
          .of(
            yup.object().shape({
              name: yup.string().required(),
              type: yup
                .string()
                .required()
                .oneOf([
                  'TEXT',
                  'SHORT_TEXT',
                  'NUMBER',
                  'FLOAT',
                  'CHOICE',
                  'DATE'
                ]),
              options: yup.array().of(yup.string()).optional(),
              value: yup.string().required(),
              required: yup.boolean().required()
            })
          )
          .required()
      })
      .required()
  })

  afterAll(async () => {
    await deleteUser(userId)
  })

  // TODO:
  test('should succeed with 200 creating a record', async () => {
    const recordBody = {
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
            value: 'Soltero'
          },
          {
            name: 'Edad',
            type: 'NUMBER',
            value: 30
          },
          {
            name: 'Peso en kg',
            type: 'FLOAT',
            value: 70.5
          },
          {
            name: 'Notas adicionales',
            type: 'TEXT',
            value: 'Paciente en buenas condiciones'
          },
          {
            name: 'Observaciones breves',
            type: 'SHORT_TEXT',
            value: 'Revisión rápida'
          },
          {
            name: 'Fecha de nacimiento',
            type: 'DATE',
            value: '1992-01-15'
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
      await validateResponse(response.data.data, recordSchema)
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
              type: 'CHOICE',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Paciente en buenas condiciones'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Revisión rápida'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '1992-01-15'
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
              type: 'CHOICE',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Paciente en buenas condiciones'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Revisión rápida'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '1992-01-15'
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
              type: 'CHOICE',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Paciente en buenas condiciones'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Revisión rápida'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '1992-01-15'
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
              type: 'CHOICE',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Paciente en buenas condiciones'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Revisión rápida'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '1992-01-15'
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
              type: 'CHOICE',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Paciente en buenas condiciones'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Revisión rápida'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '1992-01-15'
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
              type: 'CHOICE',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Paciente en buenas condiciones'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Revisión rápida'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '1992-01-15'
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
              type: 'CHOICE',
              options: ['Soltero', 'Casado'],
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
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
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 123
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Paciente en buen estado'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: true
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Paciente en buen estado'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: ['Texto1', 'Texto2']
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Paciente en buen estado'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 123
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: true
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: ['Texto1', 'Texto2']
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 'treinta'
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones breves'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: true
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones breves'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: [1, 2, 3]
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones breves'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30.5
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 65.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones breves'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 'sesenta'
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones breves'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: true
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones breves'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: [60.5, 65.2]
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Información adicional'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones breves'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas de prueba'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas de prueba'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas de prueba'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas de prueba'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones'
            },
            {
              name: 'Fecha de nacimiento',
              type: 'DATE',
              value: '2024-09-01'
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
              name: 'Nacimiento',
              type: 'DATE',
              value: 'not-a-date'
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas de prueba'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones'
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
              name: 'Nacimiento',
              type: 'DATE',
              value: true
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas de prueba'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones'
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
              name: 'Nacimiento',
              type: 'DATE',
              value: 1234567890
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas de prueba'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones'
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
              name: 'Nacimiento',
              type: 'DATE',
              value: ['2023-01-01']
            },
            {
              name: 'Estado Civil',
              type: 'CHOICE',
              value: 'Soltero'
            },
            {
              name: 'Edad',
              type: 'NUMBER',
              value: 30
            },
            {
              name: 'Peso en kg',
              type: 'FLOAT',
              value: 70.5
            },
            {
              name: 'Notas adicionales',
              type: 'TEXT',
              value: 'Notas de prueba'
            },
            {
              name: 'Observaciones breves',
              type: 'SHORT_TEXT',
              value: 'Observaciones'
            }
          ]
        }
      },
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })
})
