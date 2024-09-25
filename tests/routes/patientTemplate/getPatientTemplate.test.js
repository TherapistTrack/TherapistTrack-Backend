const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const COMMON_MSG = require('../../../utils/errorMsg')
const {
  createTestDoctor,
  deleteUser,
  checkFailRequest
} = require('../../testHelpers')

describe('Get Patient Template by ID Tests', () => {
  let doctor
  let templateId

  const REQUEST_URL = `${BASE_URL}/doctor/PatientTemplate?templateId=${templateId}`

  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  async function checkFailGetRequest(queryParams, expectedCode, expectedMsg) {
    await checkFailRequest(
      'get',
      REQUEST_URL,
      HEADERS,
      queryParams,
      {},
      expectedCode,
      expectedMsg
    )
  }

  beforeAll(async () => {
    doctor = await createTestDoctor()

    // Crear una plantilla de paciente para usarla en los tests
    templateId = await createTestPatientTemplate(
      doctor.roleDependentInfo.id,
      `testTemplate_${Date.now()}`,
      [
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
    )
  })

  afterAll(async () => {
    await deleteUser(doctorId)
  })

  // Test para obtener una plantilla por su ID correctamente
  test('should success with 200 retrieve a patient template by its ID', async () => {
    try {
      const response = await axios.get(
        REQUEST_URL,
        {
          doctorId: doctor.roleDependentInfo.id,
          templateId: templateId
        },
        { headers: HEADERS }
      )
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty(
        'doctor',
        doctor.roleDependentInfo.id
      )
      expect(response.data).toHaveProperty('lastUpdated')
      expect(response.data).toHaveProperty('name', 'Plantilla-2024')
      expect(response.data.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Nombres',
            type: 'SHORT_TEXT',
            required: true
          }),
          expect.objectContaining({
            name: 'Apellidos',
            type: 'SHORT_TEXT',
            required: true
          }),
          expect.objectContaining({
            name: 'Edad',
            type: 'NUMBER',
            required: true
          })
        ])
      )
      expect(response.data.message).toBe(COMMON_MSG.REQUEST_SUCCESS)
    } catch (error) {
      console.error(
        'Error retrieving template by ID:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para fallar si no se proporciona el doctorId
  test('should fail with 400 if "doctorId" is not provided', async () => {
    await checkFailGetRequest(
      {
        templateId
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // Test para fallar si no se proporciona el templateId
  test('should fail with 400 if "templateId" is not provided', async () => {
    await checkFailGetRequest(
      {
        doctorId
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // Test para fallar si el doctor existe pero no es el propietario de la plantilla
  test('should fail with 403 if "doctorId" exist but is not the owner of the template', async () => {
    const wrongDoctorId = 'anotherDoctorId'

    await checkFailGetRequest(
      {
        templateId,
        doctorId: wrongDoctorId
      },
      403,
      COMMON_MSG.NOT_OWNER
    )
  })

  // Test para fallar si el doctorId no corresponde a un doctor existente
  test('should fail with 404 if "doctorId" does not correspond to an existent/active doctor', async () => {
    const nonExistentDoctorId = 'invalidDoctorId'

    await checkFailGetRequest(
      {
        templateId,
        doctorId: nonExistentDoctorId
      },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // Test para fallar si la plantilla no existe
  test('should fail with 404 if "template" does not correspond to an existent template', async () => {
    const nonExistentTemplateId = 'invalidTemplateId'

    await checkFailGetRequest(
      {
        templateId: nonExistentTemplateId,
        doctorId
      },
      404,
      COMMON_MSG.TEMPLATE_NOT_FOUND
    )
  })

  // Test para obtener una plantilla por su ID inexistente
  test('should fail with 404 when trying to retrieve a non-existent template', async () => {
    const nonExistentTemplateId = 'invalidTemplateId' // ID inexistente

    await checkFailGetRequest(
      {
        doctorId,
        templateId: nonExistentTemplateId
      },
      404,
      COMMON_MSG.TEMPLATE_NOT_FOUND
    )
  })
})
