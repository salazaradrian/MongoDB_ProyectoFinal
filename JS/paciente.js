const API_URL = 'http://localhost:3000/api/pacientes';
let modalPacienteBS = null;


function getBootstrapModalInstance(modalElem) {
  const bs = (typeof window !== 'undefined' && window.bootstrap) ? window.bootstrap : (typeof bootstrap !== 'undefined' ? bootstrap : null);
  
  if (!bs || !bs.Modal) {
    console.error('Bootstrap no está definido en este entorno.');
    return null;
  }
  
  return bs.Modal.getInstance(modalElem) || new bs.Modal(modalElem);
}

document.addEventListener('DOMContentLoaded', () => {
  const modalElem = document.getElementById('modalPaciente');
  if (modalElem) {
    modalPacienteBS = getBootstrapModalInstance(modalElem);
  }
  cargarPacientes();
});

// 1. Cargar pacientes desde Atlas
async function cargarPacientes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error en el servidor backend.');

    const pacientes = await res.json();
    const tbody = document.getElementById('tabla-todos-pacientes');
    if (!tbody) return;

    if (!Array.isArray(pacientes) || pacientes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No hay pacientes registrados en MongoDB Atlas.</td></tr>`;
      return;
    }

    let html = '';
    pacientes.forEach(p => {
      html += `
        <tr>
          <td class="ps-4 fw-bold">${p.cedula || ''}</td>
          <td>${p.nombre || ''}</td>
          <td>${p.provincia || ''}</td>
          <td>${p.especialidad_requerida || ''}</td>
          <td>${p.diagnostico_principal || ''}</td>
          <td class="text-center">
            <span class="badge bg-${p.nivel_urgencia > 3 ? 'danger' : 'warning'}">
              ${p.nivel_urgencia || 1}
            </span>
          </td>
          <td><span class="badge bg-secondary">${p.estado_lista || 'En Espera'}</span></td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-primary me-1 btn-acciones" onclick="abrirModalEditar('${p._id}')" title="Editar">
              <i class="fa-solid fa-pen-to-square"></i> Editar
            </button>
            <button class="btn btn-sm btn-outline-danger btn-acciones" onclick="eliminarPaciente('${p._id}')" title="Eliminar">
              <i class="fa-solid fa-trash"></i> Eliminar
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
  }
}

// 2. Abrir modal para crear
function abrirModalCrear() {
  document.getElementById('formPaciente').reset();
  document.getElementById('pacienteId').value = '';
  document.getElementById('modalTitulo').textContent = 'Agregar Nuevo Paciente';
  
  const modalElem = document.getElementById('modalPaciente');
  const modal = getBootstrapModalInstance(modalElem);
  
  if (modal) {
    modal.show();
  } else {
    alert('Error: La librería de Bootstrap no ha terminado de cargar.');
  }
}

// 3. Abrir modal y cargar datos para EDITAR
async function abrirModalEditar(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('No se pudo obtener la información del paciente.');

    const p = await res.json();

    document.getElementById('pacienteId').value = p._id || '';
    document.getElementById('cedula').value = p.cedula || '';
    document.getElementById('nombre').value = p.nombre || '';
    document.getElementById('provincia').value = p.provincia || 'San José';
    document.getElementById('especialidad').value = p.especialidad_requerida || '';
    document.getElementById('diagnostico').value = p.diagnostico_principal || '';
    document.getElementById('urgencia').value = p.nivel_urgencia || 3;
    document.getElementById('estado').value = p.estado_lista || 'En Espera';

    if (p.fecha_ingreso_lista) {
      const fecha = new Date(p.fecha_ingreso_lista);
      if (!isNaN(fecha.getTime())) {
        document.getElementById('fechaIngreso').value = fecha.toISOString().split('T')[0];
      }
    } else {
      document.getElementById('fechaIngreso').value = '';
    }

    document.getElementById('detallesClinicos').value = p.detalles_clinicos 
      ? JSON.stringify(p.detalles_clinicos, null, 2) 
      : '';

    document.getElementById('modalTitulo').textContent = 'Editar Paciente';

    // Desplegar Modal de forma segura
    const modalElem = document.getElementById('modalPaciente');
    const modal = getBootstrapModalInstance(modalElem);
    
    if (modal) {
      modal.show();
    } else {
      alert('Error: No se pudo desplegar el modal de Bootstrap.');
    }
  } catch (error) {
    alert('Error al cargar paciente: ' + error.message);
  }
}

// 4. Guardar (POST o PUT)
async function guardarPaciente() {
  const id = document.getElementById('pacienteId').value;
  let detalles = {};

  try {
    const rawJSON = document.getElementById('detallesClinicos').value.trim();
    if (rawJSON) detalles = JSON.parse(rawJSON);
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
    detalles_clinicos: detalles
  };

  const fechaIngreso = document.getElementById('fechaIngreso').value;
  if (fechaIngreso) payload.fecha_ingreso_lista = fechaIngreso;

  const esEdicion = Boolean(id);
  const url = esEdicion ? `${API_URL}/${id}` : API_URL;
  const method = esEdicion ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      ocultarModal('modalPaciente');
      cargarPacientes();
    } else {
      const errData = await res.json();
      alert('Error: ' + (errData.error || 'No se pudieron guardar los cambios.'));
    }
  } catch (error) {
    alert('Error de conexión con el servidor.');
  }
}

// 5. Ocultar Modal
function ocultarModal(modalId) {
  const modalElem = document.getElementById(modalId);
  if (modalElem) {
    const modal = getBootstrapModalInstance(modalElem);
    if (modal) modal.hide();
  }
}

// 6. Eliminar
async function eliminarPaciente(id) {
  if (!confirm('¿Está seguro de eliminar este registro?')) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) cargarPacientes();
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
  }
}

// Exportar funciones al objeto global 'window' para que respondan a los onclick del HTML
window.cargarPacientes = cargarPacientes;
window.abrirModalCrear = abrirModalCrear;
window.abrirModalEditar = abrirModalEditar;
window.guardarPaciente = guardarPaciente;
window.ocultarModal = ocultarModal;
window.eliminarPaciente = eliminarPaciente;