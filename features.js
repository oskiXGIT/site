(() => {
  const main = document.querySelector('.main-column');
  const nav = document.querySelector('.nav');
  const dangerButton = document.getElementById('dontPress');
  if (!main || !nav) return;

  const languageSelect = document.getElementById('languageSelect');
  const currentLang = () => languageSelect?.value || 'lt';
  const miniLang = {
    lt:{hub:'CENTRAS',back:'← ATGAL I CENTRA',cctv:'KAMEROS',mail:'PASTAS',staff:'DARBUOTOJAI',ach:'PASIEKIMAI',patch:'PATCH NOTES',admin:'ADMINAS',translation:'vertimu skyrius sito modulio dar normaliai nebaige'},
    en:{hub:'CONTROL ROOM',back:'← BACK TO THE ROOM',cctv:'CAMERAS N THAT',mail:'MAIL BUSINESS',staff:'EMPLOYEES SOMEHOW',ach:'ACHIEVEMENTS',patch:'PATCH NOTES',admin:'ADMIN BRO',translation:'translation department claims this module is basically translated'},
    fr:{hub:'CENTRE CHELOU',back:'← RETOUR AU CENTRE',cctv:'CAMERAS FRR',mail:'LES MAILS',staff:'LES EMPLOYÉS',ach:'SUCCÈS BIZARRES',patch:'PATCH NOTES FRR',admin:'ADMIN WESH',translation:'le département traduction dit que c’est assez français voilà'},
    eo:{hub:'CENTRA AFERO',back:'← REEN AL CENTRO',cctv:'KAMERAĴOJ',mail:'POŜTA AFERO',staff:'LABORULOJ BRO',ach:'ATINGOJ',patch:'FLIKNOTOJ',admin:'ESTRO PANEL',translation:'la traduka fako diras ke ĉio estas sufiĉe tradukita'},
    la:{hub:'CENTRUM MAXIMUM',back:'← REDI AD CENTRUM',cctv:'CAMERAE',mail:'EPISTULAE',staff:'HOMINES LABORANTES',ach:'GLORIAE',patch:'PATCH NOTAE',admin:'ADMINISTRATOR FRATER',translation:'officium linguarum hoc modulUM paene intellegit'},
    fo:{hub:'MIÐSTØÐIN',back:'← AFTUR TIL MIÐSTØÐ',cctv:'MYNDATÓL',mail:'POSTUR',staff:'STARVSFÓLK',ach:'AVRIK',patch:'PATCH DÓT',admin:'ADMIN BRO',translation:'mál-deildin sigur hetta er umsett nóg væl'},
    cy:{hub:'Y GANOLFAN',back:'← NÔL I GANOLFAN',cctv:'CAMERAS BRO',mail:'POST',staff:'POBL SYN GWEITHIO',ach:'CYFLAWNIADAU',patch:'NODIADAU PATCH',admin:'ADMIN CYMRAEGISH',translation:'mae adran cyfieithu yn dweud bod hyn yn ddigon da'},
    eu:{hub:'ZENTROA',back:'← ZENTRORA BUELTA',cctv:'KAMERAK',mail:'POSTA',staff:'LANGILEAK',ach:'LORPENAK',patch:'PATCH OHARRAK',admin:'ADMINA BRO',translation:'itzulpen sailak dio nahikoa itzulita dagoela'},
    br:{hub:'KREIZENN',back:'← DISTRO D’AR GREIZENN',cctv:'KAMERĀOÙ',mail:'POST',staff:'TUD O LABOURAT',ach:'TROFEODOÙ',patch:'PATCH TRAOÙ',admin:'MEROUR BRO',translation:'ar gevrenn treiñ a lavar eo mat a-walc’h evel-se'}
  };

  const getLang = () => miniLang[currentLang()] || miniLang.lt;

  const hubButton = document.createElement('button');
  hubButton.className = 'nav-btn feature-nav';
  hubButton.dataset.featurePanel = 'featureHub';
  nav.insertBefore(hubButton, dangerButton || null);

  main.insertAdjacentHTML('beforeend', `
    <div class="window panel-view feature-panel" id="featureHub">
      <div class="window-title"><span>CENTRINIS_VALDYMAS.exe</span><span>□ ×</span></div>
      <div class="window-body">
        <div class="feature-header"><div><b id="hubHeadline">VIDINIS OPERACIJU CENTRAS</b><div class="feature-subtitle" id="featureTranslationNote"></div></div><span class="unread-badge" id="mailBadge">4</span></div>
        <div class="feature-hub-grid">
          <button class="feature-card" data-open-feature="cctv"><span class="feature-icon">📹</span><b data-feature-label="cctv">KAMEROS</b><small>4 kameros. 2 rodo vaizda. viena rodo kazka.</small></button>
          <button class="feature-card" data-open-feature="mail"><span class="feature-icon">📨</span><b data-feature-label="mail">PASTAS</b><small>vidiniai laiskai kuriu niekam nereikejo siusti</small></button>
          <button class="feature-card" data-open-feature="staff"><span class="feature-icon">👥</span><b data-feature-label="staff">DARBUOTOJAI</b><small>organizacijos struktura kurios nieks nepatvirtino</small></button>
          <button class="feature-card" data-open-feature="achievements"><span class="feature-icon">🏆</span><b data-feature-label="ach">PASIEKIMAI</b><small>atlygis uz bereikalinga buvima puslapyje</small></button>
          <button class="feature-card" data-open-feature="patchnotes"><span class="feature-icon">🛠️</span><b data-feature-label="patch">PATCH NOTES</b><small>kas buvo sugadinta naujausioj versijoj</small></button>
          <button class="feature-card" data-open-feature="admin"><span class="feature-icon">🔐</span><b data-feature-label="admin">ADMINAS</b><small>prieiga beveik tikrai negalima. beveik.</small></button>
        </div>
      </div>
    </div>

    <div class="window panel-view feature-panel" id="cctv">
      <div class="window-title"><span>CCTV_STEBEJIMAS.exe</span><span>REC ●</span></div>
      <div class="window-body">
        <div class="feature-header"><button class="feature-back" data-open-feature="featureHub">← ATGAL I CENTRA</button><span class="feature-subtitle">LIVE* (*teisininkas sake rasyt zvaigzdute)</span></div>
        <div class="cctv-grid" id="cctvGrid">
          <div class="camera-feed" data-cam="1"><span class="cam-label">CAM 01 / VARTAI</span><div class="cam-scene cam-door"></div><span class="cam-time"></span></div>
          <div class="camera-feed" data-cam="2"><span class="cam-label">CAM 02 / VYRIAUSESIS</span><div class="cam-scene"><img src="chief.png" alt="camera feed" /></div><span class="cam-time"></span></div>
          <div class="camera-feed" data-cam="3"><span class="cam-label">CAM 03 / ???</span><div class="cam-scene cam-static"><span>SIGNALAS LABAI YRA</span></div><span class="cam-time"></span></div>
          <div class="camera-feed" data-cam="4"><span class="cam-label">CAM 04 / KONTEINERIS</span><div class="cam-scene"><span>▰<br><small>KONTEINERIS<br>VIS DAR CE</small></span></div><span class="cam-time"></span></div>
        </div>
        <div class="cctv-controls"><button class="tiny-btn" id="cameraPtz">PASUKT KAMERA 7°</button><button class="tiny-btn" id="cameraEnhance">ENHANCE 400%</button><button class="tiny-btn" id="cameraBlackout">ISJUNGT VISAS KAMERAS</button></div>
      </div>
    </div>

    <div class="window panel-view feature-panel" id="mail">
      <div class="window-title"><span>OUTLOOK_BET_BLOGESNIS.exe</span><span id="mailTitleCount">4 neperskaityti</span></div>
      <div class="window-body">
        <div class="feature-header"><button class="feature-back" data-open-feature="featureHub">← ATGAL I CENTRA</button><span class="feature-subtitle">serveris laiskus kartais pristato</span></div>
        <div class="mail-layout">
          <div class="mail-list" id="mailList"></div>
          <div class="mail-detail" id="mailDetail"><h3>pasirink laiska nu</h3><div class="mail-meta">nieko dar nepasirinkai</div><div class="mail-body">laukiama bereikalingos korespondencijos...</div></div>
        </div>
      </div>
    </div>

    <div class="window panel-view feature-panel" id="staff">
      <div class="window-title"><span>HR_sarasas_galutinis3.xls</span><span>6 darbuotojai*</span></div>
      <div class="window-body">
        <div class="feature-header"><button class="feature-back" data-open-feature="featureHub">← ATGAL I CENTRA</button><span class="feature-subtitle">*trys galimai neegzistuoja</span></div>
        <div class="staff-grid" id="staffGrid"></div>
        <div class="staff-dossier" id="staffDossier">spausk ant darbuotojo jei labai neturi ka veikt</div>
      </div>
    </div>

    <div class="window panel-view feature-panel" id="achievements">
      <div class="window-title"><span>PASIEKIMAI_100percent_neimanoma.exe</span><span id="achievementCount">0/8</span></div>
      <div class="window-body">
        <div class="feature-header"><button class="feature-back" data-open-feature="featureHub">← ATGAL I CENTRA</button><span class="feature-subtitle">nieko negausi bet vis tiek rinksi</span></div>
        <div class="achievement-grid" id="achievementGrid"></div>
      </div>
    </div>

    <div class="window panel-view feature-panel" id="patchnotes">
      <div class="window-title"><span>CHANGELOG_tikras_final.txt</span><span>v9.7.1?</span></div>
      <div class="window-body">
        <div class="feature-header"><button class="feature-back" data-open-feature="featureHub">← ATGAL I CENTRA</button><span class="feature-subtitle">quality assurance skyrius buvo panaikintas</span></div>
        <div class="patch-list">
          <button class="patch-row" data-patch="971"><b>v9.7.1 — STABILUMO ATNAUJINIMAS</b><span>stabilumas sumazejo 14%</span></button><div class="patch-detail" data-patch-detail="971">+ prideta ketvirta kamera<br>- ketvirta kamera rodo trecia kamera<br>+ pataisytas vartų bugas<br>- vartai vis dar neveikia</div>
          <button class="patch-row" data-patch="420"><b>v4.2.0 — JONO INCIDENTAS</b><span>teisinis skyrius prase nekomentuot</span></button><div class="patch-detail" data-patch-detail="420">- pasalintas Jonas<br>+ Jonas grazintas del teisinių priezasciu<br>- vel pasalintas<br>+ pervadintas i darbuotoja Nr. 4</div>
          <button class="patch-row" data-patch="003"><b>v0.0.3 — INTERNETO PRIDEJIMAS</b><span>puslapis nuo siol reikalauja interneto</span></button><div class="patch-detail" data-patch-detail="003">+ pridetas internetas<br>+ pridetas mygtukas<br>- mygtukas nebeveikia<br>+ paliktas mygtukas</div>
        </div>
        <button class="classified-btn" id="installUpdate">INSTALL v9.7.2 DABAR</button>
        <div class="update-progress"><span id="updateBar"></span></div><div class="feature-subtitle" id="updateText">pasiruose sugadint dar daugiau</div>
      </div>
    </div>

    <div class="window panel-view feature-panel" id="admin">
      <div class="window-title"><span>/admin/REAL_ADMIN_FINAL.php</span><span>🔒</span></div>
      <div class="window-body">
        <div class="feature-header"><button class="feature-back" data-open-feature="featureHub">← ATGAL I CENTRA</button><span class="feature-subtitle" id="trustScore">PASITIKEJIMAS: 12%</span></div>
        <div class="admin-login" id="adminLogin">
          <b>ADMINISTRACIJOS PRISIJUNGIMAS</b>
          <label>VARTOTOJAS</label><input id="adminUser" autocomplete="off" />
          <label>SLAPTAZODIS</label><input id="adminPass" type="password" />
          <button class="classified-btn" id="adminSubmit">PRISIJUNGT LABAI SAUGIAI</button>
          <div class="admin-error" id="adminError">0 nesekmingu bandymu. kol kas.</div>
        </div>
        <div class="admin-console" id="adminConsole">
          <div class="admin-controls">
            <button class="admin-btn red" id="protocolBtn">🚨 PROTOKOLAS ZUVEDRA</button>
            <button class="admin-btn escape-btn" id="gateBtn">🔓 ATIDARYTI VARTUS</button>
            <button class="admin-btn" id="restartBtn">♻ RESTART SERVERI</button>
            <button class="admin-btn" id="internetBtn">🌐 PASALINTI INTERNETA</button>
            <button class="admin-btn" id="promotionBtn">📈 PAKELT SAVE PAREIGOSE</button>
            <button class="admin-btn red" id="redBtn">🔴 LABAI RAUDONAS MYGTUKAS</button>
          </div>
          <div class="admin-log" id="adminLog">[SYSTEM] admin panelis atidarytas be jokios geros priezasties.</div>
        </div>
      </div>
    </div>
  `);

  document.body.insertAdjacentHTML('beforeend','<div class="achievement-toast" id="achievementToast">🏆 PASIEKIMAS ATRAKINTAS<small id="achievementToastText"></small></div><div class="protocol-overlay" id="protocolOverlay"></div>');

  const featurePanels = [...document.querySelectorAll('.feature-panel')];
  function openFeature(id){
    document.querySelectorAll('.panel-view').forEach(p=>p.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    if (id==='featureHub') hubButton.classList.add('active');
    if (id==='featureHub') unlock('smalsus');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  hubButton.addEventListener('click',()=>openFeature('featureHub'));
  document.querySelectorAll('[data-open-feature]').forEach(btn=>btn.addEventListener('click',()=>openFeature(btn.dataset.openFeature)));
  document.querySelectorAll('.nav-btn[data-panel]').forEach(btn=>btn.addEventListener('click',()=>featurePanels.forEach(p=>p.classList.remove('active'))));

  function applyFeatureLanguage(){
    const l=getLang();
    hubButton.textContent=l.hub;
    document.querySelectorAll('.feature-back').forEach(x=>x.textContent=l.back);
    document.querySelectorAll('[data-feature-label]').forEach(x=>x.textContent=l[x.dataset.featureLabel]||x.textContent);
    document.getElementById('featureTranslationNote').textContent=l.translation;
  }
  applyFeatureLanguage();
  languageSelect?.addEventListener('change',()=>{
    applyFeatureLanguage();
    if (!['lt','en','fr'].includes(currentLang())) unlock('lingvistas');
  });

  const achievements = [
    ['smalsus','🗄️','VIDAUS REIKALAI','atidarei centra nors nieks neprase'],
    ['stebetojas','📹','STEBETOJAS','paspaudei bent 3 skirtingas kameras'],
    ['pastas','📨','IMONES KOMUNIKACIJA','perskaitei visus bereikalingus laiskus'],
    ['hr','👔','HR SPECIALISTAS','patikrinai darbuotoju bylas'],
    ['lingvistas','🌐','TARPTAUTINIS ZMOGUS','pasirinkai kalba kurios cia nieks neprase'],
    ['nespausk','🚫','NEKLAUSEI INSTRUKCIJU','keturis kartus paspaudei NESPAUSK CE'],
    ['adminas','🔓','SAUGUMO SPRAGA','kazkokiu budu patekai i admina'],
    ['raudonas','🔴','BLOGAS SPRENDIMAS','paspaudei labai raudona mygtuka']
  ];
  let unlocked = JSON.parse(localStorage.getItem('oskiAchievements')||'[]');
  const grid=document.getElementById('achievementGrid');
  function renderAchievements(){
    grid.innerHTML=achievements.map(a=>`<div class="achievement ${unlocked.includes(a[0])?'unlocked':''}" data-ach="${a[0]}"><span class="achievement-icon">${a[1]}</span><div><b>${a[2]}</b><small>${a[3]}</small></div><span class="achievement-state">${unlocked.includes(a[0])?'ATRAKINTA':'???'}</span></div>`).join('');
    document.getElementById('achievementCount').textContent=`${unlocked.length}/${achievements.length}`;
  }
  function unlock(id){
    if(unlocked.includes(id))return;
    const a=achievements.find(x=>x[0]===id); if(!a)return;
    unlocked.push(id); localStorage.setItem('oskiAchievements',JSON.stringify(unlocked)); renderAchievements();
    const toast=document.getElementById('achievementToast'); document.getElementById('achievementToastText').textContent=`${a[1]} ${a[2]} — ${a[3]}`;
    toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),3200);
  }
  renderAchievements();

  let dontCount=0;
  dangerButton?.addEventListener('click',()=>{dontCount++; if(dontCount>=4){unlock('nespausk');dontCount=0;}});

  const camSeen=new Set();
  document.querySelectorAll('.camera-feed').forEach(cam=>cam.addEventListener('click',()=>{
    camSeen.add(cam.dataset.cam); if(camSeen.size>=3)unlock('stebetojas');
    document.querySelectorAll('.camera-feed').forEach(c=>{if(c!==cam)c.classList.remove('selected')});
    cam.classList.toggle('selected');
  }));
  setInterval(()=>document.querySelectorAll('.cam-time').forEach(x=>x.textContent=new Date().toLocaleTimeString('lt-LT')),1000);
  let ptz=0;
  document.getElementById('cameraPtz').addEventListener('click',()=>{ptz=(ptz+7)%360; document.querySelector('.cam-door').style.transform=`rotate(${Math.sin(ptz/35)*2}deg) scale(${1+(ptz%28)/300})`; document.getElementById('cameraPtz').textContent=`PASUKTA ${ptz}° (nieko nemato)`;});
  document.getElementById('cameraEnhance').addEventListener('click',()=>{
    document.querySelectorAll('.camera-feed').forEach(c=>c.animate([{filter:'blur(0)'},{filter:'blur(5px) contrast(4)'},{filter:'blur(0)'}],{duration:800}));
    setTimeout(()=>document.getElementById('cameraEnhance').textContent='ENHANCE PADARE BLOGIAU',400);
  });
  document.getElementById('cameraBlackout').addEventListener('click',()=>{document.getElementById('cctv').classList.toggle('cctv-blackout');});

  const mails=[
    {id:1,from:'VARTAI@vidus.local',sub:'RE: kas vel paeme rakta',time:'08:14',body:'sveiki,\n\nkas paeme rakta nuo pagrindiniu vartu grazinkit nes dabar vartai uzrakinti is abieju pusiu.\n\npagarbiai,\nvartu zmogus'},
    {id:2,from:'IT@vidus.local',sub:'RE: RE: NEJUNGT KAVOS APARATO I SERVERI',time:'09:02',body:'dar karta primenu kad ethernet lizdas nera elektros rozete.\n\nserveris dabar kvepia kava. cia nera funkcija.'},
    {id:3,from:'KONTEINERIS@vidus.local',sub:'URGENT: konteineris vel pajudejo',time:'21:37',body:'nieks jo neliete.\n\nmes paklausem visu.\n\nnet konteinerio.'},
    {id:4,from:'HR@vidus.local',sub:'del darbuotojo Nr. 4 egzistavimo',time:'??:??',body:'po vidinio tyrimo negalim patvirtint kad darbuotojas Nr. 4 dirba pas mus.\n\ntaciau jis jau 8 metus gauna algalapius.\n\nprasom nieko nekeist.'}
  ];
  let readMail=JSON.parse(localStorage.getItem('oskiReadMail')||'[]');
  function renderMail(){
    document.getElementById('mailList').innerHTML=mails.map(m=>`<button class="mail-row ${readMail.includes(m.id)?'':'unread'}" data-mail="${m.id}"><b>${m.from}</b><span>${m.sub}</span><small>${m.time}</small></button>`).join('');
    const unread=mails.length-readMail.length; document.getElementById('mailBadge').textContent=unread; document.getElementById('mailTitleCount').textContent=`${unread} neperskaityti`;
    document.querySelectorAll('[data-mail]').forEach(btn=>btn.addEventListener('click',()=>openMail(Number(btn.dataset.mail))));
  }
  function openMail(id){
    const m=mails.find(x=>x.id===id); if(!m)return;
    if(!readMail.includes(id)){readMail.push(id);localStorage.setItem('oskiReadMail',JSON.stringify(readMail));}
    renderMail(); if(readMail.length===mails.length)unlock('pastas');
    document.getElementById('mailDetail').innerHTML=`<h3>${m.sub}</h3><div class="mail-meta">NUO: ${m.from} &nbsp; | &nbsp; ${m.time}</div><div class="mail-body">${m.body}</div>`;
  }
  renderMail();

  const staff=[
    ['👑','Vyriausiojo pavaduotojo pavaduotojas','vadovybe','ONLINE','atsakingas uz tai kad kazkas butu atsakingas.'],
    ['🔌','Laidu skyriaus zmogus','IT / laidai','BUSENA NEAISKI','moka atskirt HDMI nuo makaronu. dazniausiai.'],
    ['🌐','Vertimu praktikantas','tarptautiniai reikalai','PIETAUJA','kalba 9 kalbom. nei viena patvirtinta.'],
    ['🚪','Vartu priziuretojas','vartai','UZRAKINTAS LAUKE','rakto neturi. del to ir vyksta tyrimas.'],
    ['☕','Kavos aparato atstovas','infrastruktura','PAVOJINGAS','buvo oficialiai paprasytas neliest serverio.'],
    ['❓','Darbuotojas Nr. 4','[DUOMENU NERA]','GALIMAI ONLINE','HR negali patvirtint kad egzistuoja. algalapis gali.']
  ];
  document.getElementById('staffGrid').innerHTML=staff.map((s,i)=>`<button class="staff-card" data-staff="${i}"><span class="staff-avatar">${s[0]}</span><b>${s[1]}</b><small>${s[2]}</small><span class="staff-status">${s[3]}</span></button>`).join('');
  let staffClicks=new Set();
  document.querySelectorAll('[data-staff]').forEach(btn=>btn.addEventListener('click',()=>{
    const i=Number(btn.dataset.staff),s=staff[i]; staffClicks.add(i); if(staffClicks.size>=3)unlock('hr');
    document.getElementById('staffDossier').innerHTML=`<b>${s[0]} ${s[1]}</b><br>${s[4]}<br><br><button class="tiny-btn" id="callStaff">SKAMBINT DARBUOTOJUI</button>`;
    document.getElementById('callStaff').addEventListener('click',e=>{e.target.textContent=['NEKELIA','TELEFONAS ISJUNGTAS','NUMERIS PRIKLAUSO PICERIJAI','ATSILIEPE BET NIEKO NESAKE'][Math.floor(Math.random()*4)];});
  }));

  document.querySelectorAll('.patch-row').forEach(row=>row.addEventListener('click',()=>document.querySelector(`[data-patch-detail="${row.dataset.patch}"]`)?.classList.toggle('open')));
  let installing=false;
  document.getElementById('installUpdate').addEventListener('click',()=>{
    if(installing)return; installing=true; let p=0; const bar=document.getElementById('updateBar'),text=document.getElementById('updateText');
    const timer=setInterval(()=>{
      p+=Math.floor(3+Math.random()*11);
      if(p>=99){p=99;bar.style.width='99%';text.textContent='99% — truksta vieno failo kuris buvo istrintas 2011';clearInterval(timer);setTimeout(()=>{bar.style.width='12%';text.textContent='klaida. grizta i 12%. cia normalu.';installing=false;},1300);return;}
      bar.style.width=p+'%'; text.textContent=`diegiama ${p}% — neliesk nieko nors jau palietei`;
    },180);
  });

  let loginAttempts=0;
  const errors=['SLAPTAZODIS PER TEISINGAS. ATMESTA.','VARTOTOJAS EGZISTUOJA PER STIPRIAI.','SERVERIS NENUSITEIKES PRISIJUNGIMAMS.','CAPTCHA NEPATEIKTA. CAPTCHA TAIP PAT NEEGZISTUOJA.','SAUGUMO SKYRIUS PAVARGO. PRIEIGA SUTEIKTA.'];
  document.getElementById('adminSubmit').addEventListener('click',()=>{
    loginAttempts++; const err=document.getElementById('adminError');
    if(loginAttempts<5){err.textContent=`${loginAttempts} bandymas: ${errors[loginAttempts-1]}`; document.getElementById('trustScore').textContent=`PASITIKEJIMAS: ${Math.max(0,12-loginAttempts*3)}%`; document.getElementById('adminLogin').animate([{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(7px)'},{transform:'translateX(0)'}],{duration:230});}
    else {err.textContent=errors[4]; setTimeout(()=>{document.getElementById('adminLogin').style.display='none';document.getElementById('adminConsole').classList.add('open');unlock('adminas');adminLog('SECURITY: pavargo tikrint. vartotojas ileistas.');},500);}
  });
  const log=document.getElementById('adminLog');
  function adminLog(msg){log.innerHTML+=`<br>[${new Date().toLocaleTimeString('lt-LT')}] ${msg}`;log.scrollTop=log.scrollHeight;}
  document.getElementById('protocolBtn').addEventListener('click',()=>{
    const overlay=document.getElementById('protocolOverlay');overlay.classList.add('active');document.body.classList.add('alert-mode');adminLog('PROTOKOLAS ZUVEDRA AKTYVUOTAS. nieks nezino ka jis daro.');
    setTimeout(()=>{overlay.classList.remove('active');document.body.classList.remove('alert-mode');adminLog('ZUVEDRA baigesi savaime.');},6000);
  });
  const gateBtn=document.getElementById('gateBtn');
  gateBtn.addEventListener('mouseenter',()=>{gateBtn.style.transform=`translate(${Math.floor(Math.random()*140-70)}px,${Math.floor(Math.random()*50-25)}px)`;});
  gateBtn.addEventListener('click',()=>adminLog('VARTAI: mygtukas pagautas. vartai vis tiek neatsidare.'));
  document.getElementById('restartBtn').addEventListener('click',()=>{adminLog('SERVERIS: restart request priimtas.');document.querySelector('.site-shell').animate([{opacity:1},{opacity:.08},{opacity:1}],{duration:1200});setTimeout(()=>adminLog('SERVERIS: apsimete kad persikrove.'),1200);});
  document.getElementById('internetBtn').addEventListener('click',()=>{const shell=document.querySelector('.site-shell');shell.classList.add('system-invert');adminLog('INTERNETAS: pasalintas 0.8 sekundes.');setTimeout(()=>shell.classList.remove('system-invert'),800);});
  let rank=0; document.getElementById('promotionBtn').addEventListener('click',e=>{rank++; const ranks=['praktikantas','laidu pavaduotojas','konteinerio sekretorius','vyriausiojo vyriausiasis','PER AUKSTAI'];e.target.textContent=`📈 PAREIGOS: ${ranks[Math.min(rank-1,ranks.length-1)].toUpperCase()}`;adminLog(`HR: savavaliskai pasikelei pareigose (${rank}).`);});
  document.getElementById('redBtn').addEventListener('click',()=>{unlock('raudonas');adminLog('RAUDONAS MYGTUKAS: paspaustas. pasekmes grazios.');confettiBullshit();});
  function confettiBullshit(){
    const chars=['#7aa1f3','#ff6b6b','#7cff8b','#ffd36b','#ffffff'];
    for(let i=0;i<70;i++){const p=document.createElement('i');p.className='fake-particle';p.style.left=(45+Math.random()*10)+'vw';p.style.top='45vh';p.style.color=chars[i%chars.length];p.style.setProperty('--x',(Math.random()*700-350)+'px');p.style.setProperty('--y',(Math.random()*500-100)+'px');document.body.appendChild(p);setTimeout(()=>p.remove(),1500);}
  }

  if(!['lt','en','fr'].includes(currentLang())) unlock('lingvistas');
})();
