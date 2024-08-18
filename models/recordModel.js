const mongoose = require('mongoose')

const RecordSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientTemplate',
      required: true
    },
    patient: {
      name: { type: String, required: true },
      lastNames: { type: String, required: true },
      fields: [
        {
          name: { type: String, required: true },
          type: { type: String, required: true },
          options: [String],
          value: { type: String, required: true },
          required: { type: Boolean, required: true }
        }
      ]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'Record' }
)

const Record = mongoose.model('Record', RecordSchema)
module.exports = Record
