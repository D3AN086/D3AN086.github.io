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
    function wire(){
      try{
        if(typeof auth==='function') auth();
        if(typeof nav==='function') nav();
        if(typeof rDaily==='function') rDaily();
        if(typeof ui==='function') ui();
      }catch(e){}
    }
    try{ document.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){}
    if(typeof load==='function'){
      Promise.resolve(load()).then(wire).catch(wire);
    } else wire();
  }).catch(fail);
})();
