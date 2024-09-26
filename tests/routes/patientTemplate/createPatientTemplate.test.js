const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  checkFailRequest
} = require('../../testHelpers')
const COMMON_MSG = require('../../../utils/errorMsg')

describe('Create Patient Template Tests', () => {
  let userId, doctorId

  const REQUEST_URL = `${REQUEST_URL}/doctor/PatientTemplate`

  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  async function checkFailCreateRequest(body, expectedCode, expectedMsg) {
    await checkFailRequest(
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
    doctorId = doctor.rolDependentInfo.id
  })

  afterAll(async () => {
    await deleteUser(userId)
  })

  // DONE:
  it('should create a new patient template correctly with all required fields', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: `testTemplate`,
      fields: [
        {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del paciente'
        },
        {
          name: 'Hijos',
          type: 'TEXT',
          required: true,
          decription: 'Hijos del paciente'
        },
        {
          name: 'Estado Civil',
          type: 'CHOICE',
          options: ['Soltero', 'Casado'],
          required: true,
          description: 'Estado civil del paciente'
        },
        {
          name: 'Fecha de Nacimiento',
          type: 'DATE',
          required: false,
          decription: 'Fecha de Nacimiento del paciente'
        }
      ]
    }

    try {
      const response = await axios.post(`${BASE_URL}/doctor/PatientTemplate`, {
        data: testTemplate,
        headers: HEADERS
      })
      expect(response.status).toBe(200) // Comprobamos que se creó correctamente
      expect(response.data.message).toBe(
        'Patient template created successfully'
      )
      templateId = response.data.data.patientTemplateId
    } catch (error) {
      console.error(
        'Error creating template:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // DONE:
  it('should fail with 400 to create a patient template without the doctorId', async () => {
    checkFailCreateRequest(
      {
        name: `testTemplate_${Date.now()}`,
        fields: [
          {
            name: 'Edad',
            type: 'NUMBER',
            required: true,
            description: 'Edad del paciente'
          },
          {
            name: 'Estado Civil',
            type: 'CHOICE',
            options: ['Soltero', 'Casado'],
            required: true,
            description: 'Estado civil del paciente'
          }
        ]
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  it('should trigger a 400 when passed a malformed fields list', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctorId,
        name: `testTemplate_${Date.now()}`,
        fields: 'This should be an array, not a string'
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  it('should fail with 400  with CHOICE field but not options attribute defined', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctorId,
        name: `testTemplate_${Date.now()}`,
        fields: [
          {
            name: 'Estado Civil',
            type: 'CHOICE',
            required: true,
            description: 'Estado civil del paciente'
          }
        ]
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  it('should fail with 400 with field "Nombres" since its a reserved name', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctorId,
        name: `testTemplate_${Date.now()}`,
        fields: [
          {
            name: 'Nombres',
            type: 'TEXT',
            required: true,
            description: 'Apellidos del paciente'
          } // "Apellidos" es un campo reservado
        ]
      },
      400,
      COMMON_MSG.RESERVED_FIELD_NAMES
    )
  })

  // DONE:
  it('should fail with 400 with field "Apellidos" since its a reserved name', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctorId,
        name: `testTemplate_${Date.now()}`,
        fields: [
          {
            name: 'Apellidos',
            type: 'TEXT',
            required: true,
            description: 'Apellidos del paciente'
          } // "Apellidos" es un campo reservado
        ]
      },
      400,
      COMMON_MSG.RESERVED_FIELD_NAMES
    )
  })

  // DONE:
  it('should fail with 404 to create a patient template with a non-existent doctorId', async () => {
    checkFailCreateRequest(
      {
        doctorId: 'nonExistentDoctorId',
        name: `testTemplate_${Date.now()}`,
        fields: [
          {
            name: 'Edad',
            type: 'NUMBER',
            required: true,
            description: 'Edad del paciente'
          },
          {
            name: 'Estado Civil',
            type: 'CHOICE',
            options: ['Soltero', 'Casado'],
            required: true,
            description: 'Estado civil del paciente'
          }
        ]
      },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // DONE:
  it('should fail with 406 when creating a patient template with an existing name', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctorId,
        name: 'testTemplate',
        fields: [
          {
            name: 'Edad',
            type: 'NUMBER',
            required: true,
            description: 'Edad del paciente'
          }
        ]
      },
      406,
      COMMON_MSG.RECORDS_USING
    )
  })

  /* Para endPonintRecords
  // Test para validar tipos de datos incorrectos en los campos
  it('should fail to create a patient template with incorrect data types', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'Plantilla-2024',
        fields: [
          { name: 'Nombres', type: 'SHORT_TEXT', required: true }, // Texto Corto
          { name: 'Apellidos', type: 'SHORT_TEXT', required: true }, // Texto Corto
          {
            name: 'Edad',
            type: 'NUMBER',
            required: true,
            value: 'not-a-number'
          }, // Error: texto en lugar de número
          {
            name: 'Estado Civil',
            type: 'CHOICE',
            options: ['Soltero', 'Casado'],
            required: true
          }
        ]
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/templates/create`,
        testTemplate,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Tipo de dato incorrecto')
    }
  })
  */
})
