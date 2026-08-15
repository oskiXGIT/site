(() => {
  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const INTERNAL_EMAIL = 'operator@oski.website';
  const SESSION_KEY = 'gangRealAdminSessionV1';

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

  let editingNoteId = null;
  let cachedNotes = [];

  function setLoginStatus(text, kind = '') {
    loginStatus.textContent = text;
    loginStatus.className = `login-status ${kind}`.trim();
  }

  function setGlobalStatus(text) {
    if (globalStatus) globalStatus.textContent = text;
    if (footerStatus) footerStatus.textContent = text;
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveSession(data) {
    const payload = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + Math.max(60, Number(data.expires_in || 3600)) * 1000,
      user: data.user || null,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    return payload;
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  async function refreshSession() {
    const session = getSession();
    if (!session?.refresh_token) return false;

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (!response.ok) return false;
      saveSession(await response.json());
      return true;
    } catch {
      return false;
    }
  }

  async function api(path, options = {}, retry = true) {
    let session = getSession();
    if (!session) throw new Error('NO_SESSION');

    if (session.expires_at && Date.now() > session.expires_at - 30000) {
      await refreshSession();
      session = getSession();
    }

    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    };

    if (options.body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });

    if (response.status === 401 && retry && await refreshSession()) {
      return api(path, options, false);
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
    if (!response.ok) {
      throw new Error(data?.msg || data?.message || 'LOGIN_FAILED');
    }

    saveSession(data);
    return data;
  }

  async function verifyAdmin() {
    const response = await api('/rest/v1/gang_admin_controls?select=key&key=eq.__admin_probe&limit=1');
    if (!response.ok) return false;
    const data = await response.json().catch(() => []);
    return Array.isArray(data) && data.some((row) => row.key === '__admin_probe');
  }

  async function enterDashboard() {
    const allowed = await verifyAdmin();
    if (!allowed) {
      clearSession();
      throw new Error('AUTH_OK_BUT_NOT_ADMIN');
    }

    const session = getSession();
    loginView.hidden = true;
    dashboardView.hidden = false;
    if (sessionUid) sessionUid.textContent = session?.user?.id ? `${session.user.id.slice(0, 8)}…` : '-';
    setGlobalStatus('AUTH OK / ADMIN OK');
    await Promise.allSettled([loadComplaints(), loadNotes(), loadControls()]);
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
      setLoginStatus('AUTH PRAEJO. TIKRINAM PAREIGAS...', 'good');
      adminPassword.value = '';
      await enterDashboard();
    } catch (error) {
      clearSession();
      if (String(error.message).includes('AUTH_OK_BUT_NOT_ADMIN')) {
        setLoginStatus('SLAPTAZODIS GAL IR TEISINGAS, BET ADMINO PAREIGU NERA.', 'bad');
      } else {
        setLoginStatus('PRIEIGA ATMESTA. SISTEMA APSIMETA KAD NEZINO KODEL.', 'bad');
      }
    } finally {
      loginBtn.disabled = false;
      adminPassword.disabled = false;
      adminPassword.focus();
    }
  }

  function logout() {
    clearSession();
    dashboardView.hidden = true;
    loginView.hidden = false;
    setLoginStatus('SESIJA SUNAIKINTA.', '');
    adminPassword.value = '';
    adminPassword.focus();
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
    if (!list) return;
    setGlobalStatus('KRAUNAMI SKUNDAI...');

    try {
      const response = await api('/rest/v1/gang_ad_complaints?select=case_id,complaint,anger,selected_language,visitor_number,created_at&order=created_at.desc&limit=200');
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const rows = await response.json();
      renderComplaints(rows);
      setGlobalStatus('SKUNDAI UZKRAUTI');
    } catch {
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
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
    if (!response.ok) {
      setGlobalStatus('SKUNDO ISTRINT NEPAVYKO');
      return;
    }
    await loadComplaints();
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
    let response;

    if (editingNoteId) {
      response = await api(`/rest/v1/gang_admin_notes?id=eq.${encodeURIComponent(editingNoteId)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      });
    } else {
      response = await api('/rest/v1/gang_admin_notes', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      $('noteState').textContent = `NEISSISAUGOJO (${response.status})`;
      return;
    }

    const data = await response.json().catch(() => []);
    if (!editingNoteId && data[0]?.id) editingNoteId = data[0].id;
    $('noteState').textContent = 'ISSaugota. kazkaip.';
    await loadNotes();
  }

  async function deleteNote() {
    if (!editingNoteId) return;
    if (!confirm('Tikrai trint sita uzrasa?')) return;
    const response = await api(`/rest/v1/gang_admin_notes?id=eq.${encodeURIComponent(editingNoteId)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
    if (!response.ok) {
      $('noteState').textContent = 'TRINT NEPAVYKO';
      return;
    }
    newNote();
    await loadNotes();
  }

  async function loadControls() {
    const response = await api('/rest/v1/gang_admin_controls?select=key,value,updated_at&order=key.asc');
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const rows = (await response.json()).filter((row) => row.key !== '__admin_probe');
    renderControls(rows);
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
          method: 'DELETE',
          headers: { Prefer: 'return=minimal' },
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
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
    });

    if (!response.ok) {
      setGlobalStatus(`VALDYMO RAKTAS NEISSISAUGOJO (${response.status})`);
      return;
    }

    $('controlKey').value = '';
    $('controlValue').value = '';
    setGlobalStatus('VALDYMO RAKTAS ISSAUGOTAS');
    await loadControls();
  }

  function setTab(name) {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${name}`));
  }

  loginBtn?.addEventListener('click', handleLogin);
  adminPassword?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleLogin();
  });
  logoutBtn?.addEventListener('click', logout);
  purgeSessionBtn?.addEventListener('click', logout);
  $('refreshComplaints')?.addEventListener('click', loadComplaints);
  $('newNoteBtn')?.addEventListener('click', newNote);
  $('saveNoteBtn')?.addEventListener('click', saveNote);
  $('deleteNoteBtn')?.addEventListener('click', deleteNote);
  $('refreshControls')?.addEventListener('click', loadControls);
  $('saveControlBtn')?.addEventListener('click', saveControl);
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));

  setInterval(() => {
    const now = new Date();
    const el = $('adminClock');
    if (el) el.textContent = now.toLocaleTimeString('lt-LT', { hour12: false });
  }, 1000);

  (async () => {
    const existing = getSession();
    if (!existing) {
      adminPassword?.focus();
      return;
    }

    setLoginStatus('RASTA SENA SESIJA. TIKRINAM...', '');
    try {
      await enterDashboard();
    } catch {
      clearSession();
      setLoginStatus('SENA SESIJA NEGALIOJA. REIK RAKTO.', 'bad');
      adminPassword?.focus();
    }
  })();
})();