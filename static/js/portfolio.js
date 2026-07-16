const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- marquee ---- */
const items = ['Frontend engineering','React & Next.js','Design systems','React Native','AI & Data Science','Mentorship'];
const track = document.getElementById('track');
const line = items.map(t=>`<span>${t} <i>◆</i></span>`).join('');
track.innerHTML = line + line;

/* ---- scroll reveal ---- */
const io = new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}
}),{threshold:.15});
document.querySelectorAll('.rv').forEach((el,i)=>{el.style.transitionDelay=(i%5)*60+'ms';io.observe(el)});

/* ---- HUD readouts + parallax ---- */
const rail=document.getElementById('rail'), scrl=document.getElementById('scrl'),
      secname=document.getElementById('secname'), media=document.getElementById('heroMedia');
const secs=[...document.querySelectorAll('#intro,#about,#resume,#contact')];
function onScroll(){
  const max=document.body.scrollHeight-innerHeight;
  const p=max>0?scrollY/max:0;
  rail.style.width=(p*100)+'%';
  scrl.textContent=p.toFixed(2);
  if(!RM) media.style.transform=`translateY(${Math.min(scrollY,innerHeight)*0.22}px)`;
  let cur=secs[0];
  for(const s of secs){ if(s.getBoundingClientRect().top<=innerHeight*0.4) cur=s; }
  secname.textContent=cur.id.toUpperCase();
  document.querySelectorAll('.navlink').forEach(a=>a.classList.toggle('on',a.dataset.sec===cur.id));
}
addEventListener('scroll',()=>requestAnimationFrame(onScroll),{passive:true}); onScroll();

/* ---- clock ---- */
setInterval(()=>{
  const d=new Date().toLocaleTimeString('en-GB',{timeZone:'Asia/Kolkata',hour12:false});
  document.getElementById('clock').textContent=d+' IST';
},1000);

/* ---- cursor + pointer readout ---- */
const cur=document.getElementById('cur'), crsr=document.getElementById('crsr');
let tx=0,ty=0,cx=0,cy=0;
addEventListener('mousemove',e=>{
  tx=e.clientX;ty=e.clientY;
  crsr.textContent=(e.clientX/innerWidth).toFixed(2)+' '+(e.clientY/innerHeight).toFixed(2);
});
(function loop(){
  cx+=(tx-cx)*.2; cy+=(ty-cy)*.2;
  cur.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.chip').forEach(el=>{
  el.addEventListener('mouseenter',()=>cur.classList.add('big'));
  el.addEventListener('mouseleave',()=>cur.classList.remove('big'));
});
addEventListener('mouseleave',()=>cur.classList.add('hide'));
addEventListener('mouseenter',()=>cur.classList.remove('hide'));

/* ---- form ---- */
document.getElementById('form').addEventListener('submit',e=>{
  e.preventDefault();
  const t=document.getElementById('sendtxt');
  t.textContent='Opening mail ↗';
  setTimeout(()=>t.textContent='Send ↗',2000);
});
