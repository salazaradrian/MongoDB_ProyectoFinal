const API_URL = 'http://localhost:3000/api/hospitales';

let listaHospitalesLocal = [];
let modalHospitalBS = null;
let modalQuirofanoBS = null;

document.addEventListener('DOMContentLoaded', () => {
  modalHospitalBS = new bootstrap.Modal(document.getElementById('modalHospital'));
  modalQuirofanoBS = new bootstrap.Modal(document.getElementById('modalQuirofano'));
  cargarHospitales();
});

// 1. READ (GET) - OBTENER HOSPITALES Y SUS QUIRÓFANOS EMBEBIDOS
async function cargarHospitales() {
  try {
    const res = await fetch(API_URL);
    let datos = await res.json();

    if (!Array.isArray(datos) || datos.length === 0) {
      datos = getHospitalesEjemplo();
    }

    listaHospitalesLocal = datos;
    renderizarTarjetas(datos);

  } catch (error) {
    console.log('Backend no disponible. Cargando datos locales de infraestructura...');
    listaHospitalesLocal = getHospitalesEjemplo();
    renderizarTarjetas(listaHospitalesLocal);
  }
}

// MOCK DE DATOS SEGÚN LA ESTRUCTURA EXACTA PEDIDA
function getHospitalesEjemplo() {
  return [
    {
      _id: "64b1f28e3a9a8d0012f3e901",
      nombre_hospital: "Hospital México",
      red_salud: "Red Central Norte",
      contacto_emergencias: "2242-6700 Ext. 102",
      coordenadas: { type: "Point", coordinates: [-84.1167, 9.9538] },
      quirofanos: [
        { id_sala: "Q-01", especialidad_asignada: "Ortopedia y Traumatología", estado: "Disponible" },
        { id_sala: "Q-02", especialidad_asignada: "Cirugía Cardiovascular", estado: "Ocupado" },
        { id_sala: "Q-03", especialidad_asignada: "Neurocirugía", estado: "Mantenimiento" }
      ]
    },
    {
      _id: "64b1f28e3a9a8d0012f3e902",
      nombre_hospital: "Hospital Rafael Ángel Calderón Guardia",
      red_salud: "Red Central Sur",
      contacto_emergencias: "2257-7922 Ext. 500",
      coordenadas: { type: "Point", coordinates: [-84.0685, 9.9358] },
      quirofanos: [
        { id_sala: "Q-A", especialidad_asignada: "Oftalmología", estado: "Disponible" },
        { id_sala: "Q-B", especialidad_asignada: "Urología", estado: "Disponible" }
      ]
    }
  ];
}

