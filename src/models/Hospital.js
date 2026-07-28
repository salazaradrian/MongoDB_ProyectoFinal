const mongoose = require('mongoose');

const quirofanoSchema = new mongoose.Schema({
  id_sala: { type: String, required: true },
  especialidad_asignada: { type: String, required: true },
  estado: {
    type: String,
    enum: ['Disponible', 'Ocupado', 'Mantenimiento'],
    default: 'Disponible'
  }
});

const hospitalSchema = new mongoose.Schema({
  nombre_hospital: { type: String, required: true },
  red_salud: { type: String },
  coordenadas: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }
  },
  quirofanos: { type: [quirofanoSchema], default: [] },
  contacto_emergencias: { type: String }
}, { collection: 'hospitales_infraestructura' });

hospitalSchema.index({ coordenadas: '2dsphere', 'quirofanos.especialidad_asignada': 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
