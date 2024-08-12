const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  options: [String],
  value: { type: String },
  required: { type: Boolean, default: false }
});

const plantillaSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  name: { type: String, required: true },
  patientTemplate: {
    record: String,
    names: String,
    lastNames: String,
    fields: [fieldSchema]
  }
}, {
  timestamps: true
});

const Plantilla = mongoose.model('Plantilla', plantillaSchema);

module.exports = Plantilla;
