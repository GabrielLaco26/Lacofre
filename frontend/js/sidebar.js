const sidebarManager = (() => {
  const appShell = document.getElementById('app-shell');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('sidebar-overlay');

  function init() {
    collapseBtn.addEventListener('click', () => {
      appShell.classList.toggle('sidebar-collapsed');
    });

    hamburgerBtn.addEventListener('click', () => {
      appShell.classList.toggle('sidebar-open');
    });

    overlay.addEventListener('click', () => {
      appShell.classList.remove('sidebar-open');
    });
  }

  function closeMobile() {
    appShell.classList.remove('sidebar-open');
  }

  return { init, closeMobile };
})();
