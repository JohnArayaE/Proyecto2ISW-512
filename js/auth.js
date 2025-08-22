// js/auth.js

// ---- Helpers ----
function getActiveUser() {
  try {
    return JSON.parse(sessionStorage.getItem('usuarioActivo'));
  } catch (e) {
    return null;
  }
}

// Oculta enlaces de Rides/NewRide si no es driver
function setupNavbarVisibility() {
  const user = getActiveUser();
  const ridesLinks = document.querySelectorAll(
    'a[href$="MyRides.html"], a[href$="NewRide.html"]'
  );

  ridesLinks.forEach(a => {
    if (!user || !user.driver) {
      a.style.display = 'none'; // ocultar para clientes o si no hay sesión
    }
  });
}

// Exigir que exista sesión (para páginas privadas en general)
function requireLogin() {
  const user = getActiveUser();
  if (!user) {
    window.location.href = 'index.html';
  }
}

// Exigir conductor (driver=true) para páginas de rides
function requireDriver() {
  const user = getActiveUser();
  if (!user) {
    window.location.href = 'index.html'; // sin sesión -> login
    return;
  }
  if (!user.driver) {
    window.location.href = 'SearhRides.html'; // cliente -> fuera
  }
}

// Ejecuta ocultamiento de enlaces en cualquier página con navbar
document.addEventListener('DOMContentLoaded', setupNavbarVisibility);
