const mongoose = require('mongoose')
const { checkIsActive } = require('../utils/checkingTool')
const DoctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, required: true },
    collegiateNumber: { type: String, required: true },
    specialty: { type: String, required: true }
  },
  { collection: 'Doctor' }
)

const AssistantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    DPI: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          const dpiRegex = /^[0-9]+$/
          return dpiRegex.test(v)
        },
        message: 'DPI must contain only numbers.'
      }
    }
  },
  { collection: 'Assistant' }
)

// Pre-save hook for date validation
AssistantSchema.pre('save', function (next) {
  if (this.endDate && this.startDate > this.endDate) {
    return next(new Error('End date cannot be before StartDate.'))
  }
  next()
})

const UserSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.ObjectId,
    names: { type: String, required: true },
    lastNames: { type: String, required: true },
    mails: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => {
          const mailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
          return v.every((str) => mailRegex.test(str))
        },
        message:
          'One or more emails do not match the format of an email. Ex: test@mail.com'
      }
    },
    phones: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => {
          const mailRegex = /^[0-9]+$/
          return v.every((str) => mailRegex.test(str))
        },
        message:
          'One or more emails do not match the format of an email. Ex: test@mail.com'
      }
    },
    rol: {
      type: String,
      required: true,
      enum: ['Doctor', 'Assistant', 'Admin']
    },
    roleDependentInfo: { type: mongoose.Schema.ObjectId, required: false },
    isActive: { type: Boolean, required: true }
  },
  {
    collection: 'User',
    timestamps: true
  }
)

const User = mongoose.model('User', UserSchema)
const Doctor = mongoose.model('Doctor', DoctorSchema)
const Assistant = mongoose.model('Assistant', AssistantSchema)

const findUser = async (username) => {
  try {
    const result = await User.findOne({ username })
    return result
  } catch (error) {
    console.error('Error executing MongoDB query:', error)
    throw error
  }
}

const findUserByRoleID = async (roleID) => {
  try {
    const result = await User.findOne({ roleDependentInfo: roleID })
    return result
  } catch (error) {
    console.error('Error executing MongoDB query:', error)
    throw error
  }
}

module.exports = {
  UserSchema,
  DoctorSchema,
  AssistantSchema,
  User,
  Doctor,
  Assistant,
  findUser,
  findUserByRoleID
}
