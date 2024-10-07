const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../../jest.setup')
const {
  createTestDoctor,
  deleteUser,
  createTestFileTemplate,
  checkFailRequest
} = require('../../../testHelpers')
const COMMON_MSG = require('../../../../utils/errorMsg')

describe('Edit Field from Patient Template Tests', () => {
  let doctor, secondDoctor, templateId

  const REQUEST_URL = `${BASE_URL}/doctor/FileTemplate/fields`

  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  async function checkFailEditRequest(body, expectedCode, expectedMsg) {
    await checkFailRequest(
      'put',
      REQUEST_URL,
      HEADERS,
      {},
      body,
      expectedCode,
      expectedMsg
    )
  }

  beforeAll(async () => {
    doctor = await createTestDoctor()
    secondDoctor = await createTestDoctor()

    templateId = await createTestFileTemplate(
      doctor.roleDependentInfo.id,
      `testTemplate_${Date.now()}`,
      [
        {
          name: 'Resumen',
          type: 'TEXT',
          required: true,
          description: ''
        },
        {
          name: 'Avance',
          type: 'CHOICE',
          options: ['Positivo', 'Neutro', 'Negativo'],
          required: true,
          description: 'Estado civil del archivo'
        }
      ]
    )
  })

  afterAll(async () => {
    await deleteUser(doctor.id)
    await deleteUser(secondDoctor.id)
  })

  // DONE:
  test('should fail with 400 to edit a field without templateID', async () => {
    checkFailEditRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        oldFieldName: 'Edad',
        fieldData: {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del archivo'
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  test('should fail with 400 to edit a field without doctorId', async () => {
    checkFailEditRequest(
      {
        templateId: doctor.roleDependentInfo.id,
        oldFieldName: 'Edad',
        fieldData: {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del archivo'
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  test('should fail with 400 to edit a field without oldFieldName', async () => {
    checkFailEditRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        templateId: templateId,
        fieldData: {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del archivo'
        }
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  test('should fail with 403 if doctor is not template owner', async () => {
    checkFailEditRequest(
      {
        doctorId: secondDoctor.roleDependentInfo.id,
        templateId: templateId,
        oldFieldName: 'Edad',
        fieldData: {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del archivo'
        }
      },
      403,
      COMMON_MSG.DOCTOR_IS_NOT_OWNER
    )
  })

  // DONE:
  test('should fail with 404 if doctorid is from a not existent/valid user', async () => {
    checkFailEditRequest(
      {
        doctorId: 'notExistentDoctor',
        templateId: templateId,
        oldFieldName: 'Edad',
        fieldData: {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del archivo'
        }
      },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // DONE:
  test('should fail with 404 if templateid is from a not existent/valid template', async () => {
    checkFailEditRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        templateId: 'notExistentTemplate',
        oldFieldName: 'Edad',
        fieldData: {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del archivo'
        }
      },
      404,
      COMMON_MSG.TEMPLATE_NOT_FOUND
    )
  })

  // DONE:
  test('should fail with 404 if oldfieldName is from a not existent/valid field', async () => {
    checkFailEditRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        templateId: templateId,
        oldFieldName: 'notExistentField',
        fieldData: {
          name: 'Edad',
          type: 'NUMBER',
          required: true,
          description: 'Edad del archivo'
        }
      },
      404,
      COMMON_MSG.FIELD_NOT_FOUND
    )
  })

  // DONE:
  test('should fail with 406 to rename a field to a field that already has that name', async () => {
    checkFailEditRequest(
      {
        doctorId: doctor.roleDependentInfo.id,
        templateId: templateId,
        oldFieldName: 'Edad',
        fieldData: {
          name: 'Estado Civil',
          options: [],
          required: true,
          description: 'Apellido del archivo'
        }
      },
      406,
      COMMON_MSG.RECORDS_USING
    )
  })

  // TODO: test edit property that is already atached to real records.
  //
  // DONE:
  test('should edit with 200 the name of an existing field in a file template', async () => {
    const fieldToEdit = {
      doctorId: doctor.roleDependentInfo.id,
      templateId: templateId,
      oldFieldName: 'Edad',
      fieldData: {
        name: 'Edad Actualizada',
        type: 'NUMBER',
        required: true,
        description: 'Edad actualizada del archivo'
      }
    }

    try {
      const response = await axios.put(REQUEST_URL, {
        data: fieldToEdit,
        headers: HEADERS
      })
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
      doctorId: doctor.roleDependentInfo.id,
      templateID: templateId,
      oldFieldName: 'Edad Actualizada',
      fieldData: {
        name: 'Edad Actualizada',
        type: 'NUMBER',
        required: false, // Cambiar "Edad" a no obligatorio
        description: 'Edad no obligatoria del archivo'
      }
    }

    try {
      const response = await axios.put(REQUEST_URL, {
        data: fieldToEdit,
        headers: HEADERS
      })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe(COMMON_MSG.REQUEST_SUCCESS)
    } catch (error) {
      console.error(
        'Error editing field:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })
})
