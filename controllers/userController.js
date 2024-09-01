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

exports.deleteUser = async (req, res) => {
  try {
    const result = await User.updateOne(
      { username: req.body.username },
      { $set: { isActive: false } }
    )
    if (result.modifiedCount === 0) {
      throw new Error('User not found or already inactive')
    }
    res.send({ status: 'success', message: 'User marked as inactive' })
  } catch (error) {
    res.status(404).send({ status: 'error', message: error.message })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const result = await User.updateOne(
      { username: req.body.username },
      { $set: req.body }
    )
    if (result.modifiedCount === 0) {
      throw new Error('User not found or no updates made')
    }
    res.send({ status: 'success', message: 'User updated successfully' })
  } catch (error) {
    res.status(400).send({ status: 'error', message: error.message })
  }
}

exports.listUser = async (req, res) => {
  try {
    const user = await findUser(req.query.username)
    if (!user) {
      throw new Error('User not found')
    }
    res.json({ status: 'success', data: user })
  } catch (error) {
    res.status(404).send({ status: 'error', message: error.message })
  }
}
