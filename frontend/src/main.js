import api from './api.js';

// Handle basic UI logic for the landing page auth tabs
document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      tabLogin.classList.add('bg-indigo-500/20', 'text-indigo-300', 'shadow');
      tabLogin.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
      tabRegister.classList.remove('bg-indigo-500/20', 'text-indigo-300', 'shadow');
      tabRegister.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
    });

    tabRegister.addEventListener('click', () => {
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      tabRegister.classList.add('bg-indigo-500/20', 'text-indigo-300', 'shadow');
      tabRegister.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
      tabLogin.classList.remove('bg-indigo-500/20', 'text-indigo-300', 'shadow');
      tabLogin.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
    });
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const response = await api.post('/api/auth/signin', { email, password });
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect based on role
        if (user.role === 'ADMIN') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/dashboard.html';
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    });
  }

  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;

      try {
        await api.post('/api/auth/signup', { fullName, email, password });
        alert('Account created successfully! Please log in.');
        tabLogin.click();
      } catch (error) {
        alert(error.response?.data || 'Registration failed. Try a different email.');
      }
    });
  }
});
