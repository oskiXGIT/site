(() => {
  'use strict';

  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const INTERNAL_EMAIL = 'operator@oski.website';

  const $ = (id) => document.getElementById(id);
  const loginView = $('loginView');
  const dashboardView = $('dashboardView');
  const loginBtn = $('loginBtn');
  const adminPassword = $('adminPassword');
  const loginStatus = $('loginStatus');
  const logoutBtn = $('logoutBtn');
  const purgeSessionBtn = $('purgeSessionBtn');
  const globalStatus = $('globalStatus');
  const footerStatus = $('footerStatus');
  const sessionUid = $('sessionUid');

  let session = null;
  let editingNoteId = null;
  let cachedNotes = [];
  let editingPostId = null;
  let cachedPosts = [];
  let editingArchiveId = null;
  let cachedArchives = [];

  function setLoginStatus(text, kind = '') {
    loginStatus.textContent = text;
    loginStatus.className = `login-status ${kind}`.trim();
  }

  function setGlobalStatus(text) {
    if (globalStatus) globalStatus.textContent = text;
    if (footerStatus) footerStatus.textContent = text;
  }

  function saveSession(data) {
    session = {
      access_token: data.access_token,
      expires_at: Date.now() + Math.max(60, Number(data.expires_in || 3600)) * 1000,
      user: data.user || null,
    };
  }

  function clearSession() {
    session = null;
  }

  function lockPanel(message = 'REIKIA RAKTO.') {
    clearSession();
    dashboardView.hidden = true;
    loginView.hidden = false;
    adminPassword.value = '';
    setLoginStatus(message, 'bad');
    setTimeout(() => adminPassword?.focus(), 0);
  }

  async function revokeCurrentSession({ keepalive = false } = {}) {
    const token = session?.access_token;
    if (!token) return;
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
        keepalive,
      });
    } catch {
      // Memory is cleared regardless. Server-side session validation blocks revoked sessions.
    }
  }

  async function api(path, options = {}) {
    if (!session?.access_token) throw new Error('NO_SESSION');
    if (session.expires_at && Date.now() >= session.expires_at - 5000) {
      lockPanel('SESIJA BAIGESI. REIK RAKTO.');
      throw new Error('SESSION_EXPIRED');
    }

    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    };
    if (options.body !== undefined && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      lockPanel('SESIJA ATMESTA. REIK RAKTO.');
    }
    return response;
  }

  async function requestAutoTranslations(type, sourceLanguage, title, body) {
    const response = await api('/functions/v1/translate-content', {
      method: 'POST',
      body: JSON.stringify({
        type,
        source_language: sourceLanguage,
        title,
        body,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error || `HTTP_${response.status}`);
      error.code = data?.error || `HTTP_${response.status}`;
      throw error;
    }
    return data?.translations && typeof data.translations === 'object' ? data.translations : {};
  }

  async function login(password) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: INTERNAL_EMAIL, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.access_token) throw new Error('LOGIN_FAILED');
    saveSession(data);
  }

  async function verifyAdmin() {
    const response = await api('/rest/v1/gang_admin_controls?select=key&key=eq.__admin_probe&limit=1');
    if (!response.ok) return false;
    const data = await response.json().catch(() => []);
    return Array.isArray(data) && data.some((row) => row.key === '__admin_probe');
  }

  async function enterDashboard() {
    if (!await verifyAdmin()) {
      await revokeCurrentSession();
      lockPanel('AUTH YRA, BET ADMINO TEISIU NERA.');
      throw new Error('NOT_ADMIN');
    }

    loginView.hidden = true;
    dashboardView.hidden = false;
    if (sessionUid) sessionUid.textContent = session?.user?.id ? `${session.user.id.slice(0, 8)}…` : '-';
    setGlobalStatus('AUTH OK / ADMIN OK / MEMORY ONLY');
    await Promise.allSettled([loadComplaints(), loadNotes(), loadControls(), loadPosts(), loadArchives()]);
  }

  async function handleLogin() {
    const password = adminPassword.value;
    if (!password) {
      setLoginStatus('RAKTAS TUSCIAS. LABAI SAUGU.', 'bad');
      return;
    }

    loginBtn.disabled = true;
    adminPassword.disabled = true;
    setLoginStatus('TIKRINAM AUTENTIFIKACIJA...', '');

    try {
      await login(password);
      adminPassword.value = '';
      setLoginStatus('AUTH PRAEJO. TIKRINAM PAREIGAS...', 'good');
      await enterDashboard();
    } catch {
      clearSession();
      setLoginStatus('PRIEIGA ATMESTA.', 'bad');
    } finally {
      loginBtn.disabled = false;
      adminPassword.disabled = false;
      if (!dashboardView.hidden) return;
      adminPassword.focus();
    }
  }

  async function logout() {
    const tokenWasPresent = Boolean(session?.access_token);
    if (tokenWasPresent) setGlobalStatus('NAIKINAMA SERVERIO SESIJA...');
    await revokeCurrentSession();
    lockPanel('ATSIJUNGTA. NORINT GRIZT REIK RAKTO.');
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'short' });
  }

  function button(text, className, onClick) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = className;
    el.textContent = text;
    el.addEventListener('click', onClick);
    return el;
  }

  async function loadComplaints() {
    const list = $('complaintsList');
    if (!list || !session) return;
    setGlobalStatus('KRAUNAMI SKUNDAI...');
    try {
      const response = await api('/rest/v1/gang_ad_complaints?select=case_id,complaint,anger,selected_language,visitor_number,created_at&order=created_at.desc&limit=200');
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      renderComplaints(await response.json());
      setGlobalStatus('SKUNDAI UZKRAUTI');
    } catch {
      if (!session) return;
      list.replaceChildren(Object.assign(document.createElement('div'), { className: 'empty', textContent: 'nepavyko uzkraut skundu' }));
      setGlobalStatus('SKUNDU MODULIS SUPYKO');
    }
  }

  function renderComplaints(rows) {
    const list = $('complaintsList');
    list.replaceChildren();
    $('complaintCount').textContent = rows.length;
    const avg = rows.length ? Math.round(rows.reduce((sum, row) => sum + Number(row.anger || 0), 0) / rows.length) : 0;
    $('complaintAnger').textContent = `${avg}%`;
    $('complaintLatest').textContent = rows[0]?.created_at ? formatDate(rows[0].created_at) : '-';

    if (!rows.length) {
      list.append(Object.assign(document.createElement('div'), { className: 'empty', textContent: 'skundu nera. reklamos laimejo.' }));
      return;
    }

    rows.forEach((row) => {
      const card = document.createElement('article');
      card.className = 'complaint-card';
      const head = document.createElement('div');
      head.className = 'complaint-head';
      const id = document.createElement('div');
      id.className = 'case-id';
      id.textContent = row.case_id || 'CASE-???';
      const del = button('TRINT SKUNDA', 'small-btn danger', async () => {
        if (!confirm(`Trint ${row.case_id || 'sita skunda'}?`)) return;
        await deleteComplaint(row.case_id);
      });
      head.append(id, del);

      const meta = document.createElement('div');
      meta.className = 'complaint-meta';
      meta.textContent = `${formatDate(row.created_at)} | PYKTIS ${row.anger ?? 0}% | KALBA ${row.selected_language || '?'} | ${row.visitor_number || 'visitor ?'}`;
      const text = document.createElement('div');
      text.className = 'complaint-text';
      text.textContent = row.complaint || '';
      const meter = document.createElement('div');
      meter.className = 'anger-meter';
      const fill = document.createElement('span');
      fill.style.width = `${Math.max(0, Math.min(100, Number(row.anger || 0)))}%`;
      meter.append(fill);
      card.append(head, meta, text, meter);
      list.append(card);
    });
  }

  async function deleteComplaint(caseId) {
    if (!caseId) return;
    const response = await api(`/rest/v1/gang_ad_complaints?case_id=eq.${encodeURIComponent(caseId)}`, {
      method: 'DELETE', headers: { Prefer: 'return=minimal' },
    });
    if (response.ok) await loadComplaints();
    else if (session) setGlobalStatus('SKUNDO ISTRINT NEPAVYKO');
  }

  async function loadNotes() {
    const response = await api('/rest/v1/gang_admin_notes?select=id,title,body,created_at,updated_at&order=updated_at.desc');
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    cachedNotes = await response.json();
    renderNotes();
  }

  function renderNotes() {
    const list = $('notesList');
    list.replaceChildren();
    if (!cachedNotes.length) {
      list.append(Object.assign(document.createElement('div'), { className: 'empty', textContent: 'nera uzrasu' }));
      return;
    }
    cachedNotes.forEach((note) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `note-row${editingNoteId === note.id ? ' active' : ''}`;
      const title = document.createElement('b');
      title.textContent = note.title;
      const time = document.createElement('small');
      time.textContent = formatDate(note.updated_at);
      row.append(title, time);
      row.addEventListener('click', () => openNote(note.id));
      list.append(row);
    });
  }

  function newNote() {
    editingNoteId = null;
    $('noteTitle').value = '';
    $('noteBody').value = '';
    $('deleteNoteBtn').disabled = true;
    $('noteState').textContent = 'NAUJAS UZRASAS';
    renderNotes();
    $('noteTitle').focus();
  }

  function openNote(id) {
    const note = cachedNotes.find((item) => item.id === id);
    if (!note) return;
    editingNoteId = note.id;
    $('noteTitle').value = note.title;
    $('noteBody').value = note.body;
    $('deleteNoteBtn').disabled = false;
    $('noteState').textContent = `REDAGUOJAMA ${String(note.id).slice(0, 8)}…`;
    renderNotes();
  }

  async function saveNote() {
    const title = $('noteTitle').value.trim();
    const body = $('noteBody').value;
    if (!title) {
      $('noteState').textContent = 'REIKIA PAVADINIMO NU';
      return;
    }
    const payload = { title, body, updated_at: new Date().toISOString() };
    const response = editingNoteId
      ? await api(`/rest/v1/gang_admin_notes?id=eq.${encodeURIComponent(editingNoteId)}`, {
          method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        })
      : await api('/rest/v1/gang_admin_notes', {
          method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        });
    if (!response.ok) {
      if (session) $('noteState').textContent = `NEISSISAUGOJO (${response.status})`;
      return;
    }
    const data = await response.json().catch(() => []);
    if (!editingNoteId && data[0]?.id) editingNoteId = data[0].id;
    $('noteState').textContent = 'ISSAUGOTA. KAZKAIP.';
    await loadNotes();
  }

  async function deleteNote() {
    if (!editingNoteId || !confirm('Tikrai trint sita uzrasa?')) return;
    const response = await api(`/rest/v1/gang_admin_notes?id=eq.${encodeURIComponent(editingNoteId)}`, {
      method: 'DELETE', headers: { Prefer: 'return=minimal' },
    });
    if (!response.ok) {
      if (session) $('noteState').textContent = 'TRINT NEPAVYKO';
      return;
    }
    newNote();
    await loadNotes();
  }

  async function loadControls() {
    const response = await api('/rest/v1/gang_admin_controls?select=key,value,updated_at&order=key.asc');
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    renderControls((await response.json()).filter((row) => row.key !== '__admin_probe'));
  }

  function renderControls(rows) {
    const list = $('controlsList');
    list.replaceChildren();
    if (!rows.length) {
      list.append(Object.assign(document.createElement('div'), { className: 'empty', textContent: 'nera valdymo raktu. dar.' }));
      return;
    }
    rows.forEach((row) => {
      const card = document.createElement('article');
      card.className = 'control-card';
      const head = document.createElement('div');
      head.className = 'control-head';
      const key = document.createElement('div');
      key.className = 'case-id';
      key.textContent = row.key;
      const actions = document.createElement('div');
      const edit = button('REDAGUOT', 'small-btn', () => {
        $('controlKey').value = row.key;
        $('controlValue').value = JSON.stringify(row.value, null, 2);
        $('controlValue').focus();
      });
      const del = button('TRINT', 'small-btn danger', async () => {
        if (!confirm(`Trint rakta ${row.key}?`)) return;
        const response = await api(`/rest/v1/gang_admin_controls?key=eq.${encodeURIComponent(row.key)}`, {
          method: 'DELETE', headers: { Prefer: 'return=minimal' },
        });
        if (response.ok) await loadControls();
      });
      actions.append(edit, document.createTextNode(' '), del);
      head.append(key, actions);
      const value = document.createElement('pre');
      value.className = 'control-value';
      value.textContent = JSON.stringify(row.value, null, 2);
      card.append(head, value);
      list.append(card);
    });
  }

  async function saveControl() {
    const key = $('controlKey').value.trim();
    const raw = $('controlValue').value.trim();
    if (!key || key === '__admin_probe') {
      setGlobalStatus('BLOGAS RAKTAS');
      return;
    }
    let value;
    try {
      value = raw ? JSON.parse(raw) : {};
    } catch {
      setGlobalStatus('JSON SUGEDES');
      return;
    }
    const response = await api('/rest/v1/gang_admin_controls?on_conflict=key', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
    });
    if (!response.ok) {
      if (session) setGlobalStatus(`VALDYMO RAKTAS NEISSISAUGOJO (${response.status})`);
      return;
    }
    $('controlKey').value = '';
    $('controlValue').value = '';
    setGlobalStatus('VALDYMO RAKTAS ISSAUGOTAS');
    await loadControls();
  }


  const CONTENT_LANGS = ['lt', 'en', 'fr', 'zh', 'ru', 'eo', 'la', 'fo', 'cy', 'eu', 'br'];
  let postLang = 'lt';
  let postTitleMap = {};
  let postBodyMap = {};
  let archiveLang = 'lt';
  let archiveSummaryMap = {};
  let archiveBodyMap = {};

  function cloneMap(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
  }

  function mapFallback(map, legacy = '') {
    if (!map || typeof map !== 'object') return legacy || '';
    return map.lt || map.en || CONTENT_LANGS.map((code) => map[code]).find(Boolean) || legacy || '';
  }

  function countTranslations(a, b) {
    return CONTENT_LANGS.filter((code) => String(a?.[code] || '').trim() || String(b?.[code] || '').trim()).length;
  }

  function updatePostTranslationCount() {
    const el = $('postTranslationCount');
    if (el) el.textContent = `VERTIMAI ${countTranslations(postTitleMap, postBodyMap)}/${CONTENT_LANGS.length}`;
  }

  function commitPostLanguage() {
    if (!CONTENT_LANGS.includes(postLang)) return;
    postTitleMap[postLang] = $('postTitle')?.value || '';
    postBodyMap[postLang] = $('postBody')?.value || '';
    updatePostTranslationCount();
  }

  function loadPostLanguage(code) {
    postLang = CONTENT_LANGS.includes(code) ? code : 'lt';
    if ($('postTranslationLang')) $('postTranslationLang').value = postLang;
    if ($('postTitle')) $('postTitle').value = postTitleMap[postLang] || '';
    if ($('postBody')) $('postBody').value = postBodyMap[postLang] || '';
    updatePostTranslationCount();
  }

  function switchPostLanguage() {
    commitPostLanguage();
    loadPostLanguage($('postTranslationLang')?.value || 'lt');
  }

  async function autoTranslatePost() {
    commitPostLanguage();
    const sourceTitle = postTitleMap[postLang] || '';
    const sourceBody = postBodyMap[postLang] || '';
    if (!sourceTitle.trim() && !sourceBody.trim()) {
      $('postState').textContent = 'PIRMA PARASYK SOURCE TEKSTA SITOJ KALBOJ';
      return;
    }

    const btn = $('autoTranslatePostBtn');
    if (btn) btn.disabled = true;
    $('postState').textContent = `VERTIMU DEPARTAMENTAS DIRBA IS ${postLang.toUpperCase()}...`;

    try {
      const translations = await requestAutoTranslations('post', postLang, sourceTitle, sourceBody);
      Object.entries(translations).forEach(([code, value]) => {
        if (!CONTENT_LANGS.includes(code) || code === postLang || !value || typeof value !== 'object') return;
        postTitleMap[code] = typeof value.title === 'string' ? value.title : '';
        postBodyMap[code] = typeof value.body === 'string' ? value.body : '';
      });
      loadPostLanguage(postLang);
      $('postState').textContent = `AUTO VERTIMAI PARUOSTI · ${countTranslations(postTitleMap, postBodyMap)}/${CONTENT_LANGS.length} · DAR REIK ISSAUGOT/PUBLIKUOT`;
    } catch (error) {
      const code = error?.code || '';
      if (code === 'OPENAI_API_KEY_MISSING') $('postState').textContent = 'TRUKSTA OPENAI_API_KEY SUPABASE SECRET';
      else if (code === 'SOURCE_TOO_LONG') $('postState').textContent = 'TEKSTAS PER ILGAS AUTO VERTIMUI';
      else if (code === 'ADMIN_ONLY') $('postState').textContent = 'VERTIMU DEPARTAMENTAS TAVES NEPAZINO';
      else $('postState').textContent = `AUTO VERTIMAI NEPAVYKO (${code || '???'})`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function loadPosts() {
    const response = await api('/rest/v1/gang_posts?select=id,title,body,title_i18n,body_i18n,published,pinned,created_at,updated_at,published_at&order=pinned.desc,published_at.desc.nullslast,created_at.desc');
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    cachedPosts = await response.json();
    renderPosts();
  }

  function renderPosts() {
    const list = $('postsList');
    if (!list) return;
    list.replaceChildren();
    if (!cachedPosts.length) {
      list.append(Object.assign(document.createElement('div'), { className: 'empty', textContent: 'nera postu. ramu.' }));
      return;
    }
    cachedPosts.forEach((post) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `note-row post-row${editingPostId === post.id ? ' active' : ''}`;
      const title = document.createElement('b');
      title.textContent = `${post.pinned ? '📌 ' : ''}${mapFallback(post.title_i18n, post.title) || '[be pavadinimo]'}`;
      const meta = document.createElement('small');
      meta.textContent = `${post.published ? 'VIESAS' : 'JUODRASTIS'} · VERT ${countTranslations(post.title_i18n, post.body_i18n)}/${CONTENT_LANGS.length} · ${formatDate(post.published_at || post.updated_at)}`;
      row.append(title, meta);
      row.addEventListener('click', () => openPost(post.id));
      list.append(row);
    });
  }

  function newPost() {
    editingPostId = null;
    postTitleMap = {};
    postBodyMap = {};
    postLang = 'lt';
    $('postPinned').checked = false;
    $('deletePostBtn').disabled = true;
    $('unpublishPostBtn').disabled = true;
    $('postState').textContent = 'NAUJAS POSTAS / DAR NEVIESAS';
    loadPostLanguage('lt');
    renderPosts();
    $('postTitle').focus();
  }

  function openPost(id, preferredLang = postLang) {
    const post = cachedPosts.find((item) => item.id === id);
    if (!post) return;
    editingPostId = post.id;
    postTitleMap = cloneMap(post.title_i18n);
    postBodyMap = cloneMap(post.body_i18n);
    if (!Object.keys(postTitleMap).length && post.title) postTitleMap.lt = post.title;
    if (!Object.keys(postBodyMap).length && post.body) postBodyMap.lt = post.body;
    $('postPinned').checked = Boolean(post.pinned);
    $('deletePostBtn').disabled = false;
    $('unpublishPostBtn').disabled = !post.published;
    $('postState').textContent = `${post.published ? 'PUBLIKUOTAS' : 'JUODRASTIS'} · ${String(post.id).slice(0, 8)}…`;
    loadPostLanguage(preferredLang);
    renderPosts();
  }

  async function persistPost(forcePublished = null) {
    commitPostLanguage();
    const legacyTitle = mapFallback(postTitleMap).trim();
    const legacyBody = postBodyMap.lt ?? postBodyMap.en ?? postBodyMap[postLang] ?? '';
    const pinned = $('postPinned').checked;
    if (!legacyTitle) {
      $('postState').textContent = 'REIKIA PAVADINIMO BENT VIENOJ KALBOJ';
      return false;
    }

    const current = cachedPosts.find((item) => item.id === editingPostId);
    const published = forcePublished === null ? Boolean(current?.published) : Boolean(forcePublished);
    const now = new Date().toISOString();
    const payload = {
      title: legacyTitle,
      body: legacyBody,
      title_i18n: postTitleMap,
      body_i18n: postBodyMap,
      published,
      pinned,
      updated_at: now,
      published_at: published ? (current?.published_at || now) : null,
    };

    $('postState').textContent = published ? 'SIUNCIAMA I PUSLAPI...' : 'SAUGOMA NEVIESAI...';
    const response = editingPostId
      ? await api(`/rest/v1/gang_posts?id=eq.${encodeURIComponent(editingPostId)}`, {
          method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        })
      : await api('/rest/v1/gang_posts', {
          method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        });

    if (!response.ok) {
      if (session) $('postState').textContent = `NEISSISAUGOJO (${response.status})`;
      return false;
    }
    const data = await response.json().catch(() => []);
    if (!editingPostId && data[0]?.id) editingPostId = data[0].id;
    const keepLang = postLang;
    await loadPosts();
    if (editingPostId) openPost(editingPostId, keepLang);
    $('postState').textContent = published ? 'VIESAS. VERTIMAI IRGI VIESI.' : 'ISSAUGOTA KAIP JUODRASTIS.';
    return true;
  }

  async function savePost() { await persistPost(null); }
  async function publishPost() { await persistPost(true); }
  async function unpublishPost() { if (editingPostId) await persistPost(false); }

  async function deletePost() {
    if (!editingPostId || !confirm('Tikrai trint sita posta?')) return;
    const response = await api(`/rest/v1/gang_posts?id=eq.${encodeURIComponent(editingPostId)}`, {
      method: 'DELETE', headers: { Prefer: 'return=minimal' },
    });
    if (!response.ok) {
      if (session) $('postState').textContent = 'TRINT NEPAVYKO';
      return;
    }
    newPost();
    await loadPosts();
  }

  function updateArchiveTranslationCount() {
    const el = $('archiveTranslationCount');
    if (el) el.textContent = `VERTIMAI ${countTranslations(archiveSummaryMap, archiveBodyMap)}/${CONTENT_LANGS.length}`;
  }

  function commitArchiveLanguage() {
    if (!CONTENT_LANGS.includes(archiveLang)) return;
    archiveSummaryMap[archiveLang] = $('archiveSummary')?.value || '';
    archiveBodyMap[archiveLang] = $('archiveBody')?.value || '';
    updateArchiveTranslationCount();
  }

  function loadArchiveLanguage(code) {
    archiveLang = CONTENT_LANGS.includes(code) ? code : 'lt';
    if ($('archiveTranslationLang')) $('archiveTranslationLang').value = archiveLang;
    if ($('archiveSummary')) $('archiveSummary').value = archiveSummaryMap[archiveLang] || '';
    if ($('archiveBody')) $('archiveBody').value = archiveBodyMap[archiveLang] || '';
    updateArchiveTranslationCount();
  }

  function switchArchiveLanguage() {
    commitArchiveLanguage();
    loadArchiveLanguage($('archiveTranslationLang')?.value || 'lt');
  }

  async function autoTranslateArchive() {
    commitArchiveLanguage();
    const sourceTitle = archiveSummaryMap[archiveLang] || '';
    const sourceBody = archiveBodyMap[archiveLang] || '';
    if (!sourceTitle.trim() && !sourceBody.trim()) {
      $('archiveState').textContent = 'PIRMA PARASYK SOURCE TEKSTA SITOJ KALBOJ';
      return;
    }

    const btn = $('autoTranslateArchiveBtn');
    if (btn) btn.disabled = true;
    $('archiveState').textContent = `VERTIMU DEPARTAMENTAS DIRBA IS ${archiveLang.toUpperCase()}...`;

    try {
      const translations = await requestAutoTranslations('archive', archiveLang, sourceTitle, sourceBody);
      Object.entries(translations).forEach(([code, value]) => {
        if (!CONTENT_LANGS.includes(code) || code === archiveLang || !value || typeof value !== 'object') return;
        archiveSummaryMap[code] = typeof value.title === 'string' ? value.title : '';
        archiveBodyMap[code] = typeof value.body === 'string' ? value.body : '';
      });
      loadArchiveLanguage(archiveLang);
      $('archiveState').textContent = `AUTO VERTIMAI PARUOSTI · ${countTranslations(archiveSummaryMap, archiveBodyMap)}/${CONTENT_LANGS.length} · DAR REIK ISSAUGOT/PUBLIKUOT`;
    } catch (error) {
      const code = error?.code || '';
      if (code === 'OPENAI_API_KEY_MISSING') $('archiveState').textContent = 'TRUKSTA OPENAI_API_KEY SUPABASE SECRET';
      else if (code === 'SOURCE_TOO_LONG') $('archiveState').textContent = 'TEKSTAS PER ILGAS AUTO VERTIMUI';
      else if (code === 'ADMIN_ONLY') $('archiveState').textContent = 'VERTIMU DEPARTAMENTAS TAVES NEPAZINO';
      else $('archiveState').textContent = `AUTO VERTIMAI NEPAVYKO (${code || '???'})`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function loadArchives() {
    const response = await api('/rest/v1/gang_archives?select=id,year_label,summary_lt,summary_en,summary_fr,body_lt,body_en,body_fr,summary_i18n,body_i18n,published,locked,sort_order,created_at,updated_at&order=sort_order.asc,created_at.asc');
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    cachedArchives = await response.json();
    renderArchives();
  }

  function renderArchives() {
    const list = $('archivesList');
    if (!list) return;
    list.replaceChildren();
    if (!cachedArchives.length) {
      list.append(Object.assign(document.createElement('div'), { className: 'empty', textContent: 'archyvu nera. istorija buvo istrinta.' }));
      return;
    }
    cachedArchives.forEach((entry) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `note-row archive-admin-row${editingArchiveId === entry.id ? ' active' : ''}`;
      const title = document.createElement('b');
      title.textContent = `${entry.locked ? '🔒 ' : ''}${entry.year_label} · ${mapFallback(entry.summary_i18n, entry.summary_lt || entry.summary_en) || '[be pavadinimo]'}`;
      const meta = document.createElement('small');
      meta.textContent = `${entry.published ? 'VIESAS' : 'JUODRASTIS'} · VERT ${countTranslations(entry.summary_i18n, entry.body_i18n)}/${CONTENT_LANGS.length} · EILE ${entry.sort_order}`;
      row.append(title, meta);
      row.addEventListener('click', () => openArchive(entry.id));
      list.append(row);
    });
  }

  function newArchive() {
    editingArchiveId = null;
    archiveSummaryMap = {};
    archiveBodyMap = {};
    archiveLang = 'lt';
    $('archiveYear').value = '';
    const maxSort = cachedArchives.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0);
    $('archiveSort').value = String(maxSort + 10);
    $('archiveLocked').checked = false;
    $('unpublishArchiveBtn').disabled = true;
    $('deleteArchiveBtn').disabled = true;
    $('archiveState').textContent = 'NAUJAS ARCHYVO IRASAS / JUODRASTIS';
    loadArchiveLanguage('lt');
    renderArchives();
    $('archiveYear').focus();
  }

  function openArchive(id, preferredLang = archiveLang) {
    const entry = cachedArchives.find((item) => item.id === id);
    if (!entry) return;
    editingArchiveId = entry.id;
    archiveSummaryMap = { lt: entry.summary_lt || '', en: entry.summary_en || '', fr: entry.summary_fr || '', ...cloneMap(entry.summary_i18n) };
    archiveBodyMap = { lt: entry.body_lt || '', en: entry.body_en || '', fr: entry.body_fr || '', ...cloneMap(entry.body_i18n) };
    $('archiveYear').value = entry.year_label;
    $('archiveSort').value = entry.sort_order;
    $('archiveLocked').checked = Boolean(entry.locked);
    $('unpublishArchiveBtn').disabled = !entry.published;
    $('deleteArchiveBtn').disabled = false;
    $('archiveState').textContent = `${entry.published ? 'PUBLIKUOTAS' : 'JUODRASTIS'} · ${String(entry.id).slice(0, 8)}…`;
    loadArchiveLanguage(preferredLang);
    renderArchives();
  }

  async function saveArchive(publishOverride = null) {
    commitArchiveLanguage();
    const year = $('archiveYear').value.trim();
    if (!year) {
      $('archiveState').textContent = 'REIKIA METU / KODO';
      return false;
    }
    const current = cachedArchives.find((item) => item.id === editingArchiveId);
    const published = publishOverride === null ? Boolean(current?.published) : Boolean(publishOverride);
    const payload = {
      year_label: year,
      sort_order: Number.parseInt($('archiveSort').value || '0', 10) || 0,
      locked: $('archiveLocked').checked,
      summary_i18n: archiveSummaryMap,
      body_i18n: archiveBodyMap,
      summary_lt: archiveSummaryMap.lt || '',
      summary_en: archiveSummaryMap.en || '',
      summary_fr: archiveSummaryMap.fr || '',
      body_lt: archiveBodyMap.lt || '',
      body_en: archiveBodyMap.en || '',
      body_fr: archiveBodyMap.fr || '',
      published,
      updated_at: new Date().toISOString(),
    };
    $('archiveState').textContent = published ? 'SAUGOMA / VIESINAMA...' : 'SAUGOMAS JUODRASTIS...';
    const response = editingArchiveId
      ? await api(`/rest/v1/gang_archives?id=eq.${encodeURIComponent(editingArchiveId)}`, {
          method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        })
      : await api('/rest/v1/gang_archives', {
          method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        });
    if (!response.ok) {
      if (session) $('archiveState').textContent = `NEISSISAUGOJO (${response.status})`;
      return false;
    }
    const data = await response.json().catch(() => []);
    if (!editingArchiveId && data[0]?.id) editingArchiveId = data[0].id;
    const keepLang = archiveLang;
    await loadArchives();
    if (editingArchiveId) openArchive(editingArchiveId, keepLang);
    $('archiveState').textContent = published ? 'ARCHYVAS VIESAS. VERTIMAI IRGI.' : 'JUODRASTIS ISSAUGOTAS.';
    return true;
  }

  async function unpublishArchive() { if (editingArchiveId) await saveArchive(false); }

  async function deleteArchive() {
    if (!editingArchiveId || !confirm('Tikrai trint sita archyvo irasa?')) return;
    const response = await api(`/rest/v1/gang_archives?id=eq.${encodeURIComponent(editingArchiveId)}`, {
      method: 'DELETE', headers: { Prefer: 'return=minimal' },
    });
    if (!response.ok) {
      if (session) $('archiveState').textContent = 'TRINT NEPAVYKO';
      return;
    }
    newArchive();
    await loadArchives();
  }

  $('postTranslationLang')?.addEventListener('change', switchPostLanguage);
  $('autoTranslatePostBtn')?.addEventListener('click', autoTranslatePost);
  $('postTitle')?.addEventListener('input', commitPostLanguage);
  $('postBody')?.addEventListener('input', commitPostLanguage);
  $('archiveTranslationLang')?.addEventListener('change', switchArchiveLanguage);
  $('autoTranslateArchiveBtn')?.addEventListener('click', autoTranslateArchive);
  $('archiveSummary')?.addEventListener('input', commitArchiveLanguage);
  $('archiveBody')?.addEventListener('input', commitArchiveLanguage);

  function setTab(name) {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${name}`));
  }

  loginBtn?.addEventListener('click', handleLogin);
  adminPassword?.addEventListener('keydown', (event) => { if (event.key === 'Enter') handleLogin(); });
  logoutBtn?.addEventListener('click', logout);
  purgeSessionBtn?.addEventListener('click', logout);
  $('refreshComplaints')?.addEventListener('click', loadComplaints);
  $('newNoteBtn')?.addEventListener('click', newNote);
  $('saveNoteBtn')?.addEventListener('click', saveNote);
  $('deleteNoteBtn')?.addEventListener('click', deleteNote);
  $('refreshControls')?.addEventListener('click', loadControls);
  $('saveControlBtn')?.addEventListener('click', saveControl);
  $('refreshPosts')?.addEventListener('click', loadPosts);
  $('newPostBtn')?.addEventListener('click', newPost);
  $('savePostBtn')?.addEventListener('click', savePost);
  $('publishPostBtn')?.addEventListener('click', publishPost);
  $('unpublishPostBtn')?.addEventListener('click', unpublishPost);
  $('deletePostBtn')?.addEventListener('click', deletePost);
  $('refreshArchives')?.addEventListener('click', loadArchives);
  $('newArchiveBtn')?.addEventListener('click', newArchive);
  $('saveArchiveBtn')?.addEventListener('click', () => saveArchive(null));
  $('publishArchiveBtn')?.addEventListener('click', () => saveArchive(true));
  $('unpublishArchiveBtn')?.addEventListener('click', unpublishArchive);
  $('deleteArchiveBtn')?.addEventListener('click', deleteArchive);
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));

  setInterval(() => {
    const el = $('adminClock');
    if (el) el.textContent = new Date().toLocaleTimeString('lt-LT', { hour12: false });
  }, 1000);

  window.addEventListener('pagehide', () => {
    const token = session?.access_token;
    clearSession();
    if (!token) return;
    try {
      fetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: '{}',
        keepalive: true,
      }).catch(() => {});
    } catch {}
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) lockPanel('PUSLAPIS BUVO UZMIGDYTAS. REIK RAKTO.');
  });

  dashboardView.hidden = true;
  loginView.hidden = false;
  setLoginStatus('LAUKIAMA OPERATORIAUS. KIEKVIENAS NAUJAS IKELIMAS REIKALAUJA RAKTO.', '');
  adminPassword?.focus();
})();
