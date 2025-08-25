// js/rideDetails.js
(function () {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const getJSON = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };

  const driverNameEl = $("#driverName");
  const fromTxtEl = $("#fromTxt");
  const toTxtEl   = $("#toTxt");
  const daysBox   = $("#daysBox");
  const timeEl    = $("#time");
  const seatsEl   = $("#seats");
  const feeEl     = $("#fee");
  const makeEl    = $("#make");
  const modelEl   = $("#model");
  const yearEl    = $("#year");
  const btnCancel = $("#btnCancel");
  const btnReq    = $("#btnRequest");

  // 1) Preferimos SNAPSHOT exacto del click
  let ride = null;
  const snapRaw = sessionStorage.getItem("selectedRideSnapshot");
  if (snapRaw) { try { ride = JSON.parse(snapRaw); } catch {} }

  // 2) Si no hay snapshot, usamos el índice de la URL (?i=)
  if (!ride) {
    const sp = new URLSearchParams(location.search);
    const idxParam = sp.get("i");
    if (idxParam !== null) {
      const idx = Number.parseInt(idxParam, 10);
      const rides = getJSON("rides", []);
      if (Number.isFinite(idx) && rides[idx]) {
        ride = rides[idx];
        // guardamos respaldo
        sessionStorage.setItem("selectedRideIndex", String(idx));
        sessionStorage.setItem("selectedRideSnapshot", JSON.stringify(ride));
      }
    }
  }

  // 3) Extra respaldo por índice en sesión
  if (!ride) {
    const idx = Number(sessionStorage.getItem("selectedRideIndex"));
    const rides = getJSON("rides", []);
    if (Number.isFinite(idx) && rides[idx]) ride = rides[idx];
  }

  if (!ride) { alert("No ride selected."); location.href = "SearhRides.html"; return; }

  // --- Pintado en solo lectura ---
  const users = getJSON("users", []);
  const byEmail = new Map(users.map(u => [String(u.email || "").toLowerCase(), u]));
  const ownerEmail = String(ride.ownerEmail || "").toLowerCase();
  const owner = byEmail.get(ownerEmail);
  const displayName =
    (owner && [owner.firstname, owner.lastname].filter(Boolean).join(" ").trim()) ||
    (ownerEmail ? ownerEmail.split("@")[0] : "Driver");
  driverNameEl.textContent = displayName || "";

  fromTxtEl.textContent = ride.from ?? "";
  toTxtEl.textContent   = ride.to   ?? "";

  const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const setDays = new Set(Array.isArray(ride.days) ? ride.days : []);
  daysBox.innerHTML = "";
  DAYS.forEach(d => {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.value = d; cb.disabled = true; cb.checked = setDays.has(d);
    label.appendChild(cb); label.append(" " + d);
    daysBox.appendChild(label);
  });

  timeEl.type = "text";
  timeEl.value = String(ride.time || "");
  timeEl.readOnly = true;

  seatsEl.value = ride.seats ?? "";
  seatsEl.readOnly = true;

  feeEl.value = ride.fee ?? "";
  feeEl.readOnly = true;

  const car = ride.car || {};
  makeEl.value  = car.brand ?? "";
  modelEl.value = car.model ?? "";
  yearEl.value  = car.year  ?? "";
  [makeEl, modelEl, yearEl].forEach(i => i.readOnly = true);

  // --- Acciones ---
  btnCancel?.addEventListener("click", (e) => { e.preventDefault(); history.back(); });

  btnReq?.addEventListener("click", (e) => {
    e.preventDefault();

    const active = JSON.parse(sessionStorage.getItem("usuarioActivo") || "null");
    if (!active || !active.email) { alert("Please log in to request this ride."); return; }
    if (String(active.email).toLowerCase() === ownerEmail) { alert("You can't request your own ride."); return; }

    const bookings = getJSON("bookings", []);
    bookings.push({
      id: 'b_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6),
      clientEmail: active.email,
      rideOwnerEmail: ride.ownerEmail,
      ride: ride,
      status: "pending",
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("bookings", JSON.stringify(bookings));
    location.href = "Bookings.html";
  });
})();
