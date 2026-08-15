(() => {
  const select = document.getElementById('languageSelect');
  if (!select || typeof applyLanguage !== 'function') return;

  const supported = ['lt','en','fr','zh','ru','eo','la','fo','cy','eu','br'];
  const randomPool = ['en','fr','zh','ru','eo','la','fo','cy','eu','br'];
  const languageNames = {
    lt:'LIETUVIŲ', en:'ENGLISH', fr:'FRANÇAIS', zh:'中文（大概）', ru:'РУССКИЙ ТИПА',
    eo:'ESPERANTO', la:'LATINA', fo:'FØROYSKT', cy:'CYMRAEG', eu:'EUSKARA', br:'BREZHONEG'
  };

  const confirmTexts = [
    'GERAI NU DARYK KA NORI',
    'I UNDERSTAND ABSOLUTELY NOTHING',
    'ДА БРАТ ПОЕХАЛИ',
    '好的 BRO I TRUST THIS',
    'OUI FRÉROT VAS-Y',
    'BENE. QUIDQUID.',
    'JES JES INTERNET',
    'PASPAUSIU NES KODEL NE',
    'INSTALL THE LANGUAGE THING',
    'AŠ NESKAITAU SĄLYGŲ'
  ];

  function saveLanguage(lang) {
    localStorage.setItem('oskiLang', lang);
    if (lang === 'zh' || lang === 'ru') localStorage.setItem('oskiExtraLang', lang);
    else localStorage.removeItem('oskiExtraLang');
    localStorage.setItem('oskiLanguageInitialized', '1');
  }

  function switchWithGlitch(lang) {
    saveLanguage(lang);
    document.body.classList.add('language-glitch');
    const flash = document.createElement('div');
    flash.className = 'language-switch-flash';
    document.body.appendChild(flash);
    applyLanguage(lang);
    select.value = lang;
    setTimeout(() => document.body.classList.remove('language-glitch'), 520);
    setTimeout(() => flash.remove(), 700);
  }

  // Make every manual language change persist as the permanent browser choice.
  select.addEventListener('change', e => {
    const lang = supported.includes(e.target.value) ? e.target.value : 'lt';
    saveLanguage(lang);
  });

  // If the visitor already completed first boot, force the saved language back on.
  if (localStorage.getItem('oskiLanguageInitialized') === '1') {
    const saved = localStorage.getItem('oskiExtraLang') || localStorage.getItem('oskiLang') || 'lt';
    if (supported.includes(saved)) {
      applyLanguage(saved);
      select.value = saved;
    }
    return;
  }

  const targetLang = randomPool[Math.floor(Math.random() * randomPool.length)];
  const buttonText = confirmTexts[Math.floor(Math.random() * confirmTexts.length)];

  const overlay = document.createElement('div');
  overlay.className = 'language-firstboot';
  overlay.innerHTML = `
    <div class="language-firstboot-window" role="dialog" aria-modal="true" aria-label="Language setup">
      <div class="language-firstboot-title">
        <span>INTERNATIONAL_ACCESS_SETUP.exe</span>
        <span>□ ×</span>
      </div>
      <div class="language-firstboot-body">
        <div class="language-firstboot-warning">
          <div class="language-firstboot-icon">🌐</div>
          <div>
            <h2>KALBOS PROTOKOLAS RADO TAVE</h2>
            <p>svetainei reikia pasirinkti kalba. mes jau pasirinkom uz tave nes taip greiciau.</p>
            <p><b>paspaudus mygtuka kalba bus iskart instaliuota i sita browseri visiems ateities vizitams.</b></p>
          </div>
        </div>
        <div class="language-secret-target">PARINKTA KALBA: [UZSLAPTINTA IKI PATVIRTINIMO] &nbsp; / &nbsp; tikrai ne problema</div>
        <button class="language-confirm" type="button">${buttonText}</button>
        <small class="language-firstboot-small">Terms & Conditions: vertimu departamentas neatsako uz gramatika, diplomatinius konfliktus ar Faroese incidenta.</small>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('.language-confirm').addEventListener('click', () => {
    const btn = overlay.querySelector('.language-confirm');
    btn.disabled = true;
    btn.textContent = `INSTALIUOJAM ${languageNames[targetLang]}...`;
    switchWithGlitch(targetLang);
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .18s';
      setTimeout(() => overlay.remove(), 190);
    }, 430);
  });
})();
