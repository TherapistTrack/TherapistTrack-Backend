import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js'
import { Httpx } from 'https://jslib.k6.io/httpx/0.1.0/index.js'
import { generateObjectId } from './loadTestHelpers.js'

export const options = {
  vus: 5,
  duration: '20s',
  cloud: {
    projectID: 3719305,
    name: 'Load Test - User CRUD 02'
  }
}

const BASE_URL = 'http://localhost:3001'
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer YOUR_AUTH_TOKEN`,
  Origin: 'http://localhost'
}
const session = new Httpx({ baseURL: BASE_URL, headers: HEADERS })

function generateUserData(role) {
  const randomId = generateObjectId()
  return {
    id: randomId,
    names: `TestUser`,
    lastNames: 'User',
    phones: ['12345678'],
    rol: role,
    mails: [`test-${randomId}@example.com`],
    roleDependentInfo:
      role === 'Doctor'
        ? {
            collegiateNumber: '12345',
            specialty: 'testSpecialty'
          }
        : {
            startDate: '08/14/2024',
            endDate: '08/15/2024',
            DPI: '2340934'
          }
  }
}

export default function () {
  describe('01. Create new user', () => {
    session.user = generateUserData('Doctor')

    const resp = session.post(`/users/register`, JSON.stringify(session.user))

    expect(resp.status, 'User create status').to.equal(201)
    expect(resp, 'User create valid json response').to.have.validJsonBody()

    session.newUserId = resp.json('userId')
  })

  describe('02. Get user by ID', () => {
    session.addTag('name', 'UserItemURL')
    const resp = session.get(`/users/${session.newUserId}`)

    expect(resp.status, 'Get user status').to.equal(200)
    expect(resp, 'Get user valid json response').to.have.validJsonBody()
  })

  describe('03. Update user', () => {
    session.user = {
      ...session.user,
      names: 'Updated name'
    }
    session.clearTag('name')
    const resp = session.put(`/users/update`, JSON.stringify(session.user))

    expect(resp.status, 'Update user status').to.equal(200)
    expect(resp, 'Update user valid json response').to.have.validJsonBody()
  })

  describe('04. Delete user', () => {
    const resp = session.delete(
      `/users/delete`,
      JSON.stringify({ id: session.newUserId })
    )

    expect(resp.status, 'Delete user status').to.equal(200)
    expect(resp, 'Delete user valid json response').to.have.validJsonBody()
  })
}
