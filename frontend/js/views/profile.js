window.profileView = (() => {
  const avatarEl = document.getElementById('profile-avatar');
  const uploadZone = document.getElementById('avatar-upload-zone');
  const uploadBtn = document.getElementById('avatar-upload-btn');
  const fileInput = document.getElementById('profile-avatar-input');
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const form = document.getElementById('profile-form');
  const errorEl = document.getElementById('profile-error');
  const successEl = document.getElementById('profile-success');

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const AVATAR_SIZE = 200;

  function renderAvatar(user) {
    if (user.avatar) {
      avatarEl.innerHTML = `<img src="${user.avatar}" alt="Foto de perfil" />`;
    } else {
      avatarEl.textContent = format.initials(user.name);
    }
  }

  function render() {
    const user = userStore.get();
    if (!user) return;
    nameInput.value = user.name;
    emailInput.value = user.email;
    renderAvatar(user);
    errorEl.textContent = '';
    successEl.textContent = '';
  }

  function readAndResizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = AVATAR_SIZE;
          canvas.height = AVATAR_SIZE;
          const ctx = canvas.getContext('2d');
          const scale = Math.max(AVATAR_SIZE / img.width, AVATAR_SIZE / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (AVATAR_SIZE - w) / 2, (AVATAR_SIZE - h) / 2, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem (PNG ou JPG).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Imagem muito grande. O limite é 5MB.');
      return;
    }

    avatarEl.classList.add('is-uploading');
    try {
      const dataUrl = await readAndResizeImage(file);
      avatarEl.innerHTML = `<img src="${dataUrl}" alt="Foto de perfil" />`;
      const updated = await api.updateProfile({ avatar: dataUrl });
      userStore.set(updated);
      toast.success('Foto de perfil atualizada.');
    } catch (error) {
      toast.error(error.message || 'Não foi possível atualizar a foto.');
    } finally {
      avatarEl.classList.remove('is-uploading');
    }
  }

  uploadBtn.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    handleFile(fileInput.files[0]);
    fileInput.value = '';
  });

  ['dragover', 'dragenter'].forEach((eventName) => {
    uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadZone.classList.add('dragover');
    });
  });

  ['dragleave', 'dragend'].forEach((eventName) => {
    uploadZone.addEventListener(eventName, () => {
      uploadZone.classList.remove('dragover');
    });
  });

  uploadZone.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    handleFile(file);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.textContent = '';
    successEl.textContent = '';
    const submitBtn = form.querySelector('button[type="submit"]');

    uiLoading.setButtonLoading(submitBtn, true, 'Salvando...');
    try {
      const updated = await api.updateProfile({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
      });
      userStore.set(updated);
      successEl.textContent = 'Perfil atualizado com sucesso.';
      toast.success('Perfil atualizado com sucesso.');
    } catch (error) {
      errorEl.textContent = error.message;
    } finally {
      uiLoading.setButtonLoading(submitBtn, false);
    }
  });

  return { render };
})();
