/* Bloble – calm little mini-games. No losing, only collecting. */
function miniBlobSvg(c, eyes = 'open') {
  const e = eyes === 'happy'
    ? `<path d="M-22 -30 Q-14 -40 -6 -30 M6 -30 Q14 -40 22 -30" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="-14" cy="-30" rx="7" ry="9" fill="${INK}"/><ellipse cx="14" cy="-30" rx="7" ry="9" fill="${INK}"/>
       <circle cx="-16" cy="-34" r="3" fill="#fff"/><circle cx="12" cy="-34" r="3" fill="#fff"/>`;
  return `<svg viewBox="-50 -72 100 76" style="width:100%;display:block;overflow:visible">
    <path d="M-44 0 C-50 -40 -30 -66 0 -66 C30 -66 50 -40 44 0Z" fill="${c.body}" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="-24" cy="-48" rx="9" ry="5" fill="#fff" opacity=".6"/>
    ${e}<ellipse cx="-28" cy="-18" rx="7" ry="4" fill="${c.cheek}" opacity=".55"/><ellipse cx="28" cy="-18" rx="7" ry="4" fill="${c.cheek}" opacity=".55"/>
    <path d="M-6 -18 Q-3 -14 0 -17 Q3 -14 6 -18" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
}

const Games = (() => {
  let ctx = null; // { area, scoreEl, timeEl, color, onEnd }
  let raf = 0, timers = [], running = false, cleanup = [];

  const list = [
    { id: 'stars', name: 'Star Catch', e: '⭐', desc: 'Wiggle left & right to catch falling stars.' },
    { id: 'bubbles', name: 'Bubble Pop', e: '🫧', desc: 'Pop the floaty bubbles. Gold ones are extra sparkly!' },
    { id: 'cups', name: 'Peekaboo Cups', e: '🙈', desc: 'A tiny friend hides under a cup. Can you find it?' },
  ];

  function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function stop() {
    running = false; cancelAnimationFrame(raf);
    timers.forEach(clearTimeout); timers = [];
    cleanup.forEach((f) => f()); cleanup = [];
  }
  function listen(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); cleanup.push(() => el.removeEventListener(ev, fn, opt)); }
  function setScore(v) { ctx.scoreEl.textContent = v; }
  function setTime(v) { ctx.timeEl.textContent = v == null ? '' : `⏱ ${Math.ceil(v)}`; }

  function overlay(title, text, btn, onClick) {
    const o = document.createElement('div');
    o.className = 'game-overlay';
    o.innerHTML = `<h3>${title}</h3><p>${text}</p><button class="btn primary">${btn}</button>`;
    o.querySelector('button').onclick = () => { o.remove(); onClick(); };
    ctx.area.appendChild(o);
  }

  function finish(score, coins, unit) {
    running = false; cancelAnimationFrame(raf);
    Sound.play('yay');
    const msg = score > 0 ? `You got <b>${score}</b> ${unit}!<br>+${coins} coins ♡` : `That was fun anyway! ♡<br>+${coins} coins`;
    overlay('Yay!', msg, 'Back home', () => { const cb = ctx.onEnd; stop(); cb(score, coins); });
  }

  // ---------- Star Catch ----------
  function stars() {
    const W = 320, H = 400, area = ctx.area, c = ctx.color;
    const cv = document.createElement('canvas'); area.appendChild(cv);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    let px = W / 2, tx = W / 2, score = 0, time = 30, spawn = 0, items = [], pops = [], squish = 0, keys = {};
    const toLocal = (e) => { const r = cv.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * W; };
    listen(cv, 'pointermove', (e) => { tx = toLocal(e); });
    listen(cv, 'pointerdown', (e) => { tx = toLocal(e); });
    listen(window, 'keydown', (e) => { keys[e.key] = true; });
    listen(window, 'keyup', (e) => { keys[e.key] = false; });

    function star(x, y, r, rot) {
      g.beginPath();
      for (let i = 0; i < 10; i++) { const a = rot + (i * Math.PI) / 5, rr = i % 2 ? r * 0.48 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      g.closePath();
    }
    function heart(x, y, r) {
      g.beginPath(); g.moveTo(x, y + r * 0.9);
      g.bezierCurveTo(x - r * 1.6, y - r * 0.1, x - r * 0.8, y - r * 1.4, x, y - r * 0.5);
      g.bezierCurveTo(x + r * 0.8, y - r * 1.4, x + r * 1.6, y - r * 0.1, x, y + r * 0.9);
    }
    function drawBlob(x) {
      const y = H - 24, sq = squish;
      g.save(); g.translate(x, y); g.scale(1 + sq, 1 - sq);
      g.fillStyle = c.body; g.strokeStyle = INK; g.lineWidth = 3.5;
      g.beginPath(); g.moveTo(-34, 0); g.bezierCurveTo(-40, -34, -22, -52, 0, -52); g.bezierCurveTo(22, -52, 40, -34, 34, 0); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.globalAlpha = 0.6; g.beginPath(); g.ellipse(-16, -38, 7, 4, -0.4, 0, 7); g.fill(); g.globalAlpha = 1;
      g.fillStyle = INK; [-11, 11].forEach((ex) => { g.beginPath(); g.ellipse(ex, -26, 5.5, 7, 0, 0, 7); g.fill(); });
      g.fillStyle = '#fff'; [-13, 9].forEach((ex) => { g.beginPath(); g.arc(ex, -29, 2.3, 0, 7); g.fill(); });
      g.fillStyle = c.cheek; g.globalAlpha = 0.5; [-22, 22].forEach((ex) => { g.beginPath(); g.ellipse(ex, -15, 6, 3.5, 0, 0, 7); g.fill(); }); g.globalAlpha = 1;
      g.restore();
    }
    let last = performance.now();
    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      time -= dt; setTime(Math.max(0, time));
      if (keys.ArrowLeft || keys.a) tx -= 320 * dt;
      if (keys.ArrowRight || keys.d) tx += 320 * dt;
      tx = Math.max(30, Math.min(W - 30, tx));
      px += (tx - px) * Math.min(1, dt * 12);
      squish *= Math.pow(0.02, dt);
      spawn -= dt;
      if (spawn <= 0 && time > 0.5) {
        spawn = 0.5 - Math.min(0.22, (30 - time) * 0.008);
        const r = Math.random();
        items.push({ x: 24 + Math.random() * (W - 48), y: -20, v: 110 + Math.random() * 60 + (30 - time) * 3, kind: r < 0.1 ? 'heart' : 'star', rot: Math.random() * 6, spin: (Math.random() - 0.5) * 3 });
      }
      // draw
      const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#cfe8ff'); bg.addColorStop(1, '#ffe6f1');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.7)';
      [[60, 70, 36], [240, 120, 28], [150, 220, 22]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse((x + now / 80) % (W + 80) - 40, y, r * 1.6, r * 0.6, 0, 0, 7); g.fill(); });
      g.fillStyle = '#f6d8c2'; g.fillRect(0, H - 22, W, 22);
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i]; it.y += it.v * dt; it.rot += it.spin * dt;
        if (Math.abs(it.x - px) < 38 && it.y > H - 80 && it.y < H - 20) {
          const pts = it.kind === 'heart' ? 3 : 1; score += pts; setScore(score);
          pops.push({ x: it.x, y: it.y, t: 0, txt: `+${pts}` }); items.splice(i, 1); squish = 0.18;
          Sound.play('boop', it.kind === 'heart' ? 1.4 : 1 + Math.random() * 0.2); continue;
        }
        if (it.y > H + 20) { items.splice(i, 1); continue; }
        g.lineWidth = 3; g.strokeStyle = INK;
        if (it.kind === 'heart') { g.fillStyle = '#ff8fb8'; heart(it.x, it.y, 13); } else { g.fillStyle = '#ffd96e'; star(it.x, it.y, 15, it.rot); }
        g.fill(); g.stroke();
      }
      drawBlob(px);
      g.font = '600 18px "Pixelify Sans", sans-serif'; g.textAlign = 'center';
      pops = pops.filter((p) => { p.t += dt; g.globalAlpha = 1 - p.t; g.fillStyle = '#ff6fa8'; g.fillText(p.txt, p.x, p.y - 30 - p.t * 40); g.globalAlpha = 1; return p.t < 1; });
      if (time <= 0) { finish(score, score, 'stars'); return; }
      raf = requestAnimationFrame(frame);
    }
    overlay('Star Catch', 'Move your finger or mouse (or ← →) to catch stars. Hearts are worth 3!', 'Start', () => { running = true; last = performance.now(); raf = requestAnimationFrame(frame); });
  }

  // ---------- Bubble Pop ----------
  function bubbles() {
    const area = ctx.area;
    let score = 0, time = 25, spawn = 0, list = [], last = 0;
    function make() {
      const el = document.createElement('div');
      const gold = Math.random() < 0.08, size = gold ? 46 : 40 + Math.random() * 34;
      el.className = 'gbubble' + (gold ? ' gold' : '');
      el.style.width = el.style.height = size + 'px';
      const b = { el, x: Math.random() * 84 + 2, y: 105, v: 14 + Math.random() * 10 + (25 - time) * 0.5, ph: Math.random() * 6, gold, size };
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); if (!running || b.popped) return;
        b.popped = true; el.classList.add('popped'); score += gold ? 5 : 1; setScore(score);
        Sound.play(gold ? 'chime' : 'pop'); later(() => el.remove(), 260);
      });
      area.appendChild(el); list.push(b);
    }
    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      time -= dt; setTime(Math.max(0, time));
      spawn -= dt; if (spawn <= 0 && time > 1) { spawn = 0.42; make(); }
      list = list.filter((b) => {
        if (b.popped) return false;
        b.y -= b.v * dt; b.ph += dt * 2;
        b.el.style.transform = `translate(${(Math.sin(b.ph) * 10).toFixed(1)}px, 0)`;
        b.el.style.left = b.x + '%'; b.el.style.top = b.y + '%';
        if (b.y < -18) { b.el.remove(); return false; }
        return true;
      });
      if (time <= 0) { list.forEach((b) => b.el.remove()); finish(score, Math.ceil(score / 2), 'bubbles'); return; }
      raf = requestAnimationFrame(frame);
    }
    overlay('Bubble Pop', 'Tap the bubbles before they float away. Gold bubbles give 5!', 'Start', () => { running = true; last = performance.now(); raf = requestAnimationFrame(frame); });
  }

  // ---------- Peekaboo Cups ----------
  function cups() {
    const area = ctx.area, c = ctx.color, ROUNDS = 5, SLOTS = [8, 37, 66];
    area.innerHTML = '<div class="cups-msg"></div><div class="cups"></div>';
    const msg = area.querySelector('.cups-msg'), wrap = area.querySelector('.cups');
    const cupColors = ['#ffb8d4', '#b8dcff', '#c9f0b8'];
    const cupsEl = cupColors.map((col, i) => {
      const d = document.createElement('div'); d.className = 'cup'; d.style.left = SLOTS[i] + '%';
      d.innerHTML = `<svg viewBox="0 0 100 110"><path d="M8 106 L22 12 Q50 2 78 12 L92 106 Q50 114 8 106Z" fill="${col}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M18 40 Q50 32 82 40 M14 70 Q50 62 86 70" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/><ellipse cx="50" cy="10" rx="10" ry="5" fill="#fff" stroke="${INK}" stroke-width="4"/></svg>`;
      wrap.appendChild(d); return d;
    });
    const mini = document.createElement('div'); mini.className = 'mini-blob'; mini.innerHTML = miniBlobSvg(c, 'happy');
    wrap.insertBefore(mini, wrap.firstChild);
    let pos = [0, 1, 2]; // pos[cup] = slot
    let hidden = 1, round = 0, score = 0, canPick = false;
    const placeMini = () => { mini.style.left = (SLOTS[pos[hidden]] + 2) + '%'; };
    setTime(null);

    function nextRound() {
      round++; canPick = false;
      if (round > ROUNDS) { finish(score, score * 3 + 2, 'finds'); return; }
      msg.textContent = `Round ${round}/${ROUNDS} – watch closely!`;
      hidden = Math.floor(Math.random() * 3); placeMini(); mini.style.opacity = 1;
      cupsEl.forEach((el) => el.classList.add('lift'));
      later(() => { cupsEl.forEach((el) => el.classList.remove('lift')); later(() => { mini.style.opacity = 0; shuffle(2 + round, Math.max(240, 520 - round * 55)); }, 450); }, 1100);
    }
    function shuffle(n, speed) {
      cupsEl.forEach((el) => { el.style.transitionDuration = speed / 1000 + 's'; });
      mini.style.transitionDuration = speed / 1000 + 's';
      if (n <= 0) { msg.textContent = 'Where is the little blob?'; canPick = true; return; }
      const a = Math.floor(Math.random() * 3); let b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
      const ca = pos.indexOf(a), cb = pos.indexOf(b);
      pos[ca] = b; pos[cb] = a;
      cupsEl[ca].style.left = SLOTS[b] + '%'; cupsEl[cb].style.left = SLOTS[a] + '%';
      placeMini(); Sound.play('shake');
      later(() => shuffle(n - 1, speed), speed + 40);
    }
    cupsEl.forEach((el, i) => listen(el, 'pointerdown', () => {
      if (!canPick || !running) return; canPick = false;
      mini.style.opacity = 1; el.classList.add('lift');
      if (i === hidden) { score++; setScore(score); msg.textContent = 'Found you! ♡'; Sound.play('chime'); }
      else { msg.textContent = 'Hehe, over here!'; Sound.play('giggle'); later(() => cupsEl[hidden].classList.add('lift'), 350); }
      later(() => { cupsEl.forEach((x) => x.classList.remove('lift')); later(nextRound, 500); }, 1400);
    }));
    overlay('Peekaboo Cups', 'Keep your eyes on the cup hiding the little blob. 5 rounds!', 'Start', () => { running = true; nextRound(); });
  }

  return {
    list,
    start(id, opts) {
      stop(); ctx = opts; ctx.area.innerHTML = ''; setScore(0); setTime(null);
      ({ stars, bubbles, cups })[id]();
    },
    stop,
  };
})();
