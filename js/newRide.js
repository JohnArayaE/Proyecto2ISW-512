document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ride-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("usuarioActivo"));
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

    const rides = JSON.parse(localStorage.getItem("rides")) || [];
    rides.push(ride);
    localStorage.setItem("rides", JSON.stringify(rides));

    alert("Ride created successfully!");
    window.location.href = "MyRides.html";
  });
});
