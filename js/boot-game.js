(function(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations().then(function(rs){ rs.forEach(function(r){ r.unregister(); }); });
  }
  var src='https://raw.githubusercontent.com/D3AN086/D3AN086.github.io/2bd2a9c9c174e664961d61ff599f2809ddcb8960/Index.html';
  function fail(){ document.body.innerHTML='<p style="padding:24px;color:#c9c0b0">Could not load Downtown Empire.</p>'; }
  fetch(src,{cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error('bad'); return r.text(); }).then(function(html){
    var css='#next-card,#heat-card,#rival-card,#event-card,.rival-card,.next-card,#p-dashboard .cd:has(#dn){display:none!important}.chat-fab{display:none!important}.bn{display:flex!important}.bn .nb{flex:1;font-size:9px}#gym-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}#gym-stats .gs{background:#120e14;border:1px solid #2a2a32;border-radius:10px;padding:8px;text-align:center}#gym-stats .gv{color:#f0d060;font-family:Cinzel,serif}#fight-ring{position:fixed;inset:0;z-index:80;background:#0a080c;display:none;flex-direction:column;align-items:center;justify-content:center}#fight-ring.on{display:flex}';
    html=html.replace('</style>', css+'</style>');
    html=html.replace('<button type="button" class="nb on" data-p="profile"><i class="fas fa-user"></i>Profile</button>','<button type="button" class="nb" data-p="inventory"><i class="fas fa-briefcase"></i>Inventory</button><button type="button" class="nb" data-p="profile"><i class="fas fa-user"></i>Profile</button>');
    html=html.replace(/5 Energy/g,'5 Awake'); html=html.replace(/4 Energy/g,'4 Awake');
    var parsed=new DOMParser().parseFromString(html,'text/html');
    var gameScript='';
    parsed.querySelectorAll('script').forEach(function(s){ if(!s.src) gameScript+=s.textContent+'\n'; s.remove(); });
    gameScript=gameScript.replace('let U=null,G=null;','let U=null,G={set:{},users:{}};');
    gameScript=gameScript.replace('await load();','/* boot load */');
    gameScript=gameScript.replace("if(apay){apay.value=(S().payLink||'');}","if(apay && G){apay.value=((S()||{}).payLink||'');}");
    document.head.innerHTML=parsed.head.innerHTML;
    document.body.innerHTML=parsed.body.innerHTML;
    var run=document.createElement('script'); run.textContent=gameScript; document.body.appendChild(run);
    function gearOf(u){ var eq=u&&u.eq||{}, list=typeof I==='function'?I():[]; function find(id){return list.find(function(x){return x.id===id})||null} var w=find(eq.weapon),a=find(eq.armor),v=find(eq.vehicle); return {str:(u.str||0)+(w&&w.str||0),def:(u.def||0)+(a&&a.def||0),spd:(u.agi||0),w:w?w.name:'Fists',a:a?a.name:'Street clothes'}; }
    function houseAwake(h){ var map={street:0,apt:15,condo:30,man:50,pent:80,comp:120}; if(!h)return{max:0,tick:0}; return {max:map[h.id]||0,tick:h.id==='street'?0:1}; }
    function applyHouseAwake(){ if(!U)return; var h=(typeof H==='function'?H():[]).find(function(x){return x.id===U.house}); var b=houseAwake(h); U.maxS=50+b.max; if(U.stam==null)U.stam=U.maxS; if(U.stam>U.maxS)U.stam=U.maxS; return b; }
    function gymGainPreview(s){ if(!U)return 2; var gym=typeof totalGymMult==='function'?totalGymMult():1; return Math.max(2,Math.round((((U[s]||1)*0.085)+((U.level||1)*0.55)+4)*gym)); }
    function gymGain(s){ return Math.max(2,Math.round(gymGainPreview(s)*(0.88+Math.random()*0.24))); }
    function userScore(u){ if(!u)return 0; return (u.level||1)*100+(u.xp||0)+(u.cash||0)+(u.bank||0)+(u.str||0)+(u.def||0); }
    function persistUser(){ if(!U||!U.username)return; try{ localStorage.setItem('de_char_'+String(U.username).toLowerCase(), JSON.stringify(U)); localStorage.setItem('de_session', U.username); if(G) localStorage.setItem('de_v15', JSON.stringify(G)); }catch(e){} }
    function pullUser(name){ try{ return JSON.parse(localStorage.getItem('de_char_'+String(name).toLowerCase())||'null'); }catch(e){ return null; } }
    function hookPersist(){
      if(typeof save==='function' && !save._p){ var s=save; save=function(){ try{ if(U&&G&&G.users) G.users[U.username]=U; persistUser(); }catch(e){} return s.apply(this,arguments); }; save._p=1; }
      if(typeof login==='function' && !login._p){ var lg=login; login=async function(){ var out=await lg.apply(this,arguments); if(U){ var bak=pullUser(U.username); if(bak && userScore(bak)>userScore(U)){ ['cash','bank','points','xp','level','str','def','agi','int','house','inv','eq','vip','gang','stam','energy'].forEach(function(k){ if(bak[k]!=null) U[k]=bak[k]; }); if(G&&G.users) G.users[U.username]=U; } persistUser(); if(typeof save==='function') save(); if(typeof ui==='function') ui(); } return out; }; login._p=1; }
      if(!window._deAutoSave){ window._deAutoSave=1; setInterval(function(){ if(U&&typeof save==='function') save(); },8000); document.addEventListener('visibilitychange', function(){ if(document.hidden&&U&&typeof save==='function') save(); }); window.addEventListener('pagehide', function(){ if(U&&typeof save==='function') save(); }); }
    }
    function paintGymStats(){ if(!U)return; var page=document.getElementById('p-gym'); if(!page)return; var box=document.getElementById('gym-stats'); if(!box){ box=document.createElement('div'); box.id='gym-stats'; var tg=page.querySelector('.tg'); if(tg) tg.parentNode.insertBefore(box,tg); else page.appendChild(box);} var g=gearOf(U); box.innerHTML='<div class="gs"><div class="gk">STR</div><div class="gv">'+g.str+'</div></div><div class="gs"><div class="gk">DEF</div><div class="gv">'+g.def+'</div></div><div class="gs"><div class="gk">SPD</div><div class="gv">'+g.spd+'</div></div><div class="gs"><div class="gk">INT</div><div class="gv">'+(U.int||0)+'</div></div>'; ['str','def','agi','int'].forEach(function(k){ var e=document.getElementById('xb-'+k); if(e) e.textContent='+'+gymGainPreview(k)+' / train'; }); }
    function hookGym(){ applyHouseAwake(); if(typeof train==='function'&&!train._st){ train=function(s){ if(!U)return; applyHouseAwake(); var cost={str:5,def:5,agi:4,int:4}[s]||5; if((U.stam||0)<cost){ toast('Need Awake'); return;} var gain=gymGain(s); U.stam-=cost; U[s]=(U[s]||0)+gain; U.xp=(U.xp||0)+3; if(typeof save==='function')save(); if(typeof ui==='function')ui(); toast('+'+gain); paintGymStats(); }; train._st=1; } }
    function hookMenu(){ var bar=document.getElementById('mainnav')||document.querySelector('nav.bn'); if(!bar)return; if(!bar.querySelector('[data-p="inventory"]')){ var b=document.createElement('button'); b.type='button'; b.className='nb'; b.setAttribute('data-p','inventory'); b.innerHTML='<i class="fas fa-briefcase"></i>Inventory'; var prof=bar.querySelector('[data-p="profile"]'); if(prof) bar.insertBefore(b,prof); else bar.appendChild(b);} if(typeof nav==='function') nav(); }
    function hookPlay(){ if(window._playHook)return; window._playHook=1; document.addEventListener('click',function(e){ var t=e.target.closest('button,.btn,.tb,.dj'); if(!t)return; if(t.classList.contains('tb')&&typeof train==='function'){ e.preventDefault(); train(t.dataset.s);} if(t.classList.contains('dj')&&typeof doJob==='function'){ e.preventDefault(); doJob(t.dataset.id);} }); }
    function hookAuto(){ var bat=document.getElementById('btn-auto-train'); if(bat) bat.onclick=function(){ if(typeof runAutoTrain==='function') runAutoTrain(); }; if(typeof runAutoTrain==='function'&&!runAutoTrain._g){ var r=runAutoTrain; runAutoTrain=function(){ r(); }; } }
    function wire(){ try{ if(typeof auth==='function')auth(); if(typeof nav==='function')nav(); hookPersist(); hookGym(); hookAuto(); hookMenu(); hookPlay(); }catch(e){} }
    function afterLoad(){ wire(); try{ document.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){} }
    if(typeof load==='function') Promise.resolve(load()).then(afterLoad).catch(afterLoad); else afterLoad();
  }).catch(fail);
})();
