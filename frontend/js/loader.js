const scriptLoader = (() => {
  const loaded = new Map();

  function loadScript(src) {
    if (loaded.has(src)) return loaded.get(src);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
      document.head.appendChild(script);
    });
    loaded.set(src, promise);
    return promise;
  }

  function loadStyle(href) {
    if (loaded.has(href)) return loaded.get(href);
    const promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Falha ao carregar ${href}`));
      document.head.appendChild(link);
    });
    loaded.set(href, promise);
    return promise;
  }

  return { loadScript, loadStyle };
})();
