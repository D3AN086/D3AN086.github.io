(function(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations().then(function(rs){
      rs.forEach(function(r){ r.unregister(); });
    });
  }
  var src='https://raw.githubusercontent.com/D3AN086/D3AN086.github.io/2bd2a9c9c174e664961d61ff599f2809ddcb8960/Index.html';
  var msg=document.getElementById('msg');
  fetch(src,{cache:'no-store'}).then(function(r){
    if(!r.ok) throw new Error('bad');
    return r.text();
  }).then(function(html){
    var css = '#next-card,#heat-card,#rival-card,#event-card,.rival-card,.next-card,#p-dashboard .cd:has(#dn){display:none!important}' +
      '#daily-card{display:block!important}';
    html=html.replace('</style>', css + '</style>');
    html=html.replace('Your empire starts here','The corner is yours');
    var parsed=new DOMParser().parseFromString(html,'text/html');
    var gameScript='';
    parsed.querySelectorAll('script').forEach(function(s){
      if(!s.src) gameScript += s.textContent + '\n';
      s.remove();
    });
    document.documentElement.setAttribute('lang','en');
    document.head.innerHTML=parsed.head.innerHTML;
    document.body.innerHTML=parsed.body.innerHTML;
    var run=document.createElement('script');
    run.text=gameScript;
    document.body.appendChild(run);
  }).catch(function(err){
    if(msg) msg.textContent='Could not load Downtown Empire. Refresh and try again.';
    else document.body.innerHTML='<p style="padding:24px;color:#ccc">Could not load Downtown Empire.</p>';
  });
})();
