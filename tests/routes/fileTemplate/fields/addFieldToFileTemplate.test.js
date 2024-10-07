const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  createTestFileTemplate,
  checkFailRequest
} = require('../../../testHelpers')
const COMMON_MSG = require('../../../../utils/errorMsg')

describe('Create File Template Tests', () => {
  let doctor, secondDoctor, templateId

  const REQUEST_URL = `${BASE_URL}/doctor/FileTemplate/fields`

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
    doctor = await createTestDoctor()
    secondDoctor = await createTestDoctor()

    templateId = await createTestFileTemplate(
      doctor.roleDependentInfo.id,
      `testTemplate_${Date.now()}`,
      [
        {
          name: 'Resumen',
          type: 'TEXT',
          required: true,
          description: ''
        },
        {
          name: 'Avance',
          type: 'CHOICE',
          options: ['Positivo', 'Neutro', 'Negativo'],
          required: true,
          description: 'Estado civil del paciente'
        }
      ]
    )
  })

  afterAll(async () => {
    await deleteUser(doctor.id)
    await deleteUser(secondDoctor.id)
  })

  // DONE:
  test('should success with 200 add a new field to an existing file template', async () => {
    const fieldToAdd = {
      doctorId: doctor.roleDependentInfo.id,
      templateId: templateId, // Usar el ID de la plantilla creada
      field: {
        name: 'Campo1', // Campo nuevo 'Phone Number'
        type: 'NUMBER',
        required: true,
        description: 'Campo de prueba'
      }
    }

    try {
      const response = await axios.post(REQUEST_URL, {
        data: fieldToAdd,
        headers: HEADERS
      })
      expect(response.status).toBe(200) // El backend debería devolver un estado 200
      expect(response.data.message).toBe(COMMON_MSG.REQUEST_SUCCESS) // Mensaje esperado
    } catch (error) {
      console.error(
        'Error adding field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // DONE:
  test('should fail with 400 if templateID not passed', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        field: {
          name: 'Allergies',
          type: 'TEXT',
          value: '',
          required: false,
          description: "Patient's known allergies"
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  test('should fail with 400 if doctorId is not passed ', async () => {
    checkFailCreateRequest(
      {
        templateId: templateId,
        field: {
          name: 'Allergies',
          type: 'TEXT',
          value: '',
          required: false,
          description: "Patient's known allergies"
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  test('should fail with 403 if doctor is not the owner of the template', async () => {
    checkFailCreateRequest(
      {
        doctorId: secondDoctor.roleDependentInfo.id, // Doctor incorrecto
        templateId: templateId,
        field: {
          name: 'Phone Number',
          type: 'NUMBER',
          required: true,
          description: 'Teléfono del paciente'
        }
      },
      403,
      COMMON_MSG.DOCTOR_IS_NOT_OWNER
    )
  })

  // DONE:
  test('should fail with 404 if doctorId is form a non active/valid user ', async () => {
    checkFailCreateRequest(
      {
        doctorId: 'invalidDoctorId', // Doctor incorrecto
        templateId: templateId,
        field: {
          name: 'Phone Number',
          type: 'NUMBER',
          required: true,
          description: 'Teléfono del paciente'
        }
      },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // DONE:
  test('should fail with 404 if templateId does not exist ', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        templateId: 'nonExistentTemplate',
        field: {
          name: 'Phone Number',
          type: 'NUMBER',
          required: true,
          description: 'Teléfono del paciente'
        }
      },
      404,
      COMMON_MSG.TEMPLATE_NOT_FOUND
    )
  })

  // DONE:
  test('should fail with 406 due to name already exist in template', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        templateId: templateId,
        field: {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del paciente'
        }
      },
      406,
      COMMON_MSG.RECORDS_USING
    )
  })
})