// 2. RENDERIZAR TARJETAS CON TABLAS DE QUIRÓFANOS
function renderizarTarjetas(hospitales) {
  const contenedor = document.getElementById('contenedor-hospitales');
  contenedor.innerHTML = '';

  hospitales.forEach(h => {
    // Generar filas para el arreglo embebido 'quirofanos'
    let filasQuirofanos = '';
    
    if (h.quirofanos && h.quirofanos.length > 0) {
      h.quirofanos.forEach((q, index) => {
        let badgeClass = 'badge-disponible';
        if (q.estado === 'Ocupado') badgeClass = 'badge-ocupado';
        if (q.estado === 'Mantenimiento') badgeClass = 'badge-mantenimiento';

        filasQuirofanos += `
          <tr>
            <td class="fw-bold">${q.id_sala}</td>
            <td>${q.especialidad_asignada}</td>
            <td class="text-center">
              <span class="badge ${badgeClass} px-2 py-1">${q.estado}</span>
            </td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarQuirofano('${h._id}', ${index})">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </td>
          </tr>
        `;
      });
    } else {
      filasQuirofanos = `<tr><td colspan="4" class="text-center text-muted small p-3">No hay quirófanos registrados en esta sede.</td></tr>`;
    }

    // Coordenadas GeoJSON
    const coordsText = h.coordenadas && h.coordenadas.coordinates 
      ? `[${h.coordenadas.coordinates[1]}, ${h.coordenadas.coordinates[0]}]` 
      : 'No configuradas';

    contenedor.innerHTML += `
      <div class="col-lg-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
            <div>
              <h5 class="mb-0 fw-bold"><i class="fa-solid fa-hospital me-2 text-warning"></i>${h.nombre_hospital}</h5>
              <small class="text-light opacity-75">${h.red_salud}</small>
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-light" onclick="abrirModalHospital('${h._id}')" title="Editar Hospital">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-outline-danger" onclick="eliminarHospital('${h._id}')" title="Eliminar Hospital">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="card-body">
            <div class="row mb-3 small text-muted">
              <div class="col-6">
                <i class="fa-solid fa-phone me-1 text-primary"></i> <strong>Contacto:</strong> ${h.contacto_emergencias}
              </div>
              <div class="col-6 text-end">
                <i class="fa-solid fa-location-dot me-1 text-danger"></i> <strong>GeoJSON:</strong> ${coordsText}
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold mb-0 text-secondary"><i class="fa-solid fa-door-open me-1"></i>Salas Quirúrgicas Embebidas</h6>
              <button class="btn btn-sm btn-outline-success fw-bold" onclick="abrirModalQuirofano('${h._id}')">
                <i class="fa-solid fa-plus me-1"></i> Añadir Sala
              </button>
            </div>

            <div class="table-responsive border rounded">
              <table class="table table-hover table-sm align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Sala ID</th>
                    <th>Especialidad Equipada</th>
                    <th class="text-center">Estado</th>
                    <th class="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasQuirofanos}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

// 3. CREAR / EDITAR HOSPITAL (PADRE)
function abrirModalHospital(id = null) {
  document.getElementById('formHospital').reset();
  document.getElementById('hospitalId').value = '';
  document.getElementById('modalHospitalTitulo').textContent = 'Registrar Nuevo Hospital';

  if (id) {
    const h = listaHospitalesLocal.find(item => item._id === id);
    if (h) {
      document.getElementById('hospitalId').value = h._id;
      document.getElementById('nombreHospital').value = h.nombre_hospital;
      document.getElementById('redSalud').value = h.red_salud;
      document.getElementById('contactoEmergencias').value = h.contacto_emergencias;
      if (h.coordenadas && h.coordenadas.coordinates) {
        document.getElementById('longitud').value = h.coordenadas.coordinates[0];
        document.getElementById('latitud').value = h.coordenadas.coordinates[1];
      }
      document.getElementById('modalHospitalTitulo').textContent = `Editar: ${h.nombre_hospital}`;
    }
  }
  modalHospitalBS.show();
}

async function guardarHospital() {
  const id = document.getElementById('hospitalId').value;
  const lat = parseFloat(document.getElementById('latitud').value) || 0;
  const lng = parseFloat(document.getElementById('longitud').value) || 0;

  const payload = {
    nombre_hospital: document.getElementById('nombreHospital').value,
    red_salud: document.getElementById('redSalud').value,
    contacto_emergencias: document.getElementById('contactoEmergencias').value,
    coordenadas: {
      type: "Point",
      coordinates: [lng, lat]
    }
  };

  try {
    if (id) {
      await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      payload.quirofanos = []; // Arreglo embebido inicial vacío
      await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    modalHospitalBS.hide();
    cargarHospitales();
  } catch (error) {
    // Fallback Local
    if (id) {
      const idx = listaHospitalesLocal.findIndex(h => h._id === id);
      if (idx !== -1) listaHospitalesLocal[idx] = { ...listaHospitalesLocal[idx], ...payload };
    } else {
      listaHospitalesLocal.push({ _id: Date.now().toString(), ...payload, quirofanos: [] });
    }
    modalHospitalBS.hide();
    renderizarTarjetas(listaHospitalesLocal);
  }
}

// 4. EMBEDDED CRUD - AGREGAR Y ELIMINAR SALAS DENTRO DEL ARREGLO DE UN HOSPITAL
function abrirModalQuirofano(hospitalId) {
  document.getElementById('formQuirofano').reset();
  document.getElementById('hospitalIdQuirofano').value = hospitalId;
  modalQuirofanoBS.show();
}

async function guardarQuirofanoEmbebido() {
  const hospitalId = document.getElementById('hospitalIdQuirofano').value;
  const nuevaSala = {
    id_sala: document.getElementById('idSala').value,
    especialidad_asignada: document.getElementById('especialidadAsignada').value,
    estado: document.getElementById('estadoQuirofano').value
  };

  const h = listaHospitalesLocal.find(item => item._id === hospitalId);
  if (h) {
    if (!h.quirofanos) h.quirofanos = [];
    h.quirofanos.push(nuevaSala);

    try {
      // En MongoDB/Express, actualizamos el documento padre con el arreglo actualizado
      await fetch(`${API_URL}/${hospitalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quirofanos: h.quirofanos })
      });
    } catch (e) {
      console.log('Actualizado en memoria local');
    }

    modalQuirofanoBS.hide();
    renderizarTarjetas(listaHospitalesLocal);
  }
}

async function eliminarQuirofano(hospitalId, indexQuirofano) {
  const h = listaHospitalesLocal.find(item => item._id === hospitalId);
  if (h && h.quirofanos) {
    h.quirofanos.splice(indexQuirofano, 1);

    try {
      await fetch(`${API_URL}/${hospitalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quirofanos: h.quirofanos })
      });
    } catch (e) {
      console.log('Eliminado en memoria local');
    }

    renderizarTarjetas(listaHospitalesLocal);
  }
}

async function eliminarHospital(id) {
  if (!confirm('¿Seguro que desea eliminar este centro de salud y todos sus quirófanos registrados?')) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    cargarHospitales();
  } catch (error) {
    listaHospitalesLocal = listaHospitalesLocal.filter(h => h._id !== id);
    renderizarTarjetas(listaHospitalesLocal);
  }
}