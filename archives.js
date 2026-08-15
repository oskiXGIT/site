(() => {
  'use strict';

  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const root = document.getElementById('dynamicArchives');
  const languageSelect = document.getElementById('languageSelect');
  if (!root) return;

  let rows = [];

  function lang() {
    const value = languageSelect?.value || document.documentElement.lang || 'lt';
    return ['lt', 'en', 'fr'].includes(value) ? value : 'en';
  }

  function field(row, prefix) {
    const chosen = row[`${prefix}_${lang()}`];
    return chosen || row[`${prefix}_en`] || row[`${prefix}_lt`] || '';
  }

  function popupTitle() {
    const l = lang();
    if (l === 'fr') return 'ARCHIVE TRÈS OFFICIELLE';
    if (l === 'en') return 'VERY OFFICIAL ARCHIVE';
    return 'ARCHYVO IRASAS';
  }

  function render() {
    root.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'archive-item locked';
      const b = document.createElement('b');
      b.textContent = '????';
      const span = document.createElement('span');
      span.textContent = 'archyvas kazkur dingo';
      empty.append(b, span);
      root.append(empty);
      return;
    }

    rows.forEach((row) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `archive-item${row.locked ? ' locked' : ''}`;

      const year = document.createElement('b');
      year.textContent = row.year_label;
      const summary = document.createElement('span');
      summary.textContent = field(row, 'summary') || (row.locked ? 'PRIEIGA UZDRAUSTA' : 'be pavadinimo');
      button.append(year, summary);

      if (!row.locked) {
        button.addEventListener('click', () => {
          const text = field(row, 'body') || 'failas tuscias. labai informatyvu.';
          if (typeof window.openPopup === 'function') window.openPopup(text, popupTitle());
        });
      } else {
        button.setAttribute('aria-disabled', 'true');
      }
      root.append(button);
    });
  }

  async function load() {
    try {
      const q = '/rest/v1/gang_archives?select=id,year_label,summary_lt,summary_en,summary_fr,body_lt,body_en,body_fr,locked,sort_order&published=eq.true&order=sort_order.asc,created_at.asc';
      const response = await fetch(SUPABASE_URL + q, {
        headers: { apikey: SUPABASE_KEY },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const data = await response.json();
      rows = Array.isArray(data) ? data : [];
      render();
    } catch {
      rows = [];
      render();
    }
  }

  languageSelect?.addEventListener('change', render);
  load();
})();
