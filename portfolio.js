/* Content polish, quick travel and addressable scenes; the original scene engine
 * remains responsible for transitions and the live station lifecycle. */
(() => {
  const routes = {start:'',menu:'menu',sns:'profile',about:'about',proj:'work',exp:'experience',socials:'contact',github:'code'};
  const ids = Object.fromEntries(Object.entries(routes).map(([id,slug])=>[slug,id]));
  const map = document.querySelector('#siteMap');
  const navLinks = [...map.querySelectorAll('[data-route]')];
  let restoring = false, pendingHistory = 0;
  function announce(text){document.querySelector('#announcer').textContent=text;}
  function openMap(){
    if(busy||map.open)return;
    map.showModal();sfx('move');
    const selected=map.querySelector(`[data-route="${current}"]`);(selected||navLinks[0]).focus();
  }
  document.querySelector('#mapBtn').addEventListener('click',openMap);
  document.querySelector('#closeMap').addEventListener('click',()=>map.close());
  map.addEventListener('click',e=>{if(e.target===map){const r=map.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)map.close();}});
  document.addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    if(!map.open&&(e.key.toLowerCase()==='m'||e.key==='/')){e.preventDefault();openMap();}
  });
  function travel(id){
    if(busy)return;
    map.close();
    if(id===current)return;
    if(current==='intro'){introDone=true;clearInterval(typeTimer);typing=false;}
    stack.length=0;if(id!=='menu')stack.push('menu');
    wipeTo(id,false);
  }
  document.querySelectorAll('[data-route]').forEach(link=>link.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();travel(link.dataset.route);
  }));
  function syncScene(id){
    if(!Object.hasOwn(routes,id))return;
    navLinks.forEach(link=>link.setAttribute('aria-current',link.dataset.route===id?'page':'false'));
    const hash=routes[id]?'#'+routes[id]:'';
    if(!restoring&&location.hash!==hash)history.pushState({scene:id},'',location.pathname+location.search+hash);
    document.title=id==='start'?`${FULL} — Take Your Time`:`${document.querySelector('#'+id).getAttribute('aria-label')} — ${FULL}`;
  }
  document.addEventListener('portfolio:scene',e=>syncScene(e.detail.id));
  // Browser Back/Forward shares the same scenes as Escape and the map.
  addEventListener('popstate',()=>{
    const id=ids[location.hash.slice(1)]||'start',ticket=++pendingHistory;
    const restore=()=>{
      if(ticket!==pendingHistory)return;
      if(busy){setTimeout(restore,50);return;}
      map.close();stack.length=0;if(id!=='menu'&&id!=='start')stack.push('menu');
      restoring=true;show(id);restoring=false;
    };restore();
  });

  const projectTypes=['SIMULATION / CLIMATE TECH','GAME / CANVAS','PLATFORM / OPEN SOURCE','PLATFORM / CAMPUS'];
  const projectFacts=[['0.5s','3-HOUR SIMULATION'],['0','FRAMEWORKS'],['1','DEPENDENCY'],['1','CAMPUS, CONNECTED']];
  const illustrations=[
    `<g fill="none" stroke="#32464f" stroke-width="1.5"><path d="M80 0V210M140 0V210M205 0V210M280 0V210M350 0V210M420 0V210M500 0V210M575 0V210M0 35H640M0 90H640M0 155H640"/><path d="M0 200L410 0M170 210L590 0M0 115L280 0"/></g><g fill="none" stroke="#5fd4d6" opacity=".4"><path d="M-20 160Q140 30 270 120T660 90M-20 174Q140 44 270 134T660 104M-20 187Q140 58 270 147T660 117"/></g><path class="signal-path" d="M80 35H205V90H350V155H500V90H575" fill="none" stroke="#ed1835" stroke-width="4"/><g fill="#ed1835" stroke="#fff" stroke-width="2"><circle cx="205" cy="90" r="6"/><circle cx="350" cy="155" r="6"/><circle cx="500" cy="90" r="6"/></g><circle cx="500" cy="90" r="21" stroke="#ed1835" fill="none" opacity=".5"/><text x="38" y="185" fill="#fff" font-family="monospace" font-size="12" letter-spacing="3">BENGALURU / FLOOD INTELLIGENCE</text>`,
    `<g fill="#273847"><path d="M0 0H640V40H0zM0 170H640V210H0zM0 40H85V170H0zM555 40H640V170H555z"/><path d="M170 40H195V145H170zM445 40H470V145H445z"/></g><path d="M85 171L190 145H450L555 171" fill="none" stroke="#80a9aa"/><g fill="#657c81"><path d="M104 35H153V40H104zM282 35H351V40H282zM491 35H540V40H491z"/></g><path d="M0 175H640V210H0z" fill="#123945"/><g fill="none" stroke="#366477"><path d="M0 186H135M165 188H290M350 185H440M490 189H640"/></g><g fill="#eb1736"><path d="M309 99H330V124H309zM303 124H336V151H303zM306 150H317V171H306zM324 150H335V171H324z"/></g><path d="M316 109H331V116H316z" fill="#fff"/><g fill="#dfd4b1"><path d="M392 125H405V141H392z"/></g><text x="36" y="194" fill="#b0d4d8" font-family="monospace" font-size="11" letter-spacing="2">FACILITY 22 / FIND YOUR WAY OUT</text>`,
    `<g stroke="#596171" stroke-width="3" fill="none"><path d="M70 150H570"/><path d="M160 150Q210 150 210 95V65H335Q385 65 385 115T440 150"/><path d="M300 150Q330 150 330 185H500"/></g><path class="signal-path" d="M160 150Q210 150 210 95V65H335Q385 65 385 115T440 150H570" stroke="#ef1c3b" stroke-width="4" fill="none"/><g fill="#101219" stroke="#fff" stroke-width="3"><circle cx="70" cy="150" r="8"/><circle cx="160" cy="150" r="8"/><circle cx="270" cy="65" r="8"/><circle cx="335" cy="65" r="8"/><circle cx="440" cy="150" r="8"/><circle cx="570" cy="150" r="8"/></g><text x="239" y="39" fill="#fff" font-family="monospace" font-size="11" letter-spacing="2">CONTRIBUTE → VERIFY → RANK</text><text x="40" y="190" fill="#8c919d" font-family="monospace" font-size="10">COMMUNITY IN EVERY COMMIT.</text>`,
    `<g transform="translate(96 34) rotate(-8 170 70)"><path d="M0 0H430V135H0Z" fill="#f0eddd"/><path d="M0 0H120V135H0Z" fill="#e91835"/><text x="20" y="66" fill="#fff" font-family="sans-serif" font-size="28" font-weight="900">AFTER</text><text x="20" y="97" fill="#fff" font-family="sans-serif" font-size="28" font-weight="900">CLASS</text><path d="M136 8V125" stroke="#15151a" stroke-dasharray="4 5"/><g fill="#11121a"><path d="M160 26H287V34H160zM160 47H248V52H160zM160 69H296V74H160zM160 108H171V121H160zM176 108H180V121H176zM185 108H196V121H185zM201 108H205V121H201zM210 108H222V121H210zM227 108H231V121H227zM236 108H251V121H236z"/></g><circle cx="371" cy="67" r="31" fill="none" stroke="#e91835" stroke-width="3"/><path d="M353 67L365 79L391 51" stroke="#e91835" stroke-width="5" fill="none"/></g>`
  ];
  window.enrichProject=i=>{
    const d=document.querySelector('#detail');
    const art=document.createElement('div');art.className='mission-art';art.setAttribute('aria-hidden','true');
    art.innerHTML=`<svg viewBox="0 0 640 210" preserveAspectRatio="xMidYMid slice"><rect width="640" height="210" fill="#10151d"/>${illustrations[i]}</svg><span>CASE FILE / 0${i+1}</span>`;
    const body=document.createElement('div');body.className='mission-body';while(d.firstChild)body.append(d.firstChild);d.append(art,body);
    const actions=document.createElement('div');actions.className='mission-actions';body.querySelectorAll('a').forEach(a=>actions.append(a));body.append(actions);
    const fact=document.createElement('div');fact.className='mission-fact';fact.innerHTML=`<b>${projectFacts[i][0]}</b><span>${projectFacts[i][1]}</span>`;body.prepend(fact);
  };
  document.querySelectorAll('.card').forEach((card,i)=>{
    card.querySelector('small').textContent=`0${i+1} / ${projectTypes[i]}`;
  });
  enrichProject(lists.proj.i);

  // The existing résumé content is the source of truth for all profile details.
  document.querySelector('#idcard').innerHTML=`<div class="dossier-label">IDENTITY FILE / 01 <span>✦</span></div><div class="avatar">${ME.photo?`<img src="${esc(ME.photo)}" alt="${esc(FULL)}">`:'<div class="avatar-art" aria-hidden="true"></div>'}</div><small>CODENAME / BUILDER</small><h3>${esc(FULL)}</h3><p>${esc(ME.title)}<br><span>${esc(ME.location)}</span></p><a class="resume" href="${esc(ME.resume)}" target="_blank" rel="noopener">READ MY RÉSUMÉ ↗</a><a class="profile-email" href="mailto:${esc(ME.email)}">${esc(ME.email)}</a>`;
  const facts=document.createElement('div');facts.className='profile-facts';facts.innerHTML=`<div><b>25<span>+</span></b><small>PUBLIC REPOS</small></div><div><b>02</b><small>HACKATHON WINS</small></div><div><b>04</b><small>FEATURED BUILDS</small></div>`;
  document.querySelector('#aboutRight').prepend(facts);
  document.querySelector('#ccTop').textContent='LET’S BUILD SOMETHING.';
  document.querySelector('#ccMsg').textContent='From the first idea to the final deploy. Bring the challenge — I’ll bring the code.';
  document.querySelector('#snsTitle').textContent='THE DOSSIER';
  const phoneNote=document.createElement('div');phoneNote.className='phone-note';phoneNote.innerHTML=`<span>ANUBHAV KUMAR</span><small>FULL-STACK DEVELOPER / BENGALURU</small>`;document.querySelector('.phone').append(phoneNote);

  let copyTimer;
  document.querySelector('#copyEmail').addEventListener('click',async()=>{
    const status=document.querySelector('#copyStatus'),button=document.querySelector('#copyEmail');
    clearTimeout(copyTimer);
    try{await navigator.clipboard.writeText(ME.email);status.textContent='Email copied. Your move!';button.innerHTML='COPIED <b>✓</b>';sfx('ok');}
    catch{status.textContent=`Copy manually: ${ME.email}`;}
    copyTimer=setTimeout(()=>{button.innerHTML='COPY EMAIL <b>⧉</b>';status.textContent='';},5000);
  });
  // Announce complete lines, instead of exposing the typewriter one character at a time.
  document.querySelector('#dlgText').setAttribute('aria-live','off');
  const initial=ids[location.hash.slice(1)];
  if(initial&&initial!=='start'){
    stack.length=0;if(initial!=='menu')stack.push('menu');restoring=true;show(initial);restoring=false;
    history.replaceState({scene:initial},'',location.href);
  }else{history.replaceState({scene:'start'},'',location.pathname+location.search);}
})();
