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
    var css='#next-card,#heat-card,#rival-card,#event-card,.rival-card,.next-card,#p-dashboard .cd:has(#dn){display:none!important}.chat-fab{display:none!important}';
    html=html.replace('</style>', css+'</style>');
    html=html.replace('Your empire starts here','The corner is yours');
    var parsed=new DOMParser().parseFromString(html,'text/html');
    var gameScript='';
    parsed.querySelectorAll('script').forEach(function(s){
      if(!s.src) gameScript += s.textContent + '\n';
      s.remove();
    });
    gameScript=gameScript.replace('let U=null,G=null;','let U=null,G={set:{},users:{}};');
    gameScript=gameScript.replace("if(apay){apay.value=(S().payLink||'');}","if(apay && G){apay.value=((S()||{}).payLink||'');}");
    document.head.innerHTML=parsed.head.innerHTML;
    document.body.innerHTML=parsed.body.innerHTML;
    var run=document.createElement('script');
    run.textContent=gameScript;
    document.body.appendChild(run);
    function hookGang(){
      if(typeof rGang!=='function' || rGang._hooked) return;
      var prev=rGang;
      rGang=function(){
        prev.apply(this, arguments);
        var root=document.getElementById('gang-root');
        if(!root) return;
        if(document.getElementById('gpdepb')) return;
        var vaultLine=null, armTitle=null;
        root.querySelectorAll('p,h3').forEach(function(el){
          var tx=(el.textContent||'');
          if(el.tagName==='P' && tx.indexOf('Vault:')===0) vaultLine=el;
          if(el.tagName==='H3' && tx.indexOf('Armoury')===0) armTitle=el;
        });
        if(vaultLine){
          var prow=document.createElement('div');
          prow.className='fr';
          prow.style.marginTop='8px';
          prow.innerHTML='<input id="gpdep" type="number" min="1" placeholder="Deposit points" style="background:#0a0a0e;color:#f2f2f5;border:1px solid #2a2a32;border-radius:8px;padding:10px;font-size:16px"><button type="button" class="btn p" id="gpdepb">Add points</button>';
          vaultLine.insertAdjacentElement('afterend', prow);
          document.getElementById('gpdepb').onclick=function(){
            var n=+document.getElementById('gpdep').value||0;
            if(!U||!U.gang||!G||!G.gangs||!G.gangs[U.gang]){toast('No family');return;}
            var g=G.gangs[U.gang];
            if(n<1){toast('Enter points');return;}
            if((U.points||0)<n){toast('Need more points');return;}
            U.points-=n;g.points=(g.points||0)+n;save();ui();prev();toast('Vault +'+n+' points');
          };
        }
        if(armTitle){
          var box=document.createElement('div');
          box.className='fr';
          box.style.margin='8px 0';
          var opts='<option value="">Your items</option>';
          var inv=(U&&U.inv)||[];
          var seen={};
          inv.forEach(function(id){
            if(seen[id]) return; seen[id]=1;
            var it=(typeof I==='function'?I():[]).find(function(x){return x.id===id});
            opts+='<option value="'+id+'">'+(it&&it.name?it.name:id)+'</option>';
          });
          box.innerHTML='<select id="gitem" style="flex:1;background:#0a0a0e;color:#f2f2f5;border:1px solid #2a2a32;border-radius:8px;padding:10px;font-size:16px">'+opts+'</select><button type="button" class="btn p" id="gitem-go">Donate item</button>';
          var p=armTitle.nextElementSibling;
          if(p&&p.tagName==='P') p.insertAdjacentElement('afterend', box);
          else armTitle.insertAdjacentElement('afterend', box);
          document.getElementById('gitem-go').onclick=function(){
            var id=document.getElementById('gitem').value;
            if(!id){toast('Pick an item');return;}
            if(typeof donateToGang==='function') donateToGang(id);
            else toast('Cannot donate');
          };
        }
      };
      rGang._hooked=1;
    }
    function wire(){
      try{
        if(typeof auth==='function') auth();
        if(typeof nav==='function') nav();
        if(typeof rDaily==='function') rDaily();
        hookGang();
      }catch(e){}
    }
    try{ document.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){}
    if(typeof load==='function') Promise.resolve(load()).then(wire).catch(wire);
    else wire();
  }).catch(fail);
})();
