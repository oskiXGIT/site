(() => {
  const BUILD = '20260816_0234';
  const KEY = 'oski_site_build';
  let previous = null;

  try {
    previous = localStorage.getItem(KEY);
  } catch (_) {}

  const url = new URL(window.location.href);

  if (previous !== BUILD) {
    try {
      localStorage.setItem(KEY, BUILD);
    } catch (_) {}

    if ('caches' in window) {
      caches.keys()
        .then(keys => Promise.all(keys.map(key => caches.delete(key))))
        .catch(() => {});
    }

    if (url.searchParams.get('__v') !== BUILD) {
      url.searchParams.set('__v', BUILD);
      window.location.replace(url.toString());
      return;
    }
  }

  if (url.searchParams.get('__v') === BUILD) {
    url.searchParams.delete('__v');
    const clean = `${url.pathname}${url.search}${url.hash}`;
    history.replaceState(null, '', clean);
  }
})();
