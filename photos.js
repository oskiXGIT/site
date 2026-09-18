(() => {
  'use strict';

  const SUPABASE_URL = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const BUCKET = 'gang-photo-archive';
  const nav = document.getElementById('photosNav');
  const title = document.getElementById('photosWindowTitle');
  const headline = document.getElementById('photosHeadline');
  const intro = document.getElementById('photosIntro');
  const confidence = document.getElementById('photosConfidence');
  const status = document.getElementById('photoArchiveStatus');
  const grid = document.getElementById('photoArchiveGrid');
  const languageSelect = document.getElementById('languageSelect');
  if (!grid) return;

  const COPY = {
    lt:{nav:'NUOTRAUKOS',title:'NUOTRAUKU_ARCHYVAS.db',head:'NUOTRAUKU ARCHYVAS',intro:'cia tik perziura. ikelti gali tik zmogus su tikru admin rakto prisijungimu.',confidence:'VERTIMU PASITIKIMAS',loading:'kraunam fotoaparato nusikaltimus...',empty:'nuotrauku dar nera. matyt kamera irgi isejo pietu.',error:'nuotrauku archyvas apsimete kad neegzistuoja.',untitled:'be pavadinimo, nes menas',close:'UZDARYT'},
    en:{nav:'PHOTOS',title:'PHOTO_ARCHIVE.db',head:'PHOTO ARCHIVE',intro:'view-only for civilians. uploads require the actual admin key, not confidence.',confidence:'TRANSLATION CONFIDENCE',loading:'loading camera-related evidence...',empty:'no photos yet. camera probably on lunch break.',error:'photo archive is pretending it does not exist.',untitled:'untitled because apparently art',close:'CLOSE'},
    fr:{nav:'PHOTOS',title:'ARCHIVE_PHOTOS.db',head:'ARCHIVE DE PHOTOS',intro:'lecture seule pour le public. pour envoyer une photo il faut la vraie clé admin frère.',confidence:'CONFIANCE TRADUCTION',loading:'chargement des crimes photographiques...',empty:'aucune photo. la caméra est sûrement en pause café.',error:'l’archive photo fait semblant de ne pas exister.',untitled:'sans titre parce que art wesh',close:'FERMER'},
    zh:{nav:'照片档案',title:'照片_档案.db',head:'照片档案部门',intro:'普通访客只能看。上传照片需要真正的管理员钥匙，不是勇气。',confidence:'翻译信任度',loading:'正在加载相机证据...',empty:'还没有照片。相机可能下班了。',error:'照片档案现在声称自己不存在。',untitled:'没有标题因为这是艺术',close:'关闭'},
    ru:{nav:'ФОТО',title:'ФОТО_АРХИВ.db',head:'ФОТО АРХИВ',intro:'обычным людям только смотреть. загружать можно только с настоящим админским ключом.',confidence:'ДОВЕРИЕ ПЕРЕВОДУ',loading:'грузим фотодоказательства брат...',empty:'фоток пока нет. камера ушла курить.',error:'фотоархив делает вид что его нет.',untitled:'без названия потому что искусство',close:'ЗАКРЫТЬ'},
    eo:{nav:'FOTOJ',title:'FOTO_ARKIVO.db',head:'FOTOARKIVO',intro:'publiko nur rigardas. alŝuto bezonas veran administran ŝlosilon, frato.',confidence:'FIDO AL TRADUKO',loading:'ŝargante fotografian pruvon...',empty:'neniu foto ankoraŭ. la fotilo evidente strikas.',error:'la fotoarkivo administracie malaperis.',untitled:'sentitola pro arto',close:'FERMU'},
    la:{nav:'IMAGINES',title:'ARCHIVUM_IMAGINUM.db',head:'ARCHIVUM IMAGINUM',intro:'plebs spectare tantum potest. imago mittitur solum cum clave administratoris vera.',confidence:'FIDUCIA TRANSLATIONIS',loading:'argumenta photographica onerantur...',empty:'imagines nullae. camera ad prandium abiit.',error:'archivum imaginum se mortuum simulat.',untitled:'sine titulo quia ars',close:'CLAUDE'},
    fo:{nav:'MYNDIR',title:'MYNDA_SAVN.db',head:'MYNDASAVN',intro:'vanlig fólk kann bara hyggja. upplasting krevur veruliga admin-lykilin.',confidence:'ÁLIT Á UMSETING',loading:'lesur myndaprógv inn...',empty:'ongar myndir enn. kamerað hevur frí.',error:'myndasavnið spælir burtur.',untitled:'uttan heiti tí list',close:'LAT AFTUR'},
    cy:{nav:'LLUNIAU',title:'ARCHIF_LLUNIAU.db',head:'ARCHIF LLUNIAU',intro:'gwylio yn unig i’r cyhoedd. mae uwchlwytho angen yr allwedd admin go iawn.',confidence:'HYDER CYFIEITHU',loading:'llwytho tystiolaeth camera...',empty:'dim lluniau eto. camera ar egwyl te.',error:'mae’r archif lluniau yn honni nad yw’n bodoli.',untitled:'heb deitl achos celf',close:'CAU'},
    eu:{nav:'ARGAZKIAK',title:'ARGAZKI_ARTXIBOA.db',head:'ARGAZKI ARTXIBOA',intro:'publikoak begiratu bakarrik. igotzeko benetako admin giltza behar da.',confidence:'ITZULPEN KONFIANTZA',loading:'kameraren frogak kargatzen...',empty:'oraindik argazkirik ez. kamera kafean dago.',error:'argazki artxiboa desagertu dela egiten ari da.',untitled:'izenbururik gabe artea delako',close:'ITXI'},
    br:{nav:'LUC’HSKEUDENNOÙ',title:'DIEL_LUC’HSKEUDENNOÙ.db',head:'DIEL LUC’HSKEUDENNOÙ',intro:'ar publik a c’hall sellout hepken. evit kas ur skeudenn e ranker kaout gwir alc’hwez admin.',confidence:'FIZIAÑS EN TROIDIGEZH',loading:'o kargañ prouennoù ar c’hamera...',empty:'skeudenn ebet c’hoazh. aet eo ar c’hamera da evañ kafe.',error:'diell ar skeudennoù a ra van da vezañ aet kuit.',untitled:'titl ebet rak arz eo',close:'SERRIÑ'}
  };
  const CONFIDENCE = {lt:97,en:78,fr:71,zh:19,ru:27,eo:64,la:52,fo:47,cy:49,eu:44,br:42};
  const SUPPORTED = new Set(Object.keys(COPY));
  let photos = [];

  function lang(){
    const value = languageSelect?.value || document.documentElement.lang || localStorage.getItem('oskiLang') || 'lt';
    return SUPPORTED.has(value) ? value : 'en';
  }
  function copy(){ return COPY[lang()] || COPY.en; }
  function translated(map){
    const l = lang();
    return map && typeof map === 'object' ? (map[l] || map.en || map.lt || '') : '';
  }
  function publicUrl(path){
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${String(path).split('/').map(encodeURIComponent).join('/')}`;
  }
  function formatDate(value){
    if(!value) return '';
    const d = new Date(value + (String(value).length === 10 ? 'T12:00:00' : ''));
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
  function applyCopy(){
    const t = copy();
    if(nav) nav.textContent=t.nav;
    if(title) title.textContent=t.title;
    if(headline) headline.textContent=t.head;
    if(intro) intro.textContent=t.intro;
    if(confidence) confidence.textContent=`${t.confidence}: ${CONFIDENCE[lang()] ?? 31}%`;
    render();
  }
  function openLightbox(photo){
    const t=copy();
    const overlay=document.createElement('div');
    overlay.className='photo-lightbox';
    const win=document.createElement('div');
    win.className='photo-lightbox-window';
    const bar=document.createElement('div');
    bar.className='photo-lightbox-title';
    const barText=document.createElement('span');
    barText.textContent=translated(photo.caption_i18n)||t.untitled;
    const close=document.createElement('button');
    close.type='button'; close.className='photo-lightbox-close'; close.textContent='×'; close.title=t.close;
    bar.append(barText,close);
    const img=document.createElement('img');
    img.className='photo-lightbox-image'; img.src=publicUrl(photo.storage_path); img.alt=barText.textContent; img.loading='eager';
    const copyBox=document.createElement('div'); copyBox.className='photo-lightbox-copy';
    const b=document.createElement('b'); b.textContent=barText.textContent;
    const note=document.createElement('p'); note.textContent=translated(photo.note_i18n);
    const meta=document.createElement('div'); meta.className='photo-lightbox-meta';
    meta.textContent=[formatDate(photo.taken_at),photo.original_name].filter(Boolean).join(' · ');
    copyBox.append(b,note,meta); win.append(bar,img,copyBox); overlay.append(win); document.body.append(overlay);
    const done=()=>overlay.remove();
    close.addEventListener('click',done); overlay.addEventListener('click',e=>{if(e.target===overlay)done();});
    document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){done();document.removeEventListener('keydown',esc);}});
  }
  function render(){
    const t=copy();
    if(!photos.length){
      grid.replaceChildren();
      if(status) status.textContent=t.empty;
      return;
    }
    if(status) status.textContent=`${photos.length} · ${t.confidence.toLowerCase()} ${CONFIDENCE[lang()] ?? 31}%`;
    const nodes=photos.map(photo=>{
      const card=document.createElement('button'); card.type='button'; card.className='photo-card';
      const wrap=document.createElement('div'); wrap.className='photo-card-image-wrap';
      const img=document.createElement('img'); img.src=publicUrl(photo.storage_path); img.loading='lazy'; img.alt=translated(photo.caption_i18n)||t.untitled;
      wrap.append(img);
      if(photo.taken_at){const date=document.createElement('span');date.className='photo-card-date';date.textContent=formatDate(photo.taken_at);wrap.append(date);}
      const box=document.createElement('div');box.className='photo-card-copy';
      const name=document.createElement('b');name.className='photo-card-title';name.textContent=translated(photo.caption_i18n)||t.untitled;
      const note=document.createElement('div');note.className='photo-card-note';note.textContent=translated(photo.note_i18n);
      const file=document.createElement('small');file.className='photo-card-file';file.textContent=photo.original_name||'IMG_UNKNOWN.JPG';
      box.append(name,note,file); card.append(wrap,box); card.addEventListener('click',()=>openLightbox(photo)); return card;
    });
    grid.replaceChildren(...nodes);
  }
  async function load(){
    if(status) status.textContent=copy().loading;
    try{
      const q='/rest/v1/gang_photos?select=id,storage_path,original_name,caption_i18n,note_i18n,taken_at,sort_order,created_at&published=eq.true&order=sort_order.asc,created_at.desc&limit=250';
      const response=await fetch(SUPABASE_URL+q,{headers:{apikey:SUPABASE_KEY},cache:'no-store'});
      if(!response.ok) throw new Error(`HTTP_${response.status}`);
      const data=await response.json();
      photos=Array.isArray(data)?data:[]; render();
    }catch{
      photos=[]; grid.replaceChildren(); if(status) status.textContent=copy().error;
    }
  }
  languageSelect?.addEventListener('change',applyCopy);
  window.addEventListener('oski:languagechange',applyCopy);
  applyCopy();
  load();
})();