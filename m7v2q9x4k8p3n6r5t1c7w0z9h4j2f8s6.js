(() => {
  'use strict';
  const ENDPOINT='https://otyoaqppxycpvpsclqvy.supabase.co/functions/v1/secret-gate';
  const KEY='sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const root=document.getElementById('gate');
  const input=document.getElementById('keyInput');
  const status=document.getElementById('status');
  let busy=false;

  function fail(){
    status.textContent='PRIEIGA ATMESTA';
    root.classList.remove('shake');
    void root.offsetWidth;
    root.classList.add('shake');
    input.value='';
    input.focus();
  }

  async function check(){
    if(busy) return;
    const value=input.value;
    if(value.length<16){ fail(); return; }
    busy=true;
    input.disabled=true;
    status.textContent='TIKRINAMA...';
    try{
      const r=await fetch(ENDPOINT,{
        method:'POST',
        headers:{apikey:KEY,'Content-Type':'application/json'},
        body:JSON.stringify({key:value}),
        cache:'no-store'
      });
      const data=await r.json().catch(()=>null);
      if(!r.ok || !data?.ok){ fail(); return; }
      const inside=document.createElement('section');
      inside.className='inside';
      const h=document.createElement('h1');
      h.textContent=data.content?.title||'PRIEIGA SUTEIKTA';
      const b=document.createElement('div');
      b.textContent=data.content?.body||'';
      inside.append(h,b);
      root.replaceChildren(inside);
      document.title='.';
    }catch{
      fail();
    }finally{
      busy=false;
      if(document.body.contains(input)) input.disabled=false;
    }
  }

  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();check();}
  });
  input.addEventListener('paste',e=>e.preventDefault());
  input.addEventListener('drop',e=>e.preventDefault());
  input.addEventListener('contextmenu',e=>e.preventDefault());
  input.focus();
})();