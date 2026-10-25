(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeLabel = document.querySelector('.theme-label');
  const motionButton = document.querySelector('.motion-toggle');
  const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const colorMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const readPreference = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const writePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* The site also works without browser storage. */ } };
  const applyTheme = value => {
    root.dataset.theme = value;
    themeButton.setAttribute('aria-label', `Switch to ${value === 'dark' ? 'light' : 'dark'} theme`);
    themeLabel.textContent = value === 'dark' ? 'Lights off' : 'Lights on';
    document.querySelector('meta[name="theme-color"]').content = value === 'dark' ? '#20221f' : '#faf9f6';
  };
  const applyMotion = value => {
    const off = value === 'off' || motionMedia.matches;
    root.dataset.motion = off ? 'off' : 'on';
    motionButton.textContent = off ? 'Motion off' : 'Motion on';
    motionButton.setAttribute('aria-pressed', String(off));
    motionButton.disabled = motionMedia.matches;
    motionButton.setAttribute('aria-label', motionMedia.matches ? 'Animations paused to respect your system’s reduced-motion preference' : (off ? 'Enable decorative animations' : 'Pause decorative animations'));
    motionButton.title = motionMedia.matches ? 'Reduced motion follows your system preference' : 'Toggle decorative animations';
  };
  applyTheme(readPreference('maulik-theme') || (colorMedia.matches ? 'dark' : 'light'));
  applyMotion(readPreference('maulik-motion') || 'on');
  themeButton.addEventListener('click', () => { const value = root.dataset.theme === 'dark' ? 'light' : 'dark'; writePreference('maulik-theme', value); applyTheme(value); });
  motionButton.addEventListener('click', () => { const value = root.dataset.motion === 'off' ? 'on' : 'off'; writePreference('maulik-motion', value); applyMotion(value); });
  colorMedia.addEventListener('change', event => { if (!readPreference('maulik-theme')) applyTheme(event.matches ? 'dark' : 'light'); });
  motionMedia.addEventListener('change', () => applyMotion(readPreference('maulik-motion') || 'on'));

  document.querySelectorAll('.avatar-button').forEach(avatarButton => {
    let greetingTimeout;
    avatarButton.addEventListener('click', () => {
      clearTimeout(greetingTimeout);
      avatarButton.classList.add('is-greeting');
      document.querySelector('.greeting-status').textContent = 'Hey, thanks for stopping by!';
      greetingTimeout = setTimeout(() => avatarButton.classList.remove('is-greeting'), 1800);
    });
  });

  const interests = {
    exploring: 'A little less itinerary. A little more “what’s down that road?”',
    bikes: 'Me, my Trek Marlin 7 mountain bike and a trail. A very good reason to close the laptop.',
    photos: 'A small reminder to look a little closer at ordinary things.',
    cooking: 'Chhole and rice, or a dal-tadka loud enough to hear from the next room. Measurements are approximate. The ghee is not.',
    philosophy: 'Currently accepting questions that lead to even more questions.'
  };
  document.querySelectorAll('[data-interest]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-interest]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const note = document.querySelector('#interest-note');
    note.textContent = interests[button.dataset.interest];
    note.classList.remove('note-change');
    requestAnimationFrame(() => note.classList.add('note-change'));
  }));

  const email = 'maulikchaudhary5@gmail.com';
  document.querySelector('.copy-button').addEventListener('click', async () => {
    const status = document.querySelector('.copy-status');
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      status.textContent = 'Copied. See you in the inbox!';
    } catch {
      status.textContent = 'Copy isn’t available here. Select the email address above, or click it to say hello.';
    }
  });
  const navLinks = [...document.querySelectorAll('.navigation a')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  let scheduled = false;
  const updateNavigation = () => {
    let current = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top <= window.innerHeight * .35) current = section; });
    navLinks.forEach(link => {
      const active = link.hash === `#${current.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    const available = document.documentElement.scrollHeight - window.innerHeight;
    document.querySelector('.reading-progress').style.transform = `scaleX(${available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0})`;
    scheduled = false;
  };
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); } }, {passive:true});
  window.addEventListener('resize', updateNavigation);
  updateNavigation();
  document.querySelector('#year').textContent = String(new Date().getFullYear());
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.08});
    document.querySelectorAll('.section:not(.hero) .section-heading, .recent-projects, .journey, .notebook-placeholder').forEach(element => {
      element.classList.add('reveal-ready');
      observer.observe(element);
    });
  }
  document.querySelectorAll('.avatar-button').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (root.dataset.motion === 'off' || event.pointerType !== 'mouse') return;
      const box = button.getBoundingClientRect();
      button.style.setProperty('--portrait-tilt', `${((event.clientX - box.left) / box.width - .5) * 7}deg`);
    });
    button.addEventListener('pointerleave', () => button.style.setProperty('--portrait-tilt', '0deg'));
  });
})();

/* ───────── v2: pencil marks, local time, doodles & a small easter egg ───────── */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionOn = () => !reduced.matches && root.dataset.motion !== 'off';
  const NS = 'http://www.w3.org/2000/svg';
  const svgPath = d => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('pathLength', '1'); return p; };

  /* Pencil underline under every section title (each one a little different). */
  const lines = [
    'M2 6C40 2 90 3 140 5s70 1 96-1',
    'M2 4c50 3 110 3 170 0 28-1 48 1 64 3',
    'M2 7C60 2 120 6 170 3c26-2 48 0 64 2',
  ];
  document.querySelectorAll('.section-heading h2').forEach((h2, i) => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'pencil-line');
    svg.setAttribute('viewBox', '0 0 240 9');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.appendChild(svgPath(lines[i % lines.length]));
    h2.appendChild(svg);
  });

  /* Draw things in when they scroll into view. Without IntersectionObserver
     nothing is hidden, so every mark is simply already on the page. */
  if ('IntersectionObserver' in window) {
    const drawObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      drawObserver.unobserve(entry.target);
    }), {threshold: 0.4});
    document.querySelectorAll('.work-footnote, .notebook-placeholder').forEach(el => {
      el.classList.add('draw-ready');
      drawObserver.observe(el);
    });
    document.querySelectorAll('.section-heading').forEach(el => el.classList.add('draw-ready'));
  }

  /* Local time: Maulik's clock in India, the visitor's own clock when it differs,
     and a mood line for the time of day. Updates on the minute; click to shuffle. */
  const timeNote = document.querySelector('.local-time');
  const timeText = document.querySelector('.local-time-text');
  const hourHand = document.querySelector('.clock-hand.hour');
  const minuteHand = document.querySelector('.clock-hand.minute');
  const HOME = 'Asia/Kolkata';
  const moods = {
    dawn: [
      'early start. Chai first, questions later.',
      'the sun’s up, and so am I. Technically.',
      'morning walk, thinking in browser tabs.',
    ],
    morning: [
      'probably in class, nodding along to eigenvectors.',
      'fresh coffee, fresh bugs.',
      'deep in a Jupyter notebook, somewhere around cell 47.',
    ],
    noon: [
      'lunch. Possibly dal-tadka. Definitely more ghee than necessary.',
      'midday, running on rice and optimism.',
      'refuelling. The model can train without me for an hour.',
    ],
    afternoon: [
      'post-lunch, mid-experiment.',
      'fighting the afternoon slump with a second chai.',
      'watching a loss curve like it’s the last over of a cricket match.',
    ],
    evening: [
      'golden hour, so likely on the Trek chasing a sunset.',
      'classes wrapping up, side projects opening.',
      'evening walk. The best ideas show up without a laptop.',
    ],
    night: [
      'side-project hours.',
      'cooking chhole and debugging code, not necessarily in that order.',
      'dark mode on, in the editor and in the sky.',
    ],
    late: [
      'probably still debugging something. Or should be asleep.',
      'one more cell, then sleep. Probably.',
      'the house is quiet. The terminal isn’t.',
      'asking the big questions. The small ones are in the error log.',
    ],
  };
  const visitorNotes = {
    late: ['You’re up late too, I see.', 'Night owls, both of us.'],
    dawn: ['You’re up early. Respect.'],
    morning: ['Good morning to you.'],
    noon: ['Hope lunch was good.'],
    afternoon: ['Hope your afternoon’s going well.'],
    evening: ['Good evening to you.'],
    night: ['Hope your evening was a good one.'],
  };
  const period = h => h < 5 ? 'late' : h < 8 ? 'dawn' : h < 12 ? 'morning' : h < 14 ? 'noon' : h < 17 ? 'afternoon' : h < 20 ? 'evening' : h < 23 ? 'night' : 'late';
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const clockIn = (zone, now) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: zone, hour: 'numeric', minute: 'numeric', hourCycle: 'h23'}).formatToParts(now).map(p => [p.type, p.value]));
    return {h: Number(parts.hour), m: Number(parts.minute), label: now.toLocaleTimeString('en-US', {timeZone: zone, hour: 'numeric', minute: '2-digit'}).toLowerCase()};
  };
  let visitorZone = '';
  try { visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* unknown zone */ }
  const place = zone => zone.split('/').pop().replace(/_/g, ' ');
  const hand = (len, deg) => {
    const r = (deg - 90) * Math.PI / 180;
    return `M10 10L${(10 + Math.cos(r) * len).toFixed(2)} ${(10 + Math.sin(r) * len).toFixed(2)}`;
  };
  let lastPeriod = '', mood = '', note = '';
  const render = (shuffle = false) => {
    if (!timeText) return;
    const now = new Date();
    const home = clockIn(HOME, now);
    const homePeriod = period(home.h);
    if (shuffle || homePeriod !== lastPeriod) {
      const options = moods[homePeriod].filter(line => line !== mood);
      mood = pick(options.length ? options : moods[homePeriod]);
      lastPeriod = homePeriod;
    }
    let line;
    const esc = text => text.replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
    const blink = label => esc(label).replace(':', '<span class="tick-colon">:</span>');
    const away = visitorZone && /\//.test(visitorZone) ? clockIn(visitorZone, now) : null;
    if (!away || (away.h === home.h && away.m === home.m)) {
      line = `It’s ${blink(home.label)} here in India: ${esc(mood)}`;
    } else {
      if (shuffle || !note) note = pick(visitorNotes[period(away.h)]);
      line = `It’s ${blink(away.label)} in ${esc(place(visitorZone))} and ${blink(home.label)} here in India: ${esc(mood)} ${esc(note)}`;
    }
    timeText.innerHTML = line;
    hourHand.setAttribute('d', hand(3.8, (home.h % 12) * 30 + home.m / 2));
    minuteHand.setAttribute('d', hand(5.6, home.m * 6));
  };
  const everyMinute = () => {
    render();
    setTimeout(everyMinute, 60000 - (Date.now() % 60000) + 50);
  };
  everyMinute();
  if (timeNote) {
    timeNote.setAttribute('title', 'Click for another one');
    timeNote.setAttribute('role', 'button');
    timeNote.tabIndex = 0;
    timeNote.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); timeNote.click(); } });
    timeNote.addEventListener('click', () => {
      render(true);
      timeText.classList.remove('note-change');
      requestAnimationFrame(() => timeText.classList.add('note-change'));
    });
  }

  /* A small doodle for each interest. */
  const doodles = {
    exploring: ['M3 37C16 37 13 25 26 24s14-14 26-15', 'M52 2a5 5 0 0 1 5 5c0 5-5 10-5 10s-5-5-5-10a5 5 0 0 1 5-5z', 'M52 7h.01'],
    bikes: ['M5 28a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M41 28a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M14 28 25 13h16l9 15M25 13l8 15 8-15M33 28H14', 'M21 9h8M41 13l3-6h5'],
    cooking: ['M10 20h44v8c0 7-6 12-13 12H23c-7 0-13-5-13-12z', 'M4 22h6M54 22h6', 'M7 20h50', 'M24 14c-3-3 3-5 0-9', 'M32 14c-3-3 3-5 0-9', 'M40 14c-3-3 3-5 0-9'],
    photos: ['M8 13h12l4-6h16l4 6h12v25H8z', 'M24 25a8 8 0 1 0 16 0a8 8 0 1 0-16 0', 'M29 25a3 3 0 1 0 6 0a3 3 0 1 0-6 0', 'M50 18h3'],
    philosophy: ['M14 16c0-8 9-13 20-13s20 5 20 13-9 13-20 13c-4 0-7-1-10-2', 'M12 33a3 3 0 1 0 6 0a3 3 0 1 0-6 0', 'M5 39a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0', 'M29 12c0-4 9-4 9 0 0 3-4 3-4 7', 'M34 23v.5'],
  };
  const doodle = document.querySelector('.interest-doodle');
  const drawDoodle = key => {
    if (!doodle || !doodles[key]) return;
    doodle.replaceChildren(...doodles[key].map(svgPath));
    doodle.classList.remove('sketching');
    if (motionOn()) { void doodle.getBoundingClientRect(); doodle.classList.add('sketching'); }
  };
  const pressed = document.querySelector('[data-interest][aria-pressed="true"]');
  drawDoodle(pressed ? pressed.dataset.interest : 'exploring');
  document.querySelectorAll('[data-interest]').forEach(button => button.addEventListener('click', () => drawDoodle(button.dataset.interest)));

  /* Asterisks turn slowly as the page scrolls. */
  let spinQueued = false;
  const spin = () => { root.style.setProperty('--spin', motionOn() ? (window.scrollY * 0.12).toFixed(1) : '0'); spinQueued = false; };
  window.addEventListener('scroll', () => { if (!spinQueued) { spinQueued = true; requestAnimationFrame(spin); } }, {passive: true});
  spin();

  /* A little burst when the email is copied. */
  const copyButton = document.querySelector('.copy-button');
  const copyStatus = document.querySelector('.copy-status');
  if (copyButton && copyStatus) copyButton.addEventListener('click', () => {
    setTimeout(() => {
      if (!motionOn() || !copyStatus.textContent.startsWith('Copied')) return;
      for (let i = 0; i < 7; i++) {
        const star = document.createElement('span');
        const angle = (i / 7) * Math.PI * 2 + Math.random() * .4;
        const dist = 22 + Math.random() * 14;
        star.className = 'burst';
        star.textContent = '✳';
        star.setAttribute('aria-hidden', 'true');
        star.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        star.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
        copyButton.appendChild(star);
        star.addEventListener('animationend', () => star.remove());
      }
    }, 60);
  });

  /* Easter egg: type "hello" anywhere and the portrait says hi back. */
  let typed = '';
  document.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return;
    if (event.target.closest && event.target.closest('input, textarea, [contenteditable]')) return;
    typed = (typed + event.key.toLowerCase()).slice(-5);
    if (typed !== 'hello') return;
    typed = '';
    const visible = [...document.querySelectorAll('.avatar-button')].find(b => b.offsetParent !== null);
    if (!visible) return;
    if (visible.classList.contains('mobile-avatar')) visible.scrollIntoView({behavior: motionOn() ? 'smooth' : 'auto', block: 'center'});
    visible.click();
  });

  /* Wordmark: const_variable → maulik chaudhary → तत् त्वम् असि, then keeps
     alternating between const_variable and तत् त्वम् असि. Steps by grapheme so
     Devanagari conjuncts are typed whole, never half a letter. */
  const mark = document.querySelector('.wordmark-text');
  if (mark) {
    const HANDLE = 'const_variable', NAME = 'maulik chaudhary', SANSKRIT = 'तत् त्वम् असि';
    const split = text => (window.Intl && Intl.Segmenter)
      ? [...new Intl.Segmenter('sa', {granularity: 'grapheme'}).segment(text)].map(g => g.segment)
      : Array.from(text);
    const paint = (text, word) => {
      if (word === SANSKRIT) { mark.innerHTML = `<span class="sanskrit" lang="sa">${text}</span>`; return; }
      mark.innerHTML = text.replace('_', '<em>_</em>');
    };
    const sequence = [HANDLE, NAME, SANSKRIT];
    let index = 0, current = split(HANDLE), chars = current.length, deleting = true;
    const advance = () => {
      // First pass shows all three; afterwards it alternates handle ↔ Sanskrit.
      if (index === 0 && sequence.length === 3 && !advance.firstPassDone) { index = 1; return; }
      if (index === 1) { index = 2; advance.firstPassDone = true; return; }
      index = index === 2 ? 0 : 2;
    };
    const step = () => {
      if (!motionOn()) { index = 0; current = split(HANDLE); chars = current.length; deleting = true; paint(HANDLE, HANDLE); setTimeout(step, 1000); return; }
      const word = sequence[index];
      if (deleting) {
        chars--;
        paint(current.slice(0, chars).join(''), word);
        if (chars <= 0) { deleting = false; advance(); current = split(sequence[index]); setTimeout(step, 380); return; }
        setTimeout(step, 45);
      } else {
        chars++;
        paint(current.slice(0, chars).join(''), word);
        if (chars >= current.length) { deleting = true; setTimeout(step, word === SANSKRIT ? 3400 : 2600); return; }
        setTimeout(step, (word === SANSKRIT ? 150 : 85) + Math.random() * 60);
      }
    };
    paint(HANDLE, HANDLE);
    setTimeout(step, 2400);
  }

  try {
    console.log('%c✳ Hey, you found the console.', 'font: italic 15px Georgia, serif; color: #68724e');
    console.log('Curious how this was built? Say hello: maulikchaudhary5@gmail.com');
  } catch { /* no console, no problem */ }
})();
