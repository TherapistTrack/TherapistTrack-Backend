const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const COMMON_MSG = require('../../../utils/errorMsg')
const {
  setUpEnvironmentForFilesTests,
  checkFailRequest,
  generateObjectId,
  createTestFile
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
      }
    ]
  }

  async function checkFailGetRequest(params, expectedCode, expectedMsg) {
    return checkFailRequest(
      'get',
      REQUEST_URL,
      HEADERS,
      params,
      {},
      expectedCode,
      expectedMsg
    )
  }

  beforeAll(async () => {
    secondDoctor = createTestDoctor()
    ;({ doctor, patientTemplateId, recordId, fileTemplateId } =
      await setUpEnvironmentForFilesTests(
        ['consultas', 'tests'],
        'template_test',
        [
          {
            name: 'Notas adicionales',
            type: 'TEXT',
            required: true
          }
        ]
      ))
    BASE_FILE.doctorId = doctor.roleDependentInfo.id
    BASE_FILE.recordId = recordId
    BASE_FILE.templateId = fileTemplateId
    fileId = createTestFile(BASE_FILE)
    BASE_FILE.fileId = fileId
  })
  afterAll(async () => {
    await deleteUser(doctor.id)
  })

  // DONE:
  test('should fail with 400 if doctorId is not sent', async () => {
    await checkFailGetRequest({ fileId }, 400, COMMON_MSG.MISSING_FIELDS)
  })

  // DONE:
  test('should fail with 400 if fileId is not sent', async () => {
    await checkFailGetRequest(
      { doctorId: doctor.roleDependentInfo.id },
      400,
      COMMON_MSG.MISSING_FIELDS
    )
  })

  // DONE:
  test('should fail with 403 if doctor is not the owner of the file', async () => {
    await checkFailGetRequest(
      {
        fileId,
        doctorId: secondDoctor.roleDependentInfo.id
      },
      403,
      COMMON_MSG.DOCTOR_IS_NOT_OWNER
    )
  })

  // DONE:
  test('should fail with 404 if doctorId is from a non-existent/disable user', async () => {
    const nonExistentDoctorId = generateObjectId()

    await checkFailGetRequest(
      {
        fileId,
        doctorId: nonExistentDoctorId
      },
      404,
      COMMON_MSG.DOCTOR_NOT_FOUND
    )
  })

  // DONE:
  test('should fail with 404 if fileId is from a non-existent file', async () => {
    const nonExistentRecordId = generateObjectId()

    await checkFailGetRequest(
      {
        fileId: nonExistentRecordId,
        doctorId: doctor.roleDependentInfo.id
      },
      404,
      COMMON_MSG.FILE_NOT_FOUND
    )
  })
})
