// js/searchRides.js
document.addEventListener("DOMContentLoaded", () => {
  const btnFind       = document.querySelector(".filters-box .btn");
  const resultsTextEl = document.querySelector(".results-text");
  const tbody         = document.querySelector(".rides-table tbody");

  // ---- Utilidades ----
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function safeJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  // Normaliza: trim, minúsculas y sin acentos
  function norm(str) {
    return String(str ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatCar(car) {
    if (!car || typeof car !== "object") return "--";
    return [car.brand, car.model, car.year].filter(Boolean).join(" ").trim() || "--";
  }

  function formatFee(fee) {
    if (fee === null || fee === undefined || fee === "") return "--";
    const asStr = String(fee).trim();
    if (asStr.startsWith("$")) return asStr;
    const num = Number(asStr);
    return Number.isFinite(num) ? `$${num}` : `$${asStr}`;
  }

  // Lee días seleccionados. Si los inputs tienen value lo usa;
  // si no, toma el texto del label (Mon/Tue/…).
  function getSelectedDays() {
    const labels = $$(".filters-days label");
    const picked = [];
    labels.forEach((label) => {
      const cb = label.querySelector("input[type=checkbox]");
      if (!cb || !cb.checked) return;
      const v = cb.value?.trim();
      if (v) {
        picked.push(v);
      } else {
        // fallback al texto del label
        const txt = (label.textContent || "").trim().split(/\s+/)[0];
        if (txt) picked.push(txt);
      }
    });
    // devolvemos en minúsculas y sin acentos para comparación robusta
    return picked.map((d) => norm(d));
  }

  // ---- Estado inicial ----
  if (resultsTextEl) resultsTextEl.style.display = "none";
  if (tbody) tbody.innerHTML = "";

  // ---- Eventos ----
  if (btnFind) {
    btnFind.addEventListener("click", (e) => {
      e.preventDefault();
      runSearch();
    });
  }
  // Enter para disparar búsqueda
  ["from", "to"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") runSearch();
      });
    }
  });

  // ---- Búsqueda principal ----
  function runSearch() {
    const fromVal = ($("#from")?.value || "").trim();
    const toVal   = ($("#to")?.value || "").trim();

    const normFrom = norm(fromVal);
    const normTo   = norm(toVal);
    const selectedDays = getSelectedDays(); // ya normalizados

    const rides = safeJSON("rides", []);
    const users = safeJSON("users", []);

    // Mapa de usuarios por email en minúsculas
    const userByEmail = new Map(
      users
        .filter((u) => u && (u.email || u.ownerEmail))
        .map((u) => [String(u.email || u.ownerEmail).toLowerCase(), u])
    );

    const filtered = rides.filter((r) => {
      const rFrom = norm(r?.from);
      const rTo   = norm(r?.to);

      const okFrom = normFrom ? rFrom.includes(normFrom) : true;
      const okTo   = normTo   ? rTo.includes(normTo)     : true;

      // Días
      let okDays = true;
      if (selectedDays.length > 0) {
        const rideDays = Array.isArray(r?.days) ? r.days : [];
        const rideDaysNorm = rideDays.map(norm);
        okDays = rideDaysNorm.some((d) => selectedDays.includes(d));
      }

      return okFrom && okTo && okDays;
    });

    renderResults(filtered, fromVal, toVal, userByEmail);
  }

  // ---- Render de resultados ----
  function renderResults(list, fromVal, toVal, userByEmail) {
    if (!tbody) return;

    // Texto superior
    const fromText = fromVal || "Any";
    const toText   = toVal   || "Any";
    if (resultsTextEl) {
      resultsTextEl.innerHTML =
        `Rides found from <strong>${escapeHtml(fromText)}</strong> to ` +
        `<strong>${escapeHtml(toText)}</strong>`;
      resultsTextEl.style.display = "block";
    }

    // Tabla
    tbody.innerHTML = "";

    if (!list || list.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="7" style="text-align:center;">No rides found.</td>`;
      tbody.appendChild(row);
      return;
    }

    list.forEach((r) => {
      const emailKey = String(r?.ownerEmail || "").toLowerCase();
      const u = userByEmail.get(emailKey);

      const driverName = u
        ? [u.firstname, u.lastname].filter(Boolean).join(" ").trim() || u.email || "Driver"
        : r?.ownerEmail || "Driver";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="img/icon-user.png" alt="${escapeHtml(driverName)}" class="table-icon">${escapeHtml(driverName)}</td>
        <td><a href="#">${escapeHtml(r?.from ?? "--")}</a></td>
        <td>${escapeHtml(r?.to ?? "--")}</td>
        <td>${escapeHtml(String(r?.seats ?? "--"))}</td>
        <td>${escapeHtml(formatCar(r?.car))}</td>
        <td>${escapeHtml(formatFee(r?.fee))}</td>
        <td><a href="RideDetails.html">Request</a></td>
      `;
      tbody.appendChild(tr);
    });
  }
});
