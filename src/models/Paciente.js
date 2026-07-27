const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, required: true },
  edad: { type: Number },
  estado_lista: { type: String, default: 'En Espera' },
  detalles_clinicos: { type: Object }
}, { strict: false });

module.exports = mongoose.model('Paciente', pacienteSchema);