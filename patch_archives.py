from pathlib import Path


def once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing marker: {label}')
    return text.replace(old, new, 1)

# ---------- index.html ----------
p = Path('index.html')
s = p.read_text(encoding='utf-8')
old_grid = '''          <div class="window-body archive-grid">
            <button class="archive-item" data-archive="2007"><b>2007</b><span data-i18n="archive.first">pirmas incidentas</span></button>
            <button class="archive-item" data-archive="2011"><b>2011</b><span data-i18n="archive.van">busiko byla</span></button>
            <button class="archive-item" data-archive="2016"><b>2016</b><span data-i18n="archive.it">IT katastrofa</span></button>
            <button class="archive-item" data-archive="2022"><b>2022</b><span>[REDACTED]</span></button>
            <button class="archive-item" data-archive="2026"><b>2026</b><span data-i18n="archive.revival">atgimimas</span></button>
            <button class="archive-item locked"><b>????</b><span data-i18n="archive.locked">PRIEIGA UZDRAUSTA</span></button>
          </div>'''
new_grid = '''          <div class="window-body archive-grid" id="dynamicArchives">
            <div class="archive-item locked"><b>...</b><span>kraunamas archyvas...</span></div>
          </div>'''
s = once(s, old_grid, new_grid, 'public archive grid')
s = once(s, '  <script src="posts.js?v=20260816c"></script>', '  <script src="posts.js?v=20260816c"></script>\n  <script src="archives.js?v=20260816a"></script>', 'archives script include')
p.write_text(s, encoding='utf-8')

archives_js = r'''(() => {
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
'''
Path('archives.js').write_text(archives_js, encoding='utf-8')

# ---------- admin.html ----------
p = Path('admin.html')
s = p.read_text(encoding='utf-8')
s = once(
    s,
    '        <button class="tab" data-tab="posts">POSTAI</button>\n        <button class="tab" data-tab="session">SESIJA</button>',
    '        <button class="tab" data-tab="posts">POSTAI</button>\n        <button class="tab" data-tab="archives">ARCHYVAI</button>\n        <button class="tab" data-tab="session">SESIJA</button>',
    'admin archive nav'
)
archive_panel = '''      <section class="tab-panel" id="tab-archives">
        <div class="panel-title"><b>ARCHYVU_REGISTRAS.db</b><button id="newArchiveBtn" class="small-btn">NAUJAS</button></div>
        <div class="archive-admin-layout">
          <div>
            <div class="post-admin-toolbar">
              <span class="dim">VIESAS ARCHYVAS / TIESIAI I PUSLAPI</span>
              <button id="refreshArchives" class="small-btn">ATNAUJINT</button>
            </div>
            <div id="archivesList" class="side-list archive-admin-list"><div class="empty">kraunam archyvus...</div></div>
          </div>
          <div class="editor archive-editor">
            <div class="archive-meta-grid">
              <input id="archiveYear" maxlength="32" placeholder="metai / kodas, pvz. 2031" />
              <input id="archiveSort" type="number" min="-100000" max="100000" step="1" value="0" placeholder="eile" />
            </div>
            <label class="archive-check"><input id="archiveLocked" type="checkbox" /> UZRAKINTAS / NEATIDAROMAS</label>

            <div class="archive-lang-block"><b>LT</b>
              <input id="archiveSummaryLt" maxlength="240" placeholder="trumpas pavadinimas" />
              <textarea id="archiveBodyLt" maxlength="20000" placeholder="pilnas archyvo tekstas"></textarea>
            </div>
            <div class="archive-lang-block"><b>EN</b>
              <input id="archiveSummaryEn" maxlength="240" placeholder="short label" />
              <textarea id="archiveBodyEn" maxlength="20000" placeholder="full archive text"></textarea>
            </div>
            <div class="archive-lang-block"><b>FR</b>
              <input id="archiveSummaryFr" maxlength="240" placeholder="petit label" />
              <textarea id="archiveBodyFr" maxlength="20000" placeholder="texte complet"></textarea>
            </div>

            <div class="editor-actions">
              <button id="saveArchiveBtn" class="small-btn">ISSAUGOT PAKEITIMUS</button>
              <button id="publishArchiveBtn" class="main-btn">PUBLIKUOT / ATNAUJINT</button>
              <button id="unpublishArchiveBtn" class="small-btn" disabled>NUIMT NUO PUSLAPIO</button>
              <button id="deleteArchiveBtn" class="small-btn danger" disabled>TRINT</button>
            </div>
            <div class="tiny" id="archiveState">NAUJAS ARCHYVO IRASAS / JUODRASTIS</div>
          </div>
        </div>
      </section>

'''
s = once(s, '      <section class="tab-panel" id="tab-session">', archive_panel + '      <section class="tab-panel" id="tab-session">', 'admin archive panel')
s = s.replace('admin.js?v=20260816b', 'admin.js?v=20260816c')
p.write_text(s, encoding='utf-8')

