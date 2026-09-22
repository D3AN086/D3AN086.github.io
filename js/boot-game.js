(function(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations().then(function(rs){
      rs.forEach(function(r){ r.unregister(); });
    });
  }
  var src='https://raw.githubusercontent.com/D3AN086/D3AN086.github.io/2bd2a9c9c174e664961d61ff599f2809ddcb8960/Index.html';
  function fail(){
    document.body.innerHTML='<p style="padding:24px;color:#c9c0b0;font-family:system-ui">Could not load Downtown Empire.</p>';
  }
  fetch(src,{cache:'no-store'}).then(function(r){
    if(!r.ok) throw new Error('bad');
    return r.text();
  }).then(function(html){
    var css = '#next-card,#heat-card,#rival-card,#event-card,.rival-card,.next-card,#p-dashboard .cd:has(#dn){display:none!important}.chat-fab{display:none!important}' +
      '#fight-ring{position:fixed;inset:0;z-index:80;background:rgba(6,4,8,.94);display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px}' +
      '#fight-ring.on{display:flex}' +
      '#gym-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0 12px}' +
      '#gym-stats .gs{background:#120e14;border:1px solid #2a2a32;border-radius:10px;padding:8px 4px;text-align:center}' +
      '#gym-stats .gk{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#8b8b9a}' +
      '#gym-stats .gv{font-family:Cinzel,serif;color:#f0d060;font-size:16px;margin-top:2px}' +
      '.bn{display:flex!important}.bn .nb{flex:1;font-size:9px}' +
      '#fight-ring .frs{display:flex;gap:16px;width:100%;max-width:420px}' +
      '#fight-ring .fp{flex:1;background:#120e14;border:1px solid #2a2a32;border-radius:14px;padding:14px;text-align:center}' +
      '#fight-ring .fp.you{border-color:rgba(212,175,55,.45)}' +
      '#fight-ring .fn{font-family:Cinzel,serif;color:#f0d060}' +
      '#fight-ring .fs{font-size:11px;color:#8b8b9a}' +
      '#fight-ring .bar{height:8px;background:#1a1a22;border-radius:99px;overflow:hidden;margin-top:8px}' +
      '#fight-ring .bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#7a1020,#e23d4a);transition:width .25s}' +
      '#fight-ring .flog,#fight-ring .fres{text-align:center;color:#c9c0b0;margin-top:12px}';
    html=html.replace('</style>', css+'</style>');
    html=html.replace('<button type="button" class="nb on" data-p="profile"><i class="fas fa-user"></i>Profile</button>','<button type="button" class="nb" data-p="inventory"><i class="fas fa-briefcase"></i>Inventory</button><button type="button" class="nb" data-p="profile"><i class="fas fa-user"></i>Profile</button>');
    html=html.replace(/5 Energy/g,'5 Awake');
    html=html.replace(/4 Energy/g,'4 Awake');
    var parsed=new DOMParser().parseFromString(html,'text/html');
    var gameScript='';
    parsed.querySelectorAll('script').forEach(function(s){ if(!s.src) gameScript += s.textContent+'\n'; s.remove(); });
    gameScript=gameScript.replace('let U=null,G=null;','let U=null,G={set:{},users:{}};');
    gameScript=gameScript.replace("if(apay){apay.value=(S().payLink||'');}","if(apay && G){apay.value=((S()||{}).payLink||'');}");
    document.head.innerHTML=parsed.head.innerHTML;
    document.body.innerHTML=parsed.body.innerHTML;
    var run=document.createElement('script');
    run.textContent=gameScript;
    document.body.appendChild(run);
    function gearOf(u){
      var eq=u&&u.eq||{}; var list=typeof I==='function'?I():[];
      function find(id){ return list.find(function(x){return x.id===id})||null; }
      var w=find(eq.weapon), a=find(eq.armor), v=find(eq.vehicle);
      return { str:(u.str||0)+(w&&w.str||0)+(a&&a.str||0)+(v&&v.str||0), def:(u.def||0)+(w&&w.def||0)+(a&&a.def||0)+(v&&v.def||0), spd:(u.agi||0), w:w?w.name:'Fists', a:a?a.name:'Street clothes' };
    }
    function houseAwake(h){
      var map={street:0,apt:15,condo:30,man:50,pent:80,comp:120};
      if(!h) return {max:0,tick:0};
      var mx=map[h.id]; if(mx==null) mx=Math.round(((h.gym||1)-1)*100);
      return {max:mx, tick:h.id==='street'?0:(mx>=80?2:1)};
    }
    function applyHouseAwake(){
      if(!U) return;
      var h=(typeof H==='function'?H():[]).find(function(x){return x.id===U.house});
      var b=houseAwake(h);
      U.maxS=50+b.max;
      if(U.stam==null) U.stam=U.maxS;
      if(U.stam>U.maxS) U.stam=U.maxS;
      return b;
    }
    function fightScene(name, done){
      var t=G&&G.users&&G.users[name]; if(!t){ if(done) done(); return; }
      var box=document.getElementById('fight-ring');
      if(!box){ box=document.createElement('div'); box.id='fight-ring'; document.body.appendChild(box); }
      var you=U&&U.username||'You', Y=gearOf(U), T=gearOf(t);
      box.innerHTML='<div class="frs"><div class="fp you"><div class="fn">'+you+'</div><div class="fs">STR '+Y.str+' · SPD '+Y.spd+' · DEF '+Y.def+'</div><div class="bar"><i id="hp-you"></i></div></div><div class="vs">VS</div><div class="fp"><div class="fn">'+name+'</div><div class="fs">STR '+T.str+' · SPD '+T.spd+' · DEF '+T.def+'</div><div class="bar"><i id="hp-them"></i></div></div></div><div class="flog" id="flog"></div><div class="fres" id="fres"></div>';
      box.classList.add('on'); var hy=100,ht=100,i=0;
      var timer=setInterval(function(){
        i++; var youFirst=(Y.spd+Math.random()*8)>=(T.spd+Math.random()*8);
        var atk=youFirst?Y:T,dfn=youFirst?T:Y;
        var chance=0.38+(atk.spd-dfn.spd)/90; if(chance<0.18)chance=0.18; if(chance>0.82)chance=0.82;
        var hit=Math.random()<chance, dmg=Math.max(3,Math.round(atk.str*0.22-dfn.def*0.12+4+Math.random()*8));
        var log=document.getElementById('flog');
        if(youFirst){ if(hit){ ht=Math.max(0,ht-dmg); if(log) log.textContent=you+' hits · -'+dmg; } else if(log) log.textContent=name+' soaks it'; }
        else { if(hit){ hy=Math.max(0,hy-dmg); if(log) log.textContent=name+' hits · -'+dmg; } else if(log) log.textContent=you+' soaks it'; }
        var el=document.getElementById('hp-you'); if(el) el.style.width=hy+'%';
        var em=document.getElementById('hp-them'); if(em) em.style.width=ht+'%';
        if(i>=8||hy<=0||ht<=0){ clearInterval(timer); var win=ht<hy||(ht===hy&&Y.str>=T.str); var r=document.getElementById('fres'); if(r){ r.textContent=win?'You drop them':'You hit the floor'; r.style.color=win?'#f0d060':'#e23d4a'; } setTimeout(function(){ box.classList.remove('on'); if(done) done(); },900); }
      },340);
    }
    function hookCore(){
      if(typeof doHit==='function' && !doHit._h){
        var h=doHit; doHit=function(name){ if(doHit._busy) return; doHit._busy=1; fightScene(name,function(){ h(name); doHit._busy=0; }); }; doHit._h=1;
      }
    }
    function paintGymStats(){
      if(!U) return; var page=document.getElementById('p-gym'); if(!page) return;
      var box=document.getElementById('gym-stats');
      if(!box){ box=document.createElement('div'); box.id='gym-stats'; var tg=page.querySelector('.tg'); if(tg) tg.parentNode.insertBefore(box,tg); else page.appendChild(box); }
      var g=gearOf(U);
      box.innerHTML='<div class="gs"><div class="gk">STR</div><div class="gv">'+g.str+'</div></div><div class="gs"><div class="gk">DEF</div><div class="gv">'+g.def+'</div></div><div class="gs"><div class="gk">SPD</div><div class="gv">'+g.spd+'</div></div><div class="gs"><div class="gk">INT</div><div class="gv">'+(U.int||0)+'</div></div>';
    }
    function hookGym(){
      applyHouseAwake();
      if(typeof train==='function' && !train._st){
        train=function(s){
          if(!U) return; applyHouseAwake();
          var cost={str:5,def:5,agi:4,int:4}[s]||5;
          cost=Math.max(1,Math.floor(cost*(typeof em==='function'?em():1)));
          var msg=document.getElementById('gm');
          if((U.stam||0)<cost){ if(msg){msg.textContent='Need '+cost+' Awake';msg.className='msg err';} toast('Need '+cost+' Awake'); return; }
          if(typeof locked==='function' && locked()) return;
          var gain=Math.max(1,Math.floor(1*(typeof totalGymMult==='function'?totalGymMult():1)));
          U.stam-=cost; U[s]=(U[s]||0)+gain; U.xp=(U.xp||0)+3;
          if(typeof lvl==='function') lvl(); if(typeof ui==='function') ui(); if(typeof uGym==='function') uGym(); if(typeof save==='function') save();
          if(msg){msg.textContent='+'+gain+' '+s.toUpperCase();msg.className='msg ok';}
          toast('+'+gain+' · -'+cost+' Awake'); paintGymStats();
        }; train._st=1;
      }
      if(typeof tickBars==='function' && !tickBars._aw){
        var tb=tickBars;
        tickBars=function(){ applyHouseAwake(); tb(); var b=applyHouseAwake(); if(b&&b.tick&&U.stam<U.maxS){ U.stam=Math.min(U.maxS,U.stam+b.tick); if(typeof ui==='function') ui(); } };
        tickBars._aw=1;
      }
      if(typeof rH==='function' && !rH._aw){
        var rh=rH;
        rH=function(){
          rh();
          var c=document.getElementById('hsl'); if(!c) return;
          c.querySelectorAll('.ic').forEach(function(card){
            var btn=card.querySelector('[data-id]');
            var hid=btn?btn.getAttribute('data-id'):(U&&U.house);
            var h=(typeof H==='function'?H():[]).find(function(x){return x.id===hid});
            var b=houseAwake(h); if(!b.max) return;
            var mt=card.querySelector('.mt'); if(mt && mt.textContent.indexOf('awake')<0) mt.textContent=mt.textContent+' · +'+b.max+' awake';
          });
        }; rH._aw=1;
      }
      if(typeof window.showPage==='function' && !window.showPage._gym){
        var sp=window.showPage;
        window.showPage=function(id,fromSwipe){ sp(id,fromSwipe); if(id==='gym'){ applyHouseAwake(); paintGymStats(); } if(id==='housing'&&typeof rH==='function') rH(); };
        window.showPage._gym=1;
      }
    }
    function hookMenu(){
      var bar=document.getElementById('mainnav')||document.querySelector('nav.bn');
      if(!bar) return;
      if(!bar.querySelector('[data-p="inventory"]')){
        var b=document.createElement('button'); b.type='button'; b.className='nb'; b.setAttribute('data-p','inventory');
        b.innerHTML='<i class="fas fa-briefcase"></i>Inventory';
        var prof=bar.querySelector('[data-p="profile"]'); if(prof) bar.insertBefore(b,prof); else bar.appendChild(b);
      }
      if(typeof nav==='function') nav();
    }
    function hookPlay(){
      if(window._playHook) return; window._playHook=1;
      document.addEventListener('click',function(e){
        var t=e.target.closest('button,.btn,.tb,.dj'); if(!t) return;
        if(t.classList.contains('tb') && typeof train==='function'){ e.preventDefault(); train(t.dataset.s); }
        if(t.classList.contains('dj') && typeof doJob==='function'){ e.preventDefault(); doJob(t.dataset.id); }
      });
    }
    function wire(){
      try{ if(typeof auth==='function') auth(); if(typeof nav==='function') nav(); hookCore(); hookGym(); hookMenu(); hookPlay(); }catch(e){}
    }
    try{ document.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){}
    if(typeof load==='function') Promise.resolve(load()).then(wire).catch(wire); else wire();
  }).catch(fail);
})();
