const mongoose = require('mongoose')

const fieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    options: [String],
    description: { type: String, required: true },
    required: { type: Boolean, default: true }
  },
  { _id: false }
)

const plantillaSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: { type: String, required: true },
    categories: { type: [String], required: true },
    lastUpdate: { type: Date, default: Date.now },
    fields: [fieldSchema]
  },
  { collection: 'PatientTemplate' }
)

const Plantilla = mongoose.model('Plantilla', plantillaSchema)

module.exports = Plantilla
