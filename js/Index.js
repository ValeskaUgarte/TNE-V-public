let mapa;

function mostrarPantalla(id) {
  console.log('Cambiando a pantalla:', id);
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');

  if (id === 'sucursales') {
    iniciarMapaLeaflet();
  }
}

function iniciarMapaLeaflet() {
  const sucursales = [
    { nombre: "TNE Maipú", direccion: "Av. Los Pajaritos 4630, Maipú", lat: -33.502, lng: -70.757 },
    { nombre: "TNE Agustinas", direccion: "Agustinas 555, Santiago", lat: -33.437, lng: -70.650 },
    { nombre: "TNE Providencia", direccion: "Bucarest 215, Providencia", lat: -33.426, lng: -70.617 },
    { nombre: "TNE La Florida", direccion: "Av. Vicuña Mackenna 7492, La Florida", lat: -33.515, lng: -70.598 }
  ];

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        inicializarMapa(userLat, userLng, sucursales);
        mostrarSucursalesOrdenadas(userLat, userLng, sucursales);
      },
      () => {
        inicializarMapa(-33.4489, -70.6693, sucursales);
        mostrarSucursalesOrdenadas(-33.4489, -70.6693, sucursales);
      }
    );
  } else {
    inicializarMapa(-33.4489, -70.6693, sucursales);
    mostrarSucursalesOrdenadas(-33.4489, -70.6693, sucursales);
  }
}

