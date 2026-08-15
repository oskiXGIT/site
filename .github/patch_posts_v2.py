from pathlib import Path


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"missing marker: {label}")
    return text.replace(old, new, 1)

# ---------- public index ----------
p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = replace_once(
    s,
    '        <button class="nav-btn active" data-panel="home" data-i18n="nav.home">PAGRINDINIS</button>\n        <button class="nav-btn" data-panel="archive" data-i18n="nav.archive">ARCHYVAS</button>',
    '        <button class="nav-btn active" data-panel="home" data-i18n="nav.home">PAGRINDINIS</button>\n        <button class="nav-btn" data-panel="posts">POSTAI</button>\n        <button class="nav-btn" data-panel="archive" data-i18n="nav.archive">ARCHYVAS</button>',
    'public posts nav'
)

posts_panel = '''        <div class="window panel-view" id="posts">
          <div class="window-title"><span>viesi_postai.db</span><span>□ ×</span></div>
          <div class="window-body">
            <div class="feed-title">VIESI POSTAI / PILNAS ARCHYVAS</div>
            <div class="post-archive-note">cia tie patys postai kaip THREAD UPDATE, tik visi vienoj vietoj. administracija neprisiima atsakomybes uz turini.</div>
            <div id="allPosts" class="public-post-archive">
              <div class="thread-box compact">kraunama is kazkur...</div>
            </div>
          </div>
        </div>

'''
s = replace_once(s, '        <div class="window panel-view" id="archive">', posts_panel + '        <div class="window panel-view" id="archive">', 'public posts panel')
s = s.replace('posts.js?v=20260816a', 'posts.js?v=20260816b')
p.write_text(s, encoding='utf-8')

# ---------- public posts loader ----------
Path('posts.js').write_text(r'''(() => {
  'use strict';

  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const recentRoot = document.getElementById('livePosts');
  const archiveRoot = document.getElementById('allPosts');

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
    stamp.textContent = Number.isNaN(d.getTime())
      ? '??:??'
      : d.toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'short' });

    head.append(title, stamp);

    const body = document.createElement('div');
    body.className = 'live-post-body';
    body.textContent = post.body || '';

    card.append(head, body);
    return card;
  }

  function render(root, posts, emptyText) {
    if (!root) return;
    if (!posts.length) {
      const empty = document.createElement('div');
      empty.className = 'thread-box compact';
      empty.textContent = emptyText;
      root.replaceChildren(empty);
      root.hidden = false;
      return;
    }
    root.replaceChildren(...posts.map(makePost));
    root.hidden = false;
  }

  async function load() {
    try {
      const q = '/rest/v1/gang_posts?select=id,title,body,pinned,published_at,created_at&published=eq.true&order=pinned.desc,published_at.desc.nullslast,created_at.desc&limit=100';
      const response = await fetch(SUPABASE_URL + q, {
        headers: { apikey: SUPABASE_KEY },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const posts = await response.json();
      if (!Array.isArray(posts)) throw new Error('BAD_DATA');

      render(recentRoot, posts.slice(0, 5), 'kol kas nauju postu nera. keista.');
      render(archiveRoot, posts, 'archyvas tuscias. nieks nieko neprisidirbo.');
    } catch {
      render(archiveRoot, [], 'postu serveris apsimeta kad neegzistuoja.');
    }
  }

  load();
})();
''', encoding='utf-8')

# ---------- public styles ----------
p = Path('style.css')
s = p.read_text(encoding='utf-8')
if '/* PUBLIC_POST_ARCHIVE */' not in s:
    s += r'''

/* PUBLIC_POST_ARCHIVE */
.public-post-archive { display: grid; gap: 10px; margin-top: 12px; }
.post-archive-note { margin: 0 0 12px; padding: 8px 10px; border: 1px dashed rgba(255,255,255,.2); opacity: .72; font-size: 12px; line-height: 1.45; }
'''
p.write_text(s, encoding='utf-8')

# ---------- admin HTML: explicit publish buttons ----------
p = Path('admin.html')
s = p.read_text(encoding='utf-8')
old = '''            <div class="post-flags">
              <label><input id="postPublished" type="checkbox" /> PUBLIKUOTAS</label>
              <label><input id="postPinned" type="checkbox" /> PRISEGTAS VIRSUJ</label>
            </div>
            <div class="editor-actions">
              <button id="savePostBtn" class="main-btn">ISSAUGOT POSTA</button>
              <button id="deletePostBtn" class="small-btn danger" disabled>TRINT</button>
            </div>'''
