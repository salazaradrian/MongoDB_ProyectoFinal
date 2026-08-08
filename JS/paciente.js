const API_URL = 'http://localhost:3000/api/pacientes';

let pacienteActual = null;

document.addEventListener('DOMContentLoaded', () => {
  obtenerTodosLosPacientes();
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

function abrirModalCrear() {
  document.getElementById('formPaciente').reset();
  document.getElementById('pacienteId').value = '';
  document.getElementById('modalTitulo').textContent = 'Agregar Nuevo Paciente';
  mostrarModal('modalPaciente');
}

function parsearDetallesClinicos() {
  const texto = document.getElementById('detallesClinicos').value.trim();
  if (!texto) return {};

  try {
    return JSON.parse(texto);
  } catch (error) {
    return { texto_libre: texto };
  }
}

async function guardarPaciente() {
  const form = document.getElementById('formPaciente');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const payload = {
    cedula: document.getElementById('cedula').value.trim(),
    nombre: document.getElementById('nombre').value.trim(),
    provincia: document.getElementById('provincia').value,
    especialidad_requerida: document.getElementById('especialidad').value.trim(),
    diagnostico_principal: document.getElementById('diagnostico').value.trim(),
    nivel_urgencia: Number(document.getElementById('urgencia').value),
    estado_lista: document.getElementById('estado').value,
    fecha_ingreso_lista: document.getElementById('fechaIngreso').value
      ? new Date(document.getElementById('fechaIngreso').value).toISOString()
      : new Date().toISOString(),
    detalles_clinicos: parsearDetallesClinicos()
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    ocultarModal('modalPaciente');
    obtenerTodosLosPacientes();
  } catch (error) {
    console.error('No se pudo guardar el paciente:', error);
    alert('No se pudo guardar el paciente. Revise que el backend esté disponible.');
  }
}

async function obtenerTodosLosPacientes() {
  const tablaBody = document.getElementById('tabla-todos-pacientes');

  try {
    const res = await fetch(API_URL);
    let pacientes = await res.json();

    if (!Array.isArray(pacientes)) {
      pacientes = [];
    }

    tablaBody.innerHTML = '';

    if (pacientes.length === 0) {
      tablaBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted p-4">No hay pacientes registrados todavía.</td></tr>';
      return;
    }

    pacientes.forEach(p => {
      let badgeEstado = 'bg-secondary';
      if (p.estado_lista === 'Notificado') badgeEstado = 'bg-warning text-dark';
      if (p.estado_lista === 'Asignado') badgeEstado = 'bg-success';
      if (p.estado_lista === 'Rechazado') badgeEstado = 'bg-danger';

      let detallesTexto = 'Sin especificaciones';
      if (p.detalles_clinicos && typeof p.detalles_clinicos === 'object' && Object.keys(p.detalles_clinicos).length > 0) {
        detallesTexto = Object.entries(p.detalles_clinicos)
          .map(([key, val]) => `${key}: ${val}`)
          .join(' | ');
      }

      tablaBody.innerHTML += `
        <tr>
          <td class="ps-4"><strong>${p.cedula || 'N/A'}</strong></td>
          <td class="fw-semibold">${p.nombre || 'Sin nombre'}</td>
          <td>${p.provincia || 'Sin registrar'}</td>
          <td>${p.especialidad_requerida || 'Sin especialidad'}</td>
          <td>${p.diagnostico_principal || 'Sin diagnóstico'}</td>
          <td class="text-center"><span class="badge bg-danger fs-6">${p.nivel_urgencia || 0}/5</span></td>
          <td><span class="badge ${badgeEstado} px-3 py-2">${p.estado_lista || 'En Espera'}</span></td>
          <td class="d-none"><small>${detallesTexto}</small></td>
        </tr>
      `;
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    tablaBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger p-3">Error al conectar con la API de MongoDB.</td></tr>';
  }
}