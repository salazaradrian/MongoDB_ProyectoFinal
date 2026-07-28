const mongoose = require('mongoose');
const Paciente = require('../models/Paciente');
const Hospital = require('../models/Hospital');

const pacientes = [
  {
    _id: '6495f1a1e4b0c12345678901',
    nombre: 'Amalia Robleto Escalante',
    cedula: '1-1234-5678',
    ubicacion: { type: 'Point', coordinates: [-84.4531, 10.3238] },
    provincia: 'Alajuela',
    especialidad_requerida: 'Ortopedia',
    diagnostico_principal: 'Osteoartritis severa de rodilla izquierda',
    estado_lista: 'En Espera',
    fecha_ingreso_lista: new Date('2024-02-15T08:00:00Z'),
    nivel_urgencia: 4,
    detalles_clinicos: { escala_dolor: '8/10', requiere_protesis: true, alergias: ['Penicilina'] }
  },
  {
    _id: '6495f1a1e4b0c12345678902',
    nombre: 'Carlos Vargas Umana',
    cedula: '2-0456-0789',
    ubicacion: { type: 'Point', coordinates: [-84.2231, 9.9981] },
    provincia: 'Alajuela',
    especialidad_requerida: 'Oftalmologia',
    diagnostico_principal: 'Catarata madura bilateral',
    estado_lista: 'En Espera',
    fecha_ingreso_lista: new Date('2025-05-10T10:30:00Z'),
    nivel_urgencia: 3,
    detalles_clinicos: { agudeza_visual: '20/200', presion_intraocular: '16 mmHg', condicion_coexistente: 'Diabetes Tipo 2' }
  },
  {
    _id: '6495f1a1e4b0c12345678903',
    nombre: 'Maria del Carmen Solano',
    cedula: '3-0234-0567',
    ubicacion: { type: 'Point', coordinates: [-83.5241, 10.0021] },
    provincia: 'Cartago',
    especialidad_requerida: 'Cirugia General',
    diagnostico_principal: 'Colelitiasis cronica sintomatica',
    estado_lista: 'En Espera',
    fecha_ingreso_lista: new Date('2024-11-01T14:15:00Z'),
    nivel_urgencia: 5,
    detalles_clinicos: { episodios_colico_ultimo_mes: 4, presencia_barro_biliar: true }
  },
  {
    _id: '6495f1a1e4b0c12345678904',
    nombre: 'Esteban Quesada Madrigal',
    cedula: '1-0889-0112',
    ubicacion: { type: 'Point', coordinates: [-84.0789, 9.9333] },
    provincia: 'San Jose',
    especialidad_requerida: 'Ortopedia',
    diagnostico_principal: 'Ruptura de ligamento cruzado anterior',
    estado_lista: 'Notificado',
    fecha_ingreso_lista: new Date('2025-01-20T09:00:00Z'),
    nivel_urgencia: 3,
    detalles_clinicos: { actividad_fisica: 'Alta', inflamacion_articular: 'Moderada' }
  },
  {
    _id: '6495f1a1e4b0c12345678905',
    nombre: 'Ana Lucia Benavides',
    cedula: '4-0122-0344',
    ubicacion: { type: 'Point', coordinates: [-84.1167, 10.0000] },
    provincia: 'Heredia',
    especialidad_requerida: 'Ginecologia',
    diagnostico_principal: 'Miomatosis uterina sintomatica',
    estado_lista: 'En Espera',
    fecha_ingreso_lista: new Date('2024-08-12T11:00:00Z'),
    nivel_urgencia: 4,
    detalles_clinicos: { tamano_mioma_cm: 7.5, anemia_secundaria: true }
  }
];

const hospitales = [
  {
    _id: '507f1f77bcf86cd799439011',
    nombre_hospital: 'Hospital San Carlos',
    red_salud: 'Region Huetar Norte',
    coordenadas: { type: 'Point', coordinates: [-84.4744, 10.3230] },
    quirofanos: [
      { id_sala: 'QR-01', especialidad_asignada: 'Emergencias', estado: 'Ocupado' },
      { id_sala: 'QR-02', especialidad_asignada: 'Ortopedia', estado: 'Disponible' },
      { id_sala: 'QR-03', especialidad_asignada: 'General', estado: 'Mantenimiento' }
    ],
    contacto_emergencias: '2401-1234'
  },
  {
    _id: '507f1f77bcf86cd799439012',
    nombre_hospital: 'Hospital Mexico',
    red_salud: 'Region Central',
    coordenadas: { type: 'Point', coordinates: [-84.1121, 9.9543] },
    quirofanos: [
      { id_sala: 'MX-01', especialidad_asignada: 'Cardiovascular', estado: 'Ocupado' },
      { id_sala: 'MX-02', especialidad_asignada: 'Oftalmologia', estado: 'Disponible' },
      { id_sala: 'MX-03', especialidad_asignada: 'Ortopedia', estado: 'Ocupado' }
    ],
    contacto_emergencias: '2242-6789'
  },
  {
    _id: '507f1f77bcf86cd799439013',
    nombre_hospital: 'Hospital Max Peralta',
    red_salud: 'Region Central Estructural',
    coordenadas: { type: 'Point', coordinates: [-83.9224, 9.8639] },
    quirofanos: [
      { id_sala: 'MP-01', especialidad_asignada: 'General', estado: 'Disponible' },
      { id_sala: 'MP-02', especialidad_asignada: 'Ginecologia', estado: 'Ocupado' }
    ],
    contacto_emergencias: '2550-1999'
  },
  {
    _id: '507f1f77bcf86cd799439014',
    nombre_hospital: 'Hospital San Rafael',
    red_salud: 'Region Central Norte',
    coordenadas: { type: 'Point', coordinates: [-84.2141, 10.0152] },
    quirofanos: [
      { id_sala: 'SR-01', especialidad_asignada: 'Ortopedia', estado: 'Disponible' },
      { id_sala: 'SR-02', especialidad_asignada: 'General', estado: 'Disponible' }
    ],
    contacto_emergencias: '2436-1000'
  }
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalesDB');
  await Paciente.deleteMany({});
  await Hospital.deleteMany({});
  await Paciente.insertMany(pacientes);
  await Hospital.insertMany(hospitales);
  console.log(`Insertados ${pacientes.length} pacientes y ${hospitales.length} hospitales`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
