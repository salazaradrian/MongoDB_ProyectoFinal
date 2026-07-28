const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, required: true },
  ubicacion: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }
  },
  provincia: { type: String },
  especialidad_requerida: { type: String, required: true },
  diagnostico_principal: { type: String },
  estado_lista: {
    type: String,
    enum: ['En Espera', 'Notificado', 'Asignado', 'Rechazado', 'Expirado'],
    default: 'En Espera'
  },
  fecha_ingreso_lista: { type: Date, default: Date.now },
  nivel_urgencia: { type: Number, min: 1, max: 5 },
  detalles_clinicos: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { collection: 'pacientes' });

pacienteSchema.index({ ubicacion: '2dsphere', especialidad_requerida: 1, nivel_urgencia: -1 });

module.exports = mongoose.model('Paciente', pacienteSchema);
