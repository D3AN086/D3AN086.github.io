(function(){
  try{ if('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(function(rs){ rs.forEach(function(r){ r.unregister(); }); }); }catch(e){}
  var src='https://raw.githubusercontent.com/D3AN086/D3AN086.github.io/2bd2a9c9c174e664961d61ff599f2809ddcb8960/Index.html';
  function fail(){ document.body.innerHTML='<p style="padding:24px;color:#c9c0b0">Could not load Downtown Empire.</p>'; }
  fetch(src,{cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error('bad'); return r.text(); }).then(function(html){
    var css='#next-card,#heat-card,#rival-card,#event-card,.rival-card,.next-card,#p-dashboard .cd:has(#dn){display:none!important}.chat-fab{display:none!important}.bn{display:flex!important}.bn .nb{flex:1;font-size:9px}#gym-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}#gym-stats .gs{background:#120e14;border:1px solid #2a2a32;border-radius:10px;padding:8px;text-align:center}#gym-stats .gv{color:#f0d060}#bank-vault .bv-amt{font-family:Cinzel,serif;font-size:26px;color:#f0d060}#bank-vault .bv-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}#bank-vault .bv-k{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#8b8b9a}';
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
    function safe(fn){ try{ fn(); }catch(e){} }
    function gearOf(u){ var eq=u&&u.eq||{}, list=typeof I==='function'?I():[]; function find(id){return list.find(function(x){return x.id===id})||null} var w=find(eq.weapon),a=find(eq.armor); return {str:(u.str||0)+(w&&w.str||0),def:(u.def||0)+(a&&a.def||0),spd:(u.agi||0)}; }
    function houseAwake(h){ var map={street:0,apt:15,condo:30,man:50,pent:80,comp:120}; if(!h)return{max:0,tick:0}; return {max:map[h.id]||0,tick:h.id==='street'?0:1}; }
    function applyHouseAwake(){ if(!U)return; var h=(typeof H==='function'?H():[]).find(function(x){return x.id===U.house}); var b=houseAwake(h); U.maxS=Math.max(50,50+(b.max||0)); if(U.stam==null)U.stam=U.maxS; if(U.stam>U.maxS)U.stam=U.maxS; return b; }
    function gymGainPreview(s){ if(!U)return 2; var gym=typeof totalGymMult==='function'?totalGymMult():1; return Math.max(2,Math.round((((U[s]||1)*0.085)+((U.level||1)*0.55)+4)*gym)); }
    function gymGain(s){ return Math.max(2,Math.round(gymGainPreview(s)*(0.88+Math.random()*0.24))); }
    function userScore(u){ if(!u)return 0; return (u.level||1)*100+(u.xp||0)+(u.cash||0)+(u.bank||0)+(u.str||0)+(u.def||0); }
    function persistUser(){ if(!U||!U.username)return; try{ localStorage.setItem('de_char_'+String(U.username).toLowerCase(), JSON.stringify(U)); localStorage.setItem('de_session', U.username); }catch(e){} }
    function refillBar(type){
      if(!U){ toast('Log in first'); return; }
      applyHouseAwake();
      var set=(typeof S==='function'?S():{})||{};
      if(type==='energy'){ if((U.energy||0)>=(U.maxE||100)){toast('Energy full');return;} var c=set.pe||10; if((U.points||0)<c){toast('Need '+c+' Points');return;} U.points-=c; U.energy=U.maxE||100; }
      else if(type==='nerve'){ if((U.nerve||0)>=(U.maxN||50)){toast('Nerve full');return;} var c2=set.pn||8; if((U.points||0)<c2){toast('Need '+c2+' Points');return;} U.points-=c2; U.nerve=U.maxN||50; }
      else { if((U.stam||0)>=(U.maxS||50)){toast('Awake full');return;} var c3=set.pa||8; if((U.points||0)<c3){toast('Need '+c3+' Points');return;} U.points-=c3; U.stam=U.maxS||50; toast('Awake refilled'); }
      if(typeof save==='function') save(); if(typeof ui==='function') ui();
    }
    function bankRate(){ var h=(typeof H==='function'?H():[]).find(function(x){return U&&x.id===U.house}); var map={street:0.002,apt:0.004,condo:0.006,man:0.008,pent:0.01,comp:0.015}; return (h&&map[h.id]!=null)?map[h.id]:0.002; }
    function hookBank(){
      var page=document.getElementById('p-bank'); if(!page) return;
      var wrap=document.getElementById('bank-vault');
      if(!wrap){ wrap=document.createElement('div'); wrap.id='bank-vault'; wrap.className='cd'; var old=page.querySelector('.cd'); if(old) old.replaceWith(wrap); else page.appendChild(wrap); }
      if(!U) return;
      var money=typeof f==='function'?f:function(n){return n};
      var rate=(bankRate()*100).toFixed(1);
      wrap.innerHTML='<h3>Private vault</h3><div class="bv-amt">$'+money(U.bank||0)+'</div><div class="bv-row"><div><div class="bv-k">Pocket</div><div>$'+money(U.cash||0)+'</div></div><div><div class="bv-k">Hourly cut</div><div>'+rate+'%</div></div></div><div class="fr" style="gap:8px;flex-wrap:wrap;margin-top:8px"><input type="number" id="ba" min="1" placeholder="Amount" style="flex:2;background:#0a0a0e;color:#f2f2f5;border:1px solid #2a2a32;border-radius:8px;padding:10px"><button type="button" class="btn p" id="bdep">Deposit</button><button type="button" class="btn s" id="bwdr">Withdraw</button></div><div class="fr" style="gap:8px;margin-top:8px"><button type="button" class="btn s" id="bdep-all">Stash all</button><button type="button" class="btn s" id="bwdr-all">Pull all</button></div>';
      var dep=document.getElementById('bdep'), wdr=document.getElementById('bwdr'), da=document.getElementById('bdep-all'), wa=document.getElementById('bwdr-all');
      if(dep) dep.onclick=function(){ var a=+document.getElementById('ba').value||0; if(a<=0||U.cash<a){toast('Need cash');return;} U.cash-=a; U.bank=(U.bank||0)+a; persistUser(); if(typeof save==='function')save(); if(typeof ui==='function')ui(); hookBank(); toast('Stashed'); };
      if(wdr) wdr.onclick=function(){ var a=+document.getElementById('ba').value||0; if(a<=0||(U.bank||0)<a){toast('Need vault cash');return;} U.bank-=a; U.cash+=a; persistUser(); if(typeof save==='function')save(); if(typeof ui==='function')ui(); hookBank(); toast('Pulled'); };
      if(da) da.onclick=function(){ var a=Math.floor(U.cash||0); if(a<1)return; U.cash=0; U.bank=(U.bank||0)+a; persistUser(); if(typeof save==='function')save(); if(typeof ui==='function')ui(); hookBank(); toast('Stashed'); };
      if(wa) wa.onclick=function(){ var a=Math.floor(U.bank||0); if(a<1)return; U.bank=0; U.cash+=a; persistUser(); if(typeof save==='function')save(); if(typeof ui==='function')ui(); hookBank(); toast('Pulled'); };
    }
    function hookGym(){
      applyHouseAwake();
      if(typeof train==='function'){ train=function(s){ if(!U)return; applyHouseAwake(); var cost={str:5,def:5,agi:4,int:4}[s]||5; if((U.stam||0)<cost){ toast('Need '+cost+' Awake'); return;} var gain=gymGain(s); U.stam-=cost; U[s]=(U[s]||0)+gain; U.xp=(U.xp||0)+3; persistUser(); if(typeof save==='function')save(); if(typeof ui==='function')ui(); toast('+'+gain); }; }
      if(typeof tickBars==='function' && !tickBars._ok){ var tb=tickBars; tickBars=function(){ applyHouseAwake(); tb(); }; tickBars._ok=1; }
    }
    function hookPersist(){
      if(typeof save==='function' && !save._p){ var s=save; save=function(){ try{ if(U&&G&&G.users) G.users[U.username]=U; persistUser(); }catch(e){} try{ return s.apply(this,arguments);}catch(e){} }; save._p=1; }
      if(!window._deAutoSave){ window._deAutoSave=1; setInterval(function(){ if(U&&typeof save==='function') try{ save(); }catch(e){} },8000); }
    }
    function hookMenu(){ var bar=document.getElementById('mainnav')||document.querySelector('nav.bn'); if(!bar) return; if(!bar.querySelector('[data-p="inventory"]')){ var b=document.createElement('button'); b.type='button'; b.className='nb'; b.setAttribute('data-p','inventory'); b.innerHTML='<i class="fas fa-briefcase"></i>Inventory'; var prof=bar.querySelector('[data-p="profile"]'); if(prof) bar.insertBefore(b,prof); else bar.appendChild(b); } }
    function hookPlay(){
      if(window._playHook) return; window._playHook=1;
      document.addEventListener('click',function(e){
        var t=e.target.closest('button,.tb,.dj,#tap-awake,#tap-energy,#tap-nerve,.mbar-tap');
        if(!t) return;
        if(t.id==='tap-awake' || (t.classList.contains('mbar-tap') && t.id==='tap-awake')){ e.preventDefault(); refillBar('awake'); return; }
        if(t.id==='tap-energy'){ e.preventDefault(); refillBar('energy'); return; }
        if(t.id==='tap-nerve'){ e.preventDefault(); refillBar('nerve'); return; }
        if(t.classList.contains('tb') && typeof train==='function'){ e.preventDefault(); train(t.dataset.s); }
        if(t.classList.contains('dj') && typeof doJob==='function'){ e.preventDefault(); doJob(t.dataset.id); }
      }, true);
    }
    function hookPages(){
      if(typeof window.showPage==='function' && !window.showPage._all){
        var sp=window.showPage;
        window.showPage=function(id,fs){ try{ sp(id,fs);}catch(e){} if(id==='gym'){ applyHouseAwake(); } if(id==='bank') hookBank(); };
        window.showPage._all=1;
      }
      if(typeof setupBars==='function') try{ setupBars(); }catch(e){}
    }
    function wire(){
      safe(function(){ if(typeof auth==='function') auth(); });
      safe(hookPersist); safe(hookGym); safe(hookBank); safe(hookMenu); safe(hookPlay); safe(hookPages);
    }
    function afterLoad(){ wire(); try{ document.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){} safe(hookPages); }
    if(typeof load==='function') Promise.resolve(load()).then(afterLoad).catch(afterLoad); else afterLoad();
  }).catch(fail);
})();
