window.settingsView = (() => {
  const themeOptions = document.querySelectorAll('.theme-option');
  const currencySelect = document.getElementById('currency-select');
  const successEl = document.getElementById('settings-success');

  function markThemeSelected(theme) {
    themeOptions.forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.themeOption === theme);
    });
  }

  function render() {
    const user = userStore.get();
    if (!user) return;
    markThemeSelected(themeManager.get());
    currencySelect.value = user.currency;
    successEl.textContent = '';
  }

  async function persist(partial) {
    try {
      const updated = await api.updateProfile(partial);
      userStore.set(updated);
      successEl.textContent = 'Preferências salvas.';
    } catch (error) {
      successEl.textContent = '';
      alert(error.message);
    }
  }

  themeOptions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.themeOption;
      themeManager.apply(theme);
      markThemeSelected(theme);
      persist({ theme });
    });
  });

  currencySelect.addEventListener('change', () => {
    format.setCurrency(currencySelect.value);
    persist({ currency: currencySelect.value });
    document.dispatchEvent(new CustomEvent('transactions:changed'));
  });

  return { render };
})();
