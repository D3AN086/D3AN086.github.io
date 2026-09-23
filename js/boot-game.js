(function(){
  try{ if('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(function(rs){ rs.forEach(function(r){ r.unregister(); }); }); }catch(e){}
  var sources=[
    'empire.html?v=admin3',
    'DowntownEmpire.html?v=admin3',
    'https://raw.githubusercontent.com/D3AN086/D3AN086.github.io/2bd2a9c9c174e664961d61ff599f2809ddcb8960/Index.html'
  ];
  var msg=document.getElementById('msg');
  function fail(){
    if(msg) msg.textContent='Could not load Downtown Empire.';
  }
  function next(i){
    if(i>=sources.length){ fail(); return; }
    fetch(sources[i],{cache:'no-store'}).then(function(r){
      if(!r.ok) throw new Error('bad');
      return r.text();
    }).then(boot).catch(function(){ next(i+1); });
  }
  function boot(html){
    var css='#p-admin .pb{padding-top:8px}#amn.am{position:sticky;top:0;z-index:8;display:flex;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;gap:6px;padding:6px 0 10px;margin-bottom:8px;background:#0a0a0c}#amn.am button{flex:0 0 auto;min-height:44px;min-width:92px;padding:10px 12px;touch-action:manipulation}#p-admin .btn,#p-admin button{min-height:44px;touch-action:manipulation}#p-admin input,#p-admin select,#p-admin textarea{min-height:40px;font-size:16px}#p-admin .aa{position:sticky;bottom:70px;z-index:7;background:#0a0a0c;padding:8px 0}';
    html=html.replace('</style>', css+'</style>');
    var parsed=new DOMParser().parseFromString(html,'text/html');
    var gameScript='';
    parsed.querySelectorAll('script').forEach(function(s){
      if(!s.src) gameScript+=s.textContent+'\n';
      s.remove();
    });
    document.head.innerHTML=parsed.head.innerHTML;
    document.body.innerHTML=parsed.body.innerHTML;
    var run=document.createElement('script');
    run.textContent=gameScript;
    document.body.appendChild(run);
    document.addEventListener('click',function(e){
      var tab=e.target&&e.target.closest&&e.target.closest('#amn button[data-a]');
      if(!tab)return;
      e.preventDefault();e.stopPropagation();
      document.querySelectorAll('#amn button').forEach(function(x){x.classList.remove('on')});
      document.querySelectorAll('#p-admin .ap').forEach(function(x){x.classList.remove('on');x.style.display='none'});
      tab.classList.add('on');
      var panel=document.getElementById('a-'+tab.getAttribute('data-a'));
      if(panel){panel.classList.add('on');panel.style.display='block'}
      if(typeof rAd==='function') rAd();
    },true);
    function after(){
      try{ if(typeof admin==='function') admin(); }catch(e){}
      try{ if(typeof auth==='function') auth(); }catch(e){}
      try{ if(typeof nav==='function') nav(); }catch(e){}
    }
    if(typeof load==='function') Promise.resolve(load()).then(after).catch(after);
    else after();
  }
  next(0);
})();
