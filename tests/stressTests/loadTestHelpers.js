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

module.exports = {
  generateObjectId
}
