const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const COMMON_MSG = require('../../../utils/errorMsg')

const {
  deleteUser,
  checkFailRequest,
  modifyObjectAttribute,
  modifyObjectArray,
  deleteObjectAttribute,
  setUpEnvironmentForFilesTests,
  generateObjectId
} = require('../../testHelpers')

describe('Create Files Tests', () => {
  let doctor, patientTemplateId, recordId, fileTemplateId

  const REQUEST_URL = `${BASE_URL}/files/`

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

  async function checkFailCreateRequest(body, expectedCode, expectedMsg) {
    const form = new FormData()

    // Append the metadata first.
    form.append('metadata', JSON.stringify(body))

    // Append a test PDF file.
    const filePath = path.join(__dirname, 'testFile.pdf')
    const fileName = 'testFile.pdf'
    form.append('file', fs.createReadStream(filePath), { fileName: fileName })

    return checkFailRequest(
      'post',
      REQUEST_URL,
      {
        ...form.getHeaders(),
        Authorization: `Bearer ${getAuthToken()}`,
        Origin: 'http://localhost'
      },
      {},
      form,
      expectedCode,
      expectedMsg
    )
  }

  beforeAll(async () => {
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
  })

  afterAll(async () => {
    await deleteUser(doctor.id)
  })

  function modifyFileAttribute(attributePath, newValue) {
    return modifyObjectAttribute(BASE_FILE, attributePath, newValue)
  }

  function modifyFileField(fieldName, newValue) {
    return modifyObjectArray(BASE_FILE, `fields`, (field) => {
      if (field.name === fieldName) field.value = newValue
      return field
    })
  }

  function deleteFileAttribute(attributePath) {
    return deleteObjectAttribute(BASE_FILE, attributePath)
  }

  // TODO:
  test('should succed with 200 creating a file', async () => {})

  // TODO:
  test('should fail with 400 if doctorId not passed', async () => {
    const file = deleteFileAttribute('doctorId')
    await checkFailCreateRequest(file, 400, COMMON_MSG.MISSING_FIELDS)
  })

  // TODO:
  test('should fail with 400 if templateId not passed', async () => {
    const file = deleteFileAttribute('templateId')
    await checkFailCreateRequest(file, 400, COMMON_MSG.MISSING_FIELDS)
  })
  // TODO:
  test('should fail with 400 if recordId not passed', async () => {
    const file = deleteFileAttribute('recordId')
    await checkFailCreateRequest(file, 400, COMMON_MSG.MISSING_FIELDS)
  })
  // TODO:
  test('should fail with 400 if file name is not passed', async () => {
    const file = deleteFileAttribute('recordId')
    await checkFailCreateRequest(file, 400, COMMON_MSG.MISSING_FIELDS)
  })
  // TODO:
  test('should fail with 400 if category is not passed', async () => {
    const file = deleteFileAttribute('category')
    await checkFailCreateRequest(file, 400, COMMON_MSG.MISSING_FIELDS)
  })
  // TODO:
  test('should fail with 400 if fields are not passed', async () => {
    const file = deleteFileAttribute('fields')
    await checkFailCreateRequest(file, 400, COMMON_MSG.MISSING_FIELDS)
  })
  // TODO:
  test('should fail with 404 if doctor is from a not active/existent doctor', async () => {
    const file = modifyFileAttribute('doctorId', generateObjectId())
    await checkFailCreateRequest(file, 404, COMMON_MSG.DOCTOR_NOT_FOUND)
  })
  // TODO:
  test('should fail with 404 if file template with given id do not exist', async () => {})
  // TODO:
  test('should fail with 404 if record with given id do not exist', async () => {})

  // TODO:
  test('should with 404 if not all field defined by the template are not sent', async () => {})

  // TODO:
  test('should fail with 405 when passing a category that is not defined by the template', async () => {
    const record = modifyFileField('Notas adicionales', 123)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_TEXT
    )
  })

  // ==================
  // === TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER value for TEXT field', async () => {
    const record = modifyFileField('Notas adicionales', 123)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_TEXT
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for TEXT field', async () => {
    const record = modifyFileField('Notas adicionales', true)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_TEXT
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for TEXT field', async () => {
    const record = modifyFileField('Notas adicionales', [])
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_TEXT
    )
  })

  // ==================
  // === SHORT_TEXT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER value for SHORT_TEXT field', async () => {
    const record = modifyFileField('Instrucciones de administracion', 123)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for SHORT_TEXT field', async () => {
    const record = modifyFileField('Instrucciones de administracion', true)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for SHORT_TEXT field', async () => {
    const record = modifyFileField('Instrucciones de administracion', [])
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_SHORT_TEXT
    )
  })

  // ==================
  // === NUMBER ===
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for NUMBER field', async () => {
    const record = modifyFileField('Dosis (mg)', '321')
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for NUMBER field', async () => {
    const record = modifyFileField('Dosis (mg)', false)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for NUMBER field', async () => {
    const record = modifyFileField('Dosis (mg)', [])
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
    )
  })

  // TODO:
  test('should fail with 405 when passing FLOAT value for NUMBER field', async () => {
    const record = modifyFileField('Dosis (mg)', 32.3)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_NUMBER
    )
  })

  // ==================
  // === FLOAT ===
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for FLOAT field', async () => {
    const record = modifyFileField('Concentracion', '32.2')
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_FLOAT
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for FLOAT field', async () => {
    const record = modifyFileField('Concentracion', true)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_FLOAT
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for FLOAT field', async () => {
    const record = modifyFileField('Concentracion', [])
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_FLOAT
    )
  })

  // ==================
  // === CHOICE =======
  // ==================
  // TODO:
  test('should fail with 405 when passing NUMBER values to CHOICE', async () => {
    const record = modifyFileField('Forma de dosis', 32)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN values to CHOICE', async () => {
    const record = modifyFileField('Forma de dosis', true)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
    )
  })

  // TODO:
  test('should fail with 405 when passing VALUE that is not within CHOICE value', async () => {
    const record = modifyFileField('Forma de dosis', 'Camello')
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_VALUE_CHOICE
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for CHOICE field', async () => {
    const record = modifyFileField('Forma de dosis', [])
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_CHOICE
    )
  })

  // ==================
  // === DATE =======
  // ==================
  // TODO:
  test('should fail with 405 when passing TEXT value for DATE field', async () => {
    const record = modifyFileField('Fecha de preescripcion', 'aloha')
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })

  // TODO:
  test('should fail with 405 when passing BOOLEAN value for DATE field', async () => {
    const record = modifyFileField('Fecha de preescripcion', true)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })

  // TODO:
  test('should fail with 405 when passing NUMBER value for DATE field', async () => {
    const record = modifyFileField('Fecha de preescripcion', 32)
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })

  // TODO:
  test('should fail with 405 when passing ARRAY value for DATE field', async () => {
    const record = modifyFileField('Fecha de preescripcion', [])
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })

  // TODO:
  test('should fail with 405 when passing date not in ISO8601 format for DATE field', async () => {
    const record = modifyFileField('Fecha de preescripcion', '23/3/2024')
    await checkFailCreateRequest(
      record,
      405,
      COMMON_MSG.INVALID_FIELD_TYPE_DATE
    )
  })
})
