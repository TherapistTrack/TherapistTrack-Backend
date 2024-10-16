const COMMON_MSG = require('./errorMsg')

const checkExistenceName = async (res, Controller, name, message) => {
  const existingObject = await Controller.findOne({ name })
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

module.exports = {
  checkExistenceName,
  checkExistenceId,
  checkDoctor,
  checkExistingField
}