new = '''            <div class="post-flags">
              <label><input id="postPinned" type="checkbox" /> PRISEGTAS VIRSUJ</label>
            </div>
            <div class="editor-actions">
              <button id="savePostBtn" class="small-btn">ISSAUGOT</button>
              <button id="publishPostBtn" class="main-btn">PUBLIKUOT / ATNAUJINT</button>
              <button id="unpublishPostBtn" class="small-btn" disabled>NUIMT NUO PUSLAPIO</button>
              <button id="deletePostBtn" class="small-btn danger" disabled>TRINT</button>
            </div>'''
s = replace_once(s, old, new, 'admin post buttons')
s = s.replace('admin.js?v=20260816a', 'admin.js?v=20260816b')
p.write_text(s, encoding='utf-8')

# ---------- admin JS: remove ambiguous published checkbox ----------
p = Path('admin.js')
s = p.read_text(encoding='utf-8')
start = s.find('  function newPost() {')
end = s.find('  async function deletePost() {')
if start == -1 or end == -1 or end <= start:
    raise SystemExit('missing admin post function block')

replacement = r'''  function newPost() {
    editingPostId = null;
    $('postTitle').value = '';
    $('postBody').value = '';
    $('postPinned').checked = false;
    $('deletePostBtn').disabled = true;
    $('unpublishPostBtn').disabled = true;
    $('postState').textContent = 'NAUJAS POSTAS / DAR NEVIESAS';
    renderPosts();
    $('postTitle').focus();
  }

  function openPost(id) {
    const post = cachedPosts.find((item) => item.id === id);
    if (!post) return;
    editingPostId = post.id;
    $('postTitle').value = post.title;
    $('postBody').value = post.body || '';
    $('postPinned').checked = Boolean(post.pinned);
    $('deletePostBtn').disabled = false;
    $('unpublishPostBtn').disabled = !post.published;
    $('postState').textContent = `${post.published ? 'PUBLIKUOTAS' : 'JUODRASTIS'} · ${String(post.id).slice(0, 8)}…`;
    renderPosts();
  }

  async function persistPost(forcePublished = null) {
    const title = $('postTitle').value.trim();
    const body = $('postBody').value;
    const pinned = $('postPinned').checked;
    if (!title) {
      $('postState').textContent = 'REIKIA PAVADINIMO';
      return false;
    }

    const current = cachedPosts.find((item) => item.id === editingPostId);
    const published = forcePublished === null ? Boolean(current?.published) : Boolean(forcePublished);
    const now = new Date().toISOString();
    const payload = {
      title,
      body,
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
    $('postState').textContent = published ? 'VIESAS. JAU TURETU BUT PUSLAPY.' : 'ISSAUGOTA KAIP JUODRASTIS.';
    await loadPosts();
    const refreshed = cachedPosts.find((item) => item.id === editingPostId);
    $('unpublishPostBtn').disabled = !refreshed?.published;
    $('deletePostBtn').disabled = !editingPostId;
    return true;
  }

  async function savePost() {
    await persistPost(null);
  }

  async function publishPost() {
    await persistPost(true);
  }

  async function unpublishPost() {
    if (!editingPostId) return;
    await persistPost(false);
  }

'''
s = s[:start] + replacement + s[end:]
s = replace_once(
    s,
    "  $('savePostBtn')?.addEventListener('click', savePost);\n  $('deletePostBtn')?.addEventListener('click', deletePost);",
    "  $('savePostBtn')?.addEventListener('click', savePost);\n  $('publishPostBtn')?.addEventListener('click', publishPost);\n  $('unpublishPostBtn')?.addEventListener('click', unpublishPost);\n  $('deletePostBtn')?.addEventListener('click', deletePost);",
    'admin post listeners v2'
)
p.write_text(s, encoding='utf-8')

# one-shot cleanup
Path('.github/workflows/patch-posts-v2.yml').unlink(missing_ok=True)
Path('.github/patch_posts_v2.py').unlink(missing_ok=True)
