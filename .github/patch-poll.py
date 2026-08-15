from pathlib import Path

ROOT = Path('.')

def replace_once(path, old, new):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'anchor not found in {path}: {old[:80]!r}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')

# ---------- public poll files ----------
(ROOT / 'poll.js').write_text(r'''(() => {
  'use strict';

  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const languageSelect = document.getElementById('languageSelect');
  const pollNav = document.getElementById('pollNav');
  const questionEl = document.getElementById('pollQuestion');
  const optionsEl = document.getElementById('pollOptions');
  const totalEl = document.getElementById('pollTotal');
  const statusEl = document.getElementById('pollStatus');
  const voteBtn = document.getElementById('pollVoteBtn');
  const badgeEl = document.getElementById('pollLiveBadge');
  const privacyEl = document.getElementById('pollPrivacy');

  if (!questionEl || !optionsEl || !voteBtn) return;

  const COPY = {
    lt: { nav:'BALSAVIMAS', vote:'BALSUOT', total:'BALSU IS VISO', live:'LIVE', closed:'UZDARYTA', loading:'KRAUNAMA DEMOKRATIJA...', pick:'PASIRINK VIENA NU', done:'BALSAS UZSKAITYTAS. VALSTYBE DEKOJA GAL.', already:'TU JAU BALSAIVAI. ANTRA KARTA NELEIDZIA SITAS BROWSERIS.', error:'BALSAVIMO SERVERIS APSIMETE MIRUSIU.', privacy:'ANONIMINE: IP / PASKYRA / FINGERPRINTAS NESAUgomi. SERVERYJE LIEKA TIK ATSITIKTINIO BROWSERIO RAKTO HASHAS.' },
    en: { nav:'VOTE THING', vote:'VOTE FR', total:'TOTAL VOTES', live:'LIVE', closed:'CLOSED', loading:'LOADING DEMOCRACY...', pick:'PICK ONE BRO', done:'VOTE COUNTED. GOVERNMENT PROBABLY THANKS YOU.', already:'YOU ALREADY VOTED. THIS BROWSER GETS ONE.', error:'VOTING SERVER IS PRETENDING TO BE DEAD.', privacy:'ANONYMOUS: NO IP / ACCOUNT / FINGERPRINT STORED. SERVER ONLY KEEPS A HASH OF A RANDOM BROWSER TOKEN.' },
    fr: { nav:'VOTE CHELOU', vote:'VOTER WESH', total:'VOTES AU TOTAL', live:'LIVE', closed:'FERME', loading:'LA DEMOCRATIE CHARGE...', pick:'CHOISIS UN TRUC FRR', done:'VOTE COMPTE. LA REPUBLIQUE EST CONTENTE PEUT-ETRE.', already:'T AS DEJA VOTE. CE NAVIGATEUR EN A UN.', error:'LE SERVEUR DE VOTE FAIT LE MORT.', privacy:'ANONYME: PAS D IP / COMPTE / EMPREINTE. LE SERVEUR GARDE JUSTE LE HASH D UN TOKEN ALEATOIRE DU NAVIGATEUR.' },
    zh: { nav:'投票部门', vote:'提交这个票', total:'总票数', live:'正在活着', closed:'已经关闭', loading:'民主系统加载中...', pick:'请选择一个东西', done:'票已经被系统接受。大概。', already:'这个浏览器已经投过一次。部门不同意第二次。', error:'投票服务器目前声称不存在。', privacy:'匿名说明：不保存IP、账号或浏览器指纹。服务器只保存随机浏览器令牌的哈希。' },
    ru: { nav:'ГОЛОСОВАТЬ', vote:'ГОЛОСОВАТЬ', total:'ВСЕГО ГОЛОСОВ', live:'LIVE', closed:'ЗАКРЫТО', loading:'ДЕМОКРАТИЯ ГРУЗИТСЯ...', pick:'ВЫБЕРИ ОДНО БРО', done:'ГОЛОС ПРИНЯТ. КУДА-ТО.', already:'ТЫ УЖЕ ГОЛОСОВАЛ. ЭТОМУ БРАУЗЕРУ ХВАТИТ.', error:'СЕРВЕР ГОЛОСОВАНИЯ ПРИКИНУЛСЯ МЕРТВЫМ.', privacy:'АНОНИМНО: IP / АККАУНТ / FINGERPRINT НЕ ХРАНЯТСЯ. ТОЛЬКО ХЭШ СЛУЧАЙНОГО ТОКЕНА БРАУЗЕРА.' },
    eo: { nav:'VOCDONU BRO', vote:'VOCDONU', total:'TUTAJ VOCOJ', live:'VIVA', closed:'FERMITA', loading:'DEMOKRATIO ŜARĜIĜAS...', pick:'ELEKTU UNU FRATO', done:'VOĈO REGISTRITA. HISTORIO MOVIĜIS 0.0001%.', already:'VI JAM VOĈDONIS PER ĈI TIU RETUMILO.', error:'LA VOĈDONA SERVILO MORTIS ADMINISTRE.', privacy:'ANONIME: NENIU IP / KONTO / FINGROSPURO. NUR HAŜO DE HAZARDA RETUMILA ĴETONO.' },
    la: { nav:'SUFFRAGIUM', vote:'SUFFRAGIUM DA', total:'SUFFRAGIA', live:'VIVIT', closed:'CLAUSUM', loading:'DEMOCRATIA ONERATUR...', pick:'ELIGE UNUM FRATER', done:'SUFFRAGIUM ACCEPTUM EST. SENATUS NIHIL PROMITTIT.', already:'IAM SUFFRAGIUM DEDISTI HOC NAVIGATRO.', error:'SERVITOR SUFFRAGIORUM MORTUUM SE SIMULAT.', privacy:'ANONYME: NULLUM IP / RATIO / FINGERPRINT. SERVITOR SOLAM HASH CLAVIS FORTUITAE SERVAT.' },
    fo: { nav:'ATKVØÐA', vote:'ATKVØÐ', total:'ATKVØÐUR TILSAMANS', live:'LIVE', closed:'STONGT', loading:'DEMOKRATI VERÐUR LODAÐ...', pick:'VEL EITT BRO', done:'ATKVØÐAN ER TALD. HELDUR VIT.', already:'TÚ HEVUR LONGU ATKVØTT VIÐ HESUM KAGANUM.', error:'ATKVØÐUSERVARIN SPÆLIR DEYÐUR.', privacy:'DULNEVNT: EINKI IP / KONTA / FINGERPRINT. BARA HASH AV TILVILDARLIGUM KAGATOKEN.' },
    cy: { nav:'PLEIDLAIS', vote:'PLEIDLEISIO', total:'CYFANSWM PLEIDLEISIAU', live:'BYW', closed:'WEDI CAU', loading:'DEMOCRATIAETH YN LLWYTHO...', pick:'DEWIS UN BRO', done:'PLEIDLAIS WEDI EI GYFRIF. RHYWSUT.', already:'RWYT TI EISOES WEDI PLEIDLEISIO AR Y PORWR YMA.', error:'MAE R GWEINYDD PLEIDLEISIO YN ESGUS EI FOD YN FARW.', privacy:'DAN ENW: DIM IP / CYFRIF / OL BWRWR. DIM OND HASH TOCYN PORWR AR HAP.' },
    eu: { nav:'BOZKETA', vote:'BOZKATU', total:'BOZKAK GUZTIRA', live:'BIZIRIK', closed:'ITXITA', loading:'DEMOKRAZIA KARGATZEN...', pick:'AUKERATU BAT BRO', done:'BOZKA KONTATUTA. NONBAIT.', already:'NABIGATZAILE HONEKIN JADA BOZKATU DUZU.', error:'BOZKETA ZERBITZARIA HILDA DAGOELA EGITEN ARI DA.', privacy:'ANONIMOA: EZ IP / KONTU / FINGERPRINT. AUSAZKO NABIGATZAILE TOKEN BATEN HASHA BAKARRIK.' },
    br: { nav:'VOTIÑ', vote:'VOTIÑ', total:'VOTOÙ EN HOLL', live:'BEV', closed:'SERRET', loading:'DEMOKRATELEZH O KARGAÑ...', pick:'DIBAB UNAN BRO', done:'AR VOT A ZO KONTET. MARTEZE.', already:'VOTET PEUS DRE AR MERDEER-MA DIZHALL.', error:'SERVIJER AR VOTOÙ A RA VAN DA VEZAÑ MARV.', privacy:'DIZANV: IP / KONT / ROUDAJ MERDEER EBET. HASH UN TOKEN DARGANT DRE ZEGouezh HEPKEN.' }
  };

  let poll = null;
  let selected = null;

  function lang() {
    const code = languageSelect?.value || localStorage.getItem('oskiLang') || 'lt';
    return COPY[code] ? code : 'en';
  }

  function text() { return COPY[lang()]; }

  function token() {
    const key = 'oskiPollVoterToken';
    let value = localStorage.getItem(key);
    if (!value) {
      value = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, value);
    }
    return value;
  }

  function voteStorageKey(version) { return `oskiPollChoice:${version}`; }

  async function rpc(name, body = {}) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || data?.code || `HTTP_${response.status}`);
    return data;
  }

  function applyLanguage() {
    const t = text();
    if (pollNav) pollNav.textContent = t.nav;
    if (privacyEl) privacyEl.textContent = t.privacy;
    if (voteBtn) voteBtn.textContent = t.vote;
    if (poll) render();
  }

  function render() {
    const t = text();
    if (!poll?.exists) {
      questionEl.textContent = 'apklausa dingo. administracija turbut ja pamete.';
      optionsEl.replaceChildren();
      totalEl.textContent = '0';
      statusEl.textContent = t.error;
      voteBtn.disabled = true;
      return;
    }

    questionEl.textContent = poll.question;
    totalEl.textContent = String(poll.total || 0);
    badgeEl.textContent = poll.open ? t.live : t.closed;
    badgeEl.classList.toggle('closed', !poll.open);

    const savedRaw = localStorage.getItem(voteStorageKey(poll.version));
    const saved = savedRaw === null ? null : Number.parseInt(savedRaw, 10);
    if (Number.isInteger(saved)) selected = saved;

    const total = Math.max(0, Number(poll.total || 0));
    const nodes = (poll.options || []).map((option) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'poll-option';
      const index = Number(option.index);
      if (selected === index) row.classList.add('selected');
      if (saved === index) row.classList.add('my-vote');
      row.disabled = !poll.open || saved !== null;

      const top = document.createElement('div');
      top.className = 'poll-option-top';
      const label = document.createElement('b');
      label.textContent = option.label;
      const count = document.createElement('span');
      const votes = Number(option.votes || 0);
      const pct = total ? Math.round((votes / total) * 100) : 0;
      count.textContent = `${votes} · ${pct}%`;
      top.append(label, count);

      const meter = document.createElement('div');
      meter.className = 'poll-meter';
      const fill = document.createElement('span');
      fill.style.width = `${pct}%`;
      meter.append(fill);
      row.append(top, meter);
      row.addEventListener('click', () => {
        selected = index;
        render();
      });
      return row;
    });
    optionsEl.replaceChildren(...nodes);

    if (!poll.open) statusEl.textContent = t.closed;
    else if (saved !== null) statusEl.textContent = t.already;
    else statusEl.textContent = selected === null ? t.pick : `${t.pick} ✓`;
    voteBtn.disabled = !poll.open || saved !== null || selected === null;
    voteBtn.textContent = t.vote;
  }

  async function load({ quiet = false } = {}) {
    if (!quiet) statusEl.textContent = text().loading;
    try {
      poll = await rpc('gang_poll_results');
      render();
    } catch (error) {
      if (!quiet) statusEl.textContent = `${text().error} (${error.message})`;
    }
  }

  async function vote() {
    if (!poll?.open || selected === null) return;
    voteBtn.disabled = true;
    statusEl.textContent = '...';
    try {
      const result = await rpc('gang_cast_poll_vote', {
        p_voter_token: token(),
        p_option_index: selected,
      });
      if (result?.accepted) {
        localStorage.setItem(voteStorageKey(poll.version), String(selected));
        poll = result.results || poll;
        statusEl.textContent = text().done;
      } else {
        poll = result?.results || poll;
        statusEl.textContent = text().already;
      }
      render();
    } catch (error) {
      statusEl.textContent = `${text().error} (${error.message})`;
      voteBtn.disabled = false;
    }
  }

  voteBtn.addEventListener('click', vote);
  languageSelect?.addEventListener('change', applyLanguage);
  applyLanguage();
  load();
  setInterval(() => {
    const panel = document.getElementById('poll');
    if (panel?.classList.contains('active') && document.visibilityState === 'visible') load({ quiet: true });
  }, 12000);
})();
''', encoding='utf-8')

