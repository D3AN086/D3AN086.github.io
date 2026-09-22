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
      '#fight-ring .frs{display:flex;gap:16px;width:100%;max-width:420px}' +
      '#fight-ring .fp{flex:1;background:#120e14;border:1px solid #2a2a32;border-radius:14px;padding:14px;text-align:center}' +
      '#fight-ring .fp.you{border-color:rgba(212,175,55,.45)}' +
      '#fight-ring .fn{font-family:Cinzel,serif;color:#f0d060;font-size:16px}' +
      '#fight-ring .fs{font-size:11px;color:#8b8b9a;margin:4px 0}' +
      '#fight-ring .bar{height:8px;background:#1a1a22;border-radius:99px;overflow:hidden;margin-top:8px}' +
      '#fight-ring .bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#7a1020,#e23d4a);transition:width .25s}' +
      '#fight-ring .vs{align-self:center;color:#f0d060;font-family:Cinzel,serif;letter-spacing:.2em}' +
      '#fight-ring .flog{margin-top:16px;min-height:48px;color:#c9c0b0;text-align:center}' +
      '#fight-ring .fres{font-family:Cinzel,serif;font-size:22px;margin-top:8px}';
    html=html.replace('</style>', css+'</style>');
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
      var eq=u&&u.eq||{};
      var list=typeof I==='function'?I():[];
      function find(id){ return list.find(function(x){return x.id===id})||null; }
      var w=find(eq.weapon), a=find(eq.armor), v=find(eq.vehicle);
      var str=(u.str||0)+(w&&w.str||0)+(a&&a.str||0)+(v&&v.str||0);
      var def=(u.def||0)+(w&&w.def||0)+(a&&a.def||0)+(v&&v.def||0);
      var spd=(u.agi||0)+(w&&(w.agi||w.spd)||0)+(v&&(v.agi||v.spd)||0);
      return { str:str, def:def, spd:spd, w:w?w.name:'Fists', a:a?a.name:'Street clothes' };
    }
    function fightScene(name, done){
      var t=G&&G.users&&G.users[name];
      if(!t){ if(done) done(); return; }
      var box=document.getElementById('fight-ring');
      if(!box){ box=document.createElement('div'); box.id='fight-ring'; document.body.appendChild(box); }
      var you=U&&U.username||'You';
      var Y=gearOf(U), T=gearOf(t);
      box.innerHTML='<div class="frs"><div class="fp you"><div class="fn">'+you+'</div><div class="fs">STR '+Y.str+' · SPD '+Y.spd+' · DEF '+Y.def+'</div><div class="fs">'+Y.w+' · '+Y.a+'</div><div class="bar"><i id="hp-you"></i></div></div><div class="vs">VS</div><div class="fp"><div class="fn">'+name+'</div><div class="fs">STR '+T.str+' · SPD '+T.spd+' · DEF '+T.def+'</div><div class="fs">'+T.w+' · '+T.a+'</div><div class="bar"><i id="hp-them"></i></div></div></div><div class="flog" id="flog"></div><div class="fres" id="fres"></div>';
      box.classList.add('on');
      var hy=100, ht=100, i=0;
      var blows=['cuts in','lands a hook','drives through the guard','rips a shot','slips and counters'];
      var timer=setInterval(function(){
        i++;
        var youFirst=(Y.spd+Math.random()*8)>=(T.spd+Math.random()*8);
        var atk=youFirst?Y:T, dfn=youFirst?T:Y;
        var chance=0.38+(atk.spd-dfn.spd)/90;
        if(chance<0.18)chance=0.18; if(chance>0.82)chance=0.82;
        var hit=Math.random()<chance;
        var dmg=Math.max(3, Math.round(atk.str*0.22 - dfn.def*0.12 + 4+Math.random()*8));
        var log=document.getElementById('flog');
        if(youFirst){
          if(hit){ ht=Math.max(0,ht-dmg); if(log) log.textContent=you+' '+blows[i%blows.length]+' with '+Y.w+' · -'+dmg; }
          else { if(log) log.textContent=name+' soaks it on '+T.a; }
        } else {
          if(hit){ hy=Math.max(0,hy-dmg); if(log) log.textContent=name+' '+blows[i%blows.length]+' with '+T.w+' · -'+dmg; }
          else { if(log) log.textContent=you+' soaks it on '+Y.a; }
        }
        var el=document.getElementById('hp-you'); if(el) el.style.width=hy+'%';
        var em=document.getElementById('hp-them'); if(em) em.style.width=ht+'%';
        if(i>=8 || hy<=0 || ht<=0){
          clearInterval(timer);
          var win=ht<hy || (ht===hy && Y.str>=T.str);
          var r=document.getElementById('fres'); if(r){ r.textContent=win?'You drop them':'You hit the floor'; r.style.color=win?'#f0d060':'#e23d4a'; }
          setTimeout(function(){ box.classList.remove('on'); if(done) done(); }, 900);
        }
      }, 340);
    }
    function hookCore(){
      if(typeof doHit==='function' && !doHit._h){
        var h=doHit;
        doHit=function(name){
          if(doHit._busy) return;
          doHit._busy=1;
          fightScene(name, function(){ h(name); doHit._busy=0; });
        };
        doHit._h=1;
      }
    }
    function hookPlay(){
      if(window._playHook) return; window._playHook=1;
      document.addEventListener('click',function(e){
        var t=e.target.closest('button,.btn,.tb,.dj');
        if(!t) return;
        if(t.classList.contains('tb') && typeof train==='function'){ e.preventDefault(); train(t.dataset.s); }
        if(t.classList.contains('dj') && typeof doJob==='function'){ e.preventDefault(); doJob(t.dataset.id); }
      });
      try{ if(typeof gym==='function') gym(); if(typeof rJ==='function') rJ(); }catch(err){}
    }
    function wire(){
      try{
        if(typeof auth==='function') auth();
        if(typeof nav==='function') nav();
        hookCore(); hookPlay();
      }catch(e){}
    }
    try{ document.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){}
    if(typeof load==='function') Promise.resolve(load()).then(wire).catch(wire); else wire();
  }).catch(fail);
})();
