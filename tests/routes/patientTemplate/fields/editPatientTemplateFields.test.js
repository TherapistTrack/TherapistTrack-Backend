const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  createTestPatientTemplate
} = require('../../../testHelpers')

describe('Edit Field from Patient Template Tests', () => {
  let doctorId
  let secondDoctorId
  let templateID
  let headers

  beforeAll(async () => {
    const doctor = await createTestDoctor()
    const secondDoctor = await createTestDoctor()
    doctorId = doctor.id
    secondDoctorId = secondDoctor.id
    templateID = await createTestPatientTemplate(
      doctorId,
      `testTemplate_${Date.now()}`,
      [
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
    )

    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
      Origin: 'http://localhost'
    }
  })

  afterAll(async () => {
    await deleteUser(doctorId)
  })

  // DONE:
  test('should fail with 400 to edit a field without templateID', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad',
        type: 'NUMBER',
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing fields.')
    }
  })

  // DONE:
  test('should fail with 400 to edit a field without doctorId', async () => {
    const fieldToEdit = {
      templateID: templateID,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad',
        type: 'NUMBER',
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing fields.')
    }
  })

  // DONE:
  test('should fail with 400 to edit a field without oldFieldName', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateID,
      fieldData: {
        name: 'Edad',
        type: 'NUMBER',
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Missing fields.')
    }
  })

  // DONE:
  test('should fail with 403 if doctor is not template owner', async () => {
    const fieldToEdit = {
      doctorId: secondDoctorId,
      templateID: templateID,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad',
        type: 'NUMBER',
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Doctor is not template owner')
    }
  })

  // DONE:
  test('should fail with 404 if doctorid is from a not existent/valid user', async () => {
    const fieldToEdit = {
      doctorId: 'notExistentDoctor',
      templateID: templateID,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad',
        type: 'NUMBER',
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
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
  test('should fail with 404 if templateid is from a not existent/valid template', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: 'notExistentTemplate',
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad',
        type: 'NUMBER',
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(404)
      expect(error.response.data.message).toBe('Template not found')
    }
  })

  // DONE:
  test('should fail with 404 if templateid is from a not existent/valid fielname', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateID,
      oldFieldName: 'notExistentField',
      fieldData: {
        name: 'Edad',
        type: 'NUMBER',
        required: true,
        description: 'Edad del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
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
  // DONE:
  test("should fail with 406 to rename field to 'Nombres' since its a reserved name", async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateID,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Nombres',
        options: [],
        required: true,
        description: 'Nombre del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.message).toBe(
        "'Nombres' and 'Apellidos' are reserved names"
      )
    }
  })

  // DONE:
  test("should fail with 406 to rename field to 'Apellidos' since its a reserved name", async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateID,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Apellidos',
        options: [],
        required: true,
        description: 'Apellido del paciente'
      }
    }

    try {
      await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      if (response.status >= 200 && response.status < 300) {
        fail(
          `Expected a failure, but got response with status: ${response.status}`
        )
      }
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.message).toBe(
        "'Nombres' and 'Apellidos' are reserved names"
      )
    }
  })

  // TODO: test edit property that is already atached to real records.
  //
  // DONE:
  test('should edit with 200 the name of an existing field in a patient template', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateID,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad Actualizada',
        type: 'NUMBER',
        required: true,
        description: 'Edad actualizada del paciente'
      }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Field successfully edited')
    } catch (error) {
      console.error(
        'Error editing field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // DONE:
  test('should edit with 200 an existing field to change required status', async () => {
    const fieldToEdit = {
      doctorId: doctorId,
      templateID: templateID,
      oldFieldName: 'Edad Actualizada',
      fieldData: {
        name: 'Edad Actualizada',
        type: 'NUMBER',
        required: false, // Cambiar "Edad" a no obligatorio
        description: 'Edad no obligatoria del paciente'
      }
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/doctor/PatientTemplate/fields`,
        fieldToEdit,
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('Field successfully edited')
    } catch (error) {
      console.error(
        'Error editing field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })
})
