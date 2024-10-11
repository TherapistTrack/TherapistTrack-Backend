const { findRoleByID } = require('../models/userModel')

exports.checkIsActive = async (RoleID) => {
  const User = await findRoleByID(RoleID)
  return User.isActive
}
