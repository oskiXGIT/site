(()=>{"use strict";
const AUTH_URL="https://otyoaqppxycpvpsclqvy.supabase.co";
const AUTH_KEY="sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4";
const EMAIL="secret.q7m2v9k4r6p3x8n5@oski.website";
const API="https://yubfrzwsrxfoqwkdojdx.supabase.co/functions/v1/roblox-vault";
const TOKEN_KEY="oski_rbx_vault_token";

const gate=document.getElementById("gate"),form=document.getElementById("login"),password=document.getElementById("password"),gateStatus=document.getElementById("gate-status");
const app=document.getElementById("app"),grid=document.getElementById("grid"),summary=document.getElementById("summary"),search=document.getElementById("search");
const category=document.getElementById("category"),kind=document.getElementById("kind"),status=document.getElementById("status"),empty=document.getElementById("empty");
const lock=document.getElementById("lock");

let token=sessionStorage.getItem(TOKEN_KEY)||"";
let records=[],cards=[],loaded=0,failed=0,activeImages=0;
const queue=[];let observer=null;

const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

function setLocked(message="PASSWORD REQUIRED"){
  token="";sessionStorage.removeItem(TOKEN_KEY);records=[];grid.innerHTML="";
  app.classList.add("hidden");gate.classList.remove("hidden");document.body.classList.add("locked");document.title="404";
  gateStatus.textContent=message;password.disabled=false;password.value="";password.focus();
}
function setOpen(){
  gate.classList.add("hidden");app.classList.remove("hidden");document.body.classList.remove("locked");document.title=".";
}
async function login(pw){
  const r=await fetch(AUTH_URL+"/auth/v1/token?grant_type=password",{
    method:"POST",headers:{apikey:AUTH_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({email:EMAIL,password:pw}),cache:"no-store"
  });
  const j=await r.json().catch(()=>null);
  if(!r.ok||!j?.access_token) throw new Error("ACCESS DENIED");
  return j.access_token;
}
async function apiFetch(url,opts={}){
  const headers=new Headers(opts.headers||{});headers.set("Authorization","Bearer "+token);
  return fetch(url,{...opts,headers,cache:"no-store"});
}
async function loadList(){
  const r=await apiFetch(API+"?action=list");
  if(r.status===401) throw new Error("AUTH");
  if(!r.ok) throw new Error("LOAD");
  const j=await r.json();
  if(!Array.isArray(j?.items)) throw new Error("LOAD");
  records=j.items;
}
function render(){
  loaded=0;failed=0;summary.textContent=records.length+" recovered favorites";
  const cats=[...new Set(records.map(r=>r.c))].sort((a,b)=>a.localeCompare(b));
  category.innerHTML='<option value="">All categories</option>'+cats.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join("");
  grid.innerHTML=records.map((r,i)=>{
    const meta=[r.cr?"Creator: "+r.cr:"",r.p!=null?r.p+" R$":"",r.s||"",r.f!=null?Number(r.f).toLocaleString()+" favorites":"",r.v!=null?Number(r.v).toLocaleString()+" visits":""].filter(Boolean).join(" · ");
    const searchable=(r.k+" "+r.c+" "+r.i+" "+r.n+" "+r.cr+" "+r.d).toLowerCase();
    return '<article class="card" data-search="'+esc(searchable)+'" data-cat="'+esc(r.c)+'" data-kind="'+esc(r.k)+'">'+
      '<a class="pic" href="'+esc(r.u)+'" target="_blank" rel="noopener">'+
        '<img data-kind="'+esc(r.k)+'" data-id="'+esc(r.t)+'" alt="'+esc(r.n)+'"><div class="placeholder">image</div></a>'+
      '<div class="info"><div class="tags"><span>'+esc(r.k)+'</span><span>'+esc(r.c)+'</span></div>'+
        '<a class="name" href="'+esc(r.u)+'" target="_blank" rel="noopener">'+esc(r.n)+'</a>'+
        '<div class="small">ID: '+esc(r.i)+'</div><div class="small">'+esc(meta||"No extra metadata")+'</div>'+
        (r.d?'<details><summary>Description</summary><div class="description">'+esc(r.d)+'</div></details>':"")+
      '</div></article>';
  }).join("");
  cards=[...document.querySelectorAll(".card")];
  setupObserver();filter();
}
function filter(){
  const q=search.value.trim().toLowerCase(),c=category.value,k=kind.value;let n=0;
  for(const el of cards){
    const ok=(!q||el.dataset.search.includes(q))&&(!c||el.dataset.cat===c)&&(!k||el.dataset.kind===k);
    el.classList.toggle("off",!ok);if(ok)n++;
  }
  empty.classList.toggle("hidden",n!==0);
  status.textContent=n+" shown · "+loaded+" images loaded"+(failed?" · "+failed+" unavailable":"");
}
search.addEventListener("input",filter);category.addEventListener("change",filter);kind.addEventListener("change",filter);

function setupObserver(){
  if(observer) observer.disconnect();
  observer=new IntersectionObserver(entries=>{
    for(const e of entries){
      if(!e.isIntersecting)continue;
      observer.unobserve(e.target);const img=e.target.querySelector("img");
      if(img&&!img.dataset.queued){img.dataset.queued="1";queue.push(img);pump();}
    }
  },{rootMargin:"650px 0px",threshold:.01});
  document.querySelectorAll(".pic").forEach(x=>observer.observe(x));
}
function pump(){
  while(activeImages<6&&queue.length){
    const img=queue.shift();activeImages++;
    loadImage(img).finally(()=>{activeImages--;pump();});
  }
}
async function loadImage(img){
  const ph=img.nextElementSibling;ph.textContent="loading…";
  try{
    const url=API+"?action=image&kind="+encodeURIComponent(img.dataset.kind)+"&id="+encodeURIComponent(img.dataset.id);
    const r=await apiFetch(url);
    if(r.status===401){setLocked("SESSION EXPIRED");return;}
    if(!r.ok)throw new Error();
    const blob=await r.blob(),u=URL.createObjectURL(blob);
    img.onload=()=>{img.classList.add("loaded");ph.style.display="none";loaded++;filter();};
    img.onerror=()=>{URL.revokeObjectURL(u);throw new Error();};
    img.src=u;
  }catch(e){ph.textContent="image unavailable";ph.classList.add("error");failed++;filter();}
}

form.addEventListener("submit",async e=>{
  e.preventDefault();const pw=password.value;if(!pw)return;
  password.disabled=true;gateStatus.textContent="CHECKING…";
  try{token=await login(pw);sessionStorage.setItem(TOKEN_KEY,token);password.value="";await loadList();setOpen();render();}
  catch(e){setLocked(e?.message==="AUTH"?"SESSION EXPIRED":"ACCESS DENIED");}
});
lock.addEventListener("click",()=>setLocked("LOCKED"));

(async()=>{
  if(!token){password.focus();return;}
  gateStatus.textContent="RESTORING SESSION…";
  try{await loadList();setOpen();render();}catch{setLocked("PASSWORD REQUIRED");}
})();
})();