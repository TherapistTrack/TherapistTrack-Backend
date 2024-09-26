const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  createTestPatientTemplate
} = require('../../../testHelpers')
const COMMON_MSG = require('../../../../utils/errorMsg')

describe('Create Patient Template Tests', () => {
  let doctor, secondDoctor, templateId

  const REQUEST_URL = `${BASE_URL}/doctor/PatientTemplate/fields`

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
    await deleteUser(doctor.id)
    await deleteUser(secondDoctor.id)
  })

  // DONE:
  it('should successfully add a new field to an existing patient template', async () => {
    const fieldToAdd = {
      doctorId: doctor.roleDependentInfo.id,
      templateId: templateId, // Usar el ID de la plantilla creada
      patientTemplate: {
        name: 'Numero de Telefono', // Campo nuevo 'Phone Number'
        type: 'NUMBER',
        required: true,
        description: 'Teléfono de contacto del paciente'
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToAdd,
        { headers }
      )
      expect(response.status).toBe(200) // El backend debería devolver un estado 200
      expect(response.data.message).toBe(
        'Field added to patient template successfully'
      ) // Mensaje esperado
    } catch (error) {
      console.error(
        'Error adding field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // DONE:
  it('should fail with 400 if templateID not passed', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        patientTemplate: {
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
  test('should fail with 400 if doctorId not passed ', async () => {
    checkFailCreateRequest(
      {
        templateId: templateId,
        patientTemplate: {
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
  test("should fail with 400 creating field 'Nombres' since it is a reserved name ", async () => {
    checkFailCreateRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        templateId: templateId,
        patientTemplate: {
          name: 'Nombres',
          type: 'NUMBER',
          required: true,
          description: 'Edad del paciente'
        }
      },
      400,
      COMMON_MSG.RESERVED_FIELD_NAMES
    )
  })

  // DONE:
  test("should fail with 400 creating field 'Apellidos' since it is a reserved name ", async () => {
    checkFailCreateRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        templateId: templateId,
        patientTemplate: {
          name: 'Apellidos',
          type: 'NUMBER',
          required: true,
          description: 'Edad del paciente'
        }
      },
      400,
      COMMON_MSG.RESERVED_FIELD_NAMES
    )
  })

  // DONE:
  it('should fail with 403 if doctor is not the owner of the template', async () => {
    checkFailCreateRequest(
      {
        doctorId: secondDoctor.roleDependentInfo.id, // Doctor incorrecto
        templateId: templateId,
        patientTemplate: {
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
        patientTemplate: {
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
        patientTemplate: {
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
  it('should fail with 406 due to name alredy exist in template', async () => {
    checkFailCreateRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        templateId: templateId,
        patientTemplate: {
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
