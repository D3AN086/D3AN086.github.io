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
      '#eq-bar{padding:10px}' +
      '#isl.ig{grid-template-columns:1fr;gap:8px}' +
      '#isl .ic{flex-direction:row;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 10px}' +
      '#isl .ic .icn{margin:0;width:34px;height:34px}' +
      '#g-events{margin-top:12px}' +
      '#fight-ring{position:fixed;inset:0;z-index:80;background:rgba(6,4,8,.94);display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px}' +
      '#fight-ring.on{display:flex}' +
      '#fight-ring .frs{display:flex;gap:16px;width:100%;max-width:420px}' +
      '#fight-ring .fp{flex:1;background:#120e14;border:1px solid #2a2a32;border-radius:14px;padding:14px;text-align:center}' +
      '#fight-ring .fp.you{border-color:rgba(212,175,55,.45)}' +
      '#fight-ring .fn{font-family:Cinzel,serif;color:#f0d060;font-size:16px}' +
      '#fight-ring .fs{font-size:11px;color:#8b8b9a;margin:6px 0 10px}' +
      '#fight-ring .bar{height:8px;background:#1a1a22;border-radius:99px;overflow:hidden}' +
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
    function fightScene(name, done){
      var t=G&&G.users&&G.users[name];
      if(!t){ if(done) done(); return; }
      var box=document.getElementById('fight-ring');
      if(!box){ box=document.createElement('div'); box.id='fight-ring'; document.body.appendChild(box); }
      var you=U&&U.username||'You';
      var ys=typeof liveStr==='function'?liveStr(U):(U.str||0);
      var yd=typeof liveDef==='function'?liveDef(U):(U.def||0);
      var ts=typeof liveStr==='function'?liveStr(t):(t.str||0);
      var td=typeof liveDef==='function'?liveDef(t):(t.def||0);
      box.innerHTML='<div class="frs"><div class="fp you"><div class="fn">'+you+'</div><div class="fs">STR '+ys+' · DEF '+yd+'</div><div class="bar"><i id="hp-you"></i></div></div><div class="vs">VS</div><div class="fp"><div class="fn">'+name+'</div><div class="fs">STR '+ts+' · DEF '+td+'</div><div class="bar"><i id="hp-them"></i></div></div></div><div class="flog" id="flog"></div><div class="fres" id="fres"></div>';
      box.classList.add('on');
      var hy=100, ht=100, i=0;
      var blows=['jabs','hooks','drives a knee','lands a shot','catches a counter'];
      var timer=setInterval(function(){
        i++;
        var youHit=Math.random()<(0.45+Math.max(-0.2,Math.min(0.2,(ys-td)/80)));
        var dmg=8+Math.floor(Math.random()*14);
        if(youHit){ ht=Math.max(0,ht-dmg); document.getElementById('flog').textContent=you+' '+blows[i%blows.length]+' · -'+dmg; }
        else { hy=Math.max(0,hy-dmg); document.getElementById('flog').textContent=name+' '+blows[i%blows.length]+' · -'+dmg; }
        var a=document.getElementById('hp-you'); if(a) a.style.width=hy+'%';
        var b=document.getElementById('hp-them'); if(b) b.style.width=ht+'%';
        if(i>=6 || hy<=0 || ht<=0){
          clearInterval(timer);
          var win=ht<=hy;
          var r=document.getElementById('fres'); if(r){ r.textContent=win?'You drop them':'You hit the floor'; r.style.color=win?'#f0d060':'#e23d4a'; }
          setTimeout(function(){ box.classList.remove('on'); if(done) done(); }, 900);
        }
      }, 320);
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
