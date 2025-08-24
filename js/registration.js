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
  const idNumber = document.getElementById('idNumber').value.trim();
  const birthdate = document.getElementById('birthdate').value; // formato ISO (yyyy-mm-dd)
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const repeatPassword = document.getElementById('repeat-password').value;
  const address = document.getElementById('address').value.trim();
  const country = document.getElementById('country').value;
  const state = document.getElementById('state').value.trim();
  const city = document.getElementById('city').value.trim();
  const phone = document.getElementById('phone').value.trim();

  // Validaciones mínimas
  if (!firstname || !lastname || !idNumber || !birthdate || !email || !phone) {
    alert('Por favor, complete todos los campos requeridos.');
    return;
  }

  if (password !== repeatPassword) {
    alert('Las contraseñas no coinciden. Intenta de nuevo.');
    return;
  }

  // Obtener usuarios existentes
  let users = JSON.parse(localStorage.getItem('users')) || [];

  // Validar si ya existe un usuario con ese email (email como "primary key")
  const alreadyExists = users.some(user => user.email === email);
  if (alreadyExists) {
    alert('Ya existe un usuario registrado con este correo.');
    return;
  }

  // Construir objeto de usuario
  const userData = {
    firstname,
    lastname,
    idNumber,     // NUEVO
    birthdate,    // NUEVO
    email,
    password,
    address,
    country,
    state,
    city,
    phone,
    driver: false // clientes por defecto
  };

  // Guardar
  users.push(userData);
  localStorage.setItem('users', JSON.stringify(users));

  
  document.getElementById('registration-form').reset();
}
