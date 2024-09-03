const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../jest.setup')
let doctorUser
let headers
let doctorId
let templateId

describe('Plantillas de Paciente - Tests de Integración', () => {
  // Configuración global antes de todos los tests

  // Generar IDs válidos de 24 caracteres
  const generateObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000)
      .toString(16)
      .padStart(8, '0')
    const randomPart = Math.random().toString(16).substr(2, 16).padEnd(16, '0')
    return timestamp + randomPart
  }

  beforeAll(async () => {
    const token = await getAuthToken()
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Origin: 'http://localhost'
    }

    doctorUser = {
      id: generateObjectId(),
      names: 'Test',
      lastNames: 'User',
      phones: ['12345678'],
      rol: 'Doctor',
      mails: ['test-doctor@example.com'],
      rolDependentInfo: {
        collegiateNumber: '12345',
        specialty: 'testSpecialty'
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/users/register`,
        doctorUser,
        {
          headers
        }
      )
      expect(response.status).toBe(201)
      doctorId = doctorUser.id
      console.log('Doctor ID:', doctorId)
    } catch (error) {
      console.error(
        'Error creating doctor:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Limpiar después de todos los tests
  afterAll(async () => {
    if (doctorId) {
      const response = await axios.delete(`${BASE_URL}/users/delete`, {
        data: { id: doctorId },
        headers
      })
      expect(response.status).toBe(200)
    }
  })

  // Test para crear una nueva plantilla de paciente
  it('should create a new patient template', async () => {
    const testTemplate = {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'John',
        lastNames: 'Doe',
        fields: [{ name: 'Edad', type: 'NUMBER', required: true }]
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
      expect(response.status).toBe(200)
      templateId = response.data.data.patientTemplateId
    } catch (error) {
      console.error(
        'Error creating template:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  /*
  // Test para renombrar una plantilla de paciente
  it('should rename a patient template', async () => {
    const response = await axios.patch(`${BASE_URL}/templates`, {
      doctorId: doctor._id,
      Id: templateId,
      newName: 'PlantillaRenovada2024',
    });
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('El nombre de la plantilla ha sido actualizado exitosamente');
  });

  // Test para eliminar una plantilla de paciente
  it('should delete the patient template', async () => {
    const response = await axios.delete(`${BASE_URL}/templates`, {
      data: { doctorId: doctor._id, Id: templateId },
    });
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Plantilla eliminada exitosamente');
  });

  // Test para manejar la desconexión de la base de datos (opcional)
  it('should handle database disconnection gracefully', async () => {
    // Simula la desconexión de la base de datos
    await axios.post(`${BASE_URL}/disconnect`);

    const response = await axios
      .post(`${BASE_URL}/templates/create`, {
        doctorId: doctor._id,
        name: `testTemplate_${Date.now()}`,
        patientTemplate: {
          record: '12345',
          names: 'John',
          lastNames: 'Doe',
          fields: [{ name: 'Edad', type: 'NUMBER', required: true }],
        },
      })
      .catch((err) => err.response);

    expect(response.status).toBe(500);
    expect(response.data.status).toBe('error');
    expect(response.data.message).toBe('Error interno del servidor: no se pudo conectar a la base de datos');

    // Reconecta la base de datos para siguientes pruebas
    await axios.post(`${BASE_URL}/reconnect`);
  });
  */
})
