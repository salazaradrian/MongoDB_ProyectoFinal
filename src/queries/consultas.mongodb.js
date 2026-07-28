// consultas.mongodb.js
// Abrir este archivo en VS Code con la extension "MongoDB for VS Code" y ejecutar
// cada bloque por separado (Run this line / Run selected lines), o correrlo
// completo con: mongosh --file src/queries/consultas.mongodb.js
// Requiere haber corrido antes: npm run seed

use('hospitalesDB');

// a. Hospitales cercanos a un punto que tengan al menos un quirofano
// Disponible en una especialidad especifica.
// Parametros: lng, lat, especialidad, radioMetros.
function hospitalesCercanosConEspecialidad(lng, lat, especialidad, radioMetros) {
  return db.hospitales_infraestructura.find({
    coordenadas: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radioMetros
      }
    },
    quirofanos: {
      $elemMatch: { especialidad_asignada: especialidad, estado: 'Disponible' }
    }
  });
}
hospitalesCercanosConEspecialidad(-84.1167, 10.0000, 'Ortopedia', 50000);

use('hospitalesDB');

// b. Pacientes candidatos para una especialidad liberada, ordenados por
// urgencia clinica (mayor primero) y luego por fecha de ingreso (mas antiguos primero).
// Parametro: especialidad.
function candidatosPorEspecialidad(especialidad) {
  return db.pacientes.find({
    especialidad_requerida: especialidad,
    estado_lista: 'En Espera'
  }).sort({ nivel_urgencia: -1, fecha_ingreso_lista: 1 });
}
candidatosPorEspecialidad('Ortopedia');

// c. Cantidad de pacientes en espera agrupados por especialidad y nivel de urgencia.
function pacientesPorEspecialidadYUrgencia() {
  return db.pacientes.aggregate([
    { $match: { estado_lista: 'En Espera' } },
    { $group: { _id: { especialidad: '$especialidad_requerida', urgencia: '$nivel_urgencia' }, total: { $sum: 1 } } },
    { $sort: { '_id.especialidad': 1, '_id.urgencia': -1 } }
  ]);
}
pacientesPorEspecialidadYUrgencia();

// d. Quirofanos disponibles por hospital (aplanando el arreglo embebido).
function quirofanosDisponiblesPorHospital() {
  return db.hospitales_infraestructura.aggregate([
    { $unwind: '$quirofanos' },
    { $match: { 'quirofanos.estado': 'Disponible' } },
    { $group: { _id: '$nombre_hospital', quirofanosDisponibles: { $push: '$quirofanos.id_sala' } } }
  ]);
}
quirofanosDisponiblesPorHospital();

// Indices recomendados (documento de especificacion, secciones 2.2 y 2.3).
// La app tambien los crea automaticamente al arrancar (Mongoose autoIndex),
// pero quedan aqui documentados explicitamente.
db.pacientes.createIndex({ ubicacion: '2dsphere', especialidad_requerida: 1, nivel_urgencia: -1 });
db.hospitales_infraestructura.createIndex({ coordenadas: '2dsphere', 'quirofanos.especialidad_asignada': 1 });
