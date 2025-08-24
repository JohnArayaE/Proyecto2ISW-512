// js/editProfile.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".profile-form");

  const firstNameEl = document.getElementById("first-name");
  const lastNameEl  = document.getElementById("last-name");
  const emailEl     = document.getElementById("email");
  const passEl      = document.getElementById("password");
  const pass2El     = document.getElementById("repeat-password");
  const addressEl   = document.getElementById("address");
  const countryEl   = document.getElementById("country");
  const stateEl     = document.getElementById("state");
  const cityEl      = document.getElementById("city");
  const phoneEl     = document.getElementById("phone");

  const safe = (s, fb) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  // === Usuario activo (obligatorio) ===
  const active = safe(sessionStorage.getItem("usuarioActivo"), null);
  if (!active || !active.email) {
    console.warn("No active user in sessionStorage.usuarioActivo");
    [...form.elements].forEach(el => el.disabled = true);
    return;
  }

  // === Buscar usuario por email (o ownerEmail) ===
  const users = safe(localStorage.getItem("users"), []);
  const findIndexByEmail = (email) =>
    users.findIndex(u => String(u?.email || u?.ownerEmail || "")
      .toLowerCase() === String(email).toLowerCase());
  let idx = findIndexByEmail(active.email);

  // Si no existe, lo creamos al guardar. Para prefill usamos sesión.
  const user = idx >= 0 ? users[idx] : {};

  // === Prefill (si faltan campos en conductores, se verán vacíos) ===
  firstNameEl.value = user.firstname ?? active.firstname ?? "";
  lastNameEl.value  = user.lastname  ?? active.lastname  ?? "";
  emailEl.value     = (user.email ?? active.email) || "";
  addressEl.value   = user.address   ?? active.address   ?? "";
  countryEl.value   = user.country   ?? active.country   ?? countryEl.value;
  stateEl.value     = user.state     ?? active.state     ?? "";
  cityEl.value      = user.city      ?? active.city      ?? "";
  phoneEl.value     = user.phone     ?? active.phone     ?? "";

  // === Guardar ===
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Valida contraseña SOLO si se intenta cambiar
    const p1 = passEl.value.trim();
    const p2 = pass2El.value.trim();
    if ((p1 || p2) && p1 !== p2) {
      alert("Passwords do not match.");
      return;
    }

    // Campos a actualizar/crear (para conductores que no los tenían)
    const updates = {
      email    : active.email, // email es la llave; no cambia
      firstname: firstNameEl.value.trim(),
      lastname : lastNameEl.value.trim(),
      address  : addressEl.value.trim(),
      country  : countryEl.value,
      state    : stateEl.value.trim(),
      city     : cityEl.value.trim(),
      phone    : phoneEl.value.trim(),
    };
    if (p1) updates.password = p1; // solo si se ingresó

    // Si el usuario NO existe en localStorage.users (caso conductor), lo creamos preservando lo que tenga en sesión
    if (idx < 0) {
      const baseFromSession = {
        // preserva flags/datos existentes del conductor
        driver : !!active.driver,
        car    : active.car ?? undefined,
        // otros posibles campos que quieras preservar:
        idNumber : active.idNumber ?? undefined,
        birthdate: active.birthdate ?? undefined,
      };
      users.push({ ...baseFromSession, ...updates });
      idx = users.length - 1;
    } else {
      // Mezcla con lo existente (crea los que faltaban y actualiza los presentes)
      users[idx] = { ...users[idx], ...updates };
    }

    // Persistir en localStorage
    localStorage.setItem("users", JSON.stringify(users));

    // Actualizar también la sesión (crea si faltaba, actualiza si existía)
    const newActive = { ...active, ...updates };
    sessionStorage.setItem("usuarioActivo", JSON.stringify(newActive));

    alert("Profile updated.");
    passEl.value = "";
    pass2El.value = "";
  });
});
