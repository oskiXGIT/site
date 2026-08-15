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
    await Promise.allSettled([loadComplaints(), loadNotes(), loadControls(), loadPosts()]);
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


  async function loadPosts() {
    const response = await api('/rest/v1/gang_posts?select=id,title,body,published,pinned,created_at,updated_at,published_at&order=pinned.desc,published_at.desc.nullslast,created_at.desc');
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
      title.textContent = `${post.pinned ? '📌 ' : ''}${post.title}`;
      const meta = document.createElement('small');
      meta.textContent = `${post.published ? 'VIESAS' : 'JUODRASTIS'} · ${formatDate(post.published_at || post.updated_at)}`;
      row.append(title, meta);
      row.addEventListener('click', () => openPost(post.id));
      list.append(row);
    });
  }

  function newPost() {
    editingPostId = null;
    $('postTitle').value = '';
    $('postBody').value = '';
    $('postPublished').checked = false;
    $('postPinned').checked = false;
    $('deletePostBtn').disabled = true;
    $('postState').textContent = 'NAUJAS POSTAS / JUODRASTIS';
    renderPosts();
    $('postTitle').focus();
  }

  function openPost(id) {
    const post = cachedPosts.find((item) => item.id === id);
    if (!post) return;
    editingPostId = post.id;
    $('postTitle').value = post.title;
    $('postBody').value = post.body || '';
    $('postPublished').checked = Boolean(post.published);
    $('postPinned').checked = Boolean(post.pinned);
    $('deletePostBtn').disabled = false;
    $('postState').textContent = `${post.published ? 'PUBLIKUOTAS' : 'JUODRASTIS'} · ${String(post.id).slice(0, 8)}…`;
    renderPosts();
  }

  async function savePost() {
    const title = $('postTitle').value.trim();
    const body = $('postBody').value;
    const published = $('postPublished').checked;
    const pinned = $('postPinned').checked;
    if (!title) {
      $('postState').textContent = 'REIKIA PAVADINIMO';
      return;
    }

    const current = cachedPosts.find((item) => item.id === editingPostId);
    const now = new Date().toISOString();
    const payload = {
      title,
      body,
      published,
      pinned,
      updated_at: now,
      published_at: published ? (current?.published_at || now) : null,
    };

    $('postState').textContent = published ? 'PUBLIKUOJAMA...' : 'SAUGOMAS JUODRASTIS...';
    const response = editingPostId
      ? await api(`/rest/v1/gang_posts?id=eq.${encodeURIComponent(editingPostId)}`, {
          method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        })
      : await api('/rest/v1/gang_posts', {
          method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        });

    if (!response.ok) {
      if (session) $('postState').textContent = `NEISSISAUGOJO (${response.status})`;
      return;
    }
    const data = await response.json().catch(() => []);
    if (!editingPostId && data[0]?.id) editingPostId = data[0].id;
    $('postState').textContent = published ? 'PUBLIKUOTA. REFRESHINK PAGRINDINI.' : 'JUODRASTIS ISSAUGOTAS.';
    await loadPosts();
  }

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
  $('deletePostBtn')?.addEventListener('click', deletePost);
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
