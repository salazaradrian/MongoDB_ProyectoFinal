const API_URL = 'http://localhost:3000/api/pacientes';

let listaPacientesLocal = [];
let modalBootstrap = null;

document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('modalPaciente');
  if (modalEl && typeof bootstrap !== 'undefined') {
    modalBootstrap = new bootstrap.Modal(modalEl);
  }
  obtenerTodosLosPacientes();
});

// 1. OBTENER PACIENTES (GET)
async function obtenerTodosLosPacientes() {
  const tablaBody = document.getElementById('tabla-todos-pacientes');

  try {
    const res = await fetch(API_URL);
    let pacientes = await res.json();

    if (!Array.isArray(pacientes) || pacientes.length === 0) {
      pacientes = getPacientesEjemplo();
    }

    listaPacientesLocal = pacientes;
    renderizarTabla(pacientes);

  } catch (error) {
    console.log('API no disponible. Cargando datos locales de demostración...');
    listaPacientesLocal = getPacientesEjemplo();
    renderizarTabla(listaPacientesLocal);
  }
}

// DATOS DE PRUEBA INICIALES (3 PACIENTES)
function getPacientesEjemplo() {
  return [
    {
      _id: "64b1f28e3a9a8d0012f3e8a1",
      cedula: "112340567",
      nombre: "Amabia Robesca",
      provincia: "Alajuela",
      especialidad_requerida: "Ortopedia",
      diagnostico_principal: "Artrosis severa de rodilla",
      nivel_urgencia: 4,
      estado_lista: "Notificado",
      fecha_ingreso_lista: "2026-01-15",
      detalles_clinicos: { articulacion: "Rodilla Derecha", requiere_protesis: true, material: "Titanio" }
    },
    {
      _id: "64b1f28e3a9a8d0012f3e8a2",
      cedula: "205550123",
      nombre: "Carlos Alvarado",
      provincia: "San José",
      especialidad_requerida: "Oftalmología",
      diagnostico_principal: "Catarata senil avanzada",
      nivel_urgencia: 2,
      estado_lista: "En Espera",
      fecha_ingreso_lista: "2026-02-10",
      detalles_clinicos: { ojo: "Izquierdo", dioptrias: 3.5, catarata: true }
    },
    {
      _id: "64b1f28e3a9a8d0012f3e8a3",
      cedula: "109870654",
      nombre: "Beatriz Solís",
      provincia: "Cartago",
      especialidad_requerida: "Cardiología",
      diagnostico_principal: "Bloqueo AV completo",
      nivel_urgencia: 5,
      estado_lista: "Asignado",
      fecha_ingreso_lista: "2026-03-01",
      detalles_clinicos: { marcapasos_requerido: true, tipo_camara: "Bicameral", fraccion_eyeccion: "50%" }
    }
  ];
}

