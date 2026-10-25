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
  // Two motion modes. The system's reduced-motion setting picks the default;
  // visitors can switch either way. Older saved values ('on'/'off') still work.
  const normaliseMotion = value => value === 'on' ? 'full' : value === 'off' ? 'reduced' : value;
  const applyMotion = value => {
    const mode = value === 'reduced' ? 'reduced' : 'full';
    root.dataset.motion = mode;
    motionButton.textContent = mode === 'full' ? 'Full motion' : 'Reduced motion';
    motionButton.setAttribute('aria-pressed', String(mode === 'reduced'));
    motionButton.disabled = false;
    motionButton.setAttribute('aria-label', mode === 'full' ? 'Full motion. Switch to reduced motion' : 'Reduced motion. Switch to full motion');
    motionButton.title = mode === 'full' ? 'Switch to reduced motion' : 'Switch to full motion';
  };
  const defaultMotion = () => normaliseMotion(readPreference('maulik-motion')) || (motionMedia.matches ? 'reduced' : 'full');
  applyTheme(readPreference('maulik-theme') || (colorMedia.matches ? 'dark' : 'light'));
  applyMotion(defaultMotion());
  themeButton.addEventListener('click', () => { const value = root.dataset.theme === 'dark' ? 'light' : 'dark'; writePreference('maulik-theme', value); applyTheme(value); });
  motionButton.addEventListener('click', () => { const value = root.dataset.motion === 'full' ? 'reduced' : 'full'; writePreference('maulik-motion', value); applyMotion(value); });
  colorMedia.addEventListener('change', event => { if (!readPreference('maulik-theme')) applyTheme(event.matches ? 'dark' : 'light'); });
  motionMedia.addEventListener('change', () => applyMotion(defaultMotion()));

  document.querySelectorAll('.avatar-button').forEach(avatarButton => {
    let greetingTimeout;
    avatarButton.addEventListener('click', () => {
      clearTimeout(greetingTimeout);
      avatarButton.classList.add('is-greeting');
      document.querySelector('.greeting-status').textContent = 'Hey, thanks for stopping by!';
      greetingTimeout = setTimeout(() => avatarButton.classList.remove('is-greeting'), 2600);
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
      clearTimeout(status.clearTimer);
      status.clearTimer = setTimeout(() => { status.textContent = ''; }, 3500);
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
      if (root.dataset.motion !== 'full' || event.pointerType !== 'mouse') return;
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
  // Heavy effects (drawing, typing, flipping, spinning, bursts, smooth scroll) run in Full motion only.
  const motionOn = () => root.dataset.motion === 'full';
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

  /* Local time: the line leads with the visitor's time when it differs from India,
     the tiny clock always shows India time. Updates on the minute; tap to flip. */
  const timeNote = document.querySelector('.local-time');
  const timeText = document.querySelector('.local-time-text');
  const hourHand = document.querySelector('.clock-hand.hour');
  const minuteHand = document.querySelector('.clock-hand.minute');
  const HOME = 'Asia/Kolkata';
  // Mood lines for the time of day in India, with a separate set for weekends.
  const moods = {
    weekday: {
      dawn: [
        'early start. Chai first, questions later.',
        'up early, pretending it was the plan all along.',
        'morning walk, thinking in browser tabs.',
      ],
      morning: [
        'probably in class, nodding along to eigenvectors.',
        'fresh coffee, fresh bugs.',
        'deep in a Jupyter notebook, somewhere around cell 47.',
      ],
      noon: [
        'lunch break. The model can train without me for an hour.',
        'midday, running on rice and optimism.',
        'canteen queue, mentally debugging this morning’s code.',
      ],
      afternoon: [
        'post-lunch, mid-experiment.',
        'fighting the afternoon slump with a second chai.',
        'watching a loss curve like it’s the last over of a cricket match.',
      ],
      evening: [
        'classes wrapping up, side projects opening.',
        'evening walk. The best ideas show up without a laptop.',
        'chai, a short walk, then back to the assignment.',
      ],
      night: [
        'side-project hours.',
        'cooking dinner and debugging code, not necessarily in that order.',
        'dark mode on, in the editor and in the sky.',
      ],
      late: [
        'probably still debugging something. Or should be asleep.',
        'one more cell, then sleep. Probably.',
        'the house is quiet. The terminal isn’t.',
        'asking the big questions. The small ones are in the error log.',
      ],
    },
    weekend: {
      dawn: [
        'it’s the weekend, but the alarm didn’t get the memo.',
        'quiet weekend morning. Good light for photos.',
      ],
      morning: [
        'no class today. Slow breakfast, long reading list.',
        'weekend morning, probably out on the bicycle before it gets hot.',
      ],
      noon: [
        'weekend lunch: dal-tadka, rice and zero deadlines.',
        'cooking something that takes too long and is worth it.',
      ],
      afternoon: [
        'weekend afternoon. Nap or notebook, still deciding.',
        'catching up on lectures I promised to rewatch.',
      ],
      evening: [
        'out exploring a corner of the city I haven’t seen yet.',
        'evening walk, camera in pocket.',
      ],
      night: [
        'weekend side project. The fun kind, with no deadline.',
        'chhole and rice for dinner. The weekend tradition holds.',
      ],
      late: [
        'it’s the weekend, so bedtime is negotiable.',
        'one more episode, one more cell. Then sleep. Probably.',
      ],
    },
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
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: zone, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'}).formatToParts(now).map(p => [p.type, p.value]));
    return {h: Number(parts.hour) % 24, m: Number(parts.minute), weekend: parts.weekday === 'Sat' || parts.weekday === 'Sun', label: now.toLocaleTimeString('en-US', {timeZone: zone, hour: 'numeric', minute: '2-digit'}).toLowerCase()};
  };
  let visitorZone = '';
  try { visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* unknown zone */ }
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
    const set = moods[home.weekend ? 'weekend' : 'weekday'][homePeriod];
    const key = (home.weekend ? 'weekend-' : '') + homePeriod;
    if (shuffle || key !== lastPeriod) {
      const options = set.filter(line => line !== mood);
      mood = pick(options.length ? options : set);
      lastPeriod = key;
    }
    let line;
    const esc = text => text.replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
    const blink = label => esc(label).replace(':', '<span class="tick-colon">:</span>');
    const away = visitorZone && /\//.test(visitorZone) ? clockIn(visitorZone, now) : null;
    if (!away || (away.h === home.h && away.m === home.m)) {
      line = `It’s ${blink(home.label)} here in India: ${esc(mood)}`;
    } else {
      if (shuffle || !note) note = pick(visitorNotes[period(away.h)]);
      line = `It’s ${blink(away.label)} where you are, but ${blink(home.label)} here in India: ${esc(mood)} ${esc(note)}`;
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
    // Tap: the line flips over like a card and comes back with a new one.
    let flipping = false;
    timeNote.addEventListener('click', () => {
      if (!motionOn()) {
        render(true);
        timeText.classList.remove('note-change');
        requestAnimationFrame(() => timeText.classList.add('note-change'));
        return;
      }
      if (flipping) return;
      flipping = true;
      timeNote.classList.remove('is-spinning');
      void timeNote.offsetWidth;
      timeNote.classList.add('is-spinning');
      timeText.classList.remove('flip-in');
      timeText.classList.add('flip-out');
      setTimeout(() => {
        render(true);
        timeText.classList.remove('flip-out');
        timeText.classList.add('flip-in');
        setTimeout(() => { timeText.classList.remove('flip-in'); flipping = false; }, 260);
      }, 230);
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
    doodle.classList.remove('sketching', 'fading');
    void doodle.getBoundingClientRect();
    doodle.classList.add(motionOn() ? 'sketching' : 'fading');
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
        star.textContent = '✳\uFE0E';
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
      if (!motionOn()) {
        // Reduced motion: the whole word fades out and the next one fades in.
        mark.classList.add('is-fading');
        setTimeout(() => {
          advance();
          current = split(sequence[index]);
          chars = current.length;
          deleting = true;
          paint(sequence[index], sequence[index]);
          mark.classList.remove('is-fading');
          setTimeout(step, sequence[index] === SANSKRIT ? 4200 : 3400);
        }, 380);
        return;
      }
      mark.classList.remove('is-fading');
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

  /* Phones: the header slides away a beat after you start scrolling down and
     comes back as soon as you scroll up. A back-to-top button floats bottom left. */
  const header = document.querySelector('.sidebar');
  const toTop = document.querySelector('.to-top');
  const phone = window.matchMedia('(max-width: 760px)');
  let lastY = window.scrollY, hideTimer = 0, ticking = false;
  const showHeader = () => { clearTimeout(hideTimer); hideTimer = 0; header.classList.remove('is-tucked'); };
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY, delta = y - lastY;
    lastY = y;
    if (!phone.matches) { header.classList.remove('is-tucked', 'is-floating'); toTop.classList.remove('is-shown'); return; }
    header.classList.toggle('is-floating', y > 8);
    const showTop = y > window.innerHeight * 0.8;
    toTop.classList.toggle('is-shown', showTop);
    toTop.tabIndex = showTop ? 0 : -1;
    if (y < 80 || delta < -3) { showHeader(); return; }
    if (delta > 3 && !hideTimer && !header.classList.contains('is-tucked') && !header.contains(document.activeElement)) {
      hideTimer = setTimeout(() => { header.classList.add('is-tucked'); hideTimer = 0; }, 450);
    }
  };
  if (header && toTop) {
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, {passive: true});
    phone.addEventListener('change', onScroll);
    header.addEventListener('focusin', showHeader);
    toTop.addEventListener('click', event => {
      event.preventDefault();
      window.scrollTo({top: 0, behavior: motionOn() ? 'smooth' : 'auto'});
      showHeader();
      const mark = document.querySelector('.wordmark');
      if (mark) mark.focus({preventScroll: true});
    });
    onScroll();
    // In-page links on phones: when the jump goes up the header will be showing,
    // so leave room for it; when it goes down the header tucks away straight off.
    document.addEventListener('click', event => {
      const link = event.target.closest && event.target.closest('a[href^="#"]');
      if (!phone.matches || !link || link.classList.contains('to-top') || link.classList.contains('skip-link')) return;
      const target = link.hash.length > 1 && document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY;
      const goingUp = top < window.scrollY;
      let offset = 16;
      if (goingUp || top < 80) { showHeader(); offset = header.offsetHeight + 16; }
      else { clearTimeout(hideTimer); hideTimer = 0; header.classList.add('is-tucked'); }
      window.scrollTo({top: Math.max(0, top - offset), behavior: motionOn() ? 'smooth' : 'auto'});
      try { history.replaceState(null, '', link.hash); } catch { /* sandboxed preview */ }
      // Move focus to the section so the header (which stays put while it holds focus) can tuck away.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
    });
  }

  try {
    console.log('%c✳ Hey, you found the console.', 'font: italic 15px Georgia, serif; color: #68724e');
    console.log('Curious how this was built? Say hello: maulikchaudhary5@gmail.com');
  } catch { /* no console, no problem */ }
})();
