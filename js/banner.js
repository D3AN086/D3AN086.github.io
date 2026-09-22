(function(){
  function addCss(){
    if(document.getElementById('empire-banner-css')) return;
    var l=document.createElement('link');
    l.id='empire-banner-css';
    l.rel='stylesheet';
    l.href='banner.css';
    document.head.appendChild(l);
  }
  function addLoginSky(){
    var panel=document.querySelector('.lg-panel');
    if(!panel||document.querySelector('.lg-sky')) return;
    var d=document.createElement('div');
    d.className='lg-sky';
    d.innerHTML='<div class="art"></div><div class="mark"><span>EST. THE FAMILY</span><b>Downtown Empire</b></div>';
    panel.insertBefore(d, panel.firstChild);
  }
  function addGameBanner(){
    var game=document.getElementById('game');
    if(!game||document.getElementById('empire-banner')) return;
    var b=document.createElement('div');
    b.id='empire-banner';
    b.className='empire-banner';
    b.innerHTML='<div class="art"></div><div class="shade"></div><div class="copy"><div class="kicker">The Family</div><div class="title">Downtown Empire</div><div class="city" id="banner-city">New York</div></div>';
    game.insertBefore(b, game.firstChild);
  }
  function go(){ addCss(); addLoginSky(); addGameBanner(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
