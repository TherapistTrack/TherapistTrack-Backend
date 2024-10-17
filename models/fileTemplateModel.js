const mongoose = require('mongoose')

const fieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['SHORT_TEXT', 'TEXT', 'DATE', 'NUMBER', 'FLOAT', 'CHOICE']
    },
    options: [String],
    description: { type: String },
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
    lastUpdate: { type: Date, default: Date.now },
    fields: [fieldSchema]
  },
  { collection: 'FileTemplate' }
)

const Plantilla = mongoose.model('FileTemplate', plantillaSchema)

module.exports = Plantilla
