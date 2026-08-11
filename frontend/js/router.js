const router = (() => {
  const views = {
    dashboard: { section: 'view-dashboard', title: 'Dashboard', module: () => window.dashboardView },
    transacoes: { section: 'view-transacoes', title: 'Transações', module: () => window.transactionsView },
    perfil: { section: 'view-perfil', title: 'Perfil', module: () => window.profileView },
    configuracoes: { section: 'view-configuracoes', title: 'Configurações', module: () => window.settingsView },
  };

  const pageTitle = document.getElementById('page-title');
  const navLinks = document.querySelectorAll('.nav-link[data-view]');

  function currentRoute() {
    const hash = window.location.hash.replace('#', '');
    return views[hash] ? hash : 'dashboard';
  }

  function navigate() {
    const route = currentRoute();
    const view = views[route];

    Object.values(views).forEach((v) => {
      document.getElementById(v.section).hidden = true;
    });

    const section = document.getElementById(view.section);
    section.hidden = false;
    section.classList.remove('fade-in');
    void section.offsetWidth;
    section.classList.add('fade-in');

    pageTitle.textContent = view.title;

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.view === route);
    });

    const mod = view.module();
    if (mod && typeof mod.render === 'function') {
      mod.render();
    }

    sidebarManager.closeMobile();
  }

  function init() {
    window.addEventListener('hashchange', navigate);
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    }
    navigate();
  }

  return { init, navigate };
})();
