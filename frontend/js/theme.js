const themeManager = (() => {
  const STORAGE_KEY = 'coinflow-theme';

  function get() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function toggle() {
    const next = get() === 'dark' ? 'light' : 'dark';
    apply(next);
    return next;
  }

  return { get, apply, toggle };
})();