(ROOT / 'poll.css').write_text(r'''.poll-headline{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.poll-kicker{font-size:11px;letter-spacing:2px;color:#8492aa;margin-bottom:8px}.poll-question{font-size:clamp(20px,3vw,32px);line-height:1.15;max-width:760px}.poll-live-badge{font-size:11px;font-weight:800;letter-spacing:1px;border:1px solid #52e08d;padding:6px 9px;color:#7cffaa;box-shadow:0 0 14px rgba(82,224,141,.12)}.poll-live-badge.closed{border-color:#a14d56;color:#ff7b86}.poll-options{display:grid;gap:10px}.poll-option{width:100%;background:rgba(8,12,20,.78);border:1px solid #26344d;color:#dbe7ff;text-align:left;padding:13px 14px;cursor:pointer;transition:.12s transform,.12s border-color,.12s background}.poll-option:hover:not(:disabled){transform:translateX(3px);border-color:#6d8bc3;background:rgba(19,29,48,.82)}.poll-option.selected{border-color:#9dbaff;box-shadow:inset 3px 0 0 #9dbaff}.poll-option.my-vote{border-color:#70d99a;box-shadow:inset 3px 0 0 #70d99a}.poll-option:disabled{cursor:default;opacity:.9}.poll-option-top{display:flex;justify-content:space-between;gap:14px;align-items:center}.poll-option-top b{font-size:14px}.poll-option-top span{font:12px/1.2 monospace;color:#9fb0ca;white-space:nowrap}.poll-meter{height:5px;background:#111927;margin-top:10px;overflow:hidden}.poll-meter span{display:block;height:100%;background:linear-gradient(90deg,#607eaf,#9ab6e8);transition:width .25s ease}.poll-option.my-vote .poll-meter span{background:linear-gradient(90deg,#4e9e70,#80e6a8)}.poll-bottom{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;margin-top:18px;padding-top:15px;border-top:1px solid #202b3e}.poll-vote-btn{min-width:150px}.poll-status{font:11px/1.45 monospace;color:#9daabd}.poll-total-box{text-align:right}.poll-total-box span{display:block;font-size:9px;letter-spacing:1px;color:#69778d}.poll-total-box b{font-size:24px}.poll-privacy{margin-top:14px;font:10px/1.45 monospace;color:#647187;border-left:2px solid #2c3a51;padding-left:10px}@media(max-width:700px){.poll-headline{flex-direction:column}.poll-bottom{grid-template-columns:1fr}.poll-total-box{text-align:left}.poll-vote-btn{width:100%}}
''', encoding='utf-8')

