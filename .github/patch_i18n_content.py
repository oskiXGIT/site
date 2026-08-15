from pathlib import Path
import re

LANG_OPTIONS = '''
                <option value="lt">LT · LIETUVIŲ</option>
                <option value="en">EN · ENGLISH</option>
                <option value="fr">FR · FRANÇAIS</option>
                <option value="zh">ZH · 中文</option>
                <option value="ru">RU · РУССКИЙ</option>
                <option value="eo">EO · ESPERANTO</option>
                <option value="la">LA · LATINA</option>
                <option value="fo">FO · FØROYSKT</option>
                <option value="cy">CY · CYMRAEG</option>
                <option value="eu">EU · EUSKARA</option>
                <option value="br">BR · BREZHONEG</option>'''

# ---------- admin HTML ----------
p = Path('admin.html')
s = p.read_text(encoding='utf-8')
post_start = s.index('      <section class="tab-panel" id="tab-posts">')
archive_start = s.index('      <section class="tab-panel" id="tab-archives">', post_start)
session_start = s.index('      <section class="tab-panel" id="tab-session">', archive_start)

posts_html = f'''      <section class="tab-panel" id="tab-posts">
        <div class="panel-title"><b>VIESU_POSTU_TRANSMISIJA.db</b><button id="newPostBtn" class="small-btn">NAUJAS</button></div>
        <div class="post-admin-layout">
          <div>
            <div class="post-admin-toolbar">
              <span class="dim">CIA JAU TIESIAI I PUSLAPI</span>
              <button id="refreshPosts" class="small-btn">ATNAUJINT</button>
            </div>
            <div id="postsList" class="side-list post-list"><div class="empty">nera postu</div></div>
          </div>
          <div class="editor post-editor">
            <div class="translation-toolbar">
              <label>REDAGUOJAMA KALBA
                <select id="postTranslationLang">{LANG_OPTIONS}
                </select>
              </label>
              <span id="postTranslationCount">VERTIMAI 0/11</span>
            </div>
            <input id="postTitle" maxlength="160" placeholder="posto pavadinimas SITOJ kalboj" />
            <textarea id="postBody" maxlength="20000" placeholder="posto tekstas SITOJ kalboj"></textarea>
            <div class="translation-hint">pakeitus kalba laukai persijungia i tos pacios posto versija. viskas issisaugo vienam poste.</div>
            <div class="post-flags">
              <label><input id="postPinned" type="checkbox" /> PRISEGTAS VIRSUJ</label>
            </div>
            <div class="editor-actions">
              <button id="savePostBtn" class="small-btn">ISSAUGOT</button>
              <button id="publishPostBtn" class="main-btn">PUBLIKUOT / ATNAUJINT</button>
              <button id="unpublishPostBtn" class="small-btn" disabled>NUIMT NUO PUSLAPIO</button>
              <button id="deletePostBtn" class="small-btn danger" disabled>TRINT</button>
            </div>
            <div class="tiny" id="postState">NAUJAS POSTAS / JUODRASTIS</div>
          </div>
        </div>
      </section>

'''

archives_html = f'''      <section class="tab-panel" id="tab-archives">
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

            <div class="translation-toolbar">
              <label>REDAGUOJAMA KALBA
                <select id="archiveTranslationLang">{LANG_OPTIONS}
                </select>
              </label>
              <span id="archiveTranslationCount">VERTIMAI 0/11</span>
            </div>
            <div class="archive-lang-block">
              <input id="archiveSummary" maxlength="240" placeholder="trumpas pavadinimas SITOJ kalboj" />
              <textarea id="archiveBody" maxlength="20000" placeholder="pilnas archyvo tekstas SITOJ kalboj"></textarea>
            </div>
            <div class="translation-hint">metai / kodas, uzrakinimas ir eile yra bendri. pavadinimas ir tekstas keiciasi pagal kalba.</div>

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

s = s[:post_start] + posts_html + archives_html + s[session_start:]
s = re.sub(r'admin\.js\?v=[^"\']+', 'admin.js?v=20260816d', s)
p.write_text(s, encoding='utf-8')

# ---------- admin CSS ----------
p = Path('admin.css')
s = p.read_text(encoding='utf-8')
if '/* CONTENT_I18N_EDITOR */' not in s:
    s += r'''

/* CONTENT_I18N_EDITOR */
.translation-toolbar { display:flex; align-items:flex-end; justify-content:space-between; gap:10px; margin:0 0 9px; padding:9px; border:1px dashed rgba(255,255,255,.18); background:rgba(0,0,0,.18); }
.translation-toolbar label { display:grid; gap:5px; font-size:10px; letter-spacing:.08em; opacity:.88; }
.translation-toolbar select { min-width:210px; max-width:100%; padding:8px 9px; color:inherit; background:#090d12; border:1px solid rgba(255,255,255,.22); font:inherit; }
.translation-toolbar span { font-size:11px; opacity:.72; white-space:nowrap; }
.translation-hint { font-size:11px; line-height:1.45; opacity:.58; margin:-2px 0 8px; }
@media (max-width:620px) { .translation-toolbar { align-items:stretch; flex-direction:column; } .translation-toolbar select { width:100%; } }
'''
p.write_text(s, encoding='utf-8')

# ---------- admin JS ----------
p = Path('admin.js')
s = p.read_text(encoding='utf-8')
start = s.index('  async function loadPosts() {')
end = s.index('  function setTab(name) {', start)

block = r'''  const CONTENT_LANGS = ['lt', 'en', 'fr', 'zh', 'ru', 'eo', 'la', 'fo', 'cy', 'eu', 'br'];
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
  $('postTitle')?.addEventListener('input', commitPostLanguage);
  $('postBody')?.addEventListener('input', commitPostLanguage);
  $('archiveTranslationLang')?.addEventListener('change', switchArchiveLanguage);
  $('archiveSummary')?.addEventListener('input', commitArchiveLanguage);
  $('archiveBody')?.addEventListener('input', commitArchiveLanguage);

'''

s = s[:start] + block + s[end:]
p.write_text(s, encoding='utf-8')

# ---------- public cache bust ----------
p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = re.sub(r'posts\.js\?v=[^"\']+', 'posts.js?v=20260816d', s)
s = re.sub(r'archives\.js\?v=[^"\']+', 'archives.js?v=20260816b', s)
p.write_text(s, encoding='utf-8')

# one-shot cleanup
Path('.github/workflows/patch-i18n-content.yml').unlink(missing_ok=True)
Path('.github/patch_i18n_content.py').unlink(missing_ok=True)
