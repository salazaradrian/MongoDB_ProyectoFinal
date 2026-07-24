// URL base de la API (Ajusta la ruta según los endpoints definidos en el backend)
const API_URL = 'http://localhost:3000/api/pacientes'; 

let pacienteActual = null;
let tiempoRestante = 15 * 60; // 15 minutos en segundos
let intervaloTimer = null;

// Cargar datos en cuanto el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Carga un paciente inicial por defecto para demostración
  cargarPacientePorCedula('112340567');
  
  // Cargar el registro general de MongoDB en la tabla inferior
  obtenerTodosLosPacientes();
});

// -------------------------------------------------------------------
// 1. CARGAR PACIENTE ESPECÍFICO (Ficha Superior)
// -------------------------------------------------------------------
async function cargarPacientePorCedula(cedulaDada) {
  const inputCedula = document.getElementById('input-cedula');
  const cedula = cedulaDada || (inputCedula ? inputCedula.value : '');

  try {
    const res = await fetch(`${API_URL}?cedula=${cedula}`);
    const data = await res.json();

    // Validar si la respuesta es un array o un objeto único
    pacienteActual = Array.isArray(data) ? data[0] : data;

    // SI NO HAY CONEXIÓN O NO EXISTE EL REGISTRO, CARGAMOS UN MOCK DE PRUEBA
    if (!pacienteActual || !pacienteActual.nombre) {
      pacienteActual = {
        _id: "64b1f28e3a9a8d0012f3e8a1",
        nombre: "Amabia Robesca",
        cedula: cedula || "112340567",
        ubicacion: { type: "Point", coordinates: [-84.4271, 10.3238] },
        provincia: "Alajuela",
        especialidad_requerida: "Ortopedia",
        diagnostico_principal: "Artrosis severa de rodilla derecha",
        estado_lista: "Notificado", // Opciones: 'En Espera', 'Notificado', 'Asignado', 'Rechazado'
        fecha_ingreso_lista: "2026-01-15T00:00:00.000Z",
        nivel_urgencia: 4,
        detalles_clinicos: {
          articulacion: "Rodilla Derecha",
          requiere_protesis: true,
          material_protesis: "Titanio Biomédico",
          movilidad_restringida_porcentaje: "75%"
        }
      };
    }

    renderizarFichaPaciente(pacienteActual);

  } catch (error) {
    console.error("Error al obtener paciente:", error);
  }
}

// -------------------------------------------------------------------
// 2. RENDERIZAR FICHA DE DATOS Y DETALLES POLIMÓRFICOS
// -------------------------------------------------------------------
function renderizarFichaPaciente(p) {
  // Datos principales
  document.getElementById('nombre-paciente').textContent = p.nombre;
  document.getElementById('cedula-paciente').textContent = `Cédula: ${p.cedula}`;
  document.getElementById('especialidad').textContent = p.especialidad_requerida;
  document.getElementById('provincia').textContent = p.provincia;
  document.getElementById('diagnostico').textContent = p.diagnostico_principal;
  document.getElementById('urgencia-nivel').textContent = `Nivel ${p.nivel_urgencia}/5`;

  // Formatear Fecha
  if (p.fecha_ingreso_lista) {
    const fecha = new Date(p.fecha_ingreso_lista);
    document.getElementById('fecha-ingreso').textContent = fecha.toLocaleDateString();
  }

  // Badge de Estado
  const badgeEstado = document.getElementById('badge-estado');
  badgeEstado.textContent = p.estado_lista;
  
  if (p.estado_lista === 'Notificado') {
    badgeEstado.className = "badge bg-warning text-dark badge-estado";
  } else if (p.estado_lista === 'Asignado') {
    badgeEstado.className = "badge bg-success badge-estado";
  } else if (p.estado_lista === 'Rechazado') {
    badgeEstado.className = "badge bg-danger badge-estado";
  } else {
    badgeEstado.className = "badge bg-secondary badge-estado";
  }

  // Renderizar Subdocumento Polimórfico (detalles_clinicos)
  renderizarDetallesPolimorficos(p.detalles_clinicos);

  // Manejo de Banner de Alerta según el estado
  const bannerAlerta = document.getElementById('banner-alerta');
  const confirmacion = document.getElementById('pantalla-confirmacion');

  confirmacion.classList.add('d-none'); // Ocultar mensajes previos

  if (p.estado_lista === 'Notificado') {
    bannerAlerta.classList.remove('d-none');
    tiempoRestante = 15 * 60; // Reiniciar a 15 minutos
    iniciarCronometro();
  } else {
    bannerAlerta.classList.add('d-none');
    clearInterval(intervaloTimer);
  }
}

// -------------------------------------------------------------------
// 3. RENDERIZAR ATRIBUTOS VARIABLES (POLIMORFISMO MONGODB)
// -------------------------------------------------------------------
function renderizarDetallesPolimorficos(detalles) {
  const contenedor = document.getElementById('contenedor-polimorfico');
  contenedor.innerHTML = '';

  if (!detalles || Object.keys(detalles).length === 0) {
    contenedor.innerHTML = '<em class="text-muted">Sin detalles específicos registrados.</em>';
    return;
  }

  // Recorrer dinámicamente las claves del subdocumento
  for (const [clave, valor] of Object.entries(detalles)) {
    const claveFormateada = clave.replace(/_/g, ' ').toUpperCase();
    
    let valorFormateado = valor;
    if (typeof valor === 'boolean') {
      valorFormateado = valor ? 'Sí ✅' : 'No ❌';
    }

    contenedor.innerHTML += `
      <div class="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
        <span class="text-muted small fw-semibold">${claveFormateada}:</span>
        <strong class="text-dark fs-6">${valorFormateado}</strong>
      </div>
    `;
  }
}