# ---------- index.html ----------
replace_once('index.html',
'''  <link rel="stylesheet" href="gang.css?v=20260815h" />''',
'''  <link rel="stylesheet" href="gang.css?v=20260815h" />\n  <link rel="stylesheet" href="poll.css?v=20260816a" />''')

replace_once('index.html',
'''        <button class="nav-btn" data-panel="posts">POSTAI</button>\n        <button class="nav-btn" data-panel="archive" data-i18n="nav.archive">ARCHYVAS</button>''',
'''        <button class="nav-btn" data-panel="posts">POSTAI</button>\n        <button class="nav-btn" id="pollNav" data-panel="poll">BALSAVIMAS</button>\n        <button class="nav-btn" data-panel="archive" data-i18n="nav.archive">ARCHYVAS</button>''')

poll_panel = '''\n        <div class="window panel-view" id="poll">\n          <div class="window-title"><span>VIESA_NUOMONE.db</span><span class="poll-live-badge" id="pollLiveBadge">LIVE</span></div>\n          <div class="window-body">\n            <div class="poll-headline">\n              <div>\n                <div class="poll-kicker">VIENAS KLAUSIMAS / VIENAS BALSAS / JOKIU GARANTIJU</div>\n                <div class="poll-question" id="pollQuestion">kraunama...</div>\n              </div>\n            </div>\n            <div class="poll-options" id="pollOptions"></div>\n            <div class="poll-bottom">\n              <button class="classified-btn poll-vote-btn" id="pollVoteBtn" type="button" disabled>BALSUOT</button>\n              <div class="poll-status" id="pollStatus">KRAUNAMA DEMOKRATIJA...</div>\n              <div class="poll-total-box"><span id="pollTotalLabel">BALSU IS VISO</span><b id="pollTotal">0</b></div>\n            </div>\n            <div class="poll-privacy" id="pollPrivacy">ANONIMINE APKLAUSA.</div>\n          </div>\n        </div>\n'''
replace_once('index.html',
'''        <div class="window panel-view" id="archive">''',
 poll_panel + '''\n        <div class="window panel-view" id="archive">''')

