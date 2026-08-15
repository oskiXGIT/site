from pathlib import Path


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"missing marker: {label}")
    return text.replace(old, new, 1)

# admin.html
p = Path('admin.html')
s = p.read_text(encoding='utf-8')

s = replace_once(
    s,
    '''                </select>\n              </label>\n              <span id="postTranslationCount">VERTIMAI 0/11</span>''',
    '''                </select>\n              </label>\n              <button id="autoTranslatePostBtn" class="small-btn" type="button" title="paima dabar pasirinkta kalba ir sugeneruoja kitas 10">AUTO VERTIMAI</button>\n              <span id="postTranslationCount">VERTIMAI 0/11</span>''',
    'post auto translate button',
)

s = replace_once(
    s,
    '''            <div class="translation-hint">pakeitus kalba laukai persijungia i tos pacios posto versija. viskas issisaugo vienam poste.</div>''',
    '''            <div class="translation-hint">pakeitus kalba laukai persijungia i tos pacios posto versija. AUTO VERTIMAI naudoja dabar pasirinkta kalba kaip source ir uzpildo likusias 10.</div>''',
    'post translation hint',
)

s = replace_once(
    s,
    '''                </select>\n              </label>\n              <span id="archiveTranslationCount">VERTIMAI 0/11</span>''',
    '''                </select>\n              </label>\n              <button id="autoTranslateArchiveBtn" class="small-btn" type="button" title="paima dabar pasirinkta kalba ir sugeneruoja kitas 10">AUTO VERTIMAI</button>\n              <span id="archiveTranslationCount">VERTIMAI 0/11</span>''',
    'archive auto translate button',
)

s = replace_once(
    s,
    '''            <div class="translation-hint">metai / kodas, uzrakinimas ir eile yra bendri. pavadinimas ir tekstas keiciasi pagal kalba.</div>''',
    '''            <div class="translation-hint">metai / kodas, uzrakinimas ir eile yra bendri. AUTO VERTIMAI paima dabar redaguojama kalba ir uzpildo likusias 10.</div>''',
    'archive translation hint',
)

s = s.replace('admin.js?v=20260816d', 'admin.js?v=20260816e')
p.write_text(s, encoding='utf-8')

# admin.js
p = Path('admin.js')
s = p.read_text(encoding='utf-8')

api_marker = '''  async function login(password) {'''
helper = r'''  async function requestAutoTranslations(type, sourceLanguage, title, body) {
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

'''
s = replace_once(s, api_marker, helper + api_marker, 'translation request helper')

post_marker = '''  async function loadPosts() {'''
post_auto = r'''  async function autoTranslatePost() {
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

'''
s = replace_once(s, post_marker, post_auto + post_marker, 'post auto translate function')

archive_marker = '''  async function loadArchives() {'''
archive_auto = r'''  async function autoTranslateArchive() {
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

'''
s = replace_once(s, archive_marker, archive_auto + archive_marker, 'archive auto translate function')

s = replace_once(
    s,
    '''  $('postTranslationLang')?.addEventListener('change', switchPostLanguage);''',
    '''  $('postTranslationLang')?.addEventListener('change', switchPostLanguage);\n  $('autoTranslatePostBtn')?.addEventListener('click', autoTranslatePost);''',
    'post auto translate listener',
)

s = replace_once(
    s,
    '''  $('archiveTranslationLang')?.addEventListener('change', switchArchiveLanguage);''',
    '''  $('archiveTranslationLang')?.addEventListener('change', switchArchiveLanguage);\n  $('autoTranslateArchiveBtn')?.addEventListener('click', autoTranslateArchive);''',
    'archive auto translate listener',
)

p.write_text(s, encoding='utf-8')

# one-shot cleanup
Path('.github/workflows/patch-auto-translate.yml').unlink(missing_ok=True)
Path('.github/patch-auto-translate.py').unlink(missing_ok=True)
