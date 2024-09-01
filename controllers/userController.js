const { User, findUser, Doctor, Assistant } = require('../models/userModel')
const mongoose = require('mongoose')

exports.registerUser = async (req, res) => {
  const { id, names, lastNames, phones, mails, rol, rolDependentInfo } =
    req.body

  try {
    // CREATING USER
    const newUser = new User({
      _id: id,
      names: names,
      lastNames: lastNames,
      phones: phones,
      rol: rol,
      mails: mails,
      isActive: true
    })
    await newUser.save() // Save without session

    // CREATING ROLES
    let roleInfo

    if (rol === 'Doctor') {
      let { collegiateNumber, specialty } = rolDependentInfo
      roleInfo = new Doctor({ user: newUser._id, collegiateNumber, specialty })
      await roleInfo.save()
    } else if (rol === 'Assistant') {
      let { startDate, endDate, DPI } = rolDependentInfo
      startDate = Date.parse(startDate)

      // IF END DATE IS PASSED
      if (endDate) {
        endDate = Date.parse(endDate)
        roleInfo = new Assistant({ user: newUser._id, startDate, endDate, DPI })
      } else {
        roleInfo = new Assistant({ user: newUser._id, startDate, DPI })
      }

      await roleInfo.save()
    } else {
      throw new Error(
        'Invalid Role. Could only be Doctor and Assistant. Is case sensitive.'
      )
    }

    return res
      .status(201)
      .send({ status: 'success', message: 'User registered successfully' })
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ status: 'error', message: 'Username already exists.' })
    } else {
      // Rollback manually if needed (e.g., delete the created user if role creation fails)
      await User.deleteOne({ _id: id })
      return res.status(400).send({ status: 'error', message: error.message })
    }
  }
}

// TODO:  YOU SHOULD NOT BE ABLE TO INACTIVATE YOURSELF
exports.deleteUser = async (req, res) => {
  try {
    const result = await User.updateOne(
      { _id: req.body.id },
      { $set: { isActive: false } }
    )
    res
      .status(200)
      .send({ status: 'success', message: 'User marked as inactive.' })
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { id, names, lastNames, phones, mails, rol, rolDependentInfo } =
      req.body
    if (!id || !rol) {
      throw new Error('And User ID and rol must be provided.')
    }
    await User.updateOne(
      { _id: id },
      {
        $set: {
          names,
          lastNames,
          phones,
          mails
        }
      }
    )
    if (rol === 'Doctor') {
      await Doctor.updateOne({ user: id }, { $set: rolDependentInfo })
    } else if (rol === 'Assistant') {
      await Assistant.updateOne({ user: id }, { $set: rolDependentInfo })
    }
    res.send({ status: 'success', message: 'User updated successfully' })
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}

const getUserById = async (id) => {
  const user = await User.findById(id).exec()
  if (!user) {
    throw new Error('User not found')
  }

  let rolInfo
  if (user.rol === 'Doctor') {
    rolInfo = await Doctor.find({ user: id }).exec()
  } else if (user.rol === 'Assistant') {
    rolInfo = await Assistant.find({ user: id }).exec()
  }

  const {
    _id,
    names,
    lastNames,
    mails,
    phones,
    rol,
    isActive,
    createdAt,
    updatedAt
  } = user
  return {
    id: _id,
    names,
    lastNames,
    mails,
    phones,
    rol,
    isActive,
    createdAt,
    updatedAt,
    rolDependentInfo: rolInfo
  }
}

exports.getMe = async (req, res) => {
  try {
    const id = req.body.id
    const response = await getUserById(id)

    res.status(200).json({ status: 'success', data: response })
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}

exports.getUser = async (req, res) => {
  try {
    const id = req.params.id
    const response = await getUserById(id)

    res.status(200).json({ status: 'success', data: response })
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}

exports.listUser = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('_id names lastNames')
      .exec()

    // Transform the data to rename _id to id
    const transformedUsers = users.map((user) => ({
      id: user._id, // Rename _id to id
      names: user.names,
      lastNames: user.lastNames
    }))

    res.status(200).json({ status: 'success', users: transformedUsers })
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}
