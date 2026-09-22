(function(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations().then(function(rs){
      rs.forEach(function(r){ r.unregister(); });
    });
  }
  var src='https://raw.githubusercontent.com/D3AN086/D3AN086.github.io/2bd2a9c9c174e664961d61ff599f2809ddcb8960/Index.html';
  function fail(t){
    document.body.innerHTML='<p style="padding:24px;color:#c9c0b0;font-family:system-ui">'+(t||'Could not load Downtown Empire.')+'</p>';
  }
  fetch(src,{cache:'no-store'}).then(function(r){
    if(!r.ok) throw new Error('bad');
    return r.text();
  }).then(function(html){
    var css = '#next-card,#heat-card,#rival-card,#event-card,.rival-card,.next-card,#p-dashboard .cd:has(#dn){display:none!important}' +
      '#daily-card{display:block!important}' +
      '.chat-fab{display:none!important}';
    html=html.replace('</style>', css + '</style>');
    html=html.replace('Your empire starts here','The corner is yours');
    var parsed=new DOMParser().parseFromString(html,'text/html');
    var gameScript='';
    parsed.querySelectorAll('script').forEach(function(s){
      if(!s.src) gameScript += s.textContent + '\n';
      s.remove();
    });
    document.head.innerHTML=parsed.head.innerHTML;
    document.body.innerHTML=parsed.body.innerHTML;
    var run=document.createElement('script');
    run.textContent=gameScript;
    document.body.appendChild(run);
    function wire(){
      try{
        if(typeof auth==='function') auth();
        if(typeof nav==='function') nav();
        if(typeof gym==='function') gym();
        if(typeof bank==='function') bank();
        if(typeof admin==='function') admin();
        if(typeof setupBars==='function') setupBars();
      }catch(e){}
      document.addEventListener('click',function(e){
        var t=e.target.closest('button,.btn,.lg-enter,.lg-link');
        if(!t) return;
        if(t.id==='bl'){ e.preventDefault(); if(typeof login==='function') login(); }
        if(t.id==='br'){ e.preventDefault(); if(typeof reg==='function') reg(); }
        if(t.id==='bv'){ e.preventDefault(); if(typeof confirmEmail==='function') confirmEmail(); }
        if(t.id==='btab-reg'){ var rf=document.getElementById('rf'); if(rf) rf.classList.toggle('hidden'); }
      });
    }
    try{
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }catch(e){}
    if(typeof load==='function'){
      Promise.resolve(load()).then(wire).catch(wire);
    } else {
      wire();
    }
  }).catch(function(){ fail(); });
})();
