document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('registration-form')
    .addEventListener('submit', function (event) {
      event.preventDefault();
      storeInputs();
    });
});

function storeInputs() {
  const firstname = document.getElementById('firstname').value.trim();
  const lastname = document.getElementById('lastname').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const repeatPassword = document.getElementById('repeat-password').value;
  const address = document.getElementById('address').value.trim();
  const country = document.getElementById('country').value;
  const state = document.getElementById('state').value.trim();
  const city = document.getElementById('city').value.trim();
  const phone = document.getElementById('phone').value.trim();

  // Obtener usuarios existentes o inicializar arreglo vacío
  let users = JSON.parse(localStorage.getItem('users')) || [];

  // Validar si ya existe un usuario con ese email
  const alreadyExists = users.some(user => user.email === email);
  if (alreadyExists) {
    alert('A user with this email already exists.');
    return;
  }

  // Validar que las contraseñas coincidan
  if (password === repeatPassword) {
    const userData = {
      firstname,
      lastname,
      email,
      password,
      address,
      country,
      state,
      city,
      phone,
      driver: false
    };

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful!');
    document.getElementById('registration-form').reset();
  } else {
    alert('Passwords do not match. Please try again.');
  }
}
