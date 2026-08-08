const API_URL = 'http://localhost:3000/api/hospitales';
const API_PACIENTES_URL = 'http://localhost:3000/api/pacientes';

let listaHospitalesLocal = [];
let modalHospitalBS = null;
let modalQuirofanoBS = null;
let modalAsignacionBS = null;
let seleccionQuirofanoActual = null;
let pacienteSeleccionadoActual = null;

document.addEventListener('DOMContentLoaded', () => {
  const modalHospitalEl = document.getElementById('modalHospital');
  const modalQuirofanoEl = document.getElementById('modalQuirofano');
  const modalAsignacionEl = document.getElementById('modalAsignacion');

  modalHospitalBS = window.bootstrap && window.bootstrap.Modal ? new bootstrap.Modal(modalHospitalEl) : null;
  modalQuirofanoBS = window.bootstrap && window.bootstrap.Modal ? new bootstrap.Modal(modalQuirofanoEl) : null;
  modalAsignacionBS = window.bootstrap && window.bootstrap.Modal ? new bootstrap.Modal(modalAsignacionEl) : null;

  cargarHospitales();
});

function mostrarModal(id) {
  const modalEl = document.getElementById(id);
  if (!modalEl) return;

  if (window.bootstrap && window.bootstrap.Modal) {
    const inst = window.bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    inst.show();
    return;
  }

  modalEl.classList.add('show');
  modalEl.style.display = 'block';
  modalEl.setAttribute('aria-hidden', 'false');
}

function ocultarModal(id) {
  const modalEl = document.getElementById(id);
  if (!modalEl) return;

  if (window.bootstrap && window.bootstrap.Modal) {
    const inst = window.bootstrap.Modal.getInstance(modalEl);
    if (inst) inst.hide();
    return;
  }

  modalEl.classList.remove('show');
  modalEl.style.display = 'none';
  modalEl.setAttribute('aria-hidden', 'true');
}

function abrirModalHospitalCrear() {
  abrirModalHospital();
}

function obtenerTodosLosHospitales() {
  cargarHospitales();
}

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

        const botonBusqueda = q.estado === 'Disponible'
          ? `<button class="btn btn-sm btn-outline-primary" onclick="buscarPacienteCandidato('${h._id}', ${index})" title="Buscar paciente">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>`
          : `<button class="btn btn-sm btn-outline-secondary" disabled title="Solo disponible para quirófanos libres">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>`;

        filasQuirofanos += `
          <tr>
            <td class="fw-bold">${q.id_sala}</td>
            <td>${q.especialidad_asignada}</td>
            <td class="text-center">
              <span class="badge ${badgeClass} px-2 py-1">${q.estado}</span>
            </td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-warning" onclick="cambiarEstadoQuirofano('${h._id}', ${index})" title="Cambiar estado">
                  <i class="fa-solid fa-arrows-rotate"></i>
                </button>
                ${botonBusqueda}
                <button class="btn btn-outline-danger" onclick="eliminarQuirofano('${h._id}', ${index})" title="Eliminar quirófano">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
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
  mostrarModal('modalHospital');
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
    ocultarModal('modalHospital');
    cargarHospitales();
  } catch (error) {
    // Fallback Local
    if (id) {
      const idx = listaHospitalesLocal.findIndex(h => h._id === id);
      if (idx !== -1) listaHospitalesLocal[idx] = { ...listaHospitalesLocal[idx], ...payload };
    } else {
      listaHospitalesLocal.push({ _id: Date.now().toString(), ...payload, quirofanos: [] });
    }
    ocultarModal('modalHospital');
    renderizarTarjetas(listaHospitalesLocal);
  }
}

// 4. EMBEDDED CRUD - AGREGAR Y ELIMINAR SALAS DENTRO DEL ARREGLO DE UN HOSPITAL
function abrirModalQuirofano(hospitalId) {
  document.getElementById('formQuirofano').reset();
  document.getElementById('hospitalIdQuirofano').value = hospitalId;
  mostrarModal('modalQuirofano');
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

    ocultarModal('modalQuirofano');
    renderizarTarjetas(listaHospitalesLocal);
  }
}

async function cambiarEstadoQuirofano(hospitalId, indexQuirofano) {
  const h = listaHospitalesLocal.find(item => item._id === hospitalId);
  if (!h || !h.quirofanos || !h.quirofanos[indexQuirofano]) return;

  const estados = ['Disponible', 'Ocupado', 'Mantenimiento'];
  const estadoActual = h.quirofanos[indexQuirofano].estado || 'Disponible';
  const indiceActual = estados.indexOf(estadoActual);
  h.quirofanos[indexQuirofano].estado = estados[(indiceActual + 1) % estados.length];

  try {
    await fetch(`${API_URL}/${hospitalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quirofanos: h.quirofanos })
    });
  } catch (e) {
    console.log('Estado actualizado localmente');
  }

  renderizarTarjetas(listaHospitalesLocal);
}

