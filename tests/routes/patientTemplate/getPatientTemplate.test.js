const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const { createTestDoctor, deleteUser } = require('../../testHelpers')

let doctorId
let templateId
let headers

beforeAll(async () => {
  const doctor = await createTestDoctor()
  doctorId = doctor.id
  headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  // Crear una plantilla de paciente para usarla en los tests
  const response = await axios.post(
    `${BASE_URL}/templates/create`,
    {
      doctorId: doctorId,
      name: `testTemplate_${Date.now()}`,
      patientTemplate: {
        record: '12345',
        names: 'Plantilla-2024',
        fields: [
          { name: 'Nombres', type: 'SHORT_TEXT', required: true },
          { name: 'Apellidos', type: 'SHORT_TEXT', required: true },
          { name: 'Edad', type: 'NUMBER', required: true }
        ]
      }
    },
    { headers }
  )
  templateId = response.data.data.patientTemplateId
})

afterAll(async () => {
  await deleteUser(doctorId)
})

describe('', () => {
  // Test para obtener una plantilla por su ID correctamente
  test('should success with 200 retrieve a patient template by its ID', async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/doctor/PatientTemplate?templateId=${templateId}`,
        { headers }
      )

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('doctor', doctorId)
      expect(response.data).toHaveProperty('lastUpdated') // Se asegura de que el campo "lastUpdated" esté presente
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
    } catch (error) {
      console.error(
        'Error retrieving template by ID:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })
  
  test('should fail with 400 if "doctorId" is not provided', async () => {
    
  })

  test('should fail with 400 if "templateId" is not provided', async () => {
    
  })

  test('should fail with 403 if "doctorId" exist but is not the owner of the template', async () => {
    
  })

  test('should fail with 404 if "doctorId" does not correspond to an existent/active doctor', async () => {
    
  })

  test('should fail with 404 if "template" does not correspond to an existent template', async () => {
    
  })

  // Test para obtener una plantilla por su ID inexistente
  test('should fail with 404 when trying to retrieve a non-existent template', async () => {
    const nonExistentTemplateId = '11s1s1a1w1' // ID no válido

    try {
      await axios.get(
        `${BASE_URL}/doctor/PatientTemplate?templateId=${nonExistentTemplateId}`,
        { headers }
      )
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe(
        'No se pudo encontrar la plantilla solicitada'
      )
    }
  })

})
