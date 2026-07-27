const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  camasDisponibles: { type: Number, default: 0 }
});

module.exports = mongoose.model('Hospital', hospitalSchema);