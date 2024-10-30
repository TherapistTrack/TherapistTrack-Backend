const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const COMMON_MSG = require('../../../utils/errorMsg')

const {
  deleteUser,
  checkFailRequest,
  setUpEnvironmentForFilesTests,
  createTestFile,
  createTestDoctor,
  generateObjectId
} = require('../../testHelpers')

describe('Delete Files Tests', () => {
  let doctor, secondDoctor, recordId, fileTemplateId, fileId

  const REQUEST_URL = `${BASE_URL}/files/`

  const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
    Origin: 'http://localhost'
  }

  const BASE_FILE = {
    doctorId: '', // Will be filled on the beforaAll()
    recordId: '',
    templateId: '',
    name: 'test_file',
    category: 'consultas',
    fields: [
      {
        name: 'Notas adicionales',
        value: 'nota 1'
      },
      {
        name: 'Instrucciones de administracion',
        value: 'tomar oralmente'
      },
      {
        name: 'Dosis (mg)',
        value: 32
      },
      {
        name: 'Concentracion',
        value: 3.0
      },
      {
        name: 'Forma de dosis',
        value: 'Oral'
      },
      {
        name: 'Fecha de preescripcion',
        value: '2024-11-13T14:30:00Z'
      }
    ]
  }

  async function checkFailDeleteRequest(body, expectedCode, expectedMsg) {
    return checkFailRequest(
      'delete',
      REQUEST_URL,
      HEADERS,
      {},
      body,
      expectedCode,
      expectedMsg
    )
  }

  beforeAll(async () => {
    secondDoctor = createTestDoctor()
    ;({ doctor, recordId, fileTemplateId } =
      await setUpEnvironmentForFilesTests(
        ['consultas', 'tests'],
        'template_test',
        [
          {
            name: 'Notas adicionales',
            type: 'TEXT',
            required: true
          },
          {
            name: 'Instrucciones de administracion',
            type: 'SHORT_TEXT',
            required: true
          },
          {
            name: 'Dosis (mg)',
            type: 'NUMBER',
            required: true
          },
          {
            name: 'Concentracion',
            type: 'FLOAT',
            required: true
          },
          {
            name: 'Forma de dosis',
            type: 'CHOICE',
            options: ['Oral', 'Capsula'],
            required: true
          },
          {
            name: 'Fecha de preescripcion',
            type: 'DATE',
            required: true
          }
        ]
      ))
    BASE_FILE.doctorId = doctor.roleDependentInfo.id
    BASE_FILE.recordId = recordId
    BASE_FILE.templateId = fileTemplateId

    fileId = createTestFile(BASE_FILE)
  })

  afterAll(async () => {
    await deleteUser(doctor.id)
  })

  // DONE:
  test('should succeed with 200 deleting a record', async () => {
    const deleteBody = {
      fileId: fileId,
      doctorId: doctor.roleDependentInfo.id
    }

    try {
      const response = await axios.delete(REQUEST_URL, {
        headers: HEADERS,
        data: deleteBody
      })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe(COMMON_MSG.REQUEST_SUCCESS)
    } catch (error) {
      console.error(
        'Error deleting file:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  })

  // DONE:
  test('should fail with 400 if fileId is not passed', async () => {
    await checkFailDeleteRequest(
      {
        doctorId: doctor.roleDependentInfo.id
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  test('should fail with 400 if doctorId is not passed', async () => {
    await checkFailDeleteRequest(
      {
        fileId: fileId
      },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  test('should fail with 403 if doctor is not owner of file', async () => {
    await checkFailDeleteRequest(
      {
        fileId: fileId,
        doctorId: secondDoctor.roleDependentInfo.id
      },
      403,
      COMMON_MSG.DOCTOR_IS_NOT_OWNER
    )
  })

  // DONE:
  test('should fail with 404 if doctorId is from a non-existent/active user', async () => {
    await checkFailDeleteRequest(
      {
        fileId: fileId,
        doctorId: generateObjectId()
      },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // DONE:
  test('should fail with 404 if fileId is from a non-existent file', async () => {
    await checkFailDeleteRequest(
      {
        doctor: doctor.roleDependentInfo.id,
        doctorId: generateObjectId()
      },
      404,
      COMMON_MSG.RECORD_NOT_FOUND
    )
  })
})
