(() => {
  const nav = document.querySelector('.nav');
  const mainColumn = document.querySelector('.main-column');
  if (!nav || !mainColumn) return;

  const labels = {
    lt:'GAUJA', en:'THE GANG THING', fr:'LE GANG LÀ', eo:'BANDO BRO', la:'MANUS FRATER', fo:'GANGIÐ BRO', cy:'Y GANG', eu:'GANGA BRO', br:'AR GANG', zh:'帮派部门 BRO', ru:'БАНДА ТИПА'
  };

  const gangBtn = document.createElement('button');
  gangBtn.className = 'nav-btn gang-nav-btn';
  gangBtn.dataset.panel = 'gang';
  gangBtn.textContent = labels[typeof currentLang !== 'undefined' ? currentLang : 'lt'] || 'GAUJA';
  const dont = document.getElementById('dontPress');
  nav.insertBefore(gangBtn, dont || null);

  const panel = document.createElement('div');
  panel.className = 'window panel-view gang-panel';
  panel.id = 'gang';
  panel.innerHTML = `
    <div class="window-title"><span>GAUJOS_CENTRINIS_REGISTRAS.exe</span><span>□ ×</span></div>
    <div class="window-body">
      <div class="gang-hero">
        <div class="gang-hero-copy">
          <div class="gang-kicker">VIDAUS STRUKTŪRA / GALIMAI LEGALI</div>
          <h2>Kiniečių imigrantų gaujos centrinė būstinė</h2>
          <p>organizacija veikia pagal principą „jei niekas nesupranta struktūros, vadinasi struktūra labai slapta“.</p>
          <div class="gang-motto">MOTTO: JEI VEIKIA — NELIESK. JEI NEVEIKIA — IRGI NELIESK.</div>
        </div>
        <div class="gang-seal"><div><strong>中?</strong>OSKI GANG<br>OFFICIAL-ISH<small>EST. kažkada</small></div></div>
      </div>
      <div class="gang-tabs">
        <button class="gang-tab active" data-gang-view="identity">NARIO ID</button>
        <button class="gang-tab" data-gang-view="territory">TERITORIJOS</button>
        <button class="gang-tab" data-gang-view="radio">RADIJAS</button>
        <button class="gang-tab" data-gang-view="rules">KODEKSAS</button>
        <button class="gang-tab" data-gang-view="ritual">PRIĖMIMAS</button>
      </div>

      <div class="gang-view active" data-view="identity">
        <div class="gang-id-layout">
          <div class="gang-card">
            <div class="gang-card-top"><span>KIG INTERNAL PERSONNEL CARD</span><span id="gangCardNo">#0000</span></div>
            <div class="gang-card-name" id="gangAlias">NEPATVIRTINTAS ASMUO</div>
            <div class="gang-card-rank" id="gangRank">RANGAS: LANKYTOJAS SU PER DAUG LAISVO LAIKO</div>
            <div class="gang-card-grid">
              <div><span>SKYRIUS</span><b id="gangDept">NEPRISKIRTAS</b></div>
              <div><span>PATIKIMUMAS</span><b id="gangTrust">12%</b></div>
              <div><span>LEIDIMAS</span><b id="gangClearance">DURYS NR. 0</b></div>
              <div><span>BŪSENA</span><b id="gangStatus">STEBIMAS</b></div>
            </div>
            <div class="gang-card-stamp" id="gangStamp">NEPATVIRTINTA</div>
          </div>
          <div class="gang-sidebox">
            <h3>PERSONALO SKYRIUS</h3>
            <div>Čia gali pats save „įdarbinti“, nes HR šiandien neatėjo.</div>
            <button class="gang-action" id="assignGangIdentity">GENERUOTI GAUJOS TAPATYBĘ</button>
            <button class="gang-action" id="promoteGang">PRAŠYTI PAAUKŠTINIMO</button>
            <button class="gang-action red" id="revokeGang">ANULIUOTI SAVE IŠ ORGANIZACIJOS</button>
            <div class="gang-tiny">* visi rangai neturi jokios teisinės, socialinės, finansinės ar apskritai jokios vertės.</div>
          </div>
        </div>
      </div>

      <div class="gang-view" data-view="territory">
        <div class="territory-grid" id="territoryGrid"></div>
        <div class="map-log" id="territoryLog">[MAP] sistema laukia kol kažkas pradės spaudinėt kvadratus...</div>
      </div>

      <div class="gang-view" data-view="radio">
        <div class="radio-wrap">
          <div class="radio-screen" id="gangRadio"></div>
          <div class="radio-controls">
            <div style="text-align:center;font-weight:800;font-size:10px">VIDINIS RADIJAS</div>
            <div class="radio-led"></div>
            <div class="radio-freq" id="radioFreq">88.4</div>
            <div class="radio-knob" id="radioKnob"></div>
            <button class="gang-action" id="radioTune">SUKT DAŽNĮ</button>
            <button class="gang-action" id="radioTransmit">SIŲST „ALIO?“</button>
            <div class="gang-tiny">ryšio licencija: tikriausiai baigėsi 2013</div>
          </div>
        </div>
      </div>

      <div class="gang-view" data-view="rules">
        <div class="rules-list">
          <div class="gang-rule"><b>Vyriausiasis visada teisus.</b><br><span>jei neteisus, žr. 1 punktą dar kartą.</span></div>
          <div class="gang-rule"><b>10mm raktas nėra tavo.</b><br><span>net jeigu jį radai savo kišenėje.</span></div>
          <div class="gang-rule"><b>Konteinerio nejudinti.</b><br><span>jau kažkas pajudino. matėm kas gavosi.</span></div>
          <div class="gang-rule"><b>Ketvirtos kameros neklausti.</b><br><span>ji žiūri į trečią kamerą dėl priežasčių.</span></div>
          <div class="gang-rule"><b>Maistą į serverinę galima nešti tik jei jis neturi Wi-Fi.</b><br><span>po kebabo incidento taisyklė sugriežtinta.</span></div>
          <div class="gang-rule"><b>Jeigu kas klausia kas mes tokie — sakai „nežinau“.</b><br><span>tai nėra melas.</span></div>
          <div class="gang-rule"><b>Vertimų skyriaus taisyti negalima.</b><br><span>jie labai jautrūs kritikai ir turi administratoriaus slaptažodį.</span></div>
        </div>
      </div>

      <div class="gang-view" data-view="ritual">
        <div class="ritual-box">
          <div style="font-size:28px">🧱 🔑 📦 📡</div>
          <h3>OFICIALUS PRIĖMIMO RITUALAS™</h3>
          <p>paspausk simbolius „teisinga“ tvarka. niekas nepasakys kokia ji, nes tradicija buvo pamesta.</p>
          <div class="ritual-sequence">
            <button class="ritual-btn" data-ritual="box">📦<br>KONTEINERIS</button>
            <button class="ritual-btn" data-ritual="key">🔑<br>RAKTAS</button>
            <button class="ritual-btn" data-ritual="brick">🧱<br>PLYTA</button>
            <button class="ritual-btn" data-ritual="antenna">📡<br>ANTENA</button>
          </div>
          <div class="ritual-progress" id="ritualProgress">PROGRESAS: 0/4 | STATUSAS: svetimas bičas</div>
          <button class="gang-action" id="ritualReset">PAMIRŠAU TVARKĄ / RESET</button>
        </div>
      </div>
    </div>`;
  mainColumn.appendChild(panel);

  function showGangPanel() {
    document.querySelectorAll('.panel-view').forEach(p => p.classList.toggle('active', p.id === 'gang'));
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.toggle('active', b.dataset.panel === 'gang'));
  }
  gangBtn.addEventListener('click', showGangPanel);
  document.querySelectorAll('.nav-btn[data-panel]').forEach(btn => {
    if (btn !== gangBtn) btn.addEventListener('click', () => panel.classList.remove('active'));
  });

  // language label follows the existing selector, while the deliberately Lithuanian internals stay as unexplained lore.
  document.getElementById('languageSelect')?.addEventListener('change', e => {
    setTimeout(() => gangBtn.textContent = labels[e.target.value] || 'GAUJA', 0);
  });

  document.querySelectorAll('.gang-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.gang-tab').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.gang-view').forEach(v => v.classList.toggle('active', v.dataset.view === tab.dataset.gangView));
  }));

  const aliases = ['KABELIO VAIKAS','KONTEINERIO LIUDININKAS','BLUETOOTH MINISTRAS','NEAIŠKUS ASMUO NR. 7','PLYTOS PATARĖJAS','VARTŲ STEBĖTOJAS','BALTO BUSIKO ANALITIKAS','SERVERINĖS KAMBARIO DĖDĖ','RADIJO BROLIS','ŽMOGUS KURIS TIK UŽĖJO'];
  const ranks = ['STAŽUOTOJAS BE STAŽO','JAUNESNYSIS LAIDO PRIŽIŪRĖTOJAS','KONTEINERIO REIKALŲ SPECIALISTAS','VYRESNYSIS NIEKO VADOVAS','DEPARTAMENTO PAVADUOTOJO PAVADUOTOJAS','BLUETOOTH OPERACIJŲ MARŠALAS','STRATEGINĖS PLYTOS KOMISARAS','GENERALINIS VARTŲ KLAUSIMŲ DIREKTORIUS'];
  const depts = ['LAIDŲ SKYRIUS','KONTEINERIO VALDYBA','NEAIŠKIŲ FAILŲ BIURAS','RADIJO IR KEBABO DEPARTAMENTAS','VARTŲ MINISTERIJA','VERTIMŲ SKYRIAUS PRIEŠININKAI','PLYTŲ LOGISTIKA','VIDAUS NESUSIPRATIMŲ SKYRIUS'];
  const clearances = ['DURYS NR. 0','KORIDORIUS B','KAMBARYS KURIO NĖRA','IKI VIRTUVĖS','VIENAS LAIPTAS ŽEMYN','SERVERINĖS PRIEANGIS','GALIMA ŽIŪRĖT Į VARTUS'];
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const stateKey = 'oskiGangIdentity';
  let identity = JSON.parse(localStorage.getItem(stateKey) || 'null');

  function renderIdentity(){
    if (!identity) return;
    document.getElementById('gangAlias').textContent = identity.alias;
    document.getElementById('gangRank').textContent = `RANGAS: ${identity.rank}`;
    document.getElementById('gangDept').textContent = identity.dept;
    document.getElementById('gangTrust').textContent = `${identity.trust}%`;
    document.getElementById('gangClearance').textContent = identity.clearance;
    document.getElementById('gangStatus').textContent = identity.status;
    document.getElementById('gangCardNo').textContent = identity.card;
    document.getElementById('gangStamp').textContent = identity.initiated ? 'PRIIMTAS KAŽKAIP' : 'LAUKIA RITUALO';
  }
  renderIdentity();

  function toast(text){
    let el = document.querySelector('.gang-toast');
    if(!el){ el=document.createElement('div'); el.className='gang-toast'; document.body.appendChild(el); }
    el.textContent=text; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),2800);
  }

  document.getElementById('assignGangIdentity').addEventListener('click',()=>{
    identity={alias:pick(aliases),rank:pick(ranks.slice(0,4)),dept:pick(depts),trust:Math.floor(7+Math.random()*38),clearance:pick(clearances),status:pick(['STEBIMAS','GALIMAI DARBUOTOJAS','NEATLEISTAS DAR','DAR NE DINGĘS']),card:'#'+String(Math.floor(Math.random()*9999)).padStart(4,'0'),level:0,initiated:false};
    localStorage.setItem(stateKey,JSON.stringify(identity)); renderIdentity(); toast('HR: sveikinam arba užjaučiam. tavo kortelė sugeneruota.');
  });
  document.getElementById('promoteGang').addEventListener('click',()=>{
    if(!identity) return toast('PAAUKŠTINIMAS ATMESTAS: tu dar techniškai neegzistuoji organizacijoj.');
    identity.level=(identity.level||0)+1;
    const idx=Math.min(identity.level+2,ranks.length-1);
    identity.rank=ranks[idx]; identity.trust=Math.min(99,identity.trust+Math.floor(1+Math.random()*9));
    localStorage.setItem(stateKey,JSON.stringify(identity)); renderIdentity(); toast(`PAAUKŠTINTAS: ${identity.rank}. alga liko €0.`);
  });
  document.getElementById('revokeGang').addEventListener('click',()=>{
    identity=null; localStorage.removeItem(stateKey);
    document.getElementById('gangAlias').textContent='NEPATVIRTINTAS ASMUO'; document.getElementById('gangRank').textContent='RANGAS: LANKYTOJAS SU PER DAUG LAISVO LAIKO'; document.getElementById('gangDept').textContent='NEPRISKIRTAS'; document.getElementById('gangTrust').textContent='12%'; document.getElementById('gangClearance').textContent='DURYS NR. 0'; document.getElementById('gangStatus').textContent='STEBIMAS'; document.getElementById('gangCardNo').textContent='#0000'; document.getElementById('gangStamp').textContent='NEPATVIRTINTA'; toast('PERSONALO SKYRIUS: ištrynėm tave iš Excelio. sėkmės.');
  });

  const territories=[
    ['📦','KONTEINERIO KIEMAS','strateginė vieta nes ten stovi konteineris'],['🚪','MĖLYNOS DURYS','už jų tikriausiai kažkas yra'],['🪑','SUOLIUKAS NR. 2','diplomatinė zona nuo 2018'],['🥙','KEBABO KORIDORIUS','aprūpinimo grandinės širdis'],['📡','ANTENOS KALNAS','iš tikro stogas su antena'],['🖥️','SERVERINĖS PRIEANGIS','į pačią serverinę niekas neturi rakto'],['🚐','BALTO BUSIKO VIETA','statusas neaiškus nuo 2011'],['🧱','PLYTŲ SANDĖLIS','inventorius: tarp 4 ir 700 plytų'],['☕','KAVOS APARATO SEKTORIUS','labiausiai ginčijama teritorija']
  ];
  const grid=document.getElementById('territoryGrid'), log=document.getElementById('territoryLog');
  const territoryState=JSON.parse(localStorage.getItem('oskiTerritories')||'{}');
  territories.forEach((t,i)=>{
    const d=document.createElement('div'); d.className='territory'+(territoryState[i]?' claimed':'');
    d.innerHTML=`<span class="territory-state">${territoryState[i]?'MŪSŲ':'???'}</span><div class="territory-icon">${t[0]}</div><h4>${t[1]}</h4><small>${t[2]}</small>`;
    d.addEventListener('click',()=>{
      d.classList.add('disputed'); const action=Math.random();
      setTimeout(()=>{
        d.classList.remove('disputed');
        if(action>.24){ territoryState[i]=true; d.classList.add('claimed'); d.querySelector('.territory-state').textContent='MŪSŲ'; log.innerHTML+=`<br>[${new Date().toLocaleTimeString()}] ${t[1]} pažymėta kaip „mūsų“, nes paspaudei ant kvadrato.`; }
        else { log.innerHTML+=`<br>[${new Date().toLocaleTimeString()}] ${t[1]} atsisakė būti teritorija. administracija gerbia sprendimą.`; }
        localStorage.setItem('oskiTerritories',JSON.stringify(territoryState)); log.scrollTop=log.scrollHeight;
      },550);
    }); grid.appendChild(d);
  });

  const radio=document.getElementById('gangRadio');
  const chatter=[
    ['VARTAI-1','kas turi rakta'],['LAIDAS-3','ne as'],['KONTEINERIS','kas vel paliko palete prie duru'],['HR','ar darbuotojas nr 4 realus'],['RADIO','test test nieks negirdi'],['VYRIAUSIOJO SEKRETORIUS','vyriausiasis dabar labai užsiėmęs niekuo'],['SERVERINĖ','nelieskit mėlyno laido ble'],['KEBABAS-2','kas užsakė be padažo čia disciplinos pažeidimas'],['KAMERA-4','žiūriu į kamerą 3 kaip nurodyta'],['NEŽINOMAS','alio'],['VARTAI-1','nebe alio'],['PLYTOS','inventorius nesutampa bet plytos vietoj']
  ];
  function radioLine(force){ const c=force||pick(chatter); const div=document.createElement('div'); div.className='radio-line'; div.innerHTML=`<span class="radio-time">[${new Date().toLocaleTimeString()}]</span> <span class="radio-who">${c[0]}:</span> ${c[1]}`; radio.appendChild(div); while(radio.children.length>18)radio.firstChild.remove(); radio.scrollTop=radio.scrollHeight; }
  for(let i=0;i<7;i++) setTimeout(()=>radioLine(),i*90);
  const radioTimer=setInterval(()=>{ if(document.body.contains(radio)) radioLine(); else clearInterval(radioTimer); },4200);
  let freq=88.4, angle=0;
  document.getElementById('radioTune').addEventListener('click',()=>{ freq=(76+Math.random()*37).toFixed(1); angle+=55+Math.random()*120; document.getElementById('radioFreq').textContent=freq; document.getElementById('radioKnob').style.transform=`rotate(${angle}deg)`; radioLine(['SISTEMA',`dažnis pakeistas į ${freq}. jokio skirtumo.`]); });
  document.getElementById('radioTransmit').addEventListener('click',()=>{ radioLine(['TU','alio?']); setTimeout(()=>radioLine(pick([["NEŽINOMAS","kas čia"],["VARTAI-1","neužiminėk eterio"],["HR","kas tau davė radiją"],["KAMERA-4","alio priimta"]])),800); });

  const ritualOrder=['brick','key','box','antenna']; let ritualStep=0;
  const ritualProgress=document.getElementById('ritualProgress');
  document.querySelectorAll('.ritual-btn').forEach(btn=>btn.addEventListener('click',()=>{
    if(btn.dataset.ritual===ritualOrder[ritualStep]){
      btn.classList.add('correct'); ritualStep++; ritualProgress.textContent=`PROGRESAS: ${ritualStep}/4 | STATUSAS: ${ritualStep===4?'KAŽKODĖL PRIIMTAS':'beveik savas'}`;
      if(ritualStep===4){ if(identity){ identity.initiated=true; identity.status='PRIIMTAS PER KLAIDĄ'; identity.trust=Math.min(99,identity.trust+13); localStorage.setItem(stateKey,JSON.stringify(identity)); renderIdentity(); } localStorage.setItem('oskiGangInitiated','1'); toast('CEREMONIJA BAIGTA: dabar oficialiai priklausai departamentui kurio nėra.'); }
    } else {
      btn.classList.add('wrong'); setTimeout(()=>btn.classList.remove('wrong'),550); ritualStep=0; document.querySelectorAll('.ritual-btn').forEach(b=>b.classList.remove('correct')); ritualProgress.textContent='PROGRESAS: 0/4 | STATUSAS: tradicija įsižeidė';
    }
  }));
  document.getElementById('ritualReset').addEventListener('click',()=>{ ritualStep=0; document.querySelectorAll('.ritual-btn').forEach(b=>b.classList.remove('correct','wrong')); ritualProgress.textContent='PROGRESAS: 0/4 | STATUSAS: vėl svetimas bičas'; });

  if(localStorage.getItem('oskiGangInitiated')==='1') ritualProgress.textContent='STATUSAS: ritualas jau kažkada atliktas. archyvas sako „galioja“.';
})();
