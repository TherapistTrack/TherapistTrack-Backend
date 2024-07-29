const mongoose = require('mongoose')

const metadataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['SHORT_TEXT', 'TEXT', 'DATE', 'NUMBER', 'FLOAT', 'CHOICE'],
    required: true
  },
  options: [String],
  value: { type: String, required: true },
  required: { type: Boolean, required: true }
})

const fileSchema = new mongoose.Schema({
  record: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  name: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  pages: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  metadata: [metadataSchema]
})

const File = mongoose.model('File', fileSchema)

module.exports = File
