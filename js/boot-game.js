(function(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations().then(function(rs){ rs.forEach(function(r){ r.unregister(); }); });
  }
  var src='https://raw.githubusercontent.com/D3AN086/D3AN086.github.io/2bd2a9c9c174e664961d61ff599f2809ddcb8960/Index.html';
  function fail(){ document.body.innerHTML='<p style="padding:24px;color:#c9c0b0">Could not load Downtown Empire.</p>'; }
  fetch(src,{cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error('bad'); return r.text(); }).then(function(html){
    var css='#next-card,#heat-card,#rival-card,#event-card,.rival-card,.next-card,#p-dashboard .cd:has(#dn){display:none!important}.chat-fab{display:none!important}.bn{display:flex!important}.bn .nb{flex:1;font-size:9px}#gym-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}#gym-stats .gs{background:#120e14;border:1px solid #2a2a32;border-radius:10px;padding:8px;text-align:center}#gym-stats .gv{color:#f0d060}';
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
    function userScore(u){ if(!u)return 0; return (u.level||1)*100+(u.xp||0)+(u.cash||0)+(u.bank||0)+(u.str||0)+(u.def||0); }
    function persistUser(){ if(!U||!U.username)return; try{ localStorage.setItem('de_char_'+String(U.username).toLowerCase(), JSON.stringify(U)); localStorage.setItem('de_session', U.username); if(G) localStorage.setItem('de_v15', JSON.stringify(G)); }catch(e){} }
    function listBaks(){ try{ return JSON.parse(localStorage.getItem('de_baks')||'[]'); }catch(e){ return []; } }
    function takeBackup(why){ if(!U||!U.username) return; var list=listBaks(); var snap={t:Date.now(),why:why||'auto',name:U.username,score:userScore(U),user:JSON.parse(JSON.stringify(U))}; if(list[0] && list[0].score===snap.score && (snap.t-list[0].t)<20000) return; list.unshift(snap); if(list.length>8) list=list.slice(0,8); try{ localStorage.setItem('de_baks', JSON.stringify(list)); }catch(e){} paintBackup(); }
    function restoreBak(i){ var b=listBaks()[i]; if(!b||!b.user){ toast('No backup'); return; } U=b.user; if(G&&G.users) G.users[U.username]=U; persistUser(); if(typeof save==='function') save(); if(typeof ui==='function') ui(); toast('Restored'); paintBackup(); }
    function paintBackup(){ var page=document.getElementById('p-profile'); if(!page) return; var box=document.getElementById('bak-box'); if(!box){ box=document.createElement('div'); box.id='bak-box'; box.className='cd'; page.appendChild(box);} var rows=''; listBaks().forEach(function(b,i){ rows+='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #222"><div><div style="color:#f0d060;font-size:13px">'+new Date(b.t).toLocaleString()+'</div><div style="font-size:11px;color:#8b8b9a">'+(b.why||'auto')+' \u00b7 '+b.score+'</div></div><button type="button" class="btn s bak-r" data-i="'+i+'">Restore</button></div>'; }); if(!rows) rows='<div>No backups yet</div>'; box.innerHTML='<h3>Auto backup</h3><p style="font-size:12px;color:#8b8b9a">Last 8 snapshots. Tap Restore only if progress vanished.</p>'+rows; box.querySelectorAll('.bak-r').forEach(function(btn){ btn.onclick=function(){ restoreBak(+btn.getAttribute('data-i')); }; }); }
    function houseAwake(h){ var map={street:0,apt:15,condo:30,man:50,pent:80,comp:120}; if(!h)return{max:0,tick:0}; return {max:map[h.id]||0,tick:h.id==='street'?0:1}; }
    function applyHouseAwake(){ if(!U)return; var h=(typeof H==='function'?H():[]).find(function(x){return x.id===U.house}); var b=houseAwake(h); U.maxS=50+(b&&b.max||0); if(U.stam==null)U.stam=U.maxS; return b; }
    function gymGainPreview(s){ if(!U)return 2; var gym=typeof totalGymMult==='function'?totalGymMult():1; return Math.max(2,Math.round((((U[s]||1)*0.085)+((U.level||1)*0.55)+4)*gym)); }
    function gymGain(s){ return Math.max(2,Math.round(gymGainPreview(s)*(0.88+Math.random()*0.24))); }
    function hookPersist(){ if(typeof save==='function'&&!save._p){ var s=save; save=function(){ try{ if(U&&G&&G.users) G.users[U.username]=U; persistUser(); }catch(e){} var out=s.apply(this,arguments); return out; }; save._p=1; } if(!window._deAutoSave){ window._deAutoSave=1; setInterval(function(){ if(U&&typeof save==='function') save(); },8000); setInterval(function(){ if(U){ if(typeof save==='function') save(); takeBackup('auto'); } },120000); document.addEventListener('visibilitychange', function(){ if(document.hidden&&U){ if(typeof save==='function') save(); takeBackup('leave'); } }); takeBackup('boot'); paintBackup(); } if(typeof window.showPage==='function'&&!window.showPage._bak){ var sp=window.showPage; window.showPage=function(id,fs){ sp(id,fs); if(id==='profile') paintBackup(); }; window.showPage._bak=1; } }
    function hookGym(){ applyHouseAwake(); if(typeof train==='function'&&!train._st){ train=function(s){ if(!U)return; var cost={str:5,def:5,agi:4,int:4}[s]||5; if((U.stam||0)<cost){ toast('Need Awake'); return;} var gain=gymGain(s); U.stam-=cost; U[s]=(U[s]||0)+gain; if(typeof save==='function')save(); if(typeof ui==='function')ui(); toast('+'+gain); }; train._st=1; } }
    function hookMenu(){ var bar=document.getElementById('mainnav')||document.querySelector('nav.bn'); if(!bar)return; if(!bar.querySelector('[data-p="inventory"]')){ var b=document.createElement('button'); b.type='button'; b.className='nb'; b.setAttribute('data-p','inventory'); b.innerHTML='<i class="fas fa-briefcase"></i>Inventory'; var prof=bar.querySelector('[data-p="profile"]'); if(prof) bar.insertBefore(b,prof); else bar.appendChild(b);} }
    function hookPlay(){ if(window._playHook)return; window._playHook=1; document.addEventListener('click',function(e){ var t=e.target.closest('button,.tb,.dj'); if(!t)return; if(t.classList.contains('tb')&&typeof train==='function'){ e.preventDefault(); train(t.dataset.s);} if(t.classList.contains('dj')&&typeof doJob==='function'){ e.preventDefault(); doJob(t.dataset.id);} }); }
    function wire(){ try{ if(typeof auth==='function')auth(); hookPersist(); hookGym(); hookMenu(); hookPlay(); }catch(e){} }
    function afterLoad(){ wire(); try{ document.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){} }
    if(typeof load==='function') Promise.resolve(load()).then(afterLoad).catch(afterLoad); else afterLoad();
  }).catch(fail);
})();
