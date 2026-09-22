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
    var css = '#next-card,#heat-card,#rival-card,#event-card,.rival-card,.next-card,#p-dashboard .cd:has(#dn){display:none!important}.chat-fab{display:none!important}';
    html=html.replace('</style>', css + '</style>');
    html=html.replace('Your empire starts here','The corner is yours');
    var parsed=new DOMParser().parseFromString(html,'text/html');
    var gameScript='';
    parsed.querySelectorAll('script').forEach(function(s){
      if(!s.src) gameScript += s.textContent + '\n';
      s.remove();
    });
    gameScript=gameScript.replace('let U=null,G=null;','let U=null,G={set:{},users:{}};');
    gameScript=gameScript.replace('function S(){\n  if(!G.set)G.set={};','function S(){ if(!G) G={}; if(!G.set) G.set={};');
    gameScript=gameScript.replace("if(apay){apay.value=(S().payLink||'');}","if(apay && G){apay.value=((S()||{}).payLink||'');}");
    gameScript=gameScript.replace(
      "Object.values(G.users).forEach(u=>{",
      "Object.values(G.users||{}).filter(function(u){return u&&!u.npc&&isOnline(u);}).forEach(u=>{"
    );
    document.head.innerHTML=parsed.head.innerHTML;
    document.body.innerHTML=parsed.body.innerHTML;
    var run=document.createElement('script');
    run.textContent=gameScript;
    document.body.appendChild(run);
    function addVaultPoints(){
      if(typeof rGang!=='function' || rGang._pts) return;
      var prev=rGang;
      rGang=function(){
        prev.apply(this,arguments);
        var root=document.getElementById('gang-root');
        if(!root || document.getElementById('gpdepb')) return;
        var vaultLine=null;
        root.querySelectorAll('p').forEach(function(p){
          if((p.textContent||'').indexOf('Vault:')===0) vaultLine=p;
        });
        if(!vaultLine) return;
        var row=document.createElement('div');
        row.className='fr';
        row.style.marginTop='8px';
        row.innerHTML='<input id="gpdep" type="number" min="1" placeholder="Deposit points" style="background:#0a0a0e;color:#f2f2f5;border:1px solid #2a2a32;border-radius:8px;padding:10px;font-size:16px"><button type="button" class="btn p" id="gpdepb">Add points</button>';
        vaultLine.insertAdjacentElement('afterend', row);
        document.getElementById('gpdepb').onclick=function(){
          var n=+document.getElementById('gpdep').value||0;
          if(!U || !U.gang || !G || !G.gangs || !G.gangs[U.gang]){toast('No family');return;}
          var g=G.gangs[U.gang];
          if(n<1){toast('Enter points');return;}
          if((U.points||0)<n){toast('Need more points');return;}
          U.points-=n;
          g.points=(g.points||0)+n;
          save();ui();prev();toast('Vault +'+n+' points');
        };
      };
      rGang._pts=1;
    }
    function wire(){
      try{
        if(typeof auth==='function') auth();
        if(typeof nav==='function') nav();
        if(typeof rDaily==='function') rDaily();
        if(typeof ui==='function') ui();
        addVaultPoints();
      }catch(e){}
    }
    try{ document.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){}
    if(typeof load==='function'){
      Promise.resolve(load()).then(wire).catch(wire);
    } else wire();
  }).catch(fail);
})();
