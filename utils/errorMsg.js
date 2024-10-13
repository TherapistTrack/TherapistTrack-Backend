const COMMON_MSG = {
  // 200: Success
  REQUEST_SUCCESS: 'Request succesful.',
  // 400: Missing data on request
  MISSING_FIELDS: 'Missing Fields.',
  RESERVED_FIELD_NAMES: 'Names as Apellidos and Nombres are reserved',
  // 403: Not authorized
  DOCTOR_IS_NOT_OWNER: 'Doctor is not the owner of template.',
  // 404: Resource not found
  DOCTOR_NOT_FOUND: 'Doctor not found.',
  TEMPLATE_NOT_FOUND: 'Template not found.',
  FIELD_NOT_FOUND: 'Field not found.',
  // 406: Resource already in use
  RECORDS_USING: 'Item with that id/name already exist',
  // 409: Resources depend on this resource
  OPERATION_REJECTED: 'Could not modify item since other resources depend on it'
}

module.exports = COMMON_MSG