// -------------------------------------------------------------------
// 4. CRONÓMETRO EN TIEMPO REAL
// -------------------------------------------------------------------
function iniciarCronometro() {
  const displayTimer = document.getElementById('cronometro');
  clearInterval(intervaloTimer);

  intervaloTimer = setInterval(() => {
    let min = Math.floor(tiempoRestante / 60);
    let seg = tiempoRestante % 60;

    displayTimer.textContent = `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;

    if (tiempoRestante <= 0) {
      clearInterval(intervaloTimer);
      responderOferta('Expirado');
    } else {
      tiempoRestante--;
    }
  }, 1000);
}

// -------------------------------------------------------------------
// 5. RESPONDER Y ACTUALIZAR ESTADO EN MONGODB (PUT)
// -------------------------------------------------------------------
async function responderOferta(nuevoEstado) {
  clearInterval(intervaloTimer);

  try {
    await fetch(`${API_URL}/${pacienteActual._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_lista: nuevoEstado })
    });
  } catch (e) {
    console.log("Simulando actualización local...");
  }

  // Actualizar objeto local y reflejar vista
  pacienteActual.estado_lista = nuevoEstado;
  
  document.getElementById('banner-alerta').classList.add('d-none');
  
  const confirmacion = document.getElementById('pantalla-confirmacion');
  confirmacion.classList.remove('d-none');

  const icono = document.getElementById('icono-resultado');
  const titulo = document.getElementById('titulo-resultado');
  const mensaje = document.getElementById('mensaje-resultado');

  if (nuevoEstado === 'Asignado') {
    confirmacion.className = "alert alert-success text-center p-4 mb-4 shadow-sm";
    icono.innerHTML = '<i class="fa-solid fa-circle-check text-success display-4"></i>';
    titulo.textContent = '¡Quirófano Reservado Exitosamente!';
    mensaje.textContent = 'La confirmación ha sido notificada a la central hospitalaria de la CCSS.';
  } else {
    confirmacion.className = "alert alert-warning text-center p-4 mb-4 shadow-sm";
    icono.innerHTML = '<i class="fa-solid fa-circle-xmark text-warning display-4"></i>';
    titulo.textContent = 'Cupo Declinado';
    mensaje.textContent = 'Has rechazado la oportunidad. El sistema avanzará al siguiente candidato sin mover tu lugar prioritario.';
  }

  // Actualizar también la tabla inferior
  obtenerTodosLosPacientes();
}

// -------------------------------------------------------------------
// 6. OBTENER Y MOSTRAR TODOS LOS PACIENTES EN LA TABLA ANCHA
// -------------------------------------------------------------------
async function obtenerTodosLosPacientes() {
  const tablaBody = document.getElementById('tabla-todos-pacientes');

  try {
    const res = await fetch(API_URL);
    let pacientes = await res.json();

    // MOCK SI NO HAY DATOS DE BACKEND AÚN
    if (!Array.isArray(pacientes) || pacientes.length === 0) {
      pacientes = [
        {
          _id: "64b1f28e3a9a8d0012f3e8a1",
          cedula: "112340567",
          nombre: "Amabia Robesca",
          especialidad_requerida: "Ortopedia",
          nivel_urgencia: 4,
          estado_lista: "Notificado",
          detalles_clinicos: { articulacion: "Rodilla", requiere_protesis: true, material: "Titanio" }
        },
        {
          _id: "64b1f28e3a9a8d0012f3e8a2",
          cedula: "205550123",
          nombre: "Carlos Alvarado",
          especialidad_requerida: "Oftalmología",
          nivel_urgencia: 2,
          estado_lista: "En Espera",
          detalles_clinicos: { ojo: "Izquierdo", dioptrias: 3.5, catarata: true }
        },
        {
          _id: "64b1f28e3a9a8d0012f3e8a3",
          cedula: "304440899",
          nombre: "Elena Gómez",
          especialidad_requerida: "Cardiología",
          nivel_urgencia: 5,
          estado_lista: "Asignado",
          detalles_clinicos: { marcapasos: true, fraccion_eyeccion: "45%" }
        }
      ];
    }

    tablaBody.innerHTML = '';

    pacientes.forEach(p => {
      // Badge para la tabla
      let badgeEstado = 'bg-secondary';
      if (p.estado_lista === 'Notificado') badgeEstado = 'bg-warning text-dark';
      if (p.estado_lista === 'Asignado') badgeEstado = 'bg-success';
      if (p.estado_lista === 'Rechazado') badgeEstado = 'bg-danger';

      // Formatear subdocumento polimórfico a texto de línea
      let detallesTexto = 'Sin especificaciones';
      if (p.detalles_clinicos) {
        detallesTexto = Object.entries(p.detalles_clinicos)
          .map(([key, val]) => `<span class="text-primary fw-semibold">${key}:</span> ${val}`)
          .join(' | ');
      }

      tablaBody.innerHTML += `
        <tr>
          <td class="ps-4"><strong>${p.cedula}</strong></td>
          <td class="fw-semibold">${p.nombre}</td>
          <td>${p.especialidad_requerida}</td>
          <td class="text-center"><span class="badge bg-danger fs-6">${p.nivel_urgencia}/5</span></td>
          <td><span class="badge ${badgeEstado} px-3 py-2">${p.estado_lista}</span></td>
          <td><small>${detallesTexto}</small></td>
          <td class="text-center pe-4">
            <button class="btn btn-sm btn-outline-primary fw-bold" onclick="cargarPacientePorCedula('${p.cedula}')">
              <i class="fa-solid fa-eye me-1"></i> Ver Ficha
            </button>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    console.error('Error al obtener la lista general:', error);
    tablaBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger p-3">Error al conectar con la API de MongoDB.</td></tr>`;
  }
}