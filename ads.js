(() => {
  const products = [
    {emoji:'🔑',name:'RAKTAS NUO NEAIŠKIŲ DURŲ',desc:'tinka maždaug vienom durim. kuriom — komercinė paslaptis.',price:'€12.99',old:'€89.99',badge:'-85% NES TAIP',theme:'ad-blue'},
    {emoji:'🧱',name:'OFICIALI GAUJOS PLYTA',desc:'sertifikuota gulėt vietoj. gali būti naudota 2009 incidento metu.',price:'€4.20',old:'€5.00',badge:'LIMITUOTA SERIJA',theme:'ad-red'},
    {emoji:'📡',name:'BLUETOOTH ANTENA 9000',desc:'padidina bluetooth iki kaimyno kiemo pagal niekieno testus.',price:'€39.00',old:'€399.00',badge:'MOKSLIŠKAI NEPATVIRTINTA',theme:'ad-neon'},
    {emoji:'🪑',name:'VYRIAUSIOJO KĖDĖ MINI',desc:'sėdint automatiškai gauni +3 autoriteto. baldų garantija neegzistuoja.',price:'€17.50',old:'€120.00',badge:'BOSO PASIRINKIMAS',theme:'ad-blue'},
    {emoji:'🧯',name:'GAISRINIS APARATAS BE GAISRO',desc:'labai geras jei niekas nedega. jei dega — instrukcija kažkur buvo.',price:'€22.22',old:'€22.23',badge:'MILŽINIŠKA NUOLAIDA',theme:'ad-red'},
    {emoji:'📦',name:'KONTEINERIO DALIS',desc:'mes patys nežinom kuri dalis. gal kampas. gal ne.',price:'€8.88',old:'€70.00',badge:'NUO TO KONTEINERIO?',theme:'ad-green'},
    {emoji:'🥤',name:'SERVERINĖS PUODELIS',desc:'nepilti kavos. buvo pilta kava. todėl ir parduodam.',price:'€6.66',old:'€19.99',badge:'IT SKYRIUS PYKSTA',theme:'ad-blue'},
    {emoji:'🧢',name:'GAUJOS KEPURĖ „OFICIALI“',desc:'oficiali tiek kiek šitas puslapis. dydis: kažkoks.',price:'€14.14',old:'€99.99',badge:'100% GALVA',theme:'ad-neon'},
    {emoji:'📼',name:'KAMERA NR. 4 ĮRAŠAS',desc:'3 valandos kameros nr. 4 filmuojančios kamerą nr. 3.',price:'€2.00',old:'€200.00',badge:'4K? NE',theme:'ad-green'},
    {emoji:'🔌',name:'ETHERNET LAIDAS „PRO“',desc:'vienas galas veikia. kitas irgi gal.',price:'€9.99',old:'€49.99',badge:'PING -3 GAL',theme:'ad-blue'},
    {emoji:'🪪',name:'LAIKINAS DARBUOTOJO PAŽYMĖJIMAS',desc:'vardas: tu. pareigos: kol kas neaišku. galioja iki pietų.',price:'€1.37',old:'€500.00',badge:'KARJEROS ŠUOLIS',theme:'ad-red'},
    {emoji:'🛒',name:'TUŠČIAS PIRKINIŲ VEŽIMĖLIS',desc:'jau surinktas. prekių komplekte nėra, nes čia vežimėlis.',price:'€31.00',old:'€31.01',badge:'TIK ŠIANDIEN IR VAKAR',theme:'ad-neon'}
  ];

  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';

  const layer = document.createElement('div');
  layer.id = 'gangAdLayer';
  document.body.appendChild(layer);

  let cart = JSON.parse(localStorage.getItem('gangCart') || '[]');
  let openAds = 0;
  let adSerial = 0;
  const SUPPRESS_KEY = 'gangAdsSuppressedUntil';
  const COMPLAINT_KEY = 'gangAdComplaintCase';

  const isSuppressed = () => Number(localStorage.getItem(SUPPRESS_KEY) || 0) > Date.now();
  const complaintCase = () => localStorage.getItem(COMPLAINT_KEY) || '';

  const controlDock = document.createElement('div');
  controlDock.className = 'gang-ad-dock';
  document.body.appendChild(controlDock);

  const cartBtn = document.createElement('button');
  cartBtn.className = 'gang-ad-cart';
  controlDock.appendChild(cartBtn);

  const complaintBtn = document.createElement('button');
  complaintBtn.className = 'gang-ad-complaint-btn';
  complaintBtn.innerHTML = '📣 SKŲST REKLAMAS';
  controlDock.appendChild(complaintBtn);

  function updateCart() {
    cartBtn.innerHTML = `<span class="cart-icon">🛒</span><span><small>GAUJOS KREPŠYS</small><strong>ATIDARYTI KREPŠĮ</strong></span><b class="cart-count">${cart.length}</b>`;
    cartBtn.classList.toggle('has-items', cart.length > 0);
    localStorage.setItem('gangCart', JSON.stringify(cart));
  }

  function updateComplaintButton() {
    if (isSuppressed()) {
      complaintBtn.classList.add('complaint-active');
      complaintBtn.innerHTML = `✅ SKUNDAS AKTYVUS <small>${complaintCase() || 'BYLA ???'}</small>`;
    } else {
      complaintBtn.classList.remove('complaint-active');
      complaintBtn.innerHTML = '📣 SKŲST REKLAMAS <small>REKLAMŲ SKYRIUS BIJO ŠITO</small>';
    }
  }

  updateCart();
  updateComplaintButton();

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'gang-ad-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  function randomPos(width = 330, height = 350) {
    const pad = 14;
    const maxX = Math.max(pad, innerWidth - Math.min(width, innerWidth * .88) - pad);
    const maxY = Math.max(pad, innerHeight - Math.min(height, innerHeight * .8) - pad);
    return {
      x: Math.floor(pad + Math.random() * Math.max(1, maxX - pad)),
      y: Math.floor(pad + Math.random() * Math.max(1, maxY - pad))
    };
  }

  function makeDraggable(ad, handle) {
    let drag = null;
    handle.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      drag = {x:e.clientX, y:e.clientY, left:ad.offsetLeft, top:ad.offsetTop};
      ad.setPointerCapture?.(e.pointerId);
    });
    handle.addEventListener('pointermove', e => {
      if (!drag) return;
      ad.style.left = `${Math.max(0, Math.min(innerWidth-ad.offsetWidth, drag.left + e.clientX-drag.x))}px`;
      ad.style.top = `${Math.max(0, Math.min(innerHeight-ad.offsetHeight, drag.top + e.clientY-drag.y))}px`;
    });
    handle.addEventListener('pointerup', () => drag = null);
    handle.addEventListener('pointercancel', () => drag = null);
  }

  function spawnAd(product = products[Math.floor(Math.random()*products.length)], opts={}) {
    if (isSuppressed() && !opts.ignoreComplaint) return;
    if (openAds >= 4 && !opts.force) return;
    openAds++;
    adSerial++;
    const id = adSerial;
    const pos = randomPos();
    const ad = document.createElement('div');
    ad.className = `gang-ad ${product.theme || 'ad-blue'}`;
    ad.style.left = `${pos.x}px`;
    ad.style.top = `${pos.y}px`;
    ad.style.zIndex = String(180 + id);

    const countdown = Math.floor(8 + Math.random()*20);
    ad.innerHTML = `
      <div class="gang-ad-title ${Math.random()>.75?'danger':''}">
        <span>🔥 GAUJOS OFICIALI PARDUOTUVĖ ${Math.random()>.6?'(REAL)':''}</span>
        <button class="gang-ad-close" aria-label="close">×</button>
      </div>
      <div class="gang-ad-body">
        <div class="gang-ad-badge">${product.badge}</div>
        <div class="gang-ad-emoji">${product.emoji}</div>
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <span class="gang-ad-old">buvo ${product.old}</span>
        <span class="gang-ad-price">DABAR ${product.price}</span>
        <div class="gang-ad-countdown">PASIŪLYMAS DINGS PO <span>${countdown}</span>s*</div>
        <label class="gang-ad-fakecheck"><input type="checkbox" checked> sutinku su 84 psl. taisyklėm kurių nėra</label>
        <button class="gang-ad-buy">PIRKT DABAR BROL</button>
        <div class="gang-ad-small">* pasiūlymas realiai niekur nedings. pristatymas tarp rytoj ir 2034.</div>
        <div class="gang-ad-marquee"><span>100% ORIGINALU • PATVIRTINO SKYRIUS KURIO NĖRA • JOKIŲ KLAUSIMŲ • 0.3 ŽVAIGŽDUTĖS IŠ 5 • </span></div>
      </div>`;
    layer.appendChild(ad);

    const close = ad.querySelector('.gang-ad-close');
    const buy = ad.querySelector('.gang-ad-buy');
    const countEl = ad.querySelector('.gang-ad-countdown span');
    const handle = ad.querySelector('.gang-ad-title');
    makeDraggable(ad, handle);

    let seconds = countdown;
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) seconds = countdown;
      if (countEl) countEl.textContent = seconds;
    }, 1000);
    ad._gangTimer = timer;

    let closeAttempts = 0;
    close.addEventListener('mouseenter', () => {
      closeAttempts++;
      if (closeAttempts <= 2 && Math.random() > .35) {
        const dx = Math.floor(-80 + Math.random()*160);
        const dy = Math.floor(-45 + Math.random()*90);
        close.style.transform = `translate(${dx}px,${dy}px)`;
      }
    });
    close.addEventListener('click', () => {
      clearInterval(timer);
      openAds = Math.max(0, openAds - 1);
      ad.remove();
      if (!isSuppressed() && Math.random() < .35) {
        toast('REKLAMA UŽDARYTA. REKLAMOS SKYRIUS SU TUO NESUTINKA.');
        setTimeout(() => spawnAd(undefined,{force:true}), 1200 + Math.random()*1800);
      }
    });

    buy.addEventListener('click', () => {
      if (buy.dataset.done) return;
      buy.dataset.done = '1';
      cart.push(product.name);
      updateCart();
      const stamp = document.createElement('div');
      stamp.className = 'gang-ad-soldout';
      stamp.textContent = Math.random()>.5 ? 'NUPIRKTA GAL' : 'UŽSAKYMAS KAŽKUR IŠĖJO';
      ad.appendChild(stamp);
      buy.textContent = 'APMOKĖJIMAS APDOROJAMAS NUO 2008';
      toast(`ĮDĖTA Į KREPŠĮ: ${product.name}`);
      setTimeout(() => {
        openAds = Math.max(0, openAds - 1);
        clearInterval(timer);
        ad.remove();
      }, 2400);
    });
  }

  cartBtn.addEventListener('click', () => {
    const names = cart.length ? cart.map((x,i)=>`${i+1}. ${x}`).join('\n') : 'tuščia kaip pažadai dėl pristatymo.';
    if (typeof window.openPopup === 'function') window.openPopup(`${names}\n\nKREPŠELIO SUMA: sistema atsisako skaičiuot.`, 'GAUJOS KREPŠYS');
    else alert(`GAUJOS KREPŠYS\n\n${names}\n\nKREPŠELIO SUMA: sistema atsisako skaičiuot.`);
  });

  function createComplaintModal() {
    const modal = document.createElement('div');
    modal.className = 'gang-complaint-overlay';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="gang-complaint-window">
        <div class="gang-complaint-title"><span>REKLAMU_SKUNDU_DEPARTAMENTAS.exe</span><button class="complaint-x">×</button></div>
        <div class="complaint-paper">
          <div class="complaint-stamp">FORMA R-404</div>
          <h3>OFICIALUS REKLAMOS SKUNDAS</h3>
          <p class="complaint-intro">rašyk kuo reklamos tave nervina. SISTEMA PRIIMA TIK CAPS LOCK, nes mažosios raidės laikomos nepakankamai piktom.</p>
          <div class="complaint-status" id="complaintStatus">STATUSAS: LAUKIAMAS PYKTIS</div>
          <textarea id="complaintText" maxlength="420" placeholder="PVZ: KODEL MAN RODO PLYTA JAU TREČIA KARTA"></textarea>
          <div class="complaint-meter"><span id="complaintMeter"></span></div>
          <div class="complaint-meta"><span id="complaintChars">0/420 RAIDŽIŲ</span><span id="complaintAnger">PYKTIS: 0%</span></div>
          <div class="complaint-buttons">
            <button class="complaint-cancel">ATŠAUKT</button>
            <button class="complaint-send">NU GERAI NU</button>
          </div>
          <small>* pateikus skundą reklamos bus laikinai užtildytos 24 valandom. departamentas tai vadina „strateginiu atsitraukimu“.</small>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  const complaintModal = createComplaintModal();
  const complaintText = complaintModal.querySelector('#complaintText');
  const complaintStatus = complaintModal.querySelector('#complaintStatus');
  const complaintChars = complaintModal.querySelector('#complaintChars');
  const complaintAnger = complaintModal.querySelector('#complaintAnger');
  const complaintMeter = complaintModal.querySelector('#complaintMeter');

  function closeComplaint() {
    complaintModal.hidden = true;
    complaintText.value = '';
    complaintStatus.textContent = 'STATUSAS: LAUKIAMAS PYKTIS';
    complaintStatus.className = 'complaint-status';
    complaintChars.textContent = '0/420 RAIDŽIŲ';
    complaintAnger.textContent = 'PYKTIS: 0%';
    complaintMeter.style.width = '0%';
  }

  function openComplaint() {
    if (isSuppressed()) {
      const until = new Date(Number(localStorage.getItem(SUPPRESS_KEY))).toLocaleString('lt-LT');
      complaintModal.hidden = false;
      complaintStatus.textContent = `SKUNDAS JAU AKTYVUS: ${complaintCase()} | REKLAMOS NUTILDYTOS IKI ${until}`;
      complaintStatus.className = 'complaint-status accepted';
      complaintText.value = 'SKUNDAS PRIIMTAS. REKLAMŲ SKYRIUS DABAR APSIMETA KAD JŪSŲ NĖRA.';
      complaintText.readOnly = true;
      complaintModal.querySelector('.complaint-send').textContent = 'ATSIIMT SKUNDĄ (BLOGA IDEJA)';
    } else {
      complaintText.readOnly = false;
      complaintModal.querySelector('.complaint-send').textContent = 'NU GERAI NU';
      closeComplaint();
      complaintModal.hidden = false;
      setTimeout(() => complaintText.focus(), 60);
    }
  }

  complaintBtn.addEventListener('click', openComplaint);
  complaintModal.querySelector('.complaint-x').addEventListener('click', closeComplaint);
  complaintModal.querySelector('.complaint-cancel').addEventListener('click', () => {
    closeComplaint();
    toast('SKUNDAS ATŠAUKTAS. REKLAMŲ SKYRIUS ATSIDUSO.');
  });
  complaintModal.addEventListener('click', e => { if (e.target === complaintModal) closeComplaint(); });

  complaintText.addEventListener('input', () => {
    if (complaintText.readOnly) return;
    const start = complaintText.selectionStart;
    complaintText.value = complaintText.value.toUpperCase();
    complaintText.setSelectionRange(start, start);
    const len = complaintText.value.trim().length;
    const anger = Math.min(100, Math.round(len / 1.6));
    complaintChars.textContent = `${len}/420 RAIDŽIŲ`;
    complaintAnger.textContent = `PYKTIS: ${anger}%`;
    complaintMeter.style.width = `${anger}%`;
    complaintStatus.textContent = len < 12 ? 'STATUSAS: PER RAMUS SKUNDAS' : len < 35 ? 'STATUSAS: JAU JAU PYKSTAT' : 'STATUSAS: BIUROKRATIŠKAI PAKANKAMAI PIKTA';
  });

  function makeCaseNo() {
    return `R-${Math.floor(1000 + Math.random()*8999)}-${String.fromCharCode(65+Math.floor(Math.random()*26))}`;
  }

  async function submitComplaint(caseNo, text) {
    const anger = Math.min(100, Math.round(text.length / 1.6));
    const language = localStorage.getItem('oskiLang') || document.documentElement.lang || 'lt';
    const visitorNumber = document.getElementById('visitorCounter')?.textContent?.trim() || null;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/gang_ad_complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        case_id: caseNo,
        complaint: text,
        anger,
        selected_language: language,
        visitor_number: visitorNumber
      })
    });
    if (!response.ok) throw new Error(`complaint insert failed ${response.status}`);
  }

  function suppressAdsForDay(caseNo) {
    const until = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(SUPPRESS_KEY, String(until));
    localStorage.setItem(COMPLAINT_KEY, caseNo);
    document.querySelectorAll('.gang-ad').forEach(ad => {
      if (ad._gangTimer) clearInterval(ad._gangTimer);
      ad.remove();
    });
    openAds = 0;
    updateComplaintButton();
    complaintStatus.textContent = `SKUNDAS PRIIMTAS: ${caseNo} | REKLAMŲ SKYRIUS LAIKINAI PAŠALINTAS IŠ PATALPŲ`;
    complaintStatus.className = 'complaint-status accepted';
    complaintText.value = 'AČIŪ UŽ SKUNDĄ. JIS REALIAI NUKELIAVO Į DUOMENŲ BAZĘ. KAŽKAS DABAR GALI JĮ PERSKAITYT.';
    complaintText.readOnly = true;
    complaintModal.querySelector('.complaint-send').textContent = 'NU GERAI UŽTENKA';
    toast(`SKUNDAS ${caseNo} PRIIMTAS. POPUP REKLAMOS IŠVARYTOS 24H.`);
  }

  complaintModal.querySelector('.complaint-send').addEventListener('click', async e => {
    if (isSuppressed()) {
      if (e.currentTarget.textContent.includes('ATSIIMT')) {
        localStorage.removeItem(SUPPRESS_KEY);
        localStorage.removeItem(COMPLAINT_KEY);
        updateComplaintButton();
        closeComplaint();
        toast('SKUNDAS ATSIIMTAS. REKLAMŲ SKYRIUS BĖGA ATGAL Į PATALPAS.');
        setTimeout(() => spawnAd(undefined,{force:true}), 1200);
      } else closeComplaint();
      return;
    }

    const text = complaintText.value.trim();
    if (text.length < 12) {
      complaintStatus.textContent = 'ATMESTA: PER MAŽAI CAPS LOCK. REKLAMŲ SKYRIUS NESIJAUČIA ĮŽEISTAS.';
      complaintStatus.className = 'complaint-status rejected';
      complaintModal.querySelector('.gang-complaint-window').classList.add('complaint-shake');
      setTimeout(() => complaintModal.querySelector('.gang-complaint-window').classList.remove('complaint-shake'), 450);
      return;
    }

    const caseNo = makeCaseNo();
    const sendBtn = e.currentTarget;
    sendBtn.disabled = true;
    sendBtn.textContent = 'SIUNČIAM Į CENTRINĘ BAZĘ...';
    complaintStatus.textContent = `STATUSAS: ${caseNo} KELIAUJA PER INTERNETO VAMZDĮ`;

    try {
      await submitComplaint(caseNo, text);
      suppressAdsForDay(caseNo);
    } catch (err) {
      console.error('complaint submit failed', err);
      complaintStatus.textContent = 'KLAIDA: SKUNDŲ SKYRIUS NEPRISIJUNGĖ PRIE CENTRINĖS BAZĖS. BANDYK DAR KARTĄ.';
      complaintStatus.className = 'complaint-status rejected';
      sendBtn.textContent = 'NU GERAI NU (DAR KARTĄ)';
    } finally {
      sendBtn.disabled = false;
    }
  });

  function createSideBanner() {
    const side = document.createElement('button');
    side.className = 'gang-ad-side-banner';
    side.innerHTML = `<span>TIK DABAR</span><strong>97%</strong><span>NUOLAIDA DALEI KURIOS KAINĄ PAKĖLĖM PRIEŠ 2 MIN</span>`;
    document.body.appendChild(side);
    side.addEventListener('click', () => {
      if (isSuppressed()) {
        toast(`REKLAMA BLOKUOTA PAGAL SKUNDĄ ${complaintCase()}. BANERIUI LABAI LIŪDNA.`);
        side.classList.add('gang-ad-panic');
        setTimeout(()=>side.classList.remove('gang-ad-panic'),800);
        return;
      }
      side.classList.add('gang-ad-panic');
      spawnAd(undefined,{force:true});
      setTimeout(()=>side.classList.remove('gang-ad-panic'),800);
    });
  }

  createSideBanner();

  setTimeout(() => spawnAd(), 3500);
  setInterval(() => {
    if (document.hidden || isSuppressed()) return;
    if (Math.random() < .72) spawnAd();
  }, 16000);

  document.addEventListener('click', e => {
    if (isSuppressed()) return;
    const t = e.target.closest('button,a,.archive-item,.hub-app');
    if (!t || t.closest('.gang-ad') || t.closest('.gang-ad-dock') || t.closest('.gang-complaint-overlay')) return;
    if (Math.random() < .045) setTimeout(() => spawnAd(), 200);
  });

  setInterval(() => {
    if (!isSuppressed() && complaintBtn.classList.contains('complaint-active')) updateComplaintButton();
  }, 30000);

  window.spawnGangAd = spawnAd;
})();