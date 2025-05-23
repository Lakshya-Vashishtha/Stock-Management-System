// assets/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
  // Tab switching logic
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `${tab.dataset.tab}-form`;
      const targetForm = document.getElementById(targetId);
      if (targetForm) targetForm.classList.add('active');
    });
  });

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Login form submission
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;

    if (!email || !password) {
      return alert("Please fill in all fields.");
    }

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (remember) localStorage.setItem('rememberMe', 'true');

      window.location.href = 'pages/dashboard.html';

    } catch (err) {
      alert('Login failed. Check credentials.');
    }
  });

  // Register form submission
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const businessType = document.getElementById('businessType').value;

    if (!email || !password || !confirmPassword || !businessType) {
      return alert("Please complete all fields.");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, businessType })
      });

      if (!res.ok) throw new Error('Registration failed');
      alert('Registered successfully! You can now log in.');
      document.querySelector('[data-tab="login"]').click();

    } catch (err) {
      alert('Registration failed. Try a different email.');
    }
  });
});