replace_once('index.html',
'''  <script src="posts.js?v=20260816d"></script>\n  <script src="archives.js?v=20260816b"></script>''',
'''  <script src="posts.js?v=20260816d"></script>\n  <script src="poll.js?v=20260816a"></script>\n  <script src="archives.js?v=20260816b"></script>''')

# ---------- admin.html ----------
replace_once('admin.html',
'''        <button class="tab" data-tab="archives">ARCHYVAI</button>\n        <button class="tab" data-tab="session">SESIJA</button>''',
'''        <button class="tab" data-tab="archives">ARCHYVAI</button>\n        <button class="tab" data-tab="poll">APKLAUSA</button>\n        <button class="tab" data-tab="session">SESIJA</button>''')

admin_poll_panel = '''\n      <section class="tab-panel" id="tab-poll">\n        <div class="panel-title"><b>VIESOS_NUOMONES_VALDYMAS.db</b><button id="refreshPoll" class="small-btn">ATNAUJINT</button></div>\n        <p class="dim">viena gyva apklausa. pakeitus klausima arba atsakymus seni balsai automatiskai nunulinami.</p>\n        <div class="editor poll-admin-editor">\n          <label>KLAUSIMAS</label>\n          <input id="pollAdminQuestion" maxlength="300" placeholder="pvz. kas vel pajudino konteineri?" />\n          <div class="poll-admin-head"><span>ATSAKYMAI (2-8)</span><button id="pollAddOption" class="small-btn" type="button">+ ATSAKYMAS</button></div>\n          <div id="pollAdminOptions" class="poll-admin-options"></div>\n          <label class="archive-check"><input id="pollAdminOpen" type="checkbox" /> PRIIMTI NAUJUS BALSUS</label>\n          <div class="poll-admin-stats">\n            <div><span>BALSU</span><b id="pollAdminTotal">0</b></div>\n            <div><span>BUSENA</span><b id="pollAdminStatus">-</b></div>\n            <div><span>VERSIJA</span><b id="pollAdminVersion">-</b></div>\n          </div>\n          <div id="pollAdminPreview" class="poll-admin-preview"></div>\n          <div class="editor-actions">\n            <button id="savePollBtn" class="main-btn" type="button">ISSAUGOT APKLAUSA</button>\n            <button id="resetPollBtn" class="small-btn danger" type="button">NUNULINT BALSUS</button>\n          </div>\n          <div class="tiny" id="pollAdminState">LAUKIA DEMOKRATIJOS</div>\n        </div>\n      </section>\n'''
replace_once('admin.html',
'''      <section class="tab-panel" id="tab-session">''',
 admin_poll_panel + '''\n      <section class="tab-panel" id="tab-session">''')

