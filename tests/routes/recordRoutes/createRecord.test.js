const axios = require('axios')
const { BASE_URL, getAuthToken } = require('../../jest.setup')
const { createTestDoctor, deleteUser } = require('../../testHelpers')

describe('POST and DELETE /records/ endpoint', () => {
  const baseUrl = BASE_URL + '/records'
  let doctorId
  const createdRecords = []
  let testrecordID
  const headers = {
    'Content-Type': 'application/json',
    Authorization: getAuthToken(),
    Origin: 'http://localhost'
  }
  const patientTemplate = {
    doctor: doctorId,
    name: 'testTemplate',
    fields: [
      {
        name: 'Nickname',
        type: 'SHORT_TEXT',
        value: 'jojo',
        required: true
      },
      {
        name: 'Address',
        type: '123 Maple Street, Apt 4B, Springfield, IL 62704, USA',
        value: 'single',
        required: true
      },
      {
        name: 'Age',
        type: 'NUMBER',
        value: 16,
        required: true
      },
      {
        name: 'Height',
        type: 'FLOAT',
        value: 1.84,
        required: true
      },
      {
        name: 'Birthday',
        type: 'DATE',
        value: '2024-09-21',
        required: true
      },
      {
        name: 'Civil Status',
        type: 'CHOICE',
        options: ['single', 'married', 'separate'],
        value: 'single'
      }
    ]
  }

  const idealRecord = {
    doctor: doctorId,
    template: '66b453a2601a8e9fb46d8885',
    patient: {
      names: 'Joe',
      lastNames: 'Doe',
      fields: [
        {
          name: 'Nickname',
          value: 'jojo'
        },
        {
          name: 'Address',
          value: '123 Maple Street, Apt 4B, Springfield, IL 62704, USA'
        },
        {
          name: 'Age',
          value: 16
        },
        {
          name: 'Height',
          value: 1.84
        },
        {
          name: 'Birthday',
          value: '2024-09-21'
        },
        {
          name: 'Civil Status',
          value: 'single'
        }
      ]
    }
  }

  beforeAll(async () => {
    let doctor = await createTestDoctor()
    // Create Template
    doctorId = doctor.id
  })

  afterAll(async () => {
    // Delete Template
    await deleteUser(doctorId)
  })

  it('should create a new record', async () => {
    try {
      const response = await axios.post(`${baseUrl}/`, idealRecord, { headers })
      expect(response.status).toBe(201)
      expect(response.data.message).toBe('Record created successfully')
      testrecordID = response.data.recordId
      createdRecords.push(testrecordID)
      console.log('Record ID:', testrecordID)
    } catch (error) {
      throw new Error(
        `Test failed:\nStatus: ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`
      )
    }
  })

  it('ERROR 406 when a required on the template field is not passed', async () => {
    const invalidRecordData = { ...idealRecord }
    invalidRecordData.patient.fields.shift()
    try {
      const response = await axios.post(`${baseUrl}/`, invalidRecordData, {
        headers
      })
      createdRecords.push(response.data.recordId)
      expect(response.status < 200 || response.status > 299).toBe(true) // Fail test if creation succeed
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.error).toContain(
        'Missing name or lastName attributes'
      )
    }
  })

  it('ERROR 406 when no Name or LastNames passed', async () => {
    const invalidRecordData = { ...idealRecord }
    delete invalidRecordData.patient.names
    delete invalidRecordData.patient.lastNames
    try {
      const response = await axios.post(`${baseUrl}/`, invalidRecordData, {
        headers
      })
      createdRecords.push(response.data.recordId)
      expect(response.status < 200 || response.status > 299).toBe(true) // Fail test if creation succeed
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.error).toContain(
        'Missing name or lastName attributes'
      )
    }
  })

  it('should return 406 when creating invalid TEXT field', async () => {
    const invalidRecordData = { ...idealRecord }
    invalidRecordData.patient.fields[0] = {
      name: 'Nickname',
      value: 314
    }

    try {
      const response = await axios.post(`${baseUrl}/`, invalidRecordData, {
        headers
      })
      createdRecords.push(response.data.recordId)
      expect(response.status < 200 || response.status > 299).toBe(true) // Fail test if creation succeed
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.error).toContain(
        'Invalid field value for Nickname'
      )
    }
  })

  it('should return 406 when creating invalid LARGE TEXT field', async () => {
    const invalidRecordData = { ...idealRecord }
    invalidRecordData.patient.fields[1] = {
      name: 'Address',
      value: 314
    }

    try {
      const response = await axios.post(`${baseUrl}/`, invalidRecordData, {
        headers
      })
      createdRecords.push(response.data.recordId)
      expect(response.status < 200 || response.status > 299).toBe(true) // Fail test if creation succeed
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.error).toContain(
        'Invalid field value for Address'
      )
    }
  })

  it('should return 406 when creating invalid NUMBER field', async () => {
    const invalidRecordData = { ...idealRecord }
    invalidRecordData.patient.fields[2] = {
      name: 'Age',
      value: '32'
    }

    try {
      const response = await axios.post(`${baseUrl}/`, invalidRecordData, {
        headers
      })
      createdRecords.push(response.data.recordId)
      expect(response.status < 200 || response.status > 299).toBe(true) // Fail test if creation succeed
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.error).toContain('Invalid field value for Age')
    }
  })

  it('should return 406 when creating invalid FLOAT field', async () => {
    const invalidRecordData = { ...idealRecord }
    invalidRecordData.patient.fields[3] = {
      name: 'Height',
      value: '3.32'
    }

    try {
      const response = await axios.post(`${baseUrl}/`, invalidRecordData, {
        headers
      })
      createdRecords.push(response.data.recordId)
      expect(response.status < 200 || response.status > 299).toBe(true) // Fail test if creation succeed
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.error).toContain(
        'Invalid field value for Height'
      )
    }
  })

  it('should return 406 when creating invalid DATE field', async () => {
    const invalidRecordData = { ...idealRecord }
    invalidRecordData.patient.fields[4] = {
      name: 'Height',
      value: '3213'
    }

    try {
      const response = await axios.post(`${baseUrl}/`, invalidRecordData, {
        headers
      })
      createdRecords.push(response.data.recordId)
      expect(response.status < 200 || response.status > 299).toBe(true) // Fail test if creation succeed
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.error).toContain(
        'Invalid field value for Birthday'
      )
    }
  })

  it('ERROR 406 when a field with invalid  CHOICE field', async () => {
    const invalidRecordData = { ...idealRecord }
    invalidRecordData.patient.fields[5] = {
      name: 'Civil Status',
      value: 'notExistentOption'
    }

    try {
      const response = await axios.post(`${baseUrl}/`, invalidRecordData, {
        headers
      })
      createdRecords.push(response.data.recordId)
      expect(response.status < 200 || response.status > 299).toBe(true) // Fail test if creation succeed
    } catch (error) {
      expect(error.response.status).toBe(406)
      expect(error.response.data.error).toContain('Choice is not an option')
    }
  })

  /*Este test sirve una vez tengamos la coleccion de dcotros y templates
  it('should return 400 when trying to create a record with invalid doctor or template ID', async () => {
    const invalidRecordData = {
      doctor: 'invalidDoctorId',
      template: 'invalidTemplateId',
      patient: 'Patient ID'
    }

    try {
      await axios.post(`${baseUrl}/`, invalidRecordData, { headers })
    } catch (error) {
      expect(error.response.status).toBe(400)
      expect(error.response.data.message).toBe('Invalid record or template ID')
    }
  })

  */
})
