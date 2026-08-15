from pathlib import Path


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"missing marker: {label}")
    return text.replace(old, new, 1)


# ---------- admin.html ----------
p = Path("admin.html")
s = p.read_text(encoding="utf-8")
s = replace_once(
    s,
    '        <button class="tab" data-tab="controls">VALDYMAS</button>\n        <button class="tab" data-tab="session">SESIJA</button>',
    '        <button class="tab" data-tab="controls">VALDYMAS</button>\n        <button class="tab" data-tab="posts">POSTAI</button>\n        <button class="tab" data-tab="session">SESIJA</button>',
    "admin nav tabs",
)

posts_panel = '''      <section class="tab-panel" id="tab-posts">
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
            <input id="postTitle" maxlength="160" placeholder="posto pavadinimas" />
            <textarea id="postBody" maxlength="20000" placeholder="rasai nesamone ir ji atsiranda pagrindiniam puslapy"></textarea>
            <div class="post-flags">
              <label><input id="postPublished" type="checkbox" /> PUBLIKUOTAS</label>
              <label><input id="postPinned" type="checkbox" /> PRISEGTAS VIRSUJ</label>
            </div>
            <div class="editor-actions">
              <button id="savePostBtn" class="main-btn">ISSAUGOT POSTA</button>
              <button id="deletePostBtn" class="small-btn danger" disabled>TRINT</button>
            </div>
            <div class="tiny" id="postState">NAUJAS POSTAS / JUODRASTIS</div>
          </div>
        </div>
      </section>

'''
s = replace_once(
    s,
    '      <section class="tab-panel" id="tab-session">',
    posts_panel + '      <section class="tab-panel" id="tab-session">',
    "admin session panel",
)
s = s.replace("admin.js?v=20260815b", "admin.js?v=20260816a")
p.write_text(s, encoding="utf-8")


# ---------- admin.js ----------
p = Path("admin.js")
s = p.read_text(encoding="utf-8")
s = replace_once(
    s,
    "  let editingNoteId = null;\n  let cachedNotes = [];",
    "  let editingNoteId = null;\n  let cachedNotes = [];\n  let editingPostId = null;\n  let cachedPosts = [];",
    "admin post state",
)
s = replace_once(
    s,
    "    await Promise.allSettled([loadComplaints(), loadNotes(), loadControls()]);",
    "    await Promise.allSettled([loadComplaints(), loadNotes(), loadControls(), loadPosts()]);",
    "admin initial loaders",
)

post_functions = r'''
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

'''
s = replace_once(s, "  function setTab(name) {", post_functions + "  function setTab(name) {", "admin setTab")
s = replace_once(
    s,
    "  $('saveControlBtn')?.addEventListener('click', saveControl);\n  document.querySelectorAll('.tab')",
    "  $('saveControlBtn')?.addEventListener('click', saveControl);\n  $('refreshPosts')?.addEventListener('click', loadPosts);\n  $('newPostBtn')?.addEventListener('click', newPost);\n  $('savePostBtn')?.addEventListener('click', savePost);\n  $('deletePostBtn')?.addEventListener('click', deletePost);\n  document.querySelectorAll('.tab')",
    "admin post listeners",
)
p.write_text(s, encoding="utf-8")


# ---------- public homepage ----------
p = Path("index.html")
s = p.read_text(encoding="utf-8")
s = replace_once(
    s,
    '            <div class="feed-title" data-i18n="feed.update">THREAD UPDATE</div>',
    '            <div class="feed-title" data-i18n="feed.update">THREAD UPDATE</div>\n            <div id="livePosts" class="live-posts" hidden></div>',
    "homepage live posts container",
)
s = replace_once(
    s,
    '  <script src="ads.js?v=20260815e"></script>',
    '  <script src="ads.js?v=20260815e"></script>\n  <script src="posts.js?v=20260816a"></script>',
    "homepage posts script",
)
p.write_text(s, encoding="utf-8")


posts_js = r'''(() => {
  'use strict';
  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const root = document.getElementById('livePosts');
  if (!root) return;

  function makePost(post) {
    const card = document.createElement('article');
    card.className = 'thread-box live-post';
    const head = document.createElement('div');
    head.className = 'live-post-head';
    const title = document.createElement('b');
    title.textContent = `${post.pinned ? '📌 ' : ''}${post.title}`;
    const stamp = document.createElement('span');
    stamp.className = 'stamp';
    const d = new Date(post.published_at || post.created_at);
    stamp.textContent = Number.isNaN(d.getTime()) ? '??:??' : d.toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'short' });
    head.append(title, stamp);
    const body = document.createElement('div');
    body.className = 'live-post-body';
    body.textContent = post.body || '';
    card.append(head, body);
    return card;
  }

  async function load() {
    try {
      const q = '/rest/v1/gang_posts?select=id,title,body,pinned,published_at,created_at&published=eq.true&order=pinned.desc,published_at.desc.nullslast,created_at.desc&limit=50';
      const response = await fetch(SUPABASE_URL + q, { headers: { apikey: SUPABASE_KEY } });
      if (!response.ok) return;
      const posts = await response.json();
      if (!Array.isArray(posts) || !posts.length) return;
      root.replaceChildren(...posts.map(makePost));
      root.hidden = false;
    } catch {}
  }

  load();
})();
'''
Path("posts.js").write_text(posts_js, encoding="utf-8")


# ---------- CSS ----------
p = Path("style.css")
s = p.read_text(encoding="utf-8")
if "/* LIVE_ADMIN_POSTS */" not in s:
    s += r'''

/* LIVE_ADMIN_POSTS */
.live-posts { display: grid; gap: 10px; margin-bottom: 10px; }
.live-post { border-left: 3px solid rgba(255,255,255,.35); }
.live-post-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
.live-post-head b { overflow-wrap: anywhere; }
.live-post-head .stamp { flex: 0 0 auto; }
.live-post-body { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.45; }
'''
p.write_text(s, encoding="utf-8")

p = Path("admin.css")
s = p.read_text(encoding="utf-8")
if "/* ADMIN_POSTS */" not in s:
    s += r'''

/* ADMIN_POSTS */
.post-admin-layout { display: grid; grid-template-columns: minmax(230px,.75fr) minmax(320px,1.25fr); gap: 14px; }
.post-admin-toolbar { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }
.post-list { max-height: 520px; overflow:auto; }
.post-row small { display:block; opacity:.65; margin-top:3px; }
.post-editor textarea { min-height: 260px; }
.post-flags { display:flex; flex-wrap:wrap; gap:14px; padding:9px 0; font-size:12px; }
.post-flags label { display:flex; align-items:center; gap:6px; cursor:pointer; }
.post-flags input { width:auto; }
@media (max-width: 760px) { .post-admin-layout { grid-template-columns:1fr; } }
'''
p.write_text(s, encoding="utf-8")

# One-shot cleanup.
Path(".github/workflows/add-admin-posts.yml").unlink(missing_ok=True)
Path(".github/scripts/add_admin_posts.py").unlink(missing_ok=True)