# ---------- admin.js ----------
p = Path('admin.js')
s = p.read_text(encoding='utf-8')
s = once(
    s,
    '  let editingPostId = null;\n  let cachedPosts = [];',
    '  let editingPostId = null;\n  let cachedPosts = [];\n  let editingArchiveId = null;\n  let cachedArchives = [];',
    'archive state'
)
s = once(
    s,
    '    await Promise.allSettled([loadComplaints(), loadNotes(), loadControls(), loadPosts()]);',
    '    await Promise.allSettled([loadComplaints(), loadNotes(), loadControls(), loadPosts(), loadArchives()]);',
    'archive loader'
)
archive_functions = r'''
  async function loadArchives() {
    const response = await api('/rest/v1/gang_archives?select=id,year_label,summary_lt,summary_en,summary_fr,body_lt,body_en,body_fr,published,locked,sort_order,created_at,updated_at&order=sort_order.asc,created_at.asc');
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
      title.textContent = `${entry.locked ? '🔒 ' : ''}${entry.year_label} · ${entry.summary_lt || entry.summary_en || '[be pavadinimo]'}`;
      const meta = document.createElement('small');
      meta.textContent = `${entry.published ? 'VIESAS' : 'JUODRASTIS'} · EILE ${entry.sort_order}`;
      row.append(title, meta);
      row.addEventListener('click', () => openArchive(entry.id));
      list.append(row);
    });
  }

  function newArchive() {
    editingArchiveId = null;
    $('archiveYear').value = '';
    $('archiveSort').value = String((cachedArchives.at(-1)?.sort_order || 0) + 10);
    $('archiveLocked').checked = false;
    $('archiveSummaryLt').value = '';
    $('archiveSummaryEn').value = '';
    $('archiveSummaryFr').value = '';
    $('archiveBodyLt').value = '';
    $('archiveBodyEn').value = '';
    $('archiveBodyFr').value = '';
    $('unpublishArchiveBtn').disabled = true;
    $('deleteArchiveBtn').disabled = true;
    $('archiveState').textContent = 'NAUJAS ARCHYVO IRASAS / JUODRASTIS';
    renderArchives();
    $('archiveYear').focus();
  }

  function openArchive(id) {
    const entry = cachedArchives.find((item) => item.id === id);
    if (!entry) return;
    editingArchiveId = entry.id;
    $('archiveYear').value = entry.year_label;
    $('archiveSort').value = entry.sort_order;
    $('archiveLocked').checked = Boolean(entry.locked);
    $('archiveSummaryLt').value = entry.summary_lt || '';
    $('archiveSummaryEn').value = entry.summary_en || '';
    $('archiveSummaryFr').value = entry.summary_fr || '';
    $('archiveBodyLt').value = entry.body_lt || '';
    $('archiveBodyEn').value = entry.body_en || '';
    $('archiveBodyFr').value = entry.body_fr || '';
    $('unpublishArchiveBtn').disabled = !entry.published;
    $('deleteArchiveBtn').disabled = false;
    $('archiveState').textContent = `${entry.published ? 'PUBLIKUOTAS' : 'JUODRASTIS'} · ${String(entry.id).slice(0, 8)}…`;
    renderArchives();
  }

  async function saveArchive(publishOverride = null) {
    const year = $('archiveYear').value.trim();
    if (!year) {
      $('archiveState').textContent = 'REIKIA METU / KODO';
      return;
    }
    const current = cachedArchives.find((item) => item.id === editingArchiveId);
    const published = publishOverride === null ? Boolean(current?.published) : Boolean(publishOverride);
    const payload = {
      year_label: year,
      sort_order: Number.parseInt($('archiveSort').value || '0', 10) || 0,
      locked: $('archiveLocked').checked,
      summary_lt: $('archiveSummaryLt').value,
      summary_en: $('archiveSummaryEn').value,
      summary_fr: $('archiveSummaryFr').value,
      body_lt: $('archiveBodyLt').value,
      body_en: $('archiveBodyEn').value,
      body_fr: $('archiveBodyFr').value,
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
      return;
    }
    const data = await response.json().catch(() => []);
    if (!editingArchiveId && data[0]?.id) editingArchiveId = data[0].id;
    $('archiveState').textContent = published ? 'ARCHYVAS VIESAS.' : 'JUODRASTIS ISSAUGOTAS.';
    await loadArchives();
    if (editingArchiveId) openArchive(editingArchiveId);
  }

  async function unpublishArchive() {
    if (!editingArchiveId) return;
    await saveArchive(false);
  }

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

'''
s = once(s, '  function setTab(name) {', archive_functions + '  function setTab(name) {', 'archive functions insertion')
s = once(
    s,
    "  $('deletePostBtn')?.addEventListener('click', deletePost);\n  document.querySelectorAll('.tab')",
    "  $('deletePostBtn')?.addEventListener('click', deletePost);\n  $('refreshArchives')?.addEventListener('click', loadArchives);\n  $('newArchiveBtn')?.addEventListener('click', newArchive);\n  $('saveArchiveBtn')?.addEventListener('click', () => saveArchive(null));\n  $('publishArchiveBtn')?.addEventListener('click', () => saveArchive(true));\n  $('unpublishArchiveBtn')?.addEventListener('click', unpublishArchive);\n  $('deleteArchiveBtn')?.addEventListener('click', deleteArchive);\n  document.querySelectorAll('.tab')",
    'archive listeners'
)
p.write_text(s, encoding='utf-8')

