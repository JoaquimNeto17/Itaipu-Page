(()=>{'use strict';
const q=s=>document.querySelector(s), qa=s=>Array.from(document.querySelectorAll(s));
const sections=qa('main > .slide');const nav=q('#mainNav');const menu=q('#menuToggle');
const preferReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const range=q('#projectLevel');range?.addEventListener('input',()=>{const v=+range.value;q('#projectLevelOut').textContent=v+'%';window.AlertaTank3D?.setLevel(v)});
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}
menu.addEventListener('click',()=>{let open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
qa('a[href^="#"]').forEach(a=>a.addEventListener('click',ev=>{const dest=q(a.getAttribute('href'));if(!dest)return;ev.preventDefault();closeMenu();dest.scrollIntoView({behavior:preferReduced?'instant':'smooth',block:'start'});history.replaceState(null,'',a.getAttribute('href'))}));
let ticking=false;function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;q('#progressFill').style.width=(max>0?scrollY/max*100:0)+'%';let active=0;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.55)active=i});q('#pageIndicator').textContent=String(active+1).padStart(2,'0')+' / '+String(sections.length).padStart(2,'0');qa('.topbar nav a').forEach(a=>a.classList.toggle('current',a.hash===('#'+sections[active].id)));ticking=false})}window.addEventListener('scroll',onScroll,{passive:true});onScroll();
const modal=q('#dashboardModal');q('#openDashboard')?.addEventListener('click',()=>modal.showModal());q('#closeDashboard')?.addEventListener('click',()=>modal.close());modal?.addEventListener('click',e=>{if(e.target===modal)modal.close()});
// Repetir a fotografia pelo endereço canônico se algum servidor de miniaturas falhar.
qa('.hero-photo img,.slide-photo img,.material-picture img').forEach(img=>img.addEventListener('error',()=>{
 if(!img.dataset.retried){
   img.dataset.retried='1';
   const url=img.src;
   if(url.includes('Itaipu_Dam')){img.src='https://commons.wikimedia.org/wiki/Special:Redirect/file/Itaipu_Dam%2C_aerial_photograph.jpg';return;}
   if(url.includes('Arduino_Uno_board')){img.src='https://commons.wikimedia.org/wiki/Special:Redirect/file/Arduino_Uno_board.jpg';return;}
 }
 img.closest('.hero-photo,.slide-photo,.material-picture')?.classList.add('photo-unavailable');
}));
// Configure o nome real do grupo aqui quando disponibilizado pela equipe.
const groupName='NOME DO GRUPO';q('#teamName').textContent=groupName;
function animate(){const reveals=qa('[data-reveal]');if(!window.gsap||!window.ScrollTrigger||preferReduced){reveals.forEach(el=>el.classList.add('visible'));return;}gsap.registerPlugin(ScrollTrigger);gsap.fromTo('.hero-copy h1',{y:34,autoAlpha:0},{y:0,autoAlpha:1,duration:1.2,ease:'power3.out',delay:.1});gsap.fromTo('.hero-photo',{scale:1.05,autoAlpha:0},{scale:1,autoAlpha:1,duration:1.5,ease:'power2.out',delay:.05});reveals.forEach(el=>gsap.fromTo(el,{autoAlpha:0,y:34},{autoAlpha:1,y:0,duration:1.0,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 84%',once:true}}));gsap.to('.hero-photo img',{scale:1.08,ease:'none',scrollTrigger:{trigger:'#inicio',start:'top top',end:'bottom top',scrub:1}});gsap.to('.slide-itaipu .slide-photo img',{scale:1.08,yPercent:-4,ease:'none',scrollTrigger:{trigger:'#itaipu',start:'top bottom',end:'bottom top',scrub:1}});gsap.utils.toArray('.material-card').forEach((c,i)=>gsap.fromTo(c,{opacity:0,y:24},{opacity:1,y:0,duration:.65,delay:i*.06,scrollTrigger:{trigger:'#materiais',start:'top 70%',once:true}}));}
if(document.readyState==='complete')animate();else addEventListener('load',animate,{once:true});
})();
