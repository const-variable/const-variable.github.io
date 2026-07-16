const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- typing hero name ---- */
(function(){
  const name = document.getElementById('heroName');
  if(!name) return;
  const lines = name.querySelectorAll('.ln .ty');
  const caret = document.getElementById('caret');
  const l1 = lines[0], l2 = lines[1];
  const w1 = 'const_', w2 = 'variable';
  function render(el, w, n){
    el.innerHTML = w.slice(0, n).replace('_', '<em>_</em>');
  }
  if(RM){
    render(l1, w1, w1.length);
    render(l2, w2, w2.length);
    l2.after(caret);
    return;
  }
  let i = 0;
  const total = w1.length + w2.length;
  (function tick(){
    if(i < w1.length){
      i++;
      render(l1, w1, i);
    } else if(i < total){
      const n = i - w1.length + 1;
      render(l2, w2, n);
      if(n === 1) l2.after(caret);
      i++;
    } else {
      return;
    }
    setTimeout(tick, 95);
  })();
})();

/* ---- hero halftone canvas: dappled light through canopy, follows pointer ---- */
(function(){
  const wrap = document.getElementById('heroMedia');
  const img = document.getElementById('heroImg');
  const canvas = document.getElementById('heroCanvas');
  if(!wrap || !img || !canvas || RM) return;
  const ctx = canvas.getContext('2d');
  const SCALE = 7;
  const GLOW_R2 = 700;
  const BG = [11,13,12], INK = [237,234,227], ACCENT = [217,194,126];
  const BAYER = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
  let cols = 0, rows = 0, lum = null, imgData = null, ready = false;
  let mx = -9999, my = -9999, visible = true, raf = 0;

  function lerp(a, b, t){ return a + (b - a) * t; }

  function sample(){
    if(!img.complete || !img.naturalWidth || !cols || !rows) return;
    const off = document.createElement('canvas');
    off.width = cols; off.height = rows;
    const octx = off.getContext('2d');
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cols / iw, rows / ih);
    const dw = iw * scale, dh = ih * scale;
    octx.drawImage(img, (cols - dw) * .6, (rows - dh) * .4, dw, dh);
    const data = octx.getImageData(0, 0, cols, rows).data;
    lum = new Float32Array(cols * rows);
    let min = 1, max = 0;
    for(let i = 0; i < cols * rows; i++){
      const v = (data[i*4] * .2126 + data[i*4+1] * .7152 + data[i*4+2] * .0722) / 255;
      lum[i] = v; if(v < min) min = v; if(v > max) max = v;
    }
    const range = Math.max(.08, max - min);
    for(let i = 0; i < lum.length; i++){
      lum[i] = Math.pow(Math.min(1, Math.max(0, (lum[i] - min) / range)), .9);
    }
    ready = true;
  }

  function resize(){
    const r = wrap.getBoundingClientRect();
    cols = Math.max(1, Math.round(r.width / SCALE));
    rows = Math.max(1, Math.round(r.height / SCALE));
    canvas.width = cols; canvas.height = rows;
    imgData = ctx.createImageData(cols, rows);
    sample();
  }

  function frame(t){
    if(!visible){ raf = 0; return; }
    if(ready){
      const d = imgData.data;
      const tt = t * 4e-4;
      for(let y = 0; y < rows; y++){
        for(let x = 0; x < cols; x++){
          const i = y * cols + x;
          const swirl = Math.sin(x*.09 + tt*.8) + Math.sin(y*.11 - tt*.6) + Math.sin((x+y)*.05 + tt*.4);
          let v = lum[i] + swirl * 0.018;
          const ddx = x - mx, ddy = y - my;
          const dist2 = ddx*ddx + ddy*ddy;
          let glow = 0;
          if(dist2 < GLOW_R2){ glow = 1 - dist2 / GLOW_R2; v += glow * 0.5; }
          const dith = (BAYER[y & 3][x & 3] / 16 - .5) / 9;
          v = Math.min(1, Math.max(0, v + dith));
          let r = lerp(BG[0], INK[0], v) | 0, g = lerp(BG[1], INK[1], v) | 0, b = lerp(BG[2], INK[2], v) | 0;
          if(glow > 0.12){
            r = lerp(r, ACCENT[0], Math.min(1, glow)) | 0;
            g = lerp(g, ACCENT[1], Math.min(1, glow)) | 0;
            b = lerp(b, ACCENT[2], Math.min(1, glow)) | 0;
          }
          const o = i * 4;
          d[o] = r; d[o+1] = g; d[o+2] = b; d[o+3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
    raf = requestAnimationFrame(frame);
  }

  function onMove(e){
    const r = canvas.getBoundingClientRect();
    mx = (e.clientX - r.left) / SCALE;
    my = (e.clientY - r.top) / SCALE;
  }
  function onLeave(){ mx = -9999; my = -9999; }

  if(img.complete) resize(); else img.addEventListener('load', resize);
  window.addEventListener('resize', resize);
  wrap.addEventListener('pointermove', onMove, {passive: true});
  wrap.addEventListener('pointerleave', onLeave);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if(visible && !raf) raf = requestAnimationFrame(frame);
  }).observe(canvas);
  raf = requestAnimationFrame(frame);
})();

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