# ---------- admin.css ----------
p = Path('admin.css')
s = p.read_text(encoding='utf-8')
if '/* ADMIN_ARCHIVES */' not in s:
    s += r'''

/* ADMIN_ARCHIVES */
.archive-admin-layout { display:grid; grid-template-columns:minmax(240px,.75fr) minmax(360px,1.25fr); gap:14px; }
.archive-admin-list { max-height:680px; overflow:auto; }
.archive-admin-row small { display:block; opacity:.65; margin-top:3px; }
.archive-meta-grid { display:grid; grid-template-columns:1fr 120px; gap:8px; }
.archive-check { display:flex; align-items:center; gap:7px; padding:9px 0; font-size:12px; cursor:pointer; }
.archive-check input { width:auto; }
.archive-lang-block { border:1px solid rgba(255,255,255,.12); padding:8px; margin:8px 0; }
.archive-lang-block > b { display:block; margin-bottom:6px; }
.archive-lang-block textarea { min-height:105px; }
@media (max-width:760px) { .archive-admin-layout { grid-template-columns:1fr; } .archive-meta-grid { grid-template-columns:1fr; } }
'''
p.write_text(s, encoding='utf-8')

Path('patch_archives.py').unlink()
Path('.github/workflows/patch-archives.yml').unlink()
