const axios = require('axios')
const { BASE_URL } = require('../jest.setup')
let doctorId
let templateId

describe('Plantillas de Paciente - Tests de Integración', () => {
  // Configuración global antes de todos los tests
  beforeAll(async () => {
    const newDoctor = {
      username: `doctor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      password: 'testpassword',
      name: 'Doctor01',
      lastName: 'Test',
      phones: ['12345678'],
      rol: 'doctor',
      mails: ['doctor@example.com'],
      collegiateNumber: '12345',
      specialty: 'General',
      startDate: new Date(),
      endDate: new Date(),
      DPI: '123456789'
    }

    try {
      const response = await axios.post(`${BASE_URL}/users/register`, newDoctor)
      console.log('Full Response:', response.data) // Aquí verificas toda la estructura de la respuesta
      doctorId = response.data.data?._id // Usar el operador opcional para evitar errores de undefined
      console.log('Doctor ID:', doctorId) // Aquí imprimes el ID para verificar que se obtuvo correctamente
      expect(response.status).toBe(201)
    } catch (error) {
      console.error(
        'Error creating doctor:',
        error.response ? error.response.data : error.message
      )
      throw error // Re-lanzar el error para que los tests no continúen
    }
  })

  // Limpiar después de todos los tests
  afterAll(async () => {
    if (doctorId) {
      try {
        // Eliminar el doctor después de los tests solo si fue creado correctamente
        const response = await axios.delete(`${BASE_URL}/users/delete`, {
          data: { id: doctorId }
        })
        expect(response.status).toBe(200)
      } catch (error) {
        console.error(
          'Error deleting doctor:',
          error.response ? error.response.data : error.message
        )
      }
    }
  })

  // Test para crear una nueva plantilla de paciente
  it('should create a new patient template', async () => {
    const testTemplate = {
      doctorId: doctorId, // Usar el doctorId obtenido en el beforeAll
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
        testTemplate
      )
      expect(response.status).toBe(200)
      templateId = response.data.data.patientTemplateId
      console.log('Template ID:', templateId)
    } catch (error) {
      console.error(
        'Error creating template:',
        error.response ? error.response.data : error.message
      )
      throw error // Re-lanzar el error para que los tests no continúen
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
