const COMMON_MSG = require('./errorMsg')
const { findUserByRoleID } = require('../models/userModel')

/**
 * Checks for the existence of an object with a specific name and ID in the database.
 * If the object exists, it sends a 406 status response with a provided message.
 *
 * @async
 * @function checkExistenceName
 * @param {Object} res - The response object to send the status and message.
 * @param {Object} Controller - The database controller to perform the find operation.
 * @param {string} name - The name to check for existence.
 * @param {string} selectId - The ID to check for existence.
 * @param {string} keyCheck - The key of the object to check in the database.
 * @param {string} message - The message to send if the object exists.
 * @returns {Promise<boolean>} - Returns true if the object does not exist, otherwise false.
 */
const checkExistenceName = async (res, Controller, name, selectId, message) => {
  const existingObject = await Controller.findOne({
    name: name,
    doctor: selectId
  })
  if (existingObject) {
    res.status(406).json({ status: 406, message: message })
    return false
  }
  return true
}

const checkExistenceId = async (res, Controller, Id, message) => {
  const existingObject = await Controller.findById(Id)
  if (!existingObject) {
    res.status(404).json({ status: 404, message: message })
    return false
  }
  return true
}

//special function for patient Template
const checkDoctor = async (res, Controller, doctorId, templateId) => {
  const patientemplate = await Controller.findById(templateId).lean()
  if (patientemplate.doctor.toString() !== doctorId) {
    res
      .status(403)
      .send({ status: 403, message: COMMON_MSG.DOCTOR_IS_NOT_OWNER })
    return false
  }
  return true
}

const checkExistingField = async (res, Controller, templateId, field) => {
  const patientemplate = await Controller.findById(templateId)

  const fieldExists = patientemplate.fields.some(
    (existingField) => existingField.name === field.name
  )
  if (fieldExists) {
    res.status(406).send({ status: 406, message: COMMON_MSG.RECORDS_USING })
    return false
  }
  return true
}

const doctorActive = async (res, doctorId) => {
  const doctor = await findUserByRoleID(doctorId)
  if (!doctor) {
    res.status(404).json({ status: 404, message: COMMON_MSG.DOCTOR_NOT_FOUND })
    return false
  }
  if (!doctor.isActive) {
    res.status(404).json({ status: 404, message: COMMON_MSG.DOCTOR_NOT_FOUND })
    return false
  }
  return true
}

module.exports = {
  checkExistenceName,
  checkExistenceId,
  checkDoctor,
  checkExistingField,
  doctorActive
}
