(() => {
  'use strict';
  const URL_BASE = 'https://otyoaqppxycpvpsclqvy.supabase.co';
  const KEY = 'sb_publishable_mxledKrN2vE7RmdsYQHNFA__wF3CLE4';
  const EMAIL = 'operator@oski.website';
  const BUCKET = 'lazer-private';
  const VIDEO = 'KPdcqHFnyT8';
  const $ = id => document.getElementById(id);
  const speech = [
    {id:'short-answer',title:'Say less',time:'0:29–0:30',start:29,end:30,hear:'Where does his answer land? Hear the small words around it.',try:'Keep your normal pitch. Borrow only the timing.',prompt:'A friend asks if you expected the result. Answer briefly in your own words.',guard:'Short does not mean flat. Do not force a low voice.'},
    {id:'connected',title:'Let it run',time:'6:47–6:53',start:407,end:413,hear:'Which words stay clear? Which little words move between them?',try:'Carry a thought in one easy motion.',prompt:'Tell someone what you are doing after this.',guard:'Connected speech is coordination, not random slurring.'},
    {id:'phrase',title:'Land the thought',time:'10:47–10:53',start:647,end:653,hear:'Notice where the thought keeps moving and where it lands.',try:'Follow the broad phrase shape in your own voice.',prompt:'Explain why something looked easier before you tried it.',guard:'Do not race to match a duration.'},
    {id:'flow',title:'Keep the floor',time:'11:23–11:38',start:683,end:698,hear:'Listen for how his turn stays alive without stressing every word.',try:'Keep an easy pace while answering for meaning.',prompt:'Talk for 15 seconds about a song you liked more after a second listen.',guard:'This one moment is no universal accent rule.'}
  ];
  const writing = [
    {id:'notice',title:'Notice the move',cue:'The release titles “Injoy” and “Awsum” show selective playful spelling. They do not tell us how he writes every message.',prompt:'Someone asks how your day went. Reply with a clear, short message. Use your own words.',tip:'Keep the meaning obvious. One playful choice is plenty.'},
    {id:'less-is-more',title:'Say it simply',cue:'A relaxed text can leave some work to context. It does not need a costume of misspellings.',prompt:'A friend asks if you are coming tonight. Reply naturally in one or two short lines.',tip:'Try a direct answer before adding decoration.'},
    {id:'new-situation',title:'No template',cue:'Transfer matters: a new situation tells you more than memorizing someone’s caption.',prompt:'A friend sends you a song you did not expect to like. Send a genuine first reaction.',tip:'Write for that friend. Keep any spelling shift you actually enjoy using.'}
  ];
  let auth = null, entries = [], tab = 'speak', currentSpeech = null, currentText = null;
  let recorder = null, stream = null, recorded = null, recordingTimer = null, audioUrl = null, recordUrl = null, savedTake = false;
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = value => new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
  function status(message, error=false) { const el=$('notice'); el.textContent=message; el.hidden=false; el.classList.toggle('error',error); clearTimeout(status.timer); status.timer=setTimeout(()=>el.hidden=true,6500); }
  async function call(path,options={}) {
    if (!auth?.access_token) throw Error('Sign in again.');
    if (Date.now()>auth.expires) { signOut(false); throw Error('Session expired. Sign in again.'); }
    const response=await fetch(URL_BASE+path,{...options,headers:{apikey:KEY,Authorization:'Bearer '+auth.access_token,...options.headers}});
    if (response.status===401 || response.status===403) { signOut(false); throw Error('Session ended or access denied.'); }
    if (!response.ok) { const detail=await response.json().catch(()=>({})); throw Error(detail.message||detail.error||`Request failed (${response.status}).`); }
    return response;
  }
  async function signIn() {
    const button=$('signIn'); button.disabled=true; $('loginStatus').textContent='Checking access…';
    try {
      const response=await fetch(URL_BASE+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:EMAIL,password:$('password').value})});
      const data=await response.json(); if (!response.ok || !data.access_token) throw Error('That key did not work.');
      auth={access_token:data.access_token,userId:data.user.id,expires:Date.now()+Number(data.expires_in||3600)*1000-5000};
      $('password').value='';
      const probe=await call('/rest/v1/gang_admin_controls?select=key&key=eq.__admin_probe&limit=1');
      if (!(await probe.json()).length) throw Error('This account does not have admin access.');
      $('login').hidden=true; $('app').hidden=false; await refresh();
    } catch (e) { await signOut(true); $('loginStatus').textContent=e.message||'Could not sign in.'; }
    finally { button.disabled=false; }
  }
  async function signOut(revoke=true) {
    const token=auth?.access_token; auth=null; stopRecorder();
    if (audioUrl) { URL.revokeObjectURL(audioUrl); audioUrl=null; }
    $('app').hidden=true; $('login').hidden=false; entries=[];
    if (revoke && token) await fetch(URL_BASE+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}'}).catch(()=>{});
  }
  async function refresh() {
    const response=await call('/rest/v1/lazer_entries?select=id,kind,title,data,object_path,created_at&order=created_at.desc&limit=500');
    entries=await response.json(); render();
  }
  async function saveEntry(kind,title,data={},objectPath=null) {
    const response=await call('/rest/v1/lazer_entries',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({owner:auth.userId,kind,title,data,object_path:objectPath})});
    const saved=await response.json(); entries.unshift(saved[0]); render(); return saved[0];
  }
  function showTab(next) {
    if (recorder?.state==='recording') { status('Stop your recording before leaving.',true); return; }
    tab=next;
    document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===next));
    document.querySelectorAll('[data-tab]').forEach(el=>{el.classList.toggle('active',el.dataset.tab===next);el.setAttribute('aria-current',el.dataset.tab===next?'page':'false');});
    if (next!=='speak') { const frame=$('ytFrame'); if(frame) frame.remove(); }
  }
  function completed(kind,id) { return entries.some(e=>e.kind===kind&&e.data?.lessonId===id); }
  function render() { renderSpeech(); renderText(); renderClips(); renderHistory(); }
  function renderSpeech() {
    $('speechPath').hidden=!!currentSpeech; $('speechLesson').hidden=!currentSpeech;
    $('speechPath').innerHTML=speech.map((s,i)=>`<button class="path-card ${completed('speech_session',s.id)?'done':''}" data-speech="${s.id}"><span class="level">${completed('speech_session',s.id)?'✓':String(i+1).padStart(2,'0')}</span><span><small>LEVEL ${i+1} · ${s.time}</small><strong>${s.title}</strong><em>${i===0?'One thing at a time':s.hear}</em></span><span class="arrow">↗</span></button>`).join('');
    if (!currentSpeech) return;
    const s=speech.find(x=>x.id===currentSpeech.id)||currentSpeech;
    $('speechLesson').innerHTML=`<button id="backSpeech" class="back">← All speaking levels</button><span class="kicker">${currentSpeech.custom?'YOUR CLIP':'INTERVIEW TURN · '+s.time}</span><h2>${escape(s.title)}</h2><div class="lesson-steps"><span class="on">1. Listen</span><span>2. Try</span><span>3. New words</span></div><p>${escape(s.hear)}</p><div id="sourcePlayer" class="player"></div><div class="cue"><b>ONE THING TO TRY</b><p>${escape(s.try)}</p></div><p class="guard">${escape(s.guard)}</p><div class="prompt"><small>FRESH WORDS · ANSWER FOR MEANING</small><strong>${escape(s.prompt)}</strong></div><div class="record-area"><b>Want to hear yourself?</b><p>Optional. You can finish the level without recording. If you do record, listen back once and save only if you want.</p><button id="recordButton" class="secondary">● Record a take</button><div id="recordPreview"></div></div><label for="speechNote">What felt natural? (optional)</label><textarea id="speechNote" rows="2" maxlength="500" placeholder="One small thing you noticed…"></textarea><button id="finishSpeech" class="primary">Finish level without a recording →</button>`;
    $('backSpeech').onclick=()=>{stopRecorder();currentSpeech=null;renderSpeech();};
    $('recordButton').onclick=toggleRecord;
    $('finishSpeech').onclick=async()=>{const button=$('finishSpeech');button.disabled=true;try{await saveEntry('speech_session',s.title,{lessonId:s.id,prompt:s.prompt,note:$('speechNote').value.trim(),recorded:savedTake});stopRecorder();currentSpeech=null;savedTake=false;renderSpeech();status('Level saved. Take the timing into a new conversation.');}catch(e){status(e.message,true);button.disabled=false;}};
    if (currentSpeech.custom) {
      const button=document.createElement('button');button.className='secondary';button.textContent='▶ Play your clip';button.onclick=()=>playPrivate(currentSpeech.objectPath,$('sourcePlayer'),currentSpeech.mime);$('sourcePlayer').append(button);
    } else {
      $('sourcePlayer').innerHTML=`<button id="loadYouTube" class="video-gate"><span>▶</span><strong>Load YouTube segment</strong><small>Then tap play inside the video for sound</small></button><p class="footnote">Player is set to ${s.time}. <a href="https://www.youtube.com/watch?v=${VIDEO}&t=${s.start}s" target="_blank" rel="noopener noreferrer">Open at this second on YouTube ↗</a></p>`;
      $('loadYouTube').onclick=()=>{
        const frame=document.createElement('iframe');frame.id='ytFrame';frame.title='Interview moment '+s.time;frame.allow='encrypted-media; picture-in-picture';frame.referrerPolicy='strict-origin-when-cross-origin';frame.src=`https://www.youtube.com/embed/${VIDEO}?start=${s.start}&end=${s.end}&controls=1&playsinline=1&rel=0`;
        $('loadYouTube').replaceWith(frame);
      };
    }
  }
  async function toggleRecord() {
    if (recorder?.state==='recording') { recorder.stop(); $('recordButton').textContent='Saving preview…'; return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {status('Recording is unavailable here. You can finish without it.',true);return;}
    try {
      stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(x=>MediaRecorder.isTypeSupported(x));
      recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
      const parts=[];recorded=null;
      recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};
      recorder.onstop=()=>{clearTimeout(recordingTimer);stream?.getTracks().forEach(t=>t.stop());stream=null;recorded=new Blob(parts,{type:recorder.mimeType||'audio/webm'});if(recordUrl)URL.revokeObjectURL(recordUrl);recordUrl=URL.createObjectURL(recorded);$('recordPreview').innerHTML='<audio controls aria-label="Your new take"></audio><button id="saveTake" class="secondary">Save private take</button><button id="discardTake" class="quiet">Discard</button>';$('recordPreview audio').src=recordUrl;$('saveTake').onclick=()=>saveTake();$('discardTake').onclick=()=>{URL.revokeObjectURL(recordUrl);recordUrl=null;recorded=null;$('recordPreview').replaceChildren();};$('recordButton').textContent='● Record again';};
      recorder.start();$('recordButton').textContent='■ Stop recording';recordingTimer=setTimeout(()=>{if(recorder?.state==='recording')recorder.stop();},60000);
    } catch {status('Microphone permission was not granted. Recording is optional.',true);}
  }
  function stopRecorder(){if(recorder?.state==='recording'){recorder.onstop=null;recorder.stop();}clearTimeout(recordingTimer);stream?.getTracks().forEach(t=>t.stop());stream=null;recorder=null;recorded=null;if(recordUrl){URL.revokeObjectURL(recordUrl);recordUrl=null;}}
  async function upload(file,kind,title,data) {
    if(file.size>30*1024*1024) throw Error('Choose a file under 30 MB.');
    const ext=(file.type.includes('quicktime')?'mov':file.type.includes('mp4')?'mp4':file.type.includes('wav')?'wav':file.type.includes('mpeg')?'mp3':file.type.includes('ogg')?'ogg':file.type.includes('m4a')?'m4a':'webm');
    const path=`${auth.userId}/${crypto.randomUUID()}.${ext}`;
    await call(`/storage/v1/object/${BUCKET}/${path}`,{method:'POST',headers:{'Content-Type':file.type.split(';')[0]||'audio/webm','x-upsert':'false'},body:file});
    try {return await saveEntry(kind,title,{...data,mime:file.type},path);} catch(e){await call(`/storage/v1/object/${BUCKET}`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:[path]})}).catch(()=>{});throw e;}
  }
  async function saveTake() {
    if(!recorded||!currentSpeech)return;
    const button=$('saveTake');button.disabled=true;
    try {const s=currentSpeech,note=$('speechNote').value;await upload(recorded,'speech_take','Take · '+s.title,{lessonId:s.id,prompt:s.prompt});recorded=null;savedTake=true;$('speechNote').value=note;status('Take saved privately. Finish whenever you are ready.');$('finishSpeech').textContent='Finish level →';}
    catch(e){status(e.message,true);button.disabled=false;}
  }
  async function playPrivate(path,container,mime='audio/webm') {
    container.textContent='Loading your private file…';
    try {const response=await call(`/storage/v1/object/authenticated/${BUCKET}/${path}`);const blob=await response.blob();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(blob);const media=document.createElement(mime.startsWith('video/')?'video':'audio');media.controls=true;media.src=audioUrl;media.setAttribute('aria-label','Your private reference');container.replaceChildren(media);}
    catch(e){container.textContent=e.message;}
  }
  function renderText() {
    $('textPath').hidden=!!currentText;$('textLesson').hidden=!currentText;
    $('textPath').innerHTML=writing.map((w,i)=>`<button class="path-card ${completed('text_practice',w.id)?'done':''}" data-writing="${w.id}"><span class="level">${completed('text_practice',w.id)?'✓':String(i+1).padStart(2,'0')}</span><span><small>TEXT LEVEL ${i+1}</small><strong>${w.title}</strong><em>${w.tip}</em></span><span class="arrow">↗</span></button>`).join('');
    $('ownTexts').innerHTML='<h3>Your saved examples</h3>'+(entries.filter(e=>e.kind==='text_reference').map(e=>`<div class="source-card"><b>${escape(e.title)}</b><p>${escape(e.data.body)}</p>${e.data.url?`<a href="${escape(e.data.url)}" target="_blank" rel="noopener noreferrer">Source ↗</a>`:''}</div>`).join('')||'<p class="footnote">No examples saved yet.</p>');
    if(!currentText)return;
    const w=writing.find(x=>x.id===currentText);
    $('textLesson').innerHTML=`<button id="backText" class="back">← All text levels</button><span class="kicker">WRITE AN ORIGINAL REPLY</span><h2>${w.title}</h2><div class="cue"><b>NOTICE</b><p>${w.cue}</p></div><div class="prompt"><small>NEW SITUATION</small><strong>${w.prompt}</strong></div><label for="reply">Your reply</label><textarea id="reply" rows="4" maxlength="500" placeholder="Write how you would actually text a friend…"></textarea><div id="textFeedback" class="feedback" aria-live="polite"></div><button id="checkText" class="secondary">Check the feel</button><button id="saveReply" class="primary">Save this round →</button><p class="footnote">The check gives writing heuristics, never a “Lazer score.” It cannot tell whether your wording is authentic or belongs to AAE.</p>`;
    $('backText').onclick=()=>{currentText=null;renderText();};
    $('checkText').onclick=()=>feedback(w);
    $('saveReply').onclick=async()=>{const body=$('reply').value.trim();if(body.length<2){status('Write a reply first.',true);return;}const button=$('saveReply');button.disabled=true;try{await saveEntry('text_practice',w.title,{lessonId:w.id,prompt:w.prompt,body});currentText=null;renderText();status('Saved. Try the same ease in a real conversation.');}catch(e){status(e.message,true);button.disabled=false;}};
  }
  function feedback(w) {
    const body=$('reply').value.trim();if(!body){$('textFeedback').textContent='Write a reply first.';return;}
    const words=body.split(/\s+/).length, notes=[];
    if(words>35)notes.push('This is long for the prompt. Try keeping the main thought.');
    else if(words<3)notes.push('Very short. Would your friend understand what you mean?');
    else notes.push(`${words} words. Read it as your friend: is the meaning clear?`);
    if(/(.)\1{3,}/i.test(body)||/[!?]{4,}/.test(body))notes.push('Repeated letters or punctuation stand out. Keep them only if you mean that emphasis.');
    notes.push(w.tip+' There is no style score.');
    $('textFeedback').textContent=notes.join(' ');
  }
  function renderClips() {
    const clips=entries.filter(e=>e.kind==='speech_reference');
    $('clipList').innerHTML=clips.length?clips.map(e=>`<article class="saved-card"><span class="kicker">PRIVATE CLIP · ${date(e.created_at)}</span><h3>${escape(e.title)}</h3><p>${escape(e.data.note||'One moment to listen to.')}</p><div class="card-actions"><button data-practice="${e.id}" class="secondary">Practice this ↗</button><button data-play="${e.id}" class="quiet">▶ Play</button></div><div id="media-${e.id}"></div></article>`).join(''):'<div class="empty">No clips yet. Add one above, or start with the interview levels.</div>';
  }
  function renderHistory() {
    const list=entries.filter(e=>['speech_session','speech_take','text_practice'].includes(e.kind));
    $('historyList').innerHTML=list.length?list.map(e=>`<article class="saved-card"><span class="kicker">${escape(e.kind.replace('_',' '))} · ${date(e.created_at)}</span><h3>${escape(e.title)}</h3><p>${escape(e.data.body||e.data.note||e.data.prompt||'Saved practice')}</p>${e.object_path?`<button class="secondary" data-play="${e.id}">▶ Hear take</button><div id="media-${e.id}"></div>`:''}</article>`).join(''):'<div class="empty">No rounds yet. Finish a speaking or texting level to see it here.</div>';
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-tab],[data-speech],[data-writing],[data-practice],[data-play]');if(!target||!auth)return;
    if(target.dataset.tab) showTab(target.dataset.tab);
    if(target.dataset.speech){savedTake=false;currentSpeech=speech.find(s=>s.id===target.dataset.speech);renderSpeech();}
    if(target.dataset.writing){currentText=target.dataset.writing;renderText();}
    if(target.dataset.practice){const e=entries.find(x=>x.id===target.dataset.practice);if(e){savedTake=false;currentSpeech={id:e.id,title:e.title,custom:true,objectPath:e.object_path,mime:e.data.mime,hear:'Listen twice, then choose one detail you can hear.',try:'Try that detail in your own voice.',prompt:'Use that detail in a fresh sentence of your own.',guard:'Do not assume it is a general accent feature.'};showTab('speak');renderSpeech();}}
    if(target.dataset.play){const e=entries.find(x=>x.id===target.dataset.play);if(e)playPrivate(e.object_path,$('media-'+e.id),e.data.mime);}
  });
  $('signIn').onclick=signIn;$('password').onkeydown=e=>{if(e.key==='Enter')signIn();};$('signOut').onclick=()=>signOut();$('home').onclick=()=>showTab('speak');
  $('uploadClip').onclick=async()=>{const file=$('clipFile').files[0],title=$('clipTitle').value.trim();if(!file||!title){status('Choose a file and give it a name.',true);return;}const button=$('uploadClip');button.disabled=true;try{await upload(file,'speech_reference',title,{note:$('clipNote').value.trim()});$('clipFile').value='';$('clipTitle').value='';$('clipNote').value='';status('Private clip saved.');}catch(e){status(e.message,true);}finally{button.disabled=false;}};
  $('saveTextSource').onclick=async()=>{const label=$('textSource').value.trim(),body=$('textExample').value.trim(),url=$('textUrl').value.trim();if(!label||body.length<2||url&&!/^https:\/\//i.test(url)){status('Add a label and excerpt. Links must start with https://.',true);return;}try{await saveEntry('text_reference',label,{body,url});$('textSource').value='';$('textExample').value='';$('textUrl').value='';status('Example saved privately.');}catch(e){status(e.message,true);}};
})();
