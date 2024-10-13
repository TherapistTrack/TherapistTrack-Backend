const mongoose = require('mongoose')

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  options: [String],
  description: { type: String, required: true },
  required: { type: Boolean, default: true }
})

const plantillaSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      //ref: 'Doctor',
      required: true
    },
    name: { type: String, required: true },
    fields: [fieldSchema]
  },
  { collection: 'PatientTemplate' }
)

const Plantilla = mongoose.model('Plantilla', plantillaSchema)

module.exports = Plantilla