function inicializarMapa(lat, lng, sucursales) {
  if (!mapa) {
    mapa = L.map('mapa', {
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      zoomControl: true,
      tap: true
    }).setView([lat, lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    L.marker([lat, lng]).addTo(mapa).bindPopup("Tu ubicación");

    sucursales.forEach(s => {
      L.marker([s.lat, s.lng]).addTo(mapa).bindPopup(`${s.nombre}<br>${s.direccion}`);
    });
  }
}

function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function mostrarSucursalesOrdenadas(userLat, userLng, sucursales) {
  const ahora = new Date();
  const hora = ahora.getHours();
  const diaSemana = ahora.getDay();
  
  const estaAbierta = (hora >= 9 && hora < 18) && (diaSemana >= 1 && diaSemana <= 5);
  
  const sucursalesConDistancia = sucursales.map(s => ({
    ...s,
    distancia: calcularDistancia(userLat, userLng, s.lat, s.lng)
  })).sort((a, b) => a.distancia - b.distancia);

  const lista = document.querySelector(".lista-sucursales ul");
  lista.innerHTML = "";
  sucursalesConDistancia.forEach(s => {
    const li = document.createElement("li");
    const estado = estaAbierta ? '<span class="sucursal-abierta">● Abierta</span>' : '<span class="sucursal-cerrada">● Cerrada</span>';
    li.innerHTML = `<strong>${s.nombre}</strong><br>${s.direccion}<br>${s.distancia.toFixed(1)} km · ${estado}`;
    lista.appendChild(li);
  });
}

function cargarConBanco(banco) {
  const monto = document.getElementById('monto').value;
  
  if (!monto || monto < 500) {
    alert('Ingrese un monto válido (mínimo $500)');
    return;
  }
  
  const saldoActual = parseInt(document.getElementById('saldoActual').textContent.replace('$', '').replace('.', ''));
  const nuevoSaldo = saldoActual + parseInt(monto);
  
  // URLs de los bancos
  const urlsBancos = {
    'BancoEstado': 'https://www.bancoestado.cl',
    'Santander': 'https://www.santander.cl',
    'BCI': 'https://www.bci.cl',
    'Falabella': 'https://www.bancofalabella.cl'
  };
  
  // Actualizar saldo
  document.getElementById('saldoActual').textContent = '$' + nuevoSaldo.toLocaleString('es-CL');
  document.getElementById('saldoBoton').textContent = '$' + nuevoSaldo.toLocaleString('es-CL');
  
  // Agregar al historial
  const fecha = new Date().toLocaleDateString('es-CL');
  const historial = document.getElementById('historialLista');
  const nuevoItem = document.createElement('li');
  nuevoItem.textContent = `$${parseInt(monto).toLocaleString('es-CL')} · ${banco} · ${fecha}`;
  historial.insertBefore(nuevoItem, historial.firstChild);
  
  // Redirigir al banco
  alert(`Redirigiendo a ${banco} para completar la carga de $${parseInt(monto).toLocaleString('es-CL')}`);
  window.open(urlsBancos[banco], '_blank');
  
  // Limpiar input
  document.getElementById('monto').value = '';
}

function iniciarSesion() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (!email || !password) {
    alert('Por favor completa todos los campos');
    return;
  }
  
  localStorage.setItem('usuarioLogueado', 'true');
  localStorage.setItem('userEmail', email);
  
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  
  mostrarPantalla('inicio');
}

function registrarUsuario() {
  const nombre = document.getElementById('reg-nombre').value;
  const rut = document.getElementById('reg-rut').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const terminos = document.getElementById('reg-terminos').checked;
  
  if (!nombre || !rut || !email || !password || !confirm) {
    alert('Por favor completa todos los campos');
    return;
  }
  
  if (password !== confirm) {
    alert('Las contraseñas no coinciden');
    return;
  }
  
  if (password.length < 8) {
    alert('La contraseña debe tener al menos 8 caracteres');
    return;
  }
  
  if (!terminos) {
    alert('Debes aceptar los términos y condiciones');
    return;
  }
  
  localStorage.setItem('usuarioLogueado', 'true');
  localStorage.setItem('userEmail', email);
  localStorage.setItem('userNombre', nombre);
  
  document.getElementById('reg-nombre').value = '';
  document.getElementById('reg-rut').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-password').value = '';
  document.getElementById('reg-confirm').value = '';
  document.getElementById('reg-terminos').checked = false;
  
  alert('¡Cuenta creada exitosamente!');
  mostrarPantalla('inicio');
}

function recuperarContrasena() {
  const email = document.getElementById('recovery-email').value;
  
  if (!email) {
    alert('Por favor ingresa tu correo electrónico');
    return;
  }
  
  alert(`Se ha enviado un enlace de recuperación a: ${email}`);
  document.getElementById('recovery-email').value = '';
  mostrarPantalla('login');
}

function cerrarSesion() {
  localStorage.removeItem('usuarioLogueado');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userNombre');
  mostrarPantalla('login');
}

function iniciarContadorReposicion() {
  const fechaObjetivo = new Date();
  fechaObjetivo.setDate(fechaObjetivo.getDate() + 5);
  
  function actualizarContador() {
    const ahora = new Date().getTime();
    const diferencia = fechaObjetivo - ahora;
    
    if (diferencia > 0) {
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      
      const diasElement = document.getElementById('dias');
      const horasElement = document.getElementById('horas');
      const minutosElement = document.getElementById('minutos');
      
      if (diasElement) diasElement.textContent = dias.toString().padStart(2, '0');
      if (horasElement) horasElement.textContent = horas.toString().padStart(2, '0');
      if (minutosElement) minutosElement.textContent = minutos.toString().padStart(2, '0');
    }
  }
  
  actualizarContador();
  setInterval(actualizarContador, 60000);
}

// SOLO UN EVENT LISTENER - AL FINAL
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== TNE MÓVIL INICIADA ===');
  
  // Configurar formulario de bloqueo
  const formBloqueo = document.getElementById('formBloqueo');
  if (formBloqueo) {
    formBloqueo.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const motivo = document.getElementById('motivo').value;
      const descripcion = document.getElementById('descripcion').value;
      const confirmar = document.getElementById('confirmar').checked;
      
      if (!confirmar) {
        alert('Debes confirmar que los datos son correctos');
        return;
      }
      
      alert('✅ Tarjeta física bloqueada exitosamente.');
      mostrarPantalla('inicio');
      formBloqueo.reset();
    });
  }
  
  // Iniciar contador
  iniciarContadorReposicion();
  
  // VERIFICACIÓN SIMPLE - Sin timeouts
  const usuarioLogueado = localStorage.getItem('usuarioLogueado');
  if (usuarioLogueado === 'true') {
    mostrarPantalla('inicio');
  } else {
    mostrarPantalla('login');
  }
});