// 2. RENDERIZAR TABLA CON BOTONES DE EDITAR Y ELIMINAR VISIBLES
function renderizarTabla(pacientes) {
  const tablaBody = document.getElementById('tabla-todos-pacientes');
  tablaBody.innerHTML = '';

  if (pacientes.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="9" class="text-center p-4 text-muted">No hay pacientes registrados en la lista.</td></tr>`;
    return;
  }

  pacientes.forEach(p => {
    let badgeEstado = 'bg-secondary';
    if (p.estado_lista === 'Notificado') badgeEstado = 'bg-warning text-dark';
    if (p.estado_lista === 'Asignado') badgeEstado = 'bg-success';
    if (p.estado_lista === 'Rechazado') badgeEstado = 'bg-danger';

    // Formatear subdocumento polimórfico
    let detallesTexto = 'Sin datos';
    if (p.detalles_clinicos && Object.keys(p.detalles_clinicos).length > 0) {
      detallesTexto = Object.entries(p.detalles_clinicos)
        .map(([key, val]) => {
          let valorFormateado = typeof val === 'boolean' ? (val ? 'Sí' : 'No') : val;
          return `<span class="text-primary fw-semibold">${key.replace(/_/g, ' ')}:</span> ${valorFormateado}`;
        })
        .join(' | ');
    }

    tablaBody.innerHTML += `
      <tr>
        <td class="ps-4"><strong>${p.cedula}</strong></td>
        <td class="fw-semibold">${p.nombre}</td>
        <td>${p.provincia || 'N/A'}</td>
        <td>${p.especialidad_requerida}</td>
        <td><small class="text-muted">${p.diagnostico_principal || 'N/A'}</small></td>
        <td class="text-center"><span class="badge bg-danger fs-6">${p.nivel_urgencia}/5</span></td>
        <td><span class="badge ${badgeEstado} px-3 py-2">${p.estado_lista}</span></td>
        <td><small>${detallesTexto}</small></td>
        <td class="text-center pe-4">
          <div class="d-flex justify-content-center gap-1">
            <button class="btn btn-primary btn-acciones" onclick="abrirModalEditar('${p._id}')" title="Editar Registro">
              <i class="fa-solid fa-pen-to-square me-1"></i>Editar
            </button>
            <button class="btn btn-danger btn-acciones" onclick="eliminarPaciente('${p._id}')" title="Eliminar Registro">
              <i class="fa-solid fa-trash me-1"></i>Borrar
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

// 3. FUNCIONES DE MODAL CREAR / EDITAR
function abrirModalCrear() {
  document.getElementById('formPaciente').reset();
  document.getElementById('pacienteId').value = '';
  document.getElementById('modalTitulo').textContent = 'Agregar Nuevo Paciente';
  document.getElementById('fechaIngreso').value = new Date().toISOString().split('T')[0];
  document.getElementById('detallesClinicos').value = JSON.stringify({ atributo_ejemplo: "valor" }, null, 2);
  
  if (modalBootstrap) modalBootstrap.show();
}

function abrirModalEditar(id) {
  const p = listaPacientesLocal.find(pac => pac._id === id);
  if (!p) return;

  document.getElementById('pacienteId').value = p._id;
  document.getElementById('cedula').value = p.cedula;
  document.getElementById('nombre').value = p.nombre;
  document.getElementById('provincia').value = p.provincia || 'San José';
  document.getElementById('especialidad').value = p.especialidad_requerida;
  document.getElementById('diagnostico').value = p.diagnostico_principal;
  document.getElementById('urgencia').value = p.nivel_urgencia;
  document.getElementById('estado').value = p.estado_lista;
  
  if (p.fecha_ingreso_lista) {
    document.getElementById('fechaIngreso').value = p.fecha_ingreso_lista.split('T')[0];
  }

  document.getElementById('detallesClinicos').value = JSON.stringify(p.detalles_clinicos || {}, null, 2);
  document.getElementById('modalTitulo').textContent = `Editar Paciente: ${p.nombre}`;

  if (modalBootstrap) modalBootstrap.show();
}

// 4. GUARDAR REGISTRO (POST / PUT)
async function guardarPaciente() {
  const id = document.getElementById('pacienteId').value;

  let detallesParsed = {};
  try {
    detallesParsed = JSON.parse(document.getElementById('detallesClinicos').value);
  } catch (e) {
    alert('El campo "Detalles Clínicos" debe ser un formato JSON válido.');
    return;
  }

  const payload = {
    cedula: document.getElementById('cedula').value,
    nombre: document.getElementById('nombre').value,
    provincia: document.getElementById('provincia').value,
    especialidad_requerida: document.getElementById('especialidad').value,
    diagnostico_principal: document.getElementById('diagnostico').value,
    nivel_urgencia: Number(document.getElementById('urgencia').value),
    estado_lista: document.getElementById('estado').value,
    fecha_ingreso_lista: document.getElementById('fechaIngreso').value,
    detalles_clinicos: detallesParsed
  };

  try {
    if (id) {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    if (modalBootstrap) modalBootstrap.hide();
    obtenerTodosLosPacientes();
  } catch (error) {
    // Si la API falla o no existe, actualiza de forma local en la tabla
    if (id) {
      const idx = listaPacientesLocal.findIndex(p => p._id === id);
      if (idx !== -1) listaPacientesLocal[idx] = { _id: id, ...payload };
    } else {
      listaPacientesLocal.push({ _id: Date.now().toString(), ...payload });
    }
    
    if (modalBootstrap) modalBootstrap.hide();
    renderizarTabla(listaPacientesLocal);
  }
}

// 5. ELIMINAR PACIENTE (DELETE)
async function eliminarPaciente(id) {
  if (!confirm('¿Está seguro de que desea eliminar este paciente de la lista?')) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    obtenerTodosLosPacientes();
  } catch (error) {
    listaPacientesLocal = listaPacientesLocal.filter(p => p._id !== id);
    renderizarTabla(listaPacientesLocal);
  }
}