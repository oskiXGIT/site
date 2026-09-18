(() => {
  // Every page load gets a fresh asset URL, so browser HTTP caches cannot reuse
  // an older CSS or JavaScript bundle after a site update.
  const RESET_ID = String(Date.now());
  const KEY = 'oski_site_cache_reset';

  try {
    localStorage.setItem(KEY, RESET_ID);
  } catch (_) {}

  if ('caches' in window) {
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .catch(() => {});
  }

  const refreshAsset = (element, attribute) => {
    const raw = element.getAttribute(attribute);
    if (!raw) return;

    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin) return;

    url.searchParams.set('__cache_reset', RESET_ID);
    element.setAttribute(attribute, url.pathname + url.search + url.hash);
  };

  // Stylesheets already in the document are re-requested with a unique URL;
  // scripts below this loader receive the same treatment before they execute.
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => refreshAsset(link, 'href'));
  document.querySelectorAll('script[src]').forEach(script => refreshAsset(script, 'src'));
})();