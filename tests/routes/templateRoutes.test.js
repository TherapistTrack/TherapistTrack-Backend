const axios = require('axios');
const { BASE_URL } = require('../jest.setup');

describe('Plantillas de Paciente - Tests de Integración', () => {
  let testTemplateName = `testTemplate_${Date.now()}`;
  let doctorId = '60d5ec49d8a0c540d8d6d8b5';
  let testTemplate = {
    doctorId: doctorId,
    name: testTemplateName,
    patientTemplate: {
      record: '12345',
      names: 'John',
      lastNames: 'Doe',
      fields: [
        { name: 'Edad', type: 'NUMBER', required: true }
      ]
    }
  };

  it('should create a new patient template', async () => {
    const response = await axios.post(`${BASE_URL}/plantillas/create`, testTemplate);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.message).toBe('Plantilla de paciente creada exitosamente');
  });

  it('should fail to create a patient template with incomplete data', async () => {
    const response = await axios
      .post(`${BASE_URL}/plantillas/create`, { doctorId })
      .catch((err) => err.response);
    expect(response.status).toBe(400);
    expect(response.data.status).toBe('error');
    expect(response.data.message).toBe('Datos incompletos o inválidos');
  });

  it('should fail to create a patient template with incorrect data types', async () => {
    const response = await axios
      .post(`${BASE_URL}/plantillas/create`, {
        doctorId: doctorId,
        name: 12345, // Tipo incorrecto, debería ser un string
        patientTemplate: {
          record: '12345',
          names: 'John',
          lastNames: 'Doe',
          fields: [
            { name: 'Edad', type: 'NUMBER', required: true }
          ]
        }
      })
      .catch((err) => err.response);
    expect(response.status).toBe(400);
    expect(response.data.status).toBe('error');
    expect(response.data.message).toBe('Tipo de dato incorrecto');
  });

  it('should update the patient template', async () => {
    const updateData = { doctorId, name: testTemplateName, patientTemplate: { record: '67890' } };
    const response = await axios.put(`${BASE_URL}/plantillas/update`, updateData);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.message).toBe('Plantilla actualizada exitosamente');
  });

  it('should fail to update a non-existent template', async () => {
    const updateData = { doctorId, name: 'nonexistentTemplate', patientTemplate: { record: '67890' } };
    const response = await axios
      .put(`${BASE_URL}/plantillas/update`, updateData)
      .catch((err) => err.response);
    expect(response.status).toBe(404);
    expect(response.data.status).toBe('error');
    expect(response.data.message).toBe('Plantilla no encontrada o no se realizaron cambios');
  });

  it('should delete the patient template', async () => {
    const response = await axios.delete(`${BASE_URL}/plantillas/delete`, {
      data: { doctorId, name: testTemplateName }
    });
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.message).toBe('Plantilla de paciente eliminada exitosamente');
  });

  it('should fail to delete a non-existent template', async () => {
    const response = await axios
      .delete(`${BASE_URL}/plantillas/delete`, {
        data: { doctorId, name: 'nonexistentTemplate' }
      })
      .catch((err) => err.response);
    expect(response.status).toBe(404);
    expect(response.data.status).toBe('error');
    expect(response.data.message).toBe('Plantilla no encontrada o ya fue eliminada');
  });

  it('should handle database disconnection gracefully', async () => {
    // Simula la desconexión de la base de datos
    await axios.post(`${BASE_URL}/disconnect`);

    const response = await axios
      .post(`${BASE_URL}/plantillas/create`, testTemplate)
      .catch((err) => err.response);

    expect(response.status).toBe(500);
    expect(response.data.status).toBe('error');
    expect(response.data.message).toBe('Error interno del servidor: no se pudo conectar a la base de datos');
    
    // Reconecta la base de datos para siguientes pruebas
    await axios.post(`${BASE_URL}/reconnect`);
  });
});