replace_once('admin.html',
'''  <script src="admin.js?v=20260816e"></script>''',
'''  <script src="admin.js?v=20260816f"></script>''')

# ---------- admin.js ----------
replace_once('admin.js',
'''    await Promise.allSettled([loadComplaints(), loadNotes(), loadControls(), loadPosts(), loadArchives()]);''',
'''    await Promise.allSettled([loadComplaints(), loadNotes(), loadControls(), loadPosts(), loadArchives(), loadPollAdmin()]);''')

poll_admin_js = r'''
  let adminPollData = null;

  async function pollRpc(name, payload = {}) {
    const response = await api(`/rest/v1/rpc/${name}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || data?.code || `HTTP_${response.status}`);
    return data;
  }

  function renderPollAdminOptions(labels = []) {
    const root = $('pollAdminOptions');
    if (!root) return;
    root.replaceChildren();
    labels.forEach((label, index) => {
      const row = document.createElement('div');
      row.className = 'poll-admin-option-row';
      const input = document.createElement('input');
      input.maxLength = 160;
      input.value = label || '';
      input.placeholder = `atsakymas ${index + 1}`;
      input.dataset.pollOption = '1';
      const remove = button('TRINT', 'small-btn danger', () => {
        if (root.querySelectorAll('[data-poll-option]').length <= 2) {
          $('pollAdminState').textContent = 'REIKIA BENT 2 ATSAKYMU';
          return;
        }
        row.remove();
        renumberPollAdminOptions();
      });
      row.append(input, remove);
      root.append(row);
    });
  }

  function renumberPollAdminOptions() {
    document.querySelectorAll('#pollAdminOptions [data-poll-option]').forEach((input, index) => {
      input.placeholder = `atsakymas ${index + 1}`;
    });
  }

  function addPollAdminOption() {
    const root = $('pollAdminOptions');
    const values = [...root.querySelectorAll('[data-poll-option]')].map((input) => input.value);
    if (values.length >= 8) {
      $('pollAdminState').textContent = '8 ATSAKYMU UZTENKA. CIA NE EGZAMINAS.';
      return;
    }
    values.push('');
    renderPollAdminOptions(values);
    root.querySelector('[data-poll-option]:last-of-type')?.focus?.();
  }

  function pollAdminValues() {
    return [...document.querySelectorAll('#pollAdminOptions [data-poll-option]')]
      .map((input) => input.value.trim())
      .filter(Boolean);
  }

  function renderPollAdminPreview(data) {
    const root = $('pollAdminPreview');
    if (!root) return;
    root.replaceChildren();
    const total = Math.max(0, Number(data?.total || 0));
    (data?.options || []).forEach((option) => {
      const row = document.createElement('div');
      row.className = 'poll-admin-result-row';
      const votes = Number(option.votes || 0);
      const pct = total ? Math.round(votes / total * 100) : 0;
      const line = document.createElement('div');
      line.className = 'poll-admin-result-line';
      const label = document.createElement('span');
      label.textContent = option.label;
      const count = document.createElement('b');
      count.textContent = `${votes} · ${pct}%`;
      line.append(label, count);
      const meter = document.createElement('div');
      meter.className = 'poll-admin-meter';
      const fill = document.createElement('span');
      fill.style.width = `${pct}%`;
      meter.append(fill);
      row.append(line, meter);
      root.append(row);
    });
  }

  function applyPollAdminData(data) {
    adminPollData = data;
    if (!data?.exists) {
      $('pollAdminQuestion').value = '';
      renderPollAdminOptions(['', '']);
      $('pollAdminOpen').checked = true;
      $('pollAdminTotal').textContent = '0';
      $('pollAdminStatus').textContent = 'NERA';
      $('pollAdminVersion').textContent = '-';
      renderPollAdminPreview({ options: [], total: 0 });
      return;
    }
    $('pollAdminQuestion').value = data.question || '';
    renderPollAdminOptions((data.options || []).map((option) => option.label));
    $('pollAdminOpen').checked = Boolean(data.open);
    $('pollAdminTotal').textContent = String(data.total || 0);
    $('pollAdminStatus').textContent = data.open ? 'ATIDARYTA' : 'UZDARYTA';
    $('pollAdminVersion').textContent = String(data.version || '-').slice(0, 8) + '…';
    renderPollAdminPreview(data);
  }

  async function loadPollAdmin() {
    if (!$('pollAdminQuestion') || !session) return;
    $('pollAdminState').textContent = 'KRAUNAMA APKLAUSA...';
    try {
      const data = await pollRpc('gang_poll_results');
      applyPollAdminData(data);
      $('pollAdminState').textContent = 'APKLAUSA UZKRAUTA';
    } catch (error) {
      if (!session) return;
      $('pollAdminState').textContent = `APKLAUSA NEUZSIKROVE (${error.message})`;
    }
  }

  async function savePollAdmin(reset = false) {
    const question = $('pollAdminQuestion').value.trim();
    const options = pollAdminValues();
    if (!question) {
      $('pollAdminState').textContent = 'REIKIA KLAUSIMO';
      return;
    }
    if (options.length < 2 || options.length > 8) {
      $('pollAdminState').textContent = 'REIKIA 2-8 NORMALIU ATSAKYMU';
      return;
    }
    if (reset && !confirm('Tikrai nunulint visus dabartinius balsus?')) return;

    $('pollAdminState').textContent = reset ? 'NAIKINAMI BALSAI...' : 'SAUGOMA DEMOKRATIJA...';
    try {
      const data = await pollRpc('gang_admin_set_poll', {
        p_question: question,
        p_options: options,
        p_is_open: $('pollAdminOpen').checked,
        p_reset: reset,
      });
      applyPollAdminData(data);
      $('pollAdminState').textContent = reset
        ? 'BALSAI NUNULINTI. TAUTA PAMIRSO.'
        : 'APKLAUSA ISSAUGOTA. PAKEITUS TEKSTA BALSAI NUSINULINA AUTOMATISKAI.';
      setGlobalStatus('APKLAUSA ATNAUJINTA');
    } catch (error) {
      if (!session) return;
      $('pollAdminState').textContent = `APKLAUSA NEISSISAUGOJO (${error.message})`;
    }
  }

'''
replace_once('admin.js',
'''  function setTab(name) {''',
 poll_admin_js + '''  function setTab(name) {''')

