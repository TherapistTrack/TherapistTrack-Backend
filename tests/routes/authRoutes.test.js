const axios = require('axios')
const { BASE_URL } = require('../jest.setup')

function sum(a, b) {
  return a + b
}

test('dummy test', async () => {
  expect(2).toBe(2)
})

test('dummy test 2', async () => {
  expect(2).toBe(2)
})
