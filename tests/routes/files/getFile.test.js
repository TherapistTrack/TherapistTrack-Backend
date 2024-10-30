const axios = require('axios')
const { BASE_URL, getAuthToken } = require('./jest.setup')
const yup = require('yup')
const { response } = require('express')
const COMMON_MSG = require('../../../utils/')
const {
  setUpEnvironmentForFilesTests,
  checkFailRequest,
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
    BASE_FILE.fileId = fileId
  })
  afterAll(async () => {
    await deleteUser(doctor.id)
  })

  // TODO:
  test('Should fail with 400 if fileId is not send', async () => {})

  // TODO:
  test('Should fail with 400 if doctorId is not send', async () => {})

  // TODO:
  test('Should fail with 403 if doctor is not the owner of the file ', async () => {})
  // TODO:
  test('Should fail with 404 if doctorId is from a invalid/inexistent doctor', async () => {})

  // TODO:
  test('Should fail with 404 if file with given id do not exist', async () => {})
})
