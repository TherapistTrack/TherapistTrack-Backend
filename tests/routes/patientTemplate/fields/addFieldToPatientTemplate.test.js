const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  createTestPatientTemplate
} = require('../../../testHelpers')

describe('Create Patient Template Tests', () => {
  let doctorId, templateId, headers

  beforeAll(async () => {
    const doctor = await createTestDoctor()
    doctorId = doctor.id
    templateId = await createTestPatientTemplate(doctorId, {
      doctorId: doctorId,
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
    })
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
      Origin: 'http://localhost'
    }
  })

  afterAll(async () => {
    await deleteUser(doctorId)
  })

  // DONE:
  it('should successfully add a new field to an existing patient template', async () => {
    const fieldToAdd = {
      doctorId: doctorId,
      templateID: templateId, // Usar el ID de la plantilla creada
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
    const fieldToAdd = {
      doctorID: doctorId,
      patientTemplate: {
        name: 'Allergies',
        type: 'TEXT',
        value: '',
        required: false,
        description: "Patient's known allergies"
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToAdd,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing fields.')
    }
  })

  // DONE:
  test('should fail with 400 if doctorId not passed ', async () => {
    const fieldToAdd = {
      templateID: templateId,
      patientTemplate: {
        name: 'Allergies',
        type: 'TEXT',
        value: '',
        required: false,
        description: "Patient's known allergies"
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToAdd,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing fields.')
    }
  })

  //
  it('should fail with 403 if doctor is not the owner of the template', async () => {
    const fieldToAdd = {
      doctorId: 'invalidDoctorId', // Doctor incorrecto
      templateID: templateId,
      patientTemplate: {
        name: 'Phone Number',
        type: 'NUMBER',
        required: true,
        description: 'Teléfono del paciente'
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToAdd,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(403) // El backend debería devolver un error 403
      expect(error.response.data.message).toBe(
        'Doctor is not the owner of the template'
      )
    }
  })

  // TODO:
  test('should fail with 404 if doctorId is form a non active/valid user ', async () => {})

  // TODO:
  test('should fail with 404 if templateId does not exist ', async () => {})

  // DONE:
  it('should fail with 406 due to name alredy exist in template', async () => {
    const fieldToAdd = {
      doctorId: doctorId,
      templateID: templateId,
      patientTemplate: {
        name: 'Edad',
        type: 'NUMBER',
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToAdd,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(406) // El backend debería devolver un error 406
      expect(error.response.data.message).toBe(
        'Field already existing in the template'
      )
    }
  })

  // TODO:
  test("should fail with 406 creatin field 'Nombres' since it is a reserved name ", async () => {})

  // TODO:
  test("should fail with 406 creatin field 'Apellidos' since it is a reserved name ", async () => {})
})
