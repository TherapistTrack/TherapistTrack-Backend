const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../../jest.setup')
const { createTestDoctor, deleteUser } = require('../../../testHelpers')

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

describe('Delete Field from Patient Template Tests', () => {
  // Test para eliminar correctamente un campo existente
  it('should successfully delete an existing field from the patient template', async () => {
    const fieldToDelete = {
      templateId: templateId,
      fieldName: 'Apellidos'
    }

    try {
      const response = await axios.delete(`${BASE_URL}/templates/deleteField`, {
        data: fieldToDelete,
        headers
      })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Campo eliminado correctamente')
    } catch (error) {
      console.error(
        'Error deleting field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // Test para eliminar un campo inexistente (debe retornar un error)
  it('should return an error when trying to delete a non-existent field', async () => {
    const nonExistentFieldToDelete = {
      templateId: templateId,
      fieldName: 'NoExiste'
    }

    try {
      await axios.delete(`${BASE_URL}/templates/deleteField`, {
        data: nonExistentFieldToDelete,
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe('Campo no encontrado')
    }
  })

  // Test para intentar eliminar un campo sin proporcionar el templateID (debe retornar un error)
  it('should fail to delete a field without templateID', async () => {
    const fieldToDelete = {
      fieldName: 'Edad' // Omitimos templateId para provocar el error
    }

    try {
      await axios.delete(`${BASE_URL}/templates/deleteField`, {
        data: fieldToDelete,
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'Bad Request: Missing or invalid fields in the request body'
      )
    }
  })

  // Test para intentar eliminar un campo sin doctorId
  it('should fail to delete a field without doctorId', async () => {
    const fieldToDelete = {
      fieldId: '60d5ec49d8a0c540d8d6d8b9' // Falta el doctorId
    }

    try {
      await axios.delete(`${BASE_URL}/doctor/PatientTemplate/fields`, {
        data: fieldToDelete,
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'Bad Request: Missing or invalid fields in the request body'
      )
    }
  })

  // Test para asegurar que no se elimine un campo si el doctorId no coincide
  it('should not allow deleting a field if the doctorId does not match', async () => {
    const fieldToDelete = {
      doctorId: 'incorrectDoctorId', // ID incorrecto
      fieldId: '60d5ec49d8a0c540d8d6d8b9'
    }

    try {
      await axios.delete(`${BASE_URL}/doctor/PatientTemplate/fields`, {
        data: fieldToDelete,
        headers
      })
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe(
        'Doctor not found or specified field not found in patient template'
      )
    }
  })

  // Test para eliminar un campo de una plantilla (con validación del doctorId y fieldId)
  it('should successfully delete a patient template field with doctorId and fieldId', async () => {
    const fieldToDelete = {
      doctorId: doctorId,
      fieldId: '60d5ec49d8a0c540d8d6d8b9'
    }

    try {
      const response = await axios.delete(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        { data: fieldToDelete, headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe(
        'Patient template field deleted successfully'
      )
      expect(response.data.data.doctorId).toBe(doctorId)
      expect(response.data.data.fieldId).toBe('60d5ec49d8a0c540d8d6d8b9')
    } catch (error) {
      console.error(
        'Error deleting field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })
})
