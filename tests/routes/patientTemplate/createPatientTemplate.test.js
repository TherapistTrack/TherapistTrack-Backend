const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const { createTestDoctor, deleteUser } = require('../../testHelpers')

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
  // Test para validar la falta de doctorId
  it('should fail to create a patient template without the doctorId', async () => {
    const testTemplate = {
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'Plantilla-2024',
        fields: [
          { name: 'Nombres', type: 'SHORT_TEXT', required: true },
          { name: 'Apellidos', type: 'SHORT_TEXT', required: true },
          { name: 'Edad', type: 'NUMBER', required: true },
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
      expect(error.response.data.message).toBe('Falta el ID del doctor')
    }
  })

  // Test para doctorId inexistente
  it('should fail to create a patient template with a non-existent doctorId', async () => {
    const testTemplate = {
      doctorId: 'nonExistentDoctorId', // Un doctorId que no existe en la base de datos
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'Plantilla-2024',
        fields: [
          { name: 'Nombres', type: 'SHORT_TEXT', required: true },
          { name: 'Apellidos', type: 'SHORT_TEXT', required: true },
          { name: 'Edad', type: 'NUMBER', required: true },
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
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe('Doctor not found')
    }
  })

  // Test para provocar un error interno del servidor
  it('should trigger a 400 when passed a malformed fields list', async () => {
    const malformedTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        // Campo malformado que debería causar un error en el servidor
        fields: 'This should be an array, not a string'
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/templates/create`,
        malformedTemplate,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Campos malformados')
    }
  })

  // Test para crear una nueva plantilla con todos los campos correctos
  it('should create a new patient template correctly with all required fields', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'Plantilla-2024',
        fields: [
          { name: 'Nombres', type: 'SHORT_TEXT', required: true }, // Texto Corto (obligatorio)
          { name: 'Apellidos', type: 'SHORT_TEXT', required: true }, // Texto Corto (obligatorio)
          { name: 'Edad', type: 'NUMBER', required: false }, // Número
          { name: 'Hijos', type: 'TEXT', required: true }, // Texto Largo
          {
            name: 'Estado Civil',
            type: 'CHOICE',
            options: ['Soltero', 'Casado'],
            required: true
          }, // Elección
          { name: 'Fecha de Nacimiento', type: 'DATE', required: false } // Fecha
        ]
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/templates/create`,
        testTemplate,
        {
          headers
        }
      )
      expect(response.status).toBe(201) // Comprobamos que se creó correctamente
      expect(response.data.message).toBe(
        'Plantilla de paciente creada exitosamente'
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

  // Test para crear una nueva plantilla sin Nombre
  it('should fail to create a patient template without the required "Nombres" field', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'Plantilla-2024',
        fields: [
          { name: 'Apellidos', type: 'SHORT_TEXT', required: true }, // Texto Corto (obligatorio)
          { name: 'Edad', type: 'NUMBER', required: false }, // Número
          { name: 'Hijos', type: 'TEXT', required: true }, // Texto Largo
          {
            name: 'Estado Civil',
            type: 'CHOICE',
            options: ['Soltero', 'Casado'],
            required: true
          }, // Elección
          { name: 'Fecha de Nacimiento', type: 'DATE', required: false } // Fecha
        ]
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/templates/create`,
        testTemplate,
        {
          headers
        }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing mandatory fields')
    }
  })

  // Test para crear una nueva plantilla sin Apellido
  it('should fail to create a patient template without the required "Apellidos" field', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'Plantilla-2024',
        fields: [
          { name: 'Nombres', type: 'SHORT_TEXT', required: true }, // Texto Corto (obligatorio)
          { name: 'Edad', type: 'NUMBER', required: false }, // Número
          { name: 'Hijos', type: 'TEXT', required: true }, // Texto Largo
          {
            name: 'Estado Civil',
            type: 'CHOICE',
            options: ['Soltero', 'Casado'],
            required: true
          }, // Elección
          { name: 'Fecha de Nacimiento', type: 'DATE', required: false } // Fecha
        ]
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/templates/create`,
        testTemplate,
        {
          headers
        }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing mandatory fields')
    }
  })

  // Test para crear una nueva plantilla con todos los campos correctos
  it('should fail to create template with CHOICE field but not options attribute defined', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'Plantilla-2024',
        fields: [
          { name: 'Nombres', type: 'SHORT_TEXT', required: true },
          { name: 'Apellidos', type: 'SHORT_TEXT', required: true },
          {
            name: 'Estado Civil',
            type: 'CHOICE',
            required: true
          }
        ]
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/templates/create`,
        testTemplate,
        {
          headers
        }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Malformed CHOICE field')
    }
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
