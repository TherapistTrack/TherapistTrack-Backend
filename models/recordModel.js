const mongoose = require('mongoose')

const RecordSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      //ref: 'Doctor',
      required: true
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      //ref: 'PatientTemplate',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    patient: {
      names: { type: String, required: true },
      lastNames: { type: String, required: true },
      fields: [
        {
          name: { type: String, required: true },
          type: {
            type: String,
            required: true,
            enum: ['SHORT_TEXT', 'TEXT', 'DATE', 'NUMBER', 'FLOAT', 'CHOICE']
          },
          options: [String],
          value: { type: String, required: true },
          required: { type: Boolean, required: true }
        }
      ]
    }
  },
  { collection: 'Record' }
)

const Record = mongoose.model('Record', RecordSchema)
module.exports = Record
