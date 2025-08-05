document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('registration-driver-form')
    .addEventListener('submit', function (event) {
      event.preventDefault();
      storeDriverInputs();
    });
});

function storeDriverInputs() {
  const firstname = document.getElementById('firstname').value.trim();
  const lastname = document.getElementById('lastname').value.trim();
  const idNumber = document.getElementById('id').value.trim();
  const birthdate = document.getElementById('birthdate').value;
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const repeatPassword = document.getElementById('repeat-password').value;
  const phone = document.getElementById('phone').value.trim();
  const brand = document.getElementById('brand').value.trim();
  const model = document.getElementById('model').value.trim();
  const year = document.getElementById('year').value.trim();
  const plate = document.getElementById('plate').value.trim();

  if (password !== repeatPassword) {
    alert('Passwords do not match. Please try again.');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users')) || [];

  const alreadyExists = users.some(user => user.email === email);
  if (alreadyExists) {
    alert('A user with this email already exists.');
    return;
  }

  const driverData = {
    firstname,
    lastname,
    idNumber,
    birthdate,
    email,
    password,
    phone,
    car: {
      brand,
      model,
      year,
      plate
    },
    driver: true // Distinción clave
  };

  users.push(driverData);
  localStorage.setItem('users', JSON.stringify(users));

  alert('Driver registration successful!');
  document.getElementById('registration-driver-form').reset();
}
