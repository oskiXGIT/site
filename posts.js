(() => {
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
