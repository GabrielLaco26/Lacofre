const tabs = document.querySelectorAll('.auth-tab');
const forms = document.querySelectorAll('.auth-form');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    forms.forEach((f) => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
  });
});

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';

  try {
    await api.login({
      email: loginForm.email.value.trim(),
      password: loginForm.password.value,
    });
    window.location.href = 'index.html';
  } catch (error) {
    loginError.textContent = error.message;
  }
});

const cadastroForm = document.getElementById('cadastro-form');
const cadastroError = document.getElementById('cadastro-error');

cadastroForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  cadastroError.textContent = '';

  try {
    await api.register({
      name: cadastroForm.name.value.trim(),
      email: cadastroForm.email.value.trim(),
      password: cadastroForm.password.value,
    });
    window.location.href = 'index.html';
  } catch (error) {
    cadastroError.textContent = error.message;
  }
});

api
  .me()
  .then(() => {
    window.location.href = 'index.html';
  })
  .catch(() => {});
