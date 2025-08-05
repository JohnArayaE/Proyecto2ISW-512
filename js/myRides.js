document.addEventListener('DOMContentLoaded', () => {
  const ridesTableBody = document.getElementById('rides-body');
  const activeUser = JSON.parse(localStorage.getItem('usuarioActivo'));

  if (!activeUser || !activeUser.email) {
    ridesTableBody.innerHTML = `<tr><td colspan="6">No user logged in.</td></tr>`;
    return;
  }

  const allRides = JSON.parse(localStorage.getItem('rides')) || [];

  const myRides = allRides.filter(ride => ride.ownerEmail === activeUser.email);

  if (myRides.length === 0) {
    ridesTableBody.innerHTML = `<tr><td colspan="6">No rides created yet.</td></tr>`;
    return;
  }

  myRides.forEach((ride, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td><a href="#">${ride.from}</a></td>
      <td>${ride.to}</td>
      <td>${ride.seats}</td>
      <td>${ride.car.brand} ${ride.car.model} ${ride.car.year}</td>
      <td>$${ride.fee || '--'}</td>
      <td>
        <a href="EditRide.html?ride=${index}">Edit</a> |
        <a href="#" onclick="deleteRide(${index})">Delete</a>
      </td>
    `;

    ridesTableBody.appendChild(row);
  });
});

// Elimina ride del usuario activo
function deleteRide(indexToDelete) {
  const activeUser = JSON.parse(localStorage.getItem('usuarioActivo'));
  const allRides = JSON.parse(localStorage.getItem('rides')) || [];

  const newRides = allRides.filter((ride, index) => {
    return !(ride.ownerEmail === activeUser.email && index === indexToDelete);
  });

  localStorage.setItem('rides', JSON.stringify(newRides));
  location.reload();
}
