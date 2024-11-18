import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js'
import { Httpx } from 'https://jslib.k6.io/httpx/0.1.0/index.js'
import { generateUserData } from './loadTestHelpers.js'

export const options = {
  stages: [
    { duration: '2m', target: 10 }, // ramp up to 10 users
    { duration: '5m', target: 10 }, // stay at 10 users for 5 minutes
    { duration: '2m', target: 0 }   // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_duration{staticAsset:yes}': ['p(99)<250'], // static assets should be very fast
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  }
}

const BASE_URL = 'http://localhost:3001'
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer YOUR_AUTH_TOKEN`,
  Origin: 'http://localhost'
}
const session = new Httpx({ baseURL: BASE_URL, headers: HEADERS })

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
