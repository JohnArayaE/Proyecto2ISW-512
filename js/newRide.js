document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ride-form");

  // Prefill de vehículo desde el usuario activo (sessionStorage) y bloquear campos
  const activeUser = JSON.parse(sessionStorage.getItem("usuarioActivo"));
  if (activeUser?.car) {
    const makeEl  = document.getElementById("make");
    const modelEl = document.getElementById("model");
    const yearEl  = document.getElementById("year");

    makeEl.value  = activeUser.car.brand || "";
    modelEl.value = activeUser.car.model || "";
    yearEl.value  = activeUser.car.year  || "";

    makeEl.readOnly  = true;
    modelEl.readOnly = true;
    yearEl.readOnly  = true;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // AHORA: usuarioActivo desde sessionStorage (antes lo leías de localStorage)
    const user = JSON.parse(sessionStorage.getItem("usuarioActivo"));
    if (!user || !user.email) {
      alert("No user is logged in.");
      return;
    }

    const ride = {
      from: document.getElementById("from").value,
      to: document.getElementById("to").value,
      days: Array.from(document.querySelectorAll(".checkbox-group input[type='checkbox']:checked")).map(cb => cb.value),
      time: document.getElementById("time").value,
      seats: document.getElementById("seats").value,
      fee: document.getElementById("fee").value,
      car: {
        brand: document.getElementById("make").value,
        model: document.getElementById("model").value,
        year: document.getElementById("year").value
      },
      ownerEmail: user.email
    };

    // Mantengo tu lógica original: rides en localStorage
    const rides = JSON.parse(localStorage.getItem("rides")) || [];
    rides.push(ride);
    localStorage.setItem("rides", JSON.stringify(rides));

    // Redirigir a MyRides.html después de guardar
    window.location.href = "MyRides.html";
  });
});
