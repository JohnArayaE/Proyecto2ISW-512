document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      sessionStorage.setItem('usuarioActivo', JSON.stringify(user));
      if (user.driver === true) {
        window.location.href = 'MyRides.html';
      } else {
        window.location.href = 'SearhRides.html';
      }
    } else {
      alert('Invalid email or password');
    }
  });
});
