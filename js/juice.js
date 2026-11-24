/* Bloble – juice: XP & levels, confetti, flying coins, love meter, Sparkle Fever, surprise visitors */
const Juice = (() => {
  const B = window.Bloble, $ = (s) => document.querySelector(s);
  const stage = B.stage, blob = B.blob;
  const rand = (a, b) => a + Math.random() * (b - a);

  function ensure(S) {
    if (!S) return null;
    const d = { xp: 0, level: 1, streak: 0, lastStreakDay: null, stickers: {}, newStickers: {}, quests: null, tricks: {},
      feeds: 0, baths: 0, boxes: 0, loveBursts: 0, visitors: 0, boxesSinceEpic: 0, freeBoxes: 0, bestStars: 0, legendaries: 0 };
    for (const k in d) if (S[k] === undefined) S[k] = d[k];
    return S;
  }
  const S = () => ensure(B.S);
  const vibrate = (p) => {
    try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); } catch (e) {}
  };

  // ---------- popups ----------
  function headPoint() { const r = blob.rect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.15 }; }
  function popNum(text, cls, x, y) {
    if (x == null) ({ x, y } = headPoint());
    const sr = stage.getBoundingClientRect(), el = document.createElement('div');
    el.className = 'pop-num ' + (cls || ''); el.textContent = text;
    el.style.left = (x - sr.left + rand(-14, 14)) + 'px'; el.style.top = (y - sr.top) + 'px';
    stage.appendChild(el); setTimeout(() => el.remove(), 1300);
  }
  function flash(rainbow) {
    const f = $('#flash'); f.classList.toggle('rainbow', !!rainbow);
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  }
  function shake() { stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake'); }
  let bannerT = 0, bannerQ = [];
  function banner(ico, title, sub) {
    bannerQ.push([ico, title, sub]);
    if (bannerQ.length === 1) showBanner();
  }
  function showBanner() {
    const [ico, title, sub] = bannerQ[0], b = $('#banner');
    b.innerHTML = `<span class="b-ico">${ico}</span><span><small>${sub}</small><b>${title}</b></span>`;
    b.classList.add('show'); Sound.play('sparkle');
    clearTimeout(bannerT);
    bannerT = setTimeout(() => { b.classList.remove('show'); setTimeout(() => { bannerQ.shift(); if (bannerQ.length) showBanner(); }, 450); }, 2600);
  }

  // ---------- confetti ----------
  const cv = $('#confetti'), g = cv.getContext('2d');
  let parts = [], confRaf = 0;
  const CONF_COLORS = ['#ffb3d1', '#ffe39a', '#b6f0c2', '#b3dcff', '#d6c6ff', '#ff8fb8', '#ffd36e'];
  function confetti(n = 80, x, y, hearts) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== innerWidth * dpr) { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    if (x == null) ({ x, y } = headPoint());
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI * 0.95, -Math.PI * 0.05), sp = rand(250, 720);
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(0, 6), vr: rand(-10, 10), s: rand(5, 10),
        c: CONF_COLORS[i % CONF_COLORS.length], heart: hearts && Math.random() < 0.5, life: rand(1.6, 2.6) });
    }
    if (!confRaf) { let last = performance.now(); const step = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => {
        p.vy += 900 * dt; p.vx *= Math.pow(0.35, dt); p.vy *= Math.pow(0.6, dt); p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life -= dt;
        g.save(); g.globalAlpha = Math.min(1, p.life * 2); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c;
        if (p.heart) { g.font = `${p.s * 2.2}px sans-serif`; g.fillText('♥', -p.s, p.s); } else g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 + Math.abs(Math.sin(p.r)) * p.s / 2);
        g.restore();
        return p.life > 0 && p.y < innerHeight + 30;
      });
      if (parts.length) confRaf = requestAnimationFrame(step); else { confRaf = 0; g.clearRect(0, 0, innerWidth, innerHeight); }
    }; confRaf = requestAnimationFrame(step); }
  }

  // ---------- coins flying into the counter ----------
  Bus.on('coins', (n) => {
    const from = lastPoint || headPoint(); lastPoint = null;
    const to = $('.coin-ico').getBoundingClientRect(), tx = to.left + to.width / 2, ty = to.top + to.height / 2;
    popNum(`+${n}`, 'coin', from.x, from.y);
    const count = Math.min(10, Math.max(1, Math.ceil(n / 2)));
    for (let i = 0; i < count; i++) setTimeout(() => {
      const c = document.createElement('div'); c.className = 'fly-coin';
      const sx = from.x + rand(-30, 30), sy = from.y + rand(-20, 20);
      c.style.left = sx + 'px'; c.style.top = sy + 'px'; $('#flyLayer').appendChild(c);
      const mx = (sx + tx) / 2 + rand(-60, 60), my = Math.min(sy, ty) - rand(40, 110);
      const a = c.animate([
        { transform: 'translate(0,0) scale(.4)' },
        { transform: `translate(${mx - sx}px, ${my - sy}px) scale(1.15)`, offset: 0.45 },
        { transform: `translate(${tx - sx}px, ${ty - sy}px) scale(.7)` },
      ], { duration: rand(650, 850), easing: 'ease-in' });
      a.onfinish = () => { c.remove(); Sound.play('tick', 1 + i * 0.05); const k = $('.coins'); k.classList.remove('bump'); void k.offsetWidth; k.classList.add('bump'); };
    }, i * 70);
  });
  let lastPoint = null;
  const from = (x, y) => { lastPoint = { x, y }; };

  // ---------- XP & levels ----------
  const need = (l) => 50 + (l - 1) * 35;
  function render() {
    const s = S(); if (!s) return;
    $('#lvlNum').textContent = s.level;
    $('#xpFill').style.width = Math.min(100, (s.xp / need(s.level)) * 100) + '%';
  }
  function xp(n, x, y, quiet) {
    const s = S(); if (!s || n <= 0) return;
    if (fever) n *= 2;
    s.xp += n;
    if (!quiet) popNum(`+${n} XP`, 'xp', x, y);
    const l = $('#lvlBtn'); l.classList.remove('gain'); void l.offsetWidth; l.classList.add('gain');
    let ups = 0;
    while (s.xp >= need(s.level)) { s.xp -= need(s.level); s.level++; ups++; }
    render();
    if (ups) setTimeout(() => levelUp(s.level), 500);
  }
  function levelUp(lv) {
    const s = S(), coins = 10 + lv * 3, gift = lv % 3 === 0;
    $('#levelBig').textContent = lv;
    const unlock = { 2: 'New trick: Spin! 🌀', 3: 'New trick: Dance! 💃', 5: 'New trick: Bow! 🎀', 7: 'New trick: Twirl Jump! 🌟' }[lv];
    $('#levelSub').innerHTML = `You and ${s.name} are closer than ever ♡<br><b>+${coins} coins</b>${gift ? ' · <b>+1 free gift 🎁</b>' : ''}${unlock ? `<br>${unlock}` : ''}`;
    if (gift) s.freeBoxes++;
    B.openModal('levelModal');
    Sound.play('fanfare'); vibrate([30, 50, 30]); flash(true);
    confetti(140, innerWidth / 2, innerHeight * 0.45, true);
    blob.emote('excited', 2500); blob.hop(520); blob.spin();
    setTimeout(() => B.addCoins(coins), 400);
    B.updateHUD(); B.save();
    Bus.emit('level', lv);
  }

  // ---------- love meter ----------
  let love = 0, lastPet = -10, now = 0;
  Bus.on('pet', ({ x, y }) => {
    lastPet = now; love = Math.min(1, love + 0.12);
    xp(1, x, y, true); vibrate(8);
    $('#loveMeter').classList.add('show');
    $('#loveMeter').classList.toggle('hot', love > 0.7);
    if (love >= 1) loveBurst();
  });
  function loveBurst() {
    const s = S(); love = 0; s.loveBursts++;
    flash(); shake(); vibrate([20, 30, 20, 30, 60]);
    Sound.play('yay'); setTimeout(() => Sound.play('sparkle'), 250);
    B.burst('💗', 14); confetti(90, undefined, undefined, true);
    blob.emote('love', 2600); blob.hop(540); setTimeout(() => blob.spin(0.8), 200);
    B.say('LOVE BURST!! ♡♡♡', 2200);
    Life.add(s, 'fun', 15);
    from(headPoint().x, headPoint().y); B.addCoins(5); xp(15);
    Bus.emit('loveBurst');
  }

  // ---------- Sparkle Fever ----------
  let fever = false, nextSpark = 0;
  function checkFever() {
    const s = S(); if (!s) return;
    const on = !s.asleep && Object.values(s.stats).every((v) => v >= 80) && B.phase !== 'naming';
    if (on !== fever) {
      fever = on; stage.classList.toggle('fever', on);
      if (on) { Sound.play('sparkle'); banner('✨', 'Sparkle Fever!', `${s.name} feels amazing · double XP & coins`); confetti(50); Bus.emit('fever'); }
    }
  }
  Bus.on('game', ({ coins }) => { if (fever && coins) setTimeout(() => { popNum('Fever ×2!', 'xp'); B.addCoins(coins); }, 900); });

  // ---------- surprise visitors ----------
  let visitor = null, nextVisitor = 18;
  const KINDS = [
    { k: 'balloon', w: 50, e: '🎈', dur: 10, say: 'ooh, a balloon! 🎈' },
    { k: 'star', w: 25, e: '🌟', dur: 3.6, say: 'a shooting star! make a wish!' },
    { k: 'butterfly', w: 25, e: '🦋', dur: 12, say: 'a butterfly~ 🦋' },
  ];
  function spawnVisitor() {
    const tot = KINDS.reduce((a, k) => a + k.w, 0); let r = Math.random() * tot, kind = KINDS[0];
    for (const k of KINDS) { if ((r -= k.w) < 0) { kind = k; break; } }
    const el = document.createElement('div'); el.className = 'visitor'; el.innerHTML = kind.e + (kind.k === 'balloon' ? '<i class="tag"></i>' : '');
    $('#visitors').appendChild(el);
    visitor = { ...kind, el, t: 0, x0: rand(10, 80), dir: Math.random() < 0.5 ? 1 : -1 };
    el.addEventListener('pointerdown', (e) => { e.stopPropagation(); catchVisitor(e.clientX, e.clientY); });
    B.say(kind.say, 2000); blob.emote('surprised', 900);
  }
  function catchVisitor(x, y) {
    const v = visitor, s = S(); if (!v || v.caught) return;
    v.caught = true; v.el.classList.add('caught'); setTimeout(() => v.el.remove(), 360); visitor = null;
    s.visitors++; Sound.play('pop'); vibrate(15); confetti(30, x, y);
    if (v.k === 'balloon') { from(x, y); B.addCoins(Math.floor(rand(3, 9))); xp(4, x, y + 30); blob.emote('joy', 1400); B.say('yay, coins!', 1500); }
    if (v.k === 'star') { xp(14, x, y); blob.emote('excited', 1800); B.say(B.pick(['I wished for more pets ♡', 'my wish is a secret~', 'wish granted? ✨']), 2000); Sound.play('chime'); }
    if (v.k === 'butterfly') { Life.add(s, 'fun', 10); xp(6, x, y); blob.emote('love', 1600); blob.hop(400); B.say('it said hi to me!', 1800); }
    Bus.emit('visitor', v.k); B.updateHUD();
  }
  function moveVisitor(dt) {
    const v = visitor; if (!v) return;
    v.t += dt; const p = v.t / v.dur, sr = stage.getBoundingClientRect();
    let x, y;
    if (v.k === 'balloon') { x = v.x0 + Math.sin(v.t * 1.3) * 5; y = 100 - p * 125; }
    else if (v.k === 'star') { x = v.dir > 0 ? -10 + p * 120 : 110 - p * 120; y = 6 + p * 22; if (Math.random() < 0.5) B.spawn('✦', sr.left + (x / 100) * sr.width, sr.top + (y / 100) * sr.height + 20, '', 900); }
    else { x = (v.dir > 0 ? -10 + p * 120 : 110 - p * 120); y = 35 + Math.sin(v.t * 2.2) * 12 + Math.sin(v.t * 5) * 3; v.el.style.scale = `${Math.abs(Math.sin(v.t * 9)) * 0.4 + 0.7} 1`; }
    v.el.style.left = `calc(${x}% - 17px)`; v.el.style.top = `calc(${y}% - 17px)`;
    const r = blob.rect();
    blob.lookAt(((x / 100) * sr.width + sr.left - (r.left + r.width / 2)) / (sr.width * 0.45), ((y / 100) * sr.height + sr.top - (r.top + r.height * 0.4)) / (sr.height * 0.45));
    if (p >= 1) { v.el.remove(); visitor = null; }
  }

  // ---------- loop ----------
  let last = performance.now(), sec = 0;
  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000); last = ts; now += dt;
    if (now - lastPet > 0.9 && love > 0) {
      love = Math.max(0, love - dt * 0.15);
      if (love === 0) $('#loveMeter').classList.remove('show', 'hot');
    }
    $('#loveFill').style.height = (love * 100) + '%';
    sec += dt; if (sec > 1) { sec = 0; checkFever(); }
    if (fever && now > nextSpark) { nextSpark = now + 1.1; const r = blob.rect(); B.spawn('✨', r.left + rand(0, r.width), r.top + rand(0, r.height * 0.6), '', 1500); }
    const anyModal = document.querySelector('.modal.open');
    if (!visitor && now > nextVisitor && B.S && B.phase === 'idle' && !B.S.asleep && !anyModal) { nextVisitor = now + rand(28, 60); spawnVisitor(); }
    moveVisitor(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // XP for core actions
  Bus.on('feed', () => xp(8));
  Bus.on('bath', () => xp(12));
  Bus.on('game', ({ score }) => setTimeout(() => xp(10 + Math.min(30, score)), 600));
  Bus.on('box', () => xp(5));
  Bus.on('greeted', () => { ensure(B.S); render(); });
  render();

  return { xp, popNum, confetti, flash, shake, banner, vibrate, ensure, from, get fever() { return fever; } };
})();
