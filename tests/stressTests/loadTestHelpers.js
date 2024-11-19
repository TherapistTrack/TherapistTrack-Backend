/**
 * Generates a valid 24-character ObjectId.
 * The ID consists of an 8-character hexadecimal timestamp and
 * a 16-character random hexadecimal string.
 *
 * @returns {string} ObjectId.
 */
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0')
  const randomPart = Math.random().toString(16).slice(2, 18).padEnd(16, '0')
  return timestamp + randomPart
}

/**
 * Generates user data based on the provided role.
 *
 * @param {string} role - The role of the user, either 'Doctor' or another role.
 * @returns {Object} User data - payload for creating a user.
 */
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

/**
 * Generates patient template data.
 *
 * @param {string} ownerId - The ID of the user that owns the template.
 * @returns {Object} Patient template data - payload for creating a patient template.
 */
function generatePatientTemplateData(ownerId) {
  const timestamp = new Date().toISOString()

  return {
    doctorId: ownerId,
    name: `Test Template - ${timestamp}`,
    categories: ['Test Category'],
    fields: [
      {
        name: 'Test Field',
        type: 'TEXT',
        options: [],
        required: true,
        description: 'Test Description'
      }
    ]
  }
}

/**
 * Generates file template data.
 *
 * @param {string} ownerId - The ID of the owner of the file template.
 * @returns {Object} File template data - payload for creating a file template.
 */
function generateFileTemplateData(ownerId) {
  const timestamp = new Date().toISOString()

  return {
    doctorId: ownerId,
    name: `Test Template - ${timestamp}`,
    fields: [
      {
        name: 'Test Field',
        type: 'TEXT',
        options: [],
        required: true,
        description: 'Test Description'
      }
    ]
  }
}

/**
 * Generates a random string of the specified length.
 *
 * @param {number} length - The length of the random string.
 * @returns {string} Random string.
 */
function generateRandomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2)
}

module.exports = {
  generateUserData,
  generatePatientTemplateData,
  generateRandomString,
  generateFileTemplateData
}
