const userStore = (() => {
  let user = null;

  function get() {
    return user;
  }

  function set(nextUser) {
    user = nextUser;
    document.dispatchEvent(new CustomEvent('user:changed', { detail: { user } }));
  }

  return { get, set };
})();

function renderSidebarUser(user) {
  const avatarEl = document.getElementById('sidebar-avatar');
  const nameEl = document.getElementById('sidebar-user-name');
  const emailEl = document.getElementById('sidebar-user-email');

  if (user.avatar) {
    avatarEl.innerHTML = `<img src="${user.avatar}" alt="Foto de perfil" />`;
  } else {
    avatarEl.textContent = format.initials(user.name);
  }
  nameEl.textContent = user.name;
  emailEl.textContent = user.email;
}

document.addEventListener('user:changed', (event) => {
  if (event.detail.user) renderSidebarUser(event.detail.user);
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await api.logout();
  } finally {
    window.location.href = 'login.html';
  }
});

document.getElementById('quick-theme-btn').addEventListener('click', async () => {
  const next = themeManager.toggle();
  try {
    const updated = await api.updateProfile({ theme: next });
    userStore.set(updated);
  } catch (error) {
    console.error(error);
  }
});

async function bootstrap() {
  try {
    const user = await api.me();
    userStore.set(user);
    themeManager.apply(user.theme);
    format.setCurrency(user.currency);
    sidebarManager.init();
    router.init();
  } catch (error) {
    window.location.href = 'login.html';
  }
}

bootstrap();
