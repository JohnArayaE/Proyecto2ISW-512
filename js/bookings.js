// js/bookings.js
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("bookingsBody");
  const actionHeader = document.getElementById("actionHeader");

  const users = readJSON("users", []);
  const userByEmail = new Map(users.map(u => [String(u.email || "").toLowerCase(), u]));

  const active = readSession("usuarioActivo");
  if (!active || !active.email) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No user logged in.</td></tr>`;
    return;
  }

  const isDriver = !!active.driver;
  const all = readJSON("bookings", []);

  // Filtro por rol
  const mine = isDriver
    ? all.filter(b => eqEmail(b.rideOwnerEmail, active.email))
    : all.filter(b => eqEmail(b.clientEmail, active.email));

  // Encabezado dinámico
  actionHeader.textContent = isDriver ? "Accept / Reject" : "Status";

  if (mine.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No bookings found.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  mine.forEach(b => {
    const tr = document.createElement("tr");

    // Columna usuario: para cliente mostramos CONDUCTOR; para conductor mostramos CLIENTE
    const peerEmail = isDriver ? b.clientEmail : b.rideOwnerEmail;
    const peerUser = userByEmail.get(String(peerEmail || "").toLowerCase());
    const peerName = peerUser
      ? [peerUser.firstname, peerUser.lastname].filter(Boolean).join(" ").trim() || peerUser.email
      : (peerEmail || "User");

    const rideText = `${b.ride?.from || ""} - ${b.ride?.to || ""}`;

    const tdUser = document.createElement("td");
    tdUser.innerHTML = `<img src="img/icon-user.png" class="table-icon" alt=""><strong>${escapeHtml(peerName)}</strong>`;

    const tdRide = document.createElement("td");
    tdRide.textContent = rideText;

    const tdAction = document.createElement("td");

    if (isDriver) {
      // Conductor: acciones si está pendiente
      if (b.status === "pending") {
        const aAcc = document.createElement("a");
        aAcc.href = "#"; aAcc.textContent = "Accept";
        aAcc.addEventListener("click", (e) => { e.preventDefault(); updateStatus(b.id, "accepted"); });

        const sep = document.createTextNode(" | ");

        const aRej = document.createElement("a");
        aRej.href = "#"; aRej.textContent = "Reject";
        aRej.addEventListener("click", (e) => { e.preventDefault(); updateStatus(b.id, "rejected"); });

        tdAction.append(aAcc, sep, aRej);
      } else {
        tdAction.textContent = statusPretty(b.status);
      }
    } else {
      // Cliente: solo estado
      tdAction.textContent = statusPretty(b.status);
      tdAction.className = `status-${b.status}`;
    }

    tr.append(tdUser, tdRide, tdAction);
    tbody.appendChild(tr);
  });

  // --- helpers ---
  function updateStatus(id, newStatus) {
    const list = readJSON("bookings", []);
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return;
    list[idx].status = newStatus;
    localStorage.setItem("bookings", JSON.stringify(list));
    location.reload();
  }

  function statusPretty(s) {
    switch ((s || "").toLowerCase()) {
      case "pending":  return "Pendiente";
      case "accepted": return "Aceptado";
      case "rejected": return "Rechazado";
      default:         return s || "--";
    }
  }

  function readJSON(k, fb) {
    try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; }
    catch { return fb; }
  }
  function readSession(k) {
    try { const r = sessionStorage.getItem(k); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }
  function eqEmail(a, b) {
    return String(a || "").toLowerCase() === String(b || "").toLowerCase();
  }
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
