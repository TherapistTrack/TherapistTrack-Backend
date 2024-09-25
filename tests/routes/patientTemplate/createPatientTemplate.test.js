const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const { createTestDoctor, deleteUser } = require('../../testHelpers')

let userId, doctorId, headers

describe('Create Patient Template Tests', () => {
  beforeAll(async () => {
    const doctor = await createTestDoctor()
    userId = doctor.id
    doctorId = doctor.rolDependentInfo.id
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
      Origin: 'http://localhost'
    }
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

  // DONE:
  it('should fail with 400 to create a patient template without the doctorId', async () => {
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
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing doctorId')
    }
  })

  // DONE:
  it('should fail with 404 to create a patient template with a non-existent doctorId', async () => {
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
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe('Doctor not found')
    }
  })

  // DONE:
  it('should trigger a 400 when passed a malformed fields list', async () => {
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
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Malformed fields list')
    }
  })

  // DONE:
  it('should fail with 400  with CHOICE field but not options attribute defined', async () => {
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
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Malformed CHOICE field')
    }
  })

  // DONE:
  it('should fail with 400 with field "Nombres" since its a reserved name', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      fields: [
        {
          name: 'Nombres',
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
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'The field "Nombre" is a reserved field name and cannot be used'
      )
    }
  })

  // DONE:
  it('should fail with 400 with field "Apellidos" since its a reserved name', async () => {
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
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'The field "Apellidos" is a reserved field name and cannot be used'
      )
    }
  })

  // DONE:
  it('should fail with 409 when creating a patient template with an existing name', async () => {
    const testTemplate = {
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
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(409)
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
