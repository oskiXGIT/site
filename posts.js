(() => {
  'use strict';

  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const recentRoot = document.getElementById('livePosts');
  const archiveRoot = document.getElementById('allPosts');
  const languageSelect = document.getElementById('languageSelect');
  const SUPPORTED = new Set(['lt', 'en', 'fr', 'zh', 'ru', 'eo', 'la', 'fo', 'cy', 'eu', 'br']);
  const DATE_LOCALES = {
    lt: 'lt-LT', en: 'en-GB', fr: 'fr-FR', zh: 'zh-CN', ru: 'ru-RU', eo: 'eo',
    la: 'la', fo: 'fo-FO', cy: 'cy-GB', eu: 'eu-ES', br: 'br-FR',
  };
  const EMPTY_RECENT = {
    lt: 'kol kas nauju postu nera. keista.', en: 'no new posts yet. suspicious.', fr: 'pas de nouveaux posts. bizarre.',
    zh: '暂时没有新帖子。很可疑。', ru: 'новых постов пока нет. подозрительно.', eo: 'ankoraŭ neniuj novaj afiŝoj. suspektinde.',
    la: 'nova posta adhuc nulla. suspectum.', fo: 'eingir nýggir postar enn. løgið.', cy: 'dim postiadau newydd eto. amheus.',
    eu: 'oraindik ez dago post berririk. susmagarria.', br: 'post nevez ebet evit poent. iskis.',
  };
  const EMPTY_ARCHIVE = {
    lt: 'archyvas tuscias. nieks nieko neprisidirbo.', en: 'archive is empty. apparently nobody did anything.', fr: 'archive vide. apparemment personne a rien fait.',
    zh: '存档是空的。看来没人干过任何事。', ru: 'архив пуст. видимо, никто ничего не натворил.', eo: 'la arkivo estas malplena. ŝajne neniu faris ion.',
    la: 'archivum vacuum est. nemo quicquam fecisse videtur.', fo: 'arkivið er tómt. eingin hevur gjørt nakað eftir øllum at døma.',
    cy: 'mae’r archif yn wag. mae’n debyg na wnaeth neb ddim.', eu: 'artxiboa hutsik dago. antza, inork ez du ezer egin.',
    br: 'goullo eo an diell. war a seblant n’en deus den graet netra.',
  };

  let posts = [];

  function lang() {
    const value = languageSelect?.value || document.documentElement.lang || localStorage.getItem('oskiLang') || 'lt';
    return SUPPORTED.has(value) ? value : 'en';
  }

  function translated(map, legacy = '') {
    const l = lang();
    if (map && typeof map === 'object') return map[l] || map.en || map.lt || legacy || '';
    return legacy || '';
  }

  function makePost(post) {
    const card = document.createElement('article');
    card.className = 'thread-box live-post';

    const head = document.createElement('div');
    head.className = 'live-post-head';

    const title = document.createElement('b');
    title.textContent = `${post.pinned ? '📌 ' : ''}${translated(post.title_i18n, post.title)}`;

    const stamp = document.createElement('span');
    stamp.className = 'stamp';
    const d = new Date(post.published_at || post.created_at);
    stamp.textContent = Number.isNaN(d.getTime())
      ? '??:??'
      : d.toLocaleString(DATE_LOCALES[lang()] || 'en-GB', { dateStyle: 'short', timeStyle: 'short' });

    head.append(title, stamp);

    const body = document.createElement('div');
    body.className = 'live-post-body';
    body.textContent = translated(post.body_i18n, post.body);

    card.append(head, body);
    return card;
  }

  function render(root, items, emptyText) {
    if (!root) return;
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'thread-box compact';
      empty.textContent = emptyText;
      root.replaceChildren(empty);
      root.hidden = false;
      return;
    }
    root.replaceChildren(...items.map(makePost));
    root.hidden = false;
  }

  function renderAll() {
    const l = lang();
    render(recentRoot, posts.slice(0, 5), EMPTY_RECENT[l] || EMPTY_RECENT.en);
    render(archiveRoot, posts, EMPTY_ARCHIVE[l] || EMPTY_ARCHIVE.en);
  }

  async function load() {
    try {
      const q = '/rest/v1/gang_posts?select=id,title,body,title_i18n,body_i18n,pinned,published_at,created_at&published=eq.true&order=pinned.desc,published_at.desc.nullslast,created_at.desc&limit=100';
      const response = await fetch(SUPABASE_URL + q, {
        headers: { apikey: SUPABASE_KEY },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('BAD_DATA');
      posts = data;
      renderAll();
    } catch {
      posts = [];
      renderAll();
    }
  }

  languageSelect?.addEventListener('change', renderAll);
  load();
})();
