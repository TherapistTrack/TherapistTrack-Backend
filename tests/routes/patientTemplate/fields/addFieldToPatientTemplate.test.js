const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../../jest.setup')
const { createTestDoctor, deleteUser } = require('../../../testHelpers')

let doctorId, headers

beforeAll(async () => {
  const doctor = await createTestDoctor()
  doctorId = doctor.id
  headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }
})

afterAll(async () => {
  await deleteUser(doctorId)
})

describe('Create Patient Template Tests', () => {
  // Test para agregar un campo exitosamente a una plantilla de paciente existente
  it('should successfully add a new field to an existing patient template', async () => {
    // Paso 1: Tener plantilla válida
    const testTemplate = {
      doctorId: doctorId,
      templateID: templateID,
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
    }

    let templateID

    // Crear la plantilla
    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
        testTemplate,
        { headers }
      )
      expect(response.status).toBe(200)
      templateID = response.data.data.patientTemplateId // Guardar el ID de la plantilla creada
    } catch (error) {
      console.error(
        'Error creating template:',
        error.response ? error.response.data : error.message
      )
      throw error
    }

    // Paso 2: Agregar un nuevo campo 'Phone Number'
    const fieldToAdd = {
      doctorId: doctorId,
      templateID: templateID, // Usar el ID de la plantilla creada
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

  // Test para validar que no se pueden agregar campos con el mismo nombre a una plantilla existente
  it('should fail to add a new field with the same name as an existing field in a patient template', async () => {
    // Paso 1: Tener una plantilla válida
    const testTemplate = {
      doctorId: doctorId,
      templateID: templateID,
      name: `testTemplate_${Date.now()}`,
      fields: [
        {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del paciente'
        }
      ]
    }

    let templateID

    // Crear la plantilla
    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
        testTemplate,
        { headers }
      )
      expect(response.status).toBe(200)
      templateID = response.data.data.patientTemplateId // Guardar el ID de la plantilla creada
    } catch (error) {
      console.error(
        'Error creating template:',
        error.response ? error.response.data : error.message
      )
      throw error
    }

    // Paso 2: Intentar agregar un campo con el mismo nombre 'Nombres'
    const fieldToAdd = {
      doctorId: doctorId,
      templateID: templateID,
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
    } catch (error) {
      expect(error.response.status).toBe(406) // El backend debería devolver un error 406
      expect(error.response.data.message).toBe(
        'Field already existing in the template'
      )
    }
  })

  // Test para validar falta de templateID
  it('should fail to add a field without the templateID', async () => {
    const fieldToAdd = {
      doctorId: doctorId,
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
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing template ID')
    }
  })

  // Test para validar que el doctor no es dueño de la plantilla
  it('should fail to add a field when the doctor is not the owner of the template', async () => {
    const fieldToAdd = {
      doctorId: 'invalidDoctorId', // Doctor incorrecto
      templateID: templateID,
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
    } catch (error) {
      expect(error.response.status).toBe(403) // El backend debería devolver un error 403
      expect(error.response.data.message).toBe(
        'Doctor not owner of the template'
      )
    }
  })
})
