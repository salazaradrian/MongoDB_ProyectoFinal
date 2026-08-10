// Variable global para conservar los datos originales (como ubicacion GeoJSON)
let pacienteActual = null;

// 1. Cargar paciente y guardar copia
async function abrirModalEditar(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('No se pudo obtener el paciente.');

    pacienteActual = await res.json(); // Guardamos el documento original completo

    document.getElementById('pacienteId').value = pacienteActual._id || '';
    document.getElementById('cedula').value = pacienteActual.cedula || '';
    document.getElementById('nombre').value = pacienteActual.nombre || '';
    document.getElementById('provincia').value = pacienteActual.provincia || 'San José';
    document.getElementById('especialidad').value = pacienteActual.especialidad_requerida || '';
    document.getElementById('diagnostico').value = pacienteActual.diagnostico_principal || '';
    document.getElementById('urgencia').value = pacienteActual.nivel_urgencia || 3;
    document.getElementById('estado').value = pacienteActual.estado_lista || 'En Espera';

    if (pacienteActual.fecha_ingreso_lista) {
      const fecha = new Date(pacienteActual.fecha_ingreso_lista);
      if (!isNaN(fecha.getTime())) {
        document.getElementById('fechaIngreso').value = fecha.toISOString().split('T')[0];
      }
    } else {
      document.getElementById('fechaIngreso').value = '';
    }

    document.getElementById('detallesClinicos').value = pacienteActual.detalles_clinicos 
      ? JSON.stringify(pacienteActual.detalles_clinicos, null, 2) 
      : '';

    document.getElementById('modalTitulo').textContent = 'Editar Paciente';

    const modalElem = document.getElementById('modalPaciente');
    const modal = getBootstrapModalInstance(modalElem);
    if (modal) modal.show();
  } catch (error) {
    alert('Error al cargar paciente: ' + error.message);
  }
}

// 2. Guardar incluyendo los campos requeridos por el Schema de Atlas
async function guardarPaciente() {
  const id = document.getElementById('pacienteId').value;
  let detalles = {};

  const rawJSON = document.getElementById('detallesClinicos').value.trim();
  if (rawJSON) {
    try {
      detalles = JSON.parse(rawJSON);
    } catch (e) {
      alert('El campo "Detalles Clínicos" debe ser un formato JSON válido.');
      return;
    }
  }

  // Si estamos editando, conservamos el objeto 'ubicacion' original para no violar la validación
  const payload = {
    cedula: document.getElementById('cedula').value.trim(),
    nombre: document.getElementById('nombre').value.trim(),
    provincia: document.getElementById('provincia').value,
    especialidad_requerida: document.getElementById('especialidad').value.trim(),
    diagnostico_principal: document.getElementById('diagnostico').value.trim(),
    nivel_urgencia: Number(document.getElementById('urgencia').value) || 1,
    estado_lista: document.getElementById('estado').value,
    detalles_clinicos: detalles,
    // ¡IMPORTANTE! Reutiliza la ubicación geográfica si ya existe
    ubicacion: (id && pacienteActual && pacienteActual.ubicacion) ? pacienteActual.ubicacion : {
      type: "Point",
      coordinates: [-84.0907, 9.9281] // Coordenadas por defecto (San José) si es un registro nuevo
    }
  };

  const fechaIngreso = document.getElementById('fechaIngreso').value;
  if (fechaIngreso) {
    payload.fecha_ingreso_lista = new Date(fechaIngreso).toISOString();
  }

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
      console.error('Error Atlas:', errData);
      alert('Error de validación en MongoDB Atlas: ' + (errData.error || errData.message || 'Verifica los campos requeridos.'));
    }
  } catch (error) {
    alert('Error de conexión con el servidor.');
  }
}