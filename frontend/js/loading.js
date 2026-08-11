const uiLoading = (() => {
  function setButtonLoading(btn, isLoading, loadingLabel) {
    if (isLoading) {
      if (btn.dataset.originalLabel === undefined) {
        btn.dataset.originalLabel = btn.innerHTML;
      }
      btn.disabled = true;
      btn.classList.add('is-loading');
      btn.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>${loadingLabel || 'Aguarde...'}</span>`;
    } else {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btn.dataset.originalLabel !== undefined) {
        btn.innerHTML = btn.dataset.originalLabel;
        delete btn.dataset.originalLabel;
      }
    }
  }

  // Só mostra o skeleton se a operação passar do delay — evita "flash"
  // de loading em requisições rápidas (chamadas locais costumam ser <50ms).
  async function withDelayedSkeleton(asyncFn, { onShow, onHide, delay = 150 } = {}) {
    let shown = false;
    const timer = setTimeout(() => {
      shown = true;
      onShow?.();
    }, delay);

    try {
      return await asyncFn();
    } finally {
      clearTimeout(timer);
      if (shown) onHide?.();
    }
  }

  return { setButtonLoading, withDelayedSkeleton };
})();
