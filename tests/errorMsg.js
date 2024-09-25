const COMMON_MSG = {
  // 200
  REQUEST_SUCCESS: 'Request succesful.',
  // 400
  MISSING_FIELDS: 'Missing Fields.',
  // 403
  DOCTOR_IS_NOT_OWNER: 'Doctor is not the owner of template.',
  // 404
  DOCTOR_NOT_FOUND: 'Doctor not found.',
  TEMPLATE_NOT_FOUND: 'Template not found.',
  // 406
  RECORDS_USING: 'Item with that id/name already exist',
  // 409
  OPERATION_REJECTED: 'Could not modify item since other resources depend on it'
}

module.exports = COMMON_MSG
