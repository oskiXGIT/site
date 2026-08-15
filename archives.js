(() => {
  'use strict';

  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const root = document.getElementById('dynamicArchives');
  const languageSelect = document.getElementById('languageSelect');
  if (!root) return;

  const SUPPORTED = new Set(['lt', 'en', 'fr', 'zh', 'ru', 'eo', 'la', 'fo', 'cy', 'eu', 'br']);
  const POPUP_TITLES = {
    lt: 'ARCHYVO IRASAS', en: 'VERY OFFICIAL ARCHIVE', fr: 'ARCHIVE TRÈS OFFICIELLE', zh: '非常官方的档案',
    ru: 'ОЧЕНЬ ОФИЦИАЛЬНЫЙ АРХИВ', eo: 'TRE OFICIALA ARKIVO', la: 'ARCHIVUM VALDE OFFICIALE',
    fo: 'ÓGVULIGA ALMENNT ARKIV', cy: 'ARCHIF SWYDDOGOL IAWN', eu: 'OSO ARTXIBO OFIZIALA', br: 'DIELL GWALL OFISIEL',
  };
  const EMPTY_LABEL = {
    lt: 'archyvas kazkur dingo', en: 'archive disappeared somewhere', fr: 'les archives ont disparu quelque part',
    zh: '档案不知道跑哪去了', ru: 'архив куда-то исчез', eo: 'la arkivo malaperis ie', la: 'archivum alicubi evanuit',
    fo: 'arkivið hvarv onkustaðni', cy: 'diflannodd yr archif rywle', eu: 'artxiboa nonbait desagertu da', br: 'an diell zo aet da get en un tu bennak',
  };
  const LOCKED_LABEL = {
    lt: 'PRIEIGA UZDRAUSTA', en: 'ACCESS DENIED', fr: 'ACCÈS REFUSÉ', zh: '拒绝访问', ru: 'ДОСТУП ЗАПРЕЩЁН',
    eo: 'ALIRO RIFUZITA', la: 'ADITUS NEGATUS', fo: 'ATGONGD NOKTAÐ', cy: 'MYNEDIAD WEDI EI WRTHOD', eu: 'SARBIDEA UKATUTA', br: 'MONED NAC’HET',
  };

  let rows = [];

  function lang() {
    const value = languageSelect?.value || document.documentElement.lang || localStorage.getItem('oskiLang') || 'lt';
    return SUPPORTED.has(value) ? value : 'en';
  }

  function translated(map, legacy = '') {
    const l = lang();
    if (map && typeof map === 'object') return map[l] || map.en || map.lt || legacy || '';
    return legacy || '';
  }

  function legacyField(row, prefix) {
    const l = lang();
    return row[`${prefix}_${l}`] || row[`${prefix}_en`] || row[`${prefix}_lt`] || '';
  }

  function render() {
    root.replaceChildren();
    const l = lang();

    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'archive-item locked';
      const b = document.createElement('b');
      b.textContent = '????';
      const span = document.createElement('span');
      span.textContent = EMPTY_LABEL[l] || EMPTY_LABEL.en;
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
      summary.textContent = translated(row.summary_i18n, legacyField(row, 'summary')) || (row.locked ? (LOCKED_LABEL[l] || LOCKED_LABEL.en) : '—');
      button.append(year, summary);

      if (!row.locked) {
        button.addEventListener('click', () => {
          const text = translated(row.body_i18n, legacyField(row, 'body')) || '—';
          if (typeof window.openPopup === 'function') window.openPopup(text, POPUP_TITLES[l] || POPUP_TITLES.en);
        });
      } else {
        button.setAttribute('aria-disabled', 'true');
      }
      root.append(button);
    });
  }

  async function load() {
    try {
      const q = '/rest/v1/gang_archives?select=id,year_label,summary_lt,summary_en,summary_fr,body_lt,body_en,body_fr,summary_i18n,body_i18n,locked,sort_order&published=eq.true&order=sort_order.asc,created_at.asc';
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
