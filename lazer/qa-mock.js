window.fetch = (() => {
  const rows = [];
  return async (url, options={}) => {
    const path=String(url), method=options.method||'GET';
    const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
    if(path.includes('/auth/v1/token')) return reply({access_token:'qa-token',expires_in:3600,user:{id:'9525ddd1-838f-4eff-bc85-5546850fee51'}});
    if(path.includes('/auth/v1/logout')) return reply({});
    if(path.includes('gang_admin_controls')) return reply([{key:'__admin_probe'}]);
    if(path.includes('/rest/v1/lazer_entries')){
      if(method==='POST'){const input=JSON.parse(options.body),row={...input,id:crypto.randomUUID(),created_at:new Date().toISOString()};rows.unshift(row);return reply([row],201);}
      return reply(rows);
    }
    if(path.includes('/storage/v1/object/authenticated')) return new Response(new Blob(['test'],{type:'audio/webm'}));
    if(path.includes('/storage/v1/object/')) return reply({Key:'qa'});
    return reply({error:'unexpected test request'},404);
  };
})();