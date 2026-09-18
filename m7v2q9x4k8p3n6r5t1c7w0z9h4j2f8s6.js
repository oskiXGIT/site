(() => {
  'use strict';

  const SUPABASE_URL='https://otyoaqppxycpvpsclqvy.supabase.co';
  const SUPABASE_KEY='sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const INTERNAL_EMAIL='secret.q7m2v9k4r6p3x8n5@oski.website';

  const root=document.getElementById('gate');
  const input=document.getElementById('keyInput');
  const status=document.getElementById('status');
  let busy=false;

  function fail(message='PRIEIGA ATMESTA'){
    status.textContent=message;
    root.classList.remove('shake');
    void root.offsetWidth;
    root.classList.add('shake');
    input.value='';
    input.focus();
  }

  async function openWithAuth(){
    if(busy) return;
    const password=input.value;
    if(password.length<16){ fail(); return; }

    busy=true;
    input.disabled=true;
    status.textContent='TIKRINAMA...';

    try{
      const authResponse=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{
        method:'POST',
        headers:{
          apikey:SUPABASE_KEY,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          email:INTERNAL_EMAIL,
          password
        }),
        cache:'no-store'
      });

      const auth=await authResponse.json().catch(()=>null);
      if(!authResponse.ok || !auth?.access_token){
        fail();
        return;
      }

      const contentResponse=await fetch(`${SUPABASE_URL}/rest/v1/secret_link_content?select=title,body&singleton=eq.true&limit=1`,{
        headers:{
          apikey:SUPABASE_KEY,
          Authorization:`Bearer ${auth.access_token}`
        },
        cache:'no-store'
      });

      const rows=await contentResponse.json().catch(()=>[]);
      if(!contentResponse.ok || !Array.isArray(rows) || !rows[0]){
        fail('AUTH PRAEJO, BET TURINYS UZRAKINTAS');
        return;
      }

      const inside=document.createElement('section');
      inside.className='inside';

      const h=document.createElement('h1');
      h.textContent=rows[0].title||'PRIEIGA SUTEIKTA';

      const b=document.createElement('div');
      b.textContent=rows[0].body||'';

      inside.append(h,b);
      root.replaceChildren(inside);
      document.title='.';
    }catch{
      fail('RYŠYS NUMIRĖ. BANDYK DAR KARTĄ.');
    }finally{
      busy=false;
      if(document.body.contains(input)) input.disabled=false;
    }
  }

  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      e.preventDefault();
      openWithAuth();
    }
  });

  input.focus();
})();