replace_once('admin.js',
'''  $('deleteArchiveBtn')?.addEventListener('click', deleteArchive);\n  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));''',
'''  $('deleteArchiveBtn')?.addEventListener('click', deleteArchive);\n  $('refreshPoll')?.addEventListener('click', loadPollAdmin);\n  $('pollAddOption')?.addEventListener('click', addPollAdminOption);\n  $('savePollBtn')?.addEventListener('click', () => savePollAdmin(false));\n  $('resetPollBtn')?.addEventListener('click', () => savePollAdmin(true));\n  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));''')

# ---------- admin.css ----------
p = ROOT / 'admin.css'
css = p.read_text(encoding='utf-8')
css += r'''

/* anonymous public poll controls */
.poll-admin-editor{max-width:920px}.poll-admin-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:4px;font-size:11px;color:#8490a5}.poll-admin-options{display:grid;gap:8px}.poll-admin-option-row{display:grid;grid-template-columns:1fr auto;gap:8px}.poll-admin-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:6px 0}.poll-admin-stats>div{border:1px solid #27344b;background:#0b1019;padding:10px}.poll-admin-stats span{display:block;font-size:9px;color:#7f8ba0;letter-spacing:1px}.poll-admin-stats b{display:block;margin-top:4px;font:15px monospace;color:#d8e5ff}.poll-admin-preview{display:grid;gap:8px;border-top:1px solid #27344b;padding-top:12px}.poll-admin-result-row{font:11px monospace}.poll-admin-result-line{display:flex;justify-content:space-between;gap:12px}.poll-admin-meter{height:5px;margin-top:5px;background:#111927;overflow:hidden}.poll-admin-meter span{display:block;height:100%;background:#7594c8}@media(max-width:700px){.poll-admin-stats{grid-template-columns:1fr}.poll-admin-option-row{grid-template-columns:1fr}.poll-admin-option-row .small-btn{justify-self:start}}
'''
p.write_text(css, encoding='utf-8')

# Remove temporary patch machinery before final commit.
for temp in [ROOT / '.github/patch-poll.py', ROOT / '.github/workflows/patch-poll.yml']:
    if temp.exists():
        temp.unlink()
