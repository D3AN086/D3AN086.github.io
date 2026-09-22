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
      '#eq-bar h3{margin-bottom:6px}' +
      '#eq-bar .eq-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px}' +
      '#eq-bar .eq-slot{background:#0e0c10;border:1px solid #2a2a32;border-radius:10px;padding:8px 6px;text-align:center}' +
      '#eq-bar .eq-slot b{display:block;font-size:11px;color:#f0d060;margin-top:3px}' +
      '#eq-bar .eq-k{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#8b8b9a}' +
      '#isl.ig{grid-template-columns:1fr;gap:8px}' +
      '#isl .ic{flex-direction:row;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 10px}' +
      '#isl .ic .icn{margin:0;width:34px;height:34px;flex-shrink:0;border-radius:8px}' +
      '#isl .ic .icn i{font-size:14px}' +
      '#isl .ic h4{text-align:left;flex:1;min-width:30%;margin:0;font-size:13px;color:#f0d060}' +
      '#isl .ic .ds{display:none}' +
      '#isl .ic .mt{order:2;margin-left:auto;font-size:11px}' +
      '#isl .ic .ow{order:4;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#9dffc0}' +
      '#isl .ic .aa{order:5;width:100%;display:grid!important;grid-template-columns:1fr 1fr;gap:4px!important}' +
      '#isl .ic .aa .btn{width:100%;min-height:32px;font-size:11px;padding:6px}' +
      '#isl .ic.eqon{border-color:rgba(212,175,55,.55)}' +
      '#g-events{margin-top:12px}' +
      '#g-events .gev{font-size:12px;color:#c9c0b0;padding:6px 0;border-bottom:1px solid #222}' +
      '#g-events .gev b{color:#f0d060;font-weight:600}';
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
    function itemName(id){
      var it=(typeof I==='function'?I():[]).find(function(x){return x.id===id});
      return it&&it.name?it.name:id;
    }
    function gangLog(g,text){
      if(!g) return;
      if(!g.log) g.log=[];
      g.log.unshift({t:Date.now(),text:text});
      if(g.log.length>24) g.log=g.log.slice(0,24);
    }
    function returnLoans(g,username){
      if(!g||!g.loans) return;
      var keep=[];
      g.loans.forEach(function(loan){
        if(loan.user!==username){ keep.push(loan); return; }
        var pl=G.users&&G.users[username];
        if(pl){
          if(pl.eq){['weapon','armor','vehicle'].forEach(function(s){ if(pl.eq[s]===loan.id) pl.eq[s]=''; });}
          if(pl.inv) pl.inv=pl.inv.filter(function(x){return x!==loan.id;});
        }
        if(!g.armory) g.armory=[];
        g.armory.push(loan.id);
        gangLog(g, username+' left · '+itemName(loan.id)+' returned to the vault');
      });
      g.loans=keep;
    }
    function hookCore(){
      if(typeof donateToGang==='function' && !donateToGang._h){
        var d=donateToGang;
        donateToGang=function(id){
          d(id);
          var g=typeof myGang==='function'?myGang():null;
          if(g){ gangLog(g,(U&&U.username||'A member')+' donated '+itemName(id)); save(); }
        };
        donateToGang._h=1;
      }
      if(typeof doHit==='function' && !doHit._h){
        var h=doHit;
        doHit=function(name){
          h(name);
          try{
            var t=G&&G.users&&G.users[name];
            if(t&&t.gang&&G.gangs&&G.gangs[t.gang]){
              gangLog(G.gangs[t.gang], name+' was hit by '+(U&&U.username||'someone'));
              save();
            }
          }catch(e){}
        };
        doHit._h=1;
      }
    }
    function hookInv(){
      if(typeof rInv!=='function' || rInv._hooked) return;
      var prev=rInv;
      rInv=function(){
        prev.apply(this,arguments);
        var bar=document.getElementById('eq-bar');
        if(bar && U && typeof eqItem==='function'){
          var w=eqItem('weapon'),a=eqItem('armor'),v=eqItem('vehicle');
          var bonus='';
          try{ bonus='+'+bonusStr()+' STR · +'+bonusDef()+' DEF'; }catch(e){}
          bar.innerHTML='<h3>Loadout</h3><div class="eq-grid">'+
            '<div class="eq-slot"><div class="eq-k">Weapon</div><b>'+(w?w.name:'—')+'</b></div>'+
            '<div class="eq-slot"><div class="eq-k">Armor</div><b>'+(a?a.name:'—')+'</b></div>'+
            '<div class="eq-slot"><div class="eq-k">Ride</div><b>'+(v?v.name:'—')+'</b></div></div>'+
            '<p style="font-size:11px;color:#8b8b9a;margin-top:6px">'+bonus+'</p>';
        }
        document.querySelectorAll('#isl .ic').forEach(function(card){
          if(card.querySelector('.ow')) card.classList.add('eqon');
        });
      };
      rInv._hooked=1;
    }
    function hookGang(){
      if(typeof rGang!=='function' || rGang._hooked) return;
      var prev=rGang;
      rGang=function(){
        prev.apply(this, arguments);
        var root=document.getElementById('gang-root');
        if(!root) return;
        var g=typeof myGang==='function'?myGang():null;
        if(!document.getElementById('gpdepb')){
          var vaultLine=null, armTitle=null;
          root.querySelectorAll('p,h3').forEach(function(el){
            var tx=(el.textContent||'');
            if(el.tagName==='P' && tx.indexOf('Vault:')===0) vaultLine=el;
            if(el.tagName==='H3' && tx.indexOf('Armoury')===0) armTitle=el;
          });
          if(vaultLine){
            var prow=document.createElement('div');
            prow.className='fr'; prow.style.marginTop='8px';
            prow.innerHTML='<input id="gpdep" type="number" min="1" placeholder="Deposit points" style="background:#0a0a0e;color:#f2f2f5;border:1px solid #2a2a32;border-radius:8px;padding:10px;font-size:16px"><button type="button" class="btn p" id="gpdepb">Add points</button>';
            vaultLine.insertAdjacentElement('afterend', prow);
            document.getElementById('gpdepb').onclick=function(){
              var n=+document.getElementById('gpdep').value||0;
              if(!g){toast('No family');return;}
              if(n<1){toast('Enter points');return;}
              if((U.points||0)<n){toast('Need more points');return;}
              U.points-=n;g.points=(g.points||0)+n;
              gangLog(g,(U.username||'Member')+' deposited '+n+' points');
              save();ui();prev();toast('Vault +'+n+' points');
            };
          }
          if(armTitle){
            var box=document.createElement('div');
            box.className='fr'; box.style.margin='8px 0';
            var opts='<option value="">Your items</option>';
            var seen={};
            ((U&&U.inv)||[]).forEach(function(id){
              if(seen[id]) return; seen[id]=1;
              opts+='<option value="'+id+'">'+itemName(id)+'</option>';
            });
            box.innerHTML='<select id="gitem" style="flex:1;background:#0a0a0e;color:#f2f2f5;border:1px solid #2a2a32;border-radius:8px;padding:10px;font-size:16px">'+opts+'</select><button type="button" class="btn p" id="gitem-go">Donate item</button>';
            var p=armTitle.nextElementSibling;
            if(p&&p.tagName==='P') p.insertAdjacentElement('afterend', box);
            else armTitle.insertAdjacentElement('afterend', box);
            document.getElementById('gitem-go').onclick=function(){
              var id=document.getElementById('gitem').value;
              if(!id){toast('Pick an item');return;}
              if(typeof donateToGang==='function') donateToGang(id);
            };
          }
        }
        var leave=document.getElementById('gleave');
        if(leave){
          leave.onclick=function(){
            var fam=typeof myGang==='function'?myGang():null;
            var members=fam&&fam.members?Object.keys(fam.members):[];
            if(typeof myRank==='function' && myRank()==='Boss' && members.length>1){toast('Promote someone first');return;}
            if(fam){ returnLoans(fam, U.username); delete fam.members[U.username]; gangLog(fam, U.username+' left the family'); }
            if(fam && !Object.keys(fam.members||{}).length) delete G.gangs[fam.id];
            U.gang=''; save(); prev(); toast('Left');
          };
        }
        var old=document.getElementById('g-events');
        if(old) old.remove();
        if(g){
          var card=document.createElement('div');
          card.className='cd';
          card.id='g-events';
          var memOpts='<option value="">Loan to member</option>';
          Object.keys(g.members||{}).forEach(function(n){
            memOpts+='<option value="'+n+'">'+n+'</option>';
          });
          var armOpts='<option value="">Vault item</option>';
          (g.armory||[]).forEach(function(id,i){
            armOpts+='<option value="'+i+'">'+itemName(id)+'</option>';
          });
          var loans='';
          (g.loans||[]).forEach(function(loan){
            loans+='<div class="gev">On loan · <b>'+itemName(loan.id)+'</b> to '+loan.user+'</div>';
          });
          var feed='';
          (g.log||[]).forEach(function(ev){
            feed+='<div class="gev">'+ev.text+'</div>';
          });
          if(!feed) feed='<div class="gev">No events yet</div>';
          card.innerHTML='<h3>Family book</h3>'+
            '<div class="fr" style="margin:8px 0;gap:8px;flex-wrap:wrap">'+
            '<select id="gloan-item" style="flex:1;min-width:120px;background:#0a0a0e;color:#f2f2f5;border:1px solid #2a2a32;border-radius:8px;padding:10px">'+armOpts+'</select>'+
            '<select id="gloan-who" style="flex:1;min-width:120px;background:#0a0a0e;color:#f2f2f5;border:1px solid #2a2a32;border-radius:8px;padding:10px">'+memOpts+'</select>'+
            '<button type="button" class="btn p" id="gloan-go">Loan</button></div>'+
            loans+feed;
          root.appendChild(card);
          var go=document.getElementById('gloan-go');
          if(go) go.onclick=function(){
            var fam=typeof myGang==='function'?myGang():null;
            if(!fam) return;
            var ix=+document.getElementById('gloan-item').value;
            var who=document.getElementById('gloan-who').value;
            if(!who || isNaN(ix) || !fam.armory || !fam.armory[ix]){toast('Pick item and member');return;}
            var id=fam.armory[ix];
            fam.armory.splice(ix,1);
            var pl=G.users[who];
            if(!pl){toast('No such member');return;}
            if(!pl.inv) pl.inv=[];
            pl.inv.push(id);
            if(!fam.loans) fam.loans=[];
            fam.loans.push({user:who,id:id,t:Date.now()});
            gangLog(fam, 'Loaned '+itemName(id)+' to '+who);
            save(); prev(); toast('Loaned to '+who);
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
        hookCore();
        hookGang();
        hookInv();
      }catch(e){}
    }
    try{ document.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){}
    if(typeof load==='function') Promise.resolve(load()).then(wire).catch(wire);
    else wire();
  }).catch(fail);
})();
