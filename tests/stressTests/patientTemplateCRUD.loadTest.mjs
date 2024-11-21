import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js'
import { Httpx } from 'https://jslib.k6.io/httpx/0.1.0/index.js'
import {
  generateUserData,
  generatePatientTemplateData,
  generateRandomString
} from './loadTestHelpers.js'

export const options = {
  stages: [
    { duration: '2m', target: 10 }, // ramp up to 10 users
    { duration: '5m', target: 10 }, // stay at 10 users for 5 minutes
    { duration: '2m', target: 0 } // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_duration{staticAsset:yes}': ['p(99)<250'],
    http_req_failed: ['rate<0.01'] // HTTP errors should be less than 1%
  }
}

const BASE_URL = 'http://localhost:3001'
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer YOUR_AUTH_TOKEN`,
  Origin: 'http://localhost'
}

const session = new Httpx({ baseURL: BASE_URL, headers: HEADERS })

export function setup() {
  let doctorRoleId = null

  describe('Doctor to assing patient templates', () => {
    const registerResponse = session.post(
      `/users/register`,
      JSON.stringify(generateUserData('Doctor'))
    )

    expect(registerResponse.status, 'User registration status').to.equal(201)
    expect(registerResponse, 'User registration valid json response').to.have.validJsonBody()

    doctorRoleId = registerResponse.json('roleId')
    expect(doctorRoleId, 'Doctor role ID').to.be.a('string')
  })

  return doctorRoleId
}

export default function (doctorRoleId) {
  describe('01. Create new patient template', () => {
    const templateData = generatePatientTemplateData(doctorRoleId)

    const createTemplateResponse = session.post(
      '/doctor/PatientTemplate', JSON.stringify(templateData)
    )

    expect(createTemplateResponse.status, 'Create template status').to.equal(201)
    expect(createTemplateResponse,'Create template valid JSON response').to.have.validJsonBody()

    session.newPatientTemplateId = createTemplateResponse.json('data.patientTemplateId')
    expect(session.newPatientTemplateId, 'New template ID').to.be.a('string')
  })

  describe('02. Get patient template by ID', () => {
    session.addTag('name', 'UserItemURL')

    const url = `/doctor/PatientTemplate?templateId=${session.newPatientTemplateId}&doctorId=${doctorRoleId}`
    const fetchResponse = session.get(url)
    
    expect(fetchResponse.status, 'Get template status').to.equal(200)
    expect(fetchResponse,'Get template valid JSON response').to.have.validJsonBody()
    session.fetchedTemplate = fetchResponse.json('data')
  })

  describe('03. Rename patient template by ID', () => {
    session.clearTag('name')
    const payload = { 
      templateId: session.newPatientTemplateId, 
      name: generateRandomString(10),
      doctorId: doctorRoleId 
    }

    const updateResponse = session.patch('/doctor/PatientTemplate', JSON.stringify(payload))
    
    expect(updateResponse.status, 'Get template status').to.equal(200)
    expect(updateResponse,'Get template valid JSON response').to.have.validJsonBody()
  })

  describe('04. Delete patient template by ID', () => {
    const payload = { templateId: session.newPatientTemplateId, doctorId: doctorRoleId }
    const deleteResponse = session.delete('/doctor/PatientTemplate', JSON.stringify(payload))

    expect(deleteResponse.status, 'Delete template status').to.equal(200)
    expect(deleteResponse,'Delete template valid JSON response').to.have.validJsonBody()
  })
}
