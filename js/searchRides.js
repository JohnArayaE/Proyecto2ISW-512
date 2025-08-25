// js/searchRides.js
document.addEventListener("DOMContentLoaded", () => {
  const btnFind       = document.querySelector(".filters-box .btn");
  const resultsTextEl = document.querySelector(".results-text");
  const tbody         = document.querySelector(".rides-table tbody");

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const getJSON = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };

  const norm = (str) => String(str ?? "")
    .trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  const escapeHtml = (str) => String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");

  const formatCar = (car) =>
    (!car || typeof car !== "object") ? "--"
      : [car.brand, car.model, car.year].filter(Boolean).join(" ").trim() || "--";

  const formatFee = (fee) => {
    if (fee === null || fee === undefined || fee === "") return "--";
    const s = String(fee).trim();
    if (s.startsWith("$")) return s;
    const n = Number(s);
    return Number.isFinite(n) ? `$${n}` : `$${s}`;
  };

  const getSelectedDays = () => {
    const picked = [];
    $$(".filters-days label").forEach(label => {
      const cb = label.querySelector('input[type="checkbox"]');
      if (!cb || !cb.checked) return;
      picked.push((cb.value || label.textContent.split(/\s+/)[0]).trim());
    });
    return picked.map(norm);
  };

  if (resultsTextEl) resultsTextEl.style.display = "none";
  if (tbody) tbody.innerHTML = "";

  btnFind?.addEventListener("click", (e) => { e.preventDefault(); runSearch(); });
  ["from","to"].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });
  });

  function runSearch() {
    const fromVal = ($("#from")?.value || "").trim();
    const toVal   = ($("#to")?.value || "").trim();
    const normFrom = norm(fromVal);
    const normTo   = norm(toVal);
    const selectedDays = getSelectedDays();

    const rides = getJSON("rides", []);
    const users = getJSON("users", []);
    const userByEmail = new Map(
      users.filter(u => u && u.email).map(u => [u.email.toLowerCase(), u])
    );

    const indices = [];
    rides.forEach((r, idx) => {
      const rFrom = norm(r?.from);
      const rTo   = norm(r?.to);

      const okFrom = normFrom ? rFrom.includes(normFrom) : true;
      const okTo   = normTo   ? rTo.includes(normTo)     : true;

      let okDays = true;
      if (selectedDays.length > 0) {
        const rd = Array.isArray(r?.days) ? r.days : [];
        const rdNorm = rd.map(norm);
        okDays = rdNorm.some(d => selectedDays.includes(d));
      }

      if (okFrom && okTo && okDays) indices.push(idx);
    });

    renderResults(indices, fromVal, toVal, userByEmail, rides);
  }

  function renderResults(indices, fromVal, toVal, userByEmail, rides) {
    if (!tbody) return;

    const fromText = fromVal || "Any";
    const toText   = toVal   || "Any";
    if (resultsTextEl) {
      resultsTextEl.innerHTML =
        `Rides found from <strong>${escapeHtml(fromText)}</strong> to <strong>${escapeHtml(toText)}</strong>`;
      resultsTextEl.style.display = "block";
    }

    tbody.innerHTML = "";
    if (!indices.length) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="7" style="text-align:center;">No rides found.</td>`;
      tbody.appendChild(row);
      return;
    }

    indices.forEach((idx) => {
      const r = rides[idx];
      const u = userByEmail.get(String(r?.ownerEmail || "").toLowerCase());
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
        <td><a class="request-link" href="RideDetails.html?i=${idx}" data-index="${idx}">Request</a></td>
      `;

      // Guardamos snapshot (por si el orden cambia o abren en la misma pestaña)
      tr.querySelector(".request-link")?.addEventListener("click", (ev) => {
        const i = Number(ev.currentTarget.getAttribute("data-index"));
        sessionStorage.setItem("selectedRideIndex", String(i));
        sessionStorage.setItem("selectedRideSnapshot", JSON.stringify(rides[i]));
        // no evitamos la navegación: el href ?i= garantiza el índice correcto
      });

      tbody.appendChild(tr);
    });
  }
});
