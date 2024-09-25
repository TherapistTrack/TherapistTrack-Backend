const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../../jest.setup')
const { createTestDoctor, deleteUser } = require('../../../testHelpers')

describe('Delete Field from Patient Template Tests', () => {
  let doctorId
  let secondDoctorId
  let templateID
  let headers

  beforeAll(async () => {
    const doctor = await createTestDoctor()
    const secondDoctor = await createTestDoctor()
    doctorId = doctor.id
    secondDoctorId = secondDoctor.id
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
      Origin: 'http://localhost'
    }

    // Crear una plantilla de paciente para usarla en los tests
    const response = await axios.post(
      `${BASE_URL}/doctor/PatientTemplate`,
      {
        doctorId: doctorId,
        name: `testTemplate_${Date.now()}`,
        fields: [{ name: 'Edad', type: 'NUMBER', required: true }]
      },
      { headers }
    )
    templateID = response.data.data.patientTemplateID
  })

  afterAll(async () => {
    await deleteUser(doctorId)
  })

  // DONE:
  it('should suceed with 200 delete an existing field from the patient template', async () => {
    const fieldToDelete = {
      doctorId: doctorId,
      templateID: templateID,
      name: 'Edad'
    }

    try {
      const response = await axios.delete(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        {
          data: fieldToDelete,
          headers
        }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Field successfully deleted')
    } catch (error) {
      console.error(
        'Error deleting field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // DONE:
  it('should fail with 400 to delete a field without templateID', async () => {
    const fieldToDelete = {
      doctorId: doctorId,
      name: 'Edad' // Omitimos templateID para provocar el error
    }

    try {
      await axios.delete(`${BASE_URL}/doctor/PatientTemplate/fields`, {
        data: fieldToDelete,
        headers
      })
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'Missing or invalid fields in the request body'
      )
    }
  })

  // DONE:
  it('should fail with 400 to delete a field without doctorId', async () => {
    const fieldToDelete = {
      templateID: templateID,
      name: 'Edad'
    }

    try {
      await axios.delete(`${BASE_URL}/doctor/PatientTemplate/fields`, {
        data: fieldToDelete,
        headers
      })
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'Missing or invalid fields in the request body'
      )
    }
  })

  // DONE:
  it('should fail with 400 to delete a field without name', async () => {
    const fieldToDelete = {
      doctorId: doctorId,
      templateID: templateID
    }

    try {
      await axios.delete(`${BASE_URL}/doctor/PatientTemplate/fields`, {
        data: fieldToDelete,
        headers
      })
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe(
        'Missing or invalid fields in the request body'
      )
    }
  })

  // DONE:
  it('should fail with 403 if doctor is not owner of the template', async () => {
    const fieldToDelete = {
      doctorId: secondDoctorId, // ID incorrecto
      templateID: templateID,
      name: 'Edad'
    }

    try {
      await axios.delete(`${BASE_URL}/doctor/PatientTemplate/fields`, {
        data: fieldToDelete,
        headers
      })
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(403)
      expect(error.response.data.message).toBe(
        'Doctor is not the owner of template'
      )
    }
  })

  // DONE:
  it('should fail with 404 when doctorId is not valid/active', async () => {
    const nonExistentFieldToDelete = {
      doctorId: 'nonExistentDoctor',
      templateID: templateID,
      name: 'Edad'
    }

    try {
      await axios.delete(`${BASE_URL}/doctor/PatientTemplate/fields`, {
        data: nonExistentFieldToDelete,
        headers
      })
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe('doctorId not found')
    }
  })

  // DONE:
  it('should fail with 404 when templateID is not valid/existent', async () => {
    const nonExistentFieldToDelete = {
      doctorId: doctorId,
      templateID: 'nonExistentTemplate',
      name: 'Edad'
    }

    try {
      await axios.delete(`${BASE_URL}/doctor/PatientTemplate/fields`, {
        data: nonExistentFieldToDelete,
        headers
      })
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe('template not found')
    }
  })

  // DONE:
  it('should fail with 404 when "name" does not exist', async () => {
    const nonExistentFieldToDelete = {
      doctorId: doctorId,
      templateID: templateID,
      name: 'doesNotExist'
    }

    try {
      await axios.delete(`${BASE_URL}/doctor/PatientTemplate/fields`, {
        data: nonExistentFieldToDelete,
        headers
      })
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe('Field not found')
    }
  })
})
