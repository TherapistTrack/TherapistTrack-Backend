const mongoose = require('mongoose')

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
    endDate: { type: Date, required: true },
    DPI: { type: String, required: true }
  },
  { collection: 'Assistant' }
)

const UserSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.ObjectId,
    names: { type: String, required: true },
    lastNames: { type: String, required: true },
    mails: [String],
    phones: [String],
    rol: { type: String, required: true }
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

module.exports = {
  UserSchema,
  DoctorSchema,
  AssistantSchema,
  User,
  Doctor,
  Assistant,
  findUser
}
