(() => {
  'use strict';

  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const languageSelect = document.getElementById('languageSelect');
  const pollNav = document.getElementById('pollNav');
  const questionEl = document.getElementById('pollQuestion');
  const optionsEl = document.getElementById('pollOptions');
  const totalEl = document.getElementById('pollTotal');
  const totalLabelEl = document.getElementById('pollTotalLabel');
  const statusEl = document.getElementById('pollStatus');
  const voteBtn = document.getElementById('pollVoteBtn');
  const badgeEl = document.getElementById('pollLiveBadge');
  const privacyEl = document.getElementById('pollPrivacy');

  if (!questionEl || !optionsEl || !voteBtn) return;

  const COPY = {
    lt: { nav:'BALSAVIMAS', vote:'BALSUOT', total:'BALSU IS VISO', live:'LIVE', closed:'UZDARYTA', loading:'KRAUNAMA DEMOKRATIJA...', pick:'PASIRINK VIENA NU', done:'BALSAS UZSKAITYTAS. VALSTYBE DEKOJA GAL.', already:'TU JAU BALSAVAI. ANTRA KARTA NELEIDZIA SITAS BROWSERIS.', error:'BALSAVIMO SERVERIS APSIMETE MIRUSIU.', privacy:'ANONIMINE: IP / PASKYRA / FINGERPRINTAS NESAUGOMI. SERVERYJE LIEKA TIK ATSITIKTINIO BROWSERIO RAKTO HASHAS.' },
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
  let renderedVersion = null;

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
    if (totalLabelEl) totalLabelEl.textContent = t.total;
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

    if (renderedVersion !== poll.version) {
      renderedVersion = poll.version;
      selected = null;
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
