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

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
        testTemplate,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing doctorId')
    }
  })

  // Test para doctorId inexistente
  it('should fail to create a patient template with a non-existent doctorId', async () => {
    const testTemplate = {
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
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
        testTemplate,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe('Doctor not found')
    }
  })

  // Test para provocar un error interno del servidor
  it('should trigger a 500 when passed a malformed fields list', async () => {
    const malformedTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      fields: 'This should be an array, not a string'
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
        malformedTemplate,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(500)
      expect(error.response.data.message).toBe('Malformed fields list')
    }
  })

  // Test para crear una nueva plantilla con todos los campos correctos
  it('should create a new patient template correctly with all required fields', async () => {
    const testTemplate = {
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
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
        testTemplate,
        {
          headers
        }
      )
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

  // Test para fallar al crear una plantilla con campo CHOICE sin definir el atributo options
  it('should fail to create template with CHOICE field but not options attribute defined', async () => {
    const testTemplate = {
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
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
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

  // Test para crear una nueva plantilla sin Nombre
  it('should fail to create a patient template with field "Nombre" since its a reserved name', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      fields: [
        {
          name: 'Nombre',
          type: 'TEXT',
          required: true,
          description: 'Nombre del paciente'
        } // "Nombre" es un campo reservado
      ]
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
        testTemplate,
        {
          headers
        }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'The field "Nombre" is a reserved field name and cannot be used'
      )
    }
  })

  // Test para crear una nueva plantilla sin Apellido
  it('should fail to create a patient template with field "Apellidos" since its a reserved name', async () => {
    const testTemplate = {
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
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
        testTemplate,
        {
          headers
        }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'The field "Apellidos" is a reserved field name and cannot be used'
      )
    }
  })

  // Test que rechaza una plantilla con un nombre ya usado
  it('should fail when creating a patient template with an existing name', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: 'Plantilla2024', // Usamos un nombre que ya existe
      fields: [
        {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del paciente'
        }
      ]
    }

    // Primero crear la plantilla con este nombre
    await axios.post(`${BASE_URL}/doctor/PatientTemplate`, testTemplate, {
      headers
    })

    // Intentar crear otra plantilla con el mismo nombre
    try {
      const response = await axios.post(
        `${BASE_URL}/doctor/PatientTemplate`,
        testTemplate,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'Template with this name already exists'
      )
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
