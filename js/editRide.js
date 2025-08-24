// js/editRide.js
(function () {
  "use strict";

  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Helpers
  function safeJSON(key, fb) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fb; }
    catch { return fb; }
  }
  function getParamInt(name) {
    const v = new URLSearchParams(location.search).get(name);
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  function setSelectValue(select, value) {
    if (!select) return;
    const exists = Array.from(select.options).some(o => o.value === value || o.text === value);
    if (!exists && value) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      select.prepend(opt);
    }
    if (value) select.value = value;
  }
  function redirect(msg) {
    if (msg) alert(msg);
    location.href = "MyRides.html";
  }

  // DOM
  const form    = $("#ride-form");
  const fromEl  = $("#from");
  const toEl    = $("#to");
  const timeEl  = $("#time");
  const seatsEl = $("#seats");
  const feeEl   = $("#fee");

  // Vehicle (solo lectura)
  const makeEl  = $("#carMake");
  const modelEl = $("#carModel");
  const yearEl  = $("#carYear");

  // Cargar ride
  const idx   = getParamInt("ride");
  const rides = safeJSON("rides", []);
  const ride  = (idx !== null) ? rides[idx] : null;
  if (!ride) redirect("Ride not found.");

  // Guard: propietario
  const activeUser = (() => {
    try { return JSON.parse(sessionStorage.getItem("usuarioActivo")); }
    catch { return null; }
  })();
  if (!activeUser || activeUser.email !== ride.ownerEmail) {
    redirect("You cannot edit this ride.");
  }

  // Prefill
  fromEl.value  = ride.from  ?? "";
  toEl.value    = ride.to    ?? "";
  setSelectValue(timeEl, ride.time ?? "");
  seatsEl.value = ride.seats ?? "";
  feeEl.value   = ride.fee   ?? "";

  const car = ride.car || {};
  // vehiculo congelado
  makeEl.value  = car.brand ?? "";
  modelEl.value = car.model ?? "";
  yearEl.value  = (car.year ?? "").toString();

  // Days
  const dayCbs = $$(".day");
  const rideDays = Array.isArray(ride.days) ? ride.days : [];
  dayCbs.forEach(cb => { cb.checked = rideDays.includes(cb.value); });

  // Guardar (no cambia car)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const updated = {
      ...ride,
      from: fromEl.value.trim(),
      to: toEl.value.trim(),
      time: timeEl.value,
      seats: Number(seatsEl.value),
      fee: String(feeEl.value).trim(),
      days: dayCbs.filter(cb => cb.checked).map(cb => cb.value),
      // car se conserva tal cual estaba
      car: ride.car
    };

    rides[idx] = updated;
    localStorage.setItem("rides", JSON.stringify(rides));
    location.href = "MyRides.html";
  });
})();