async function buscarPacienteCandidato(hospitalId, indexQuirofano) {
  // Busca un paciente apto para la sala que se seleccionó
  const h = listaHospitalesLocal.find(item => item._id === hospitalId);
  const q = h?.quirofanos?.[indexQuirofano];

  if (!h || !q) return;

  if (q.estado !== 'Disponible') {
    // Evita buscar pacientes si la sala no está disponible
    mostrarModalAsignacion('Quirófano no disponible', '<div class="alert alert-warning mb-0">Solo se pueden buscar pacientes cuando el quirófano está en estado Disponible.</div>', false);
    return;
  }

  try {
    const res = await fetch(API_PACIENTES_URL);
    let pacientes = await res.json();

    if (!Array.isArray(pacientes)) {
      pacientes = [];
    }

    const candidatos = pacientes
      // Filtra pacientes en espera con datos y especialidad compatibles
      .filter(p => p && p.estado_lista === 'En Espera' && p.ubicacion?.coordinates && p.especialidad_requerida)
      .filter(p => {
        const especialidadPaciente = (p.especialidad_requerida || '').toLowerCase();
        const especialidadSala = (q.especialidad_asignada || '').toLowerCase();
        return especialidadPaciente.includes(especialidadSala) || especialidadSala.includes(especialidadPaciente);
      })
      .map(p => ({
        ...p,
        distanciaKm: calcularDistanciaKm(h.coordenadas?.coordinates, p.ubicacion?.coordinates)
      }))
      .sort((a, b) => {
        if (b.nivel_urgencia !== a.nivel_urgencia) return b.nivel_urgencia - a.nivel_urgencia;
        if (a.distanciaKm !== b.distanciaKm) return a.distanciaKm - b.distanciaKm;
        return new Date(a.fecha_ingreso_lista || 0) - new Date(b.fecha_ingreso_lista || 0);
      });

    const candidato = candidatos[0];
    // Guarda la sala y el paciente elegido para asignarlos después
    seleccionQuirofanoActual = { hospitalId, indexQuirofano, hospital: h, quironfano: q };
    pacienteSeleccionadoActual = candidato || null;

    if (!candidato) {
      mostrarModalAsignacion('Sin candidatos', '<div class="alert alert-secondary mb-0">No se encontraron pacientes en espera con la especialidad indicada para este quirófano.</div>', false);
      return;
    }

    const distanciaTexto = candidato.distanciaKm !== null ? `${candidato.distanciaKm.toFixed(1)} km` : 'No disponible';
    mostrarModalAsignacion(
      'Paciente recomendado',
      `
        <div class="alert alert-success mb-3">
          <h6 class="fw-bold mb-2">${candidato.nombre}</h6>
          <p class="mb-1"><strong>Cédula:</strong> ${candidato.cedula || 'N/A'}</p>
          <p class="mb-1"><strong>Especialidad:</strong> ${candidato.especialidad_requerida}</p>
          <p class="mb-1"><strong>Urgencia:</strong> ${candidato.nivel_urgencia}/5</p>
          <p class="mb-1"><strong>Distancia:</strong> ${distanciaTexto}</p>
          <p class="mb-0"><strong>Estado:</strong> ${candidato.estado_lista}</p>
        </div>
        <p class="text-muted small mb-0">Se eligió al paciente con mayor urgencia y menor distancia respecto al hospital.</p>
      `,
      true
    );
  } catch (error) {
    mostrarModalAsignacion('Error', '<div class="alert alert-danger mb-0">No fue posible consultar los pacientes en este momento.</div>', false);
  }
}

function mostrarModalAsignacion(titulo, contenido, mostrarBoton) {
  document.getElementById('modalAsignacionTitulo').textContent = titulo;
  document.getElementById('modalAsignacionBody').innerHTML = contenido;
  document.getElementById('btnAsignarPaciente').style.display = mostrarBoton ? 'inline-block' : 'none';
  mostrarModal('modalAsignacion');
}

async function confirmarAsignacion() {
  // Confirma la asignación y cambia el estado de la sala y del paciente
  if (!seleccionQuirofanoActual || !pacienteSeleccionadoActual) return;

  const { hospitalId, indexQuirofano: indexQuirofanoActual } = seleccionQuirofanoActual;
  const h = listaHospitalesLocal.find(item => item._id === hospitalId);

  if (h?.quirofanos?.[indexQuirofanoActual]) {
    // Marca la sala como ocupada
    h.quirofanos[indexQuirofanoActual].estado = 'Ocupado';
  }

  try {
    await fetch(`${API_URL}/${hospitalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quirofanos: h.quirofanos })
    });

    await fetch(`${API_PACIENTES_URL}/${pacienteSeleccionadoActual._id}`, {
      // Cambia el estado del paciente a asignado
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_lista: 'Asignado' })
    });
  } catch (error) {
    console.log('Asignación actualizada localmente');
  }

  ocultarModal('modalAsignacion');
  renderizarTarjetas(listaHospitalesLocal);
}

function calcularDistanciaKm(coordenadasHospital, coordenadasPaciente) {
  if (!coordenadasHospital || !coordenadasPaciente || coordenadasHospital.length < 2 || coordenadasPaciente.length < 2) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [lngHospital, latHospital] = coordenadasHospital;
  const [lngPaciente, latPaciente] = coordenadasPaciente;

  const toRad = valor => valor * Math.PI / 180;
  const radioTierraKm = 6371;
  const dLat = toRad(latPaciente - latHospital);
  const dLng = toRad(lngPaciente - lngHospital);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(latHospital)) * Math.cos(toRad(latPaciente)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radioTierraKm * c;
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