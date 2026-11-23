/* Bloble – app controller: visits, care actions, gifts, hatdex */
(() => {
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage'), app = $('#app'), speech = $('#speech'), particles = $('#particles');
  const blob = new BlobView($('#blobSvg'));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const BOX_COST = 25;

  let S = Store.load();
  let phase = 'naming'; // naming | shy | busy | idle | bath | game
  let visitInfo = null, audioOn = false;
  let pointer = { down: false, x: 0, y: 0, lastMove: -10, stroke: 0, scrub: 0 };
  let now = 0, nextIdle = 4, nextChat = 10, nextZ = 0, lastSave = 0, lastTick = 0;

  const FOODS = [
    { e: '🍓', n: 'Berry', v: 15, fun: 2 },
    { e: '🍙', n: 'Rice ball', v: 30, fun: 0 },
    { e: '🍪', n: 'Cookie', v: 20, fun: 5 },
    { e: '🍮', n: 'Pudding', v: 25, fun: 8 },
    { e: '🍎', n: 'Apple', v: 20, fun: 2 },
    { e: '🍡', n: 'Dango', v: 28, fun: 4 },
  ];

  // ---------- helpers ----------
  const save = () => { if (S) Store.save(S); };
  let toastT = 0;
  function toast(msg, ms = 2800) {
    const t = $('#toast'); t.innerHTML = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
  }
  function hint(msg) { const h = $('#hint'); if (msg) { h.textContent = msg; h.classList.add('show'); } else h.classList.remove('show'); }
  let sayT = 0;
  function say(text, ms = 2200) {
    const r = blob.rect(), sr = stage.getBoundingClientRect();
    speech.textContent = text;
    speech.style.top = Math.max(8, r.top - sr.top - 56) + 'px';
    speech.classList.add('show');
    clearTimeout(sayT); sayT = setTimeout(() => speech.classList.remove('show'), ms);
  }
  function spawn(html, cx, cy, cls = '', life = 2800) {
    const sr = stage.getBoundingClientRect(), el = document.createElement('span');
    el.className = 'pt ' + cls; el.innerHTML = html;
    el.style.left = (cx - sr.left) + 'px'; el.style.top = (cy - sr.top) + 'px';
    el.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
    particles.appendChild(el); setTimeout(() => el.remove(), life);
    return el;
  }
  function burst(html, n = 6, cls = '') {
    const r = blob.rect();
    for (let i = 0; i < n; i++) setTimeout(() => spawn(html, r.left + r.width * (0.15 + Math.random() * 0.7), r.top + r.height * (0.1 + Math.random() * 0.5), cls), i * 90);
  }
  function openModal(id) { $('#' + id).classList.add('open'); }
  function closeModal(id) { $('#' + id).classList.remove('open'); }
  function addCoins(n) {
    if (!n) return;
    S.coins += n; Sound.play('coin');
    const c = $('.coins'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    updateHUD();
  }
  const today = () => dayKey(Date.now());
  const giftReady = () => S && S.lastGift !== today();

  function updateHUD() {
    if (!S) return;
    for (const k of ['hunger', 'fun', 'clean', 'energy']) {
      const el = document.querySelector(`.stat[data-stat="${k}"]`), v = S.stats[k];
      el.querySelector('i').style.width = v.toFixed(0) + '%';
      el.classList.toggle('low', v < 30);
    }
    $('#coinCount').textContent = S.coins;
    $('#nameLabel').textContent = S.name;
    const g = Life.growth(S);
    $('#ageLabel').textContent = `Day ${g.days} · ${g.stage}`;
    const b = $('#giftBadge'); b.textContent = '1'; b.classList.toggle('show', giftReady());
    blob.setDirt(Math.max(0, Math.min(1, (45 - S.stats.clean) / 35)));
    $('#sleepLabel').textContent = S.asleep ? 'Wake' : 'Sleep';
    document.querySelector('[data-act="sleep"]').classList.toggle('on', !!S.asleep);
  }

  function refreshMood() {
    if (!S) return;
    if (S.asleep) return blob.setBase('sleeping');
    if (phase === 'shy' || phase === 'naming') return blob.setBase(phase === 'shy' ? 'shy' : 'peek');
    const m = Life.mood(S);
    if (S.stats.energy < 18) blob.setBase('sleepy');
    else if (m.avg < 35) blob.setBase('down');
    else if (m.avg > 72) blob.setBase('happy');
    else blob.setBase('neutral');
  }

  function setTimeOfDay() {
    const h = new Date().getHours();
    const tod = h >= 6 && h < 10 ? 'morning' : h >= 10 && h < 17 ? 'day' : h >= 17 && h < 20 ? 'evening' : 'night';
    app.classList.remove('tod-morning', 'tod-day', 'tod-evening', 'tod-night');
    app.classList.add('tod-' + tod);
  }

  function applyLook() {
    blob.setColor(colorById(S.color));
    blob.setHat(S.equipped ? hatById(S.equipped) : null);
  }

  // ---------- naming ----------
  let chosenColor = COLORS[0].id, renaming = false;
  function buildColorPick() {
    const cp = $('#colorPick'); cp.innerHTML = '';
    COLORS.forEach((c) => {
      const b = document.createElement('button');
      b.style.background = c.body; b.setAttribute('aria-label', c.id);
      if (c.id === chosenColor) b.classList.add('sel');
      b.onclick = () => {
        chosenColor = c.id; buildColorPick(); Sound.play('boop', 1.2);
        $('.egg').style.background = `radial-gradient(circle at 35% 30%, #fff 0 12%, ${c.light} 14% 60%, ${c.body})`;
      };
      cp.appendChild(b);
    });
  }
  function startNaming(isRename) {
    renaming = isRename;
    $('#nameTitle').textContent = isRename ? 'A new name?' : 'A little blob appeared!';
    $('#nameSub').textContent = isRename ? `What should we call your friend now?` : `It's peeking at you with big curious eyes. What will you call it?`;
    $('#nameInput').value = isRename ? S.name : '';
    $('#colorPick').style.display = isRename ? 'none' : '';
    $('.egg-wrap').style.display = isRename ? 'none' : '';
    chosenColor = pick(COLORS).id; buildColorPick();
    const c = colorById(chosenColor);
    $('.egg').style.background = `radial-gradient(circle at 35% 30%, #fff 0 12%, ${c.light} 14% 60%, ${c.body})`;
    openModal('nameModal');
    setTimeout(() => $('#nameInput').focus(), 300);
  }
  function confirmName() {
    const name = ($('#nameInput').value.trim() || 'Mochi').slice(0, 14);
    closeModal('nameModal');
    unlockAudio();
    if (renaming) {
      S.name = name; save(); updateHUD();
      blob.emote('love', 1800); blob.hop(380); Sound.play('yay');
      say(`${name}? I love it! ♡`); burst('💗', 5);
      return;
    }
    S = Life.create(name, chosenColor); save();
    applyLook(); blob.setScale(Life.growth(S).scale, true);
    blob.y = -240; blob.vy = 0;
    phase = 'busy'; updateHUD();
    blob.emote('surprised', 900);
    setTimeout(() => { blob.emote('excited', 2600); Sound.play('yay'); say(`Hi! I'm ${name}!`, 2600); burst('✨', 6); blob.hop(420); }, 900);
    setTimeout(() => { phase = 'idle'; refreshMood(); toast('🎁 A welcome present is waiting for you!'); updateHUD(); }, 3600);
  }

  // ---------- the visit ----------
  function beginVisit() {
    visitInfo = Life.visit(S, Date.now());
    S.asleep = false; // it always wakes up when you come by
    save(); applyLook();
    const g = Life.growth(S);
    const prev = visitInfo.grew ? Life.growth({ daysCount: S.daysCount - 1 }).scale : g.scale;
    blob.setScale(prev, true);
    phase = 'shy'; refreshMood(); updateHUD();
    setTimeout(() => { if (phase === 'shy') say('…?', 4000); }, 900);
    setTimeout(() => { if (phase === 'shy') hint(`Someone's here… tap ${S.name} gently`); }, 1600);
  }

  function recognize() {
    phase = 'busy'; hint(null);
    const info = visitInfo || { missed: false };
    blob.emote('surprised', 800); Sound.play('surprise'); say('!', 800); blob.hop(260);
    const greet = () => {
      blob.emote(info.missed ? 'love' : 'joy', 2600); Sound.play('yay');
      say(info.missed ? `You came back!! ♡` : pick([`It's you! ♡`, 'Yay, my friend!', 'Hiii! ♡', `I knew it was you!`]), 2600);
      burst('💗', info.missed ? 10 : 6);
      blob.hop(420); setTimeout(() => blob.hop(330), 520); if (info.missed) setTimeout(() => blob.hop(380), 1040);
      setTimeout(afterGreeting, 2800);
    };
    if (info.missed) {
      setTimeout(() => {
        blob.emote('sad', 2600); Sound.play('aww');
        const d = Math.floor(info.awayHours / 24);
        say(d >= 2 ? `I missed you so much…` : `I missed you…`, 2500);
      }, 900);
      setTimeout(greet, 3500);
    } else setTimeout(greet, 900);
  }

  function afterGreeting() {
    phase = 'idle'; refreshMood();
    if (visitInfo && visitInfo.grew && S.daysCount > 1) {
      const g = Life.growth(S);
      blob.setScale(g.scale); burst('✨', 8); Sound.play('chime');
      toast(`🌱 ${S.name} grew a little! Day ${g.days} · ${g.stage}`, 3500);
      say('I feel bigger!', 2000);
    } else if (giftReady()) toast('🎁 A daily present is waiting!');
    updateHUD();
  }

  // ---------- audio ----------
  function unlockAudio() {
    if (audioOn) return;
    audioOn = true; Sound.unlock();
    $('#musicBtn').classList.toggle('off', !Sound.enabled);
  }
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('#musicBtn')) unlockAudio(); }, true);
  document.addEventListener('keydown', () => unlockAudio(), { once: true });
  $('#musicBtn').onclick = () => {
    if (!audioOn) { audioOn = true; Sound.unlock(); if (!Sound.enabled) Sound.toggle(); }
    else Sound.toggle();
    $('#musicBtn').classList.toggle('off', !Sound.enabled);
  };
  $('#musicBtn').classList.toggle('off', !Sound.enabled);

  // ---------- touching the blob ----------
  function gazeFrom(x, y) {
    const r = blob.rect(), sr = stage.getBoundingClientRect();
    blob.lookAt((x - (r.left + r.width / 2)) / (sr.width * 0.45), (y - (r.top + r.height * 0.4)) / (sr.height * 0.45));
  }
  stage.addEventListener('pointerdown', (e) => {
    if (!S || phase === 'naming' || phase === 'game') return;
    if (e.target.closest('.bath-done, .nametag')) return;
    pointer.down = true; pointer.x = e.clientX; pointer.y = e.clientY; pointer.stroke = 0; pointer.lastMove = now;
    gazeFrom(e.clientX, e.clientY);
    if (!blob.contains(e.clientX, e.clientY)) return;
    if (phase === 'shy') return recognize();
    if (phase === 'busy') return;
    if (S.asleep) { blob.emote('sleepy', 1400); say('zzz… five more minutes…', 1800); blob.poke(); return; }
    if (phase === 'bath') return;
    blob.poke(); Sound.play('giggle');
    blob.emote(pick(['joy', 'wink', 'happy']), 900);
    Life.add(S, 'fun', 0.5);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!S) return;
    const dx = e.clientX - pointer.x, dy = e.clientY - pointer.y, d = Math.hypot(dx, dy);
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.lastMove = now;
    if (phase !== 'shy') gazeFrom(e.clientX, e.clientY);
    const over = blob.contains(e.clientX, e.clientY);
    if (phase === 'bath' && over && (pointer.down || e.pointerType === 'mouse')) {
      pointer.scrub += d; if (pointer.scrub > 38) { pointer.scrub = 0; scrub(e.clientX, e.clientY); }
    } else if (phase === 'idle' && pointer.down && over && !S.asleep) {
      pointer.stroke += d; if (pointer.stroke > 70) { pointer.stroke = 0; pet(e.clientX, e.clientY); }
    }
  });
  const up = () => { pointer.down = false; };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up); stage.addEventListener('pointerleave', up);

  let petCount = 0;
  function pet(x, y) {
    S.pets++; petCount++;
    Life.add(S, 'fun', 2.5);
    blob.emote(pick(['love', 'joy', 'joy']), 1300); blob.jiggle = 0.6;
    spawn('💗', x, y - 10); Sound.play('purr');
    if (petCount % 6 === 0) say(pick(['hehe~ ♡', 'that tickles!', 'more pets pls', '♡ ♡ ♡', 'purrrr…']), 1500);
    if (S.pets % 15 === 0) { addCoins(1); }
    updateHUD();
  }

  // ---------- bath ----------
  function startBath() {
    phase = 'bath'; stage.classList.add('bathing');
    hint(`Rub ${S.name} with the sponge!`); blob.emote('happy', 1200); say('Bath time? ♪', 1600);
  }
  function scrub(x, y) {
    Life.add(S, 'clean', 3.5);
    for (let i = 0; i < 2; i++) {
      const b = spawn('', x + Math.random() * 40 - 20, y + Math.random() * 30 - 15, 'bubble');
      b.style.setProperty('--s', (12 + Math.random() * 18).toFixed(0) + 'px');
    }
    Sound.play('bubble'); blob.emote('joy', 600); blob.jiggle = 0.4; updateHUD();
    if (S.stats.clean >= 100) endBath();
  }
  function endBath() {
    if (phase !== 'bath') return;
    phase = 'idle'; stage.classList.remove('bathing'); hint(null);
    if (S.stats.clean > 80) { burst('✨', 8); Sound.play('chime'); say('So fresh! ✨', 2000); blob.emote('excited', 1800); blob.hop(360); }
    save(); updateHUD();
  }
  $('#bathDone').onclick = endBath;

  // ---------- feeding ----------
  function buildFood() {
    const g = $('#foodGrid'); g.innerHTML = '';
    FOODS.forEach((f) => {
      const b = document.createElement('button'); b.className = 'food';
      b.innerHTML = `<span class="e">${f.e}</span><small>${f.n}</small>`;
      b.onclick = () => { closeModal('feedModal'); feed(f); };
      g.appendChild(b);
    });
  }
  function feed(f) {
    if (S.stats.hunger >= 96) { blob.wiggle(); blob.emote('full', 1600); say(`I'm full~`, 1600); Sound.play('boop', 0.8); return; }
    phase = 'busy';
    const sr = stage.getBoundingClientRect(), el = document.createElement('div');
    el.className = 'food-fly'; el.textContent = f.e;
    el.style.left = (sr.width / 2 - 20) + 'px'; el.style.top = (sr.height + 10) + 'px';
    stage.appendChild(el);
    blob.emote('excited', 900); blob.lookAt(0, 0.6);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const m = blob.mouthPoint();
      el.style.left = (m.x - sr.left - 20) + 'px'; el.style.top = (m.y - sr.top - 24) + 'px'; el.style.transform = 'scale(.6)';
    }));
    setTimeout(() => {
      el.remove(); blob.emote('eating', 1700); Sound.play('nom'); blob.poke();
      const m = blob.mouthPoint();
      for (let i = 0; i < 3; i++) setTimeout(() => spawn('·', m.x + Math.random() * 40 - 20, m.y, '', 1400), i * 200);
    }, 720);
    setTimeout(() => {
      Life.add(S, 'hunger', f.v); Life.add(S, 'fun', f.fun);
      blob.emote('joy', 1500); blob.hop(300); say(pick(['Yummy!', 'Nom nom ♡', 'Tasty~', `${f.n}! ♡`]), 1700);
      phase = 'idle'; save(); updateHUD();
    }, 2450);
  }

  // ---------- sleep ----------
  function sleep() {
    S.asleep = true; app.classList.add('sleeping'); blob.sleeping = true;
    Sound.play('yawn'); Sound.setSleepy(true);
    blob.emote('sleepy', 1200); say(S.stats.energy > 85 ? `Not very sleepy… but okay~` : 'Good night… ♡', 1800);
    setTimeout(refreshMood, 1200); updateHUD(); save();
  }
  function wake(auto) {
    S.asleep = false; app.classList.remove('sleeping'); blob.sleeping = false; Sound.setSleepy(false);
    blob.emote('sleepy', 1400); Sound.play('yawn');
    setTimeout(() => { blob.emote('happy', 1600); blob.hop(340); say(auto ? 'Good morning! I feel great ☀' : 'Morning~ ♡', 2000); refreshMood(); }, 1400);
    updateHUD(); save();
  }

  // ---------- play ----------
  function buildGames() {
    const l = $('#gameList'); l.innerHTML = '';
    Games.list.forEach((g) => {
      const b = document.createElement('button'); b.className = 'game-card';
      b.innerHTML = `<span class="e">${g.e}</span><span><b>${g.name}</b><small>${g.desc}</small></span>`;
      b.onclick = () => startGame(g);
      l.appendChild(b);
    });
  }
  function startGame(g) {
    if (S.stats.energy < 15) { closeModal('playModal'); blob.emote('sleepy', 1800); say('too sleepy to play… nap first?', 2200); return; }
    closeModal('playModal'); phase = 'game';
    $('#gameTitle').textContent = g.e + ' ' + g.name;
    openModal('gameModal');
    Games.start(g.id, {
      area: $('#gameArea'), scoreEl: $('#gameScore'), timeEl: $('#gameTime'), color: colorById(S.color),
      onEnd: (score, coins) => {
        closeModal('gameModal'); phase = 'idle';
        S.games++; Life.add(S, 'fun', 20); Life.add(S, 'energy', -8); Life.add(S, 'hunger', -4);
        addCoins(coins); blob.emote('excited', 2200); blob.hop(420);
        say(pick(['That was fun!', 'Again again!', 'You are so good at this!', 'Hehe, I had fun ♡']), 2200);
        save(); updateHUD();
      },
    });
  }
  $('#gameQuit').onclick = () => { Games.stop(); closeModal('gameModal'); phase = 'idle'; blob.emote('happy', 1200); say('Let\'s play later ♡', 1500); };

  // ---------- gifts / lootbox ----------
  function refreshBox() {
    const free = giftReady();
    $('#boxStage').classList.remove('opened');
    $('#giftbox').classList.remove('shake');
    $('#boxWear').hidden = true;
    $('#boxTitle').textContent = free ? 'Daily present!' : 'Gift box';
    $('#boxInfo').innerHTML = free ? 'One free present every day ♡' : `Costs <b>${BOX_COST}</b> coins · you have ${S.coins}. Earn coins by playing!`;
    const ob = $('#boxOpen');
    ob.textContent = free ? 'Open (free!)' : `Open · ${BOX_COST}`;
    ob.disabled = !free && S.coins < BOX_COST;
    ob.hidden = false;
  }
  let lastWon = null;
  function openBox() {
    const free = giftReady();
    if (!free && S.coins < BOX_COST) return;
    if (free) S.lastGift = today(); else { S.coins -= BOX_COST; }
    updateHUD(); save();
    const ob = $('#boxOpen'); ob.hidden = true;
    $('#boxStage').classList.remove('opened');
    const gb = $('#giftbox'); gb.classList.remove('shake'); void gb.offsetWidth; gb.classList.add('shake');
    [0, 450, 900].forEach((d) => setTimeout(() => Sound.play('shake'), d));
    const h = rollHat(); lastWon = h;
    setTimeout(() => {
      const dup = !!S.hats[h.id];
      S.hats[h.id] = (S.hats[h.id] || 0) + 1;
      $('#reveal').innerHTML = `${hatPreviewSvg(h)}<b>${h.name}</b><span class="rar ${h.rarity}">${RARITY[h.rarity].label}</span>`;
      $('#boxStage').classList.add('opened');
      Sound.play(h.rarity === 'legendary' || h.rarity === 'epic' ? 'yay' : 'chime');
      $('#boxInfo').innerHTML = dup ? 'You already had this one, so it turned into <b>+8 coins</b>!' : 'New hat added to your Hatdex! ♡';
      if (dup) addCoins(8);
      $('#boxWear').hidden = false;
      ob.hidden = false;
      const free2 = giftReady();
      ob.textContent = `Another · ${BOX_COST}`; ob.disabled = !free2 && S.coins < BOX_COST;
      save(); updateHUD();
    }, 1400);
  }
  $('#boxOpen').onclick = () => { if ($('#boxStage').classList.contains('opened')) { refreshBox(); setTimeout(openBox, 50); } else openBox(); };
  $('#boxWear').onclick = () => { if (lastWon) equip(lastWon.id); closeModal('boxModal'); };

  // ---------- hats ----------
  function equip(id) {
    S.equipped = S.equipped === id ? null : id;
    blob.setHat(S.equipped ? hatById(S.equipped) : null);
    blob.emote(S.equipped ? 'excited' : 'happy', 1600); blob.hop(340); Sound.play('boop', 1.3);
    say(S.equipped ? pick(['Do I look cute?', 'Fancy! ♡', 'I love it!']) : 'Hat off~', 1700);
    save();
  }
  function buildDex() {
    const g = $('#dexGrid'); g.innerHTML = '';
    const owned = HATS.filter((h) => S.hats[h.id]).length;
    $('#dexCount').textContent = `${owned}/${HATS.length}`;
    HATS.forEach((h) => {
      const n = S.hats[h.id] || 0, b = document.createElement('button');
      b.className = 'dex' + (n ? '' : ' locked') + (S.equipped === h.id ? ' worn' : '');
      b.innerHTML = `<i class="dot ${h.rarity}"></i>${n > 1 ? `<span class="cnt">×${n}</span>` : ''}${hatPreviewSvg(h)}<small>${n ? h.name : '???'}</small>`;
      b.title = n ? `${h.name} (${RARITY[h.rarity].label})` : RARITY[h.rarity].label;
      if (n) b.onclick = () => { equip(h.id); buildDex(); };
      g.appendChild(b);
    });
  }

  // ---------- action bar ----------
  document.querySelectorAll('.act').forEach((b) => b.addEventListener('click', () => {
    if (!S || phase === 'naming' || phase === 'game') return;
    const a = b.dataset.act;
    if (phase === 'shy') { recognize(); return; }
    if (phase === 'busy') return;
    if (phase === 'bath' && a !== 'bath') endBath();
    if (S.asleep && ['feed', 'bath', 'play'].includes(a)) { toast(`💤 ${S.name} is sleeping. Wake them up first?`); return; }
    Sound.play('boop', 1.1);
    if (a === 'feed') { buildFood(); openModal('feedModal'); }
    if (a === 'bath') phase === 'bath' ? endBath() : startBath();
    if (a === 'play') { buildGames(); openModal('playModal'); }
    if (a === 'sleep') S.asleep ? wake(false) : sleep();
    if (a === 'gift') { refreshBox(); openModal('boxModal'); }
    if (a === 'dex') { buildDex(); openModal('dexModal'); }
  }));
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('.modal').classList.remove('open')));
  document.querySelectorAll('.modal').forEach((m) => m.addEventListener('pointerdown', (e) => {
    if (e.target === m && m.id !== 'nameModal' && m.id !== 'gameModal') m.classList.remove('open');
  }));
  $('#nameOk').onclick = confirmName;
  $('#nameInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmName(); });
  $('#nametag').addEventListener('click', () => { if (S && phase === 'idle') startNaming(true); });

  // ---------- idle life ----------
  function idle() {
    if (phase !== 'idle' || S.asleep) return;
    if (now - pointer.lastMove > 3) {
      if (now > nextIdle) {
        nextIdle = now + 1.8 + Math.random() * 3;
        blob.lookAt(Math.random() * 1.6 - 0.8, Math.random() * 0.8 - 0.3);
        if (Math.random() < 0.18) blob.hop(220 + Math.random() * 160);
      }
    }
    if (now > nextChat) {
      nextChat = now + 11 + Math.random() * 10;
      const m = Life.mood(S);
      const needs = {
        hunger: () => { blob.emote('hungry', 2000); say(pick(['🍓?', 'tummy rumbles…', 'snack? 🍙'])); },
        fun: () => { blob.emote('down', 2000); say(pick(['play with me? 🎈', 'so bored…'])); },
        clean: () => { blob.emote('down', 2000); say(pick(['bath? 🫧', 'feeling a bit sticky…'])); },
        energy: () => { blob.emote('sleepy', 2200); Sound.play('yawn'); say('*yaaawn*'); },
      };
      if (m.need) needs[m.need]();
      else if (Math.random() < 0.45) { blob.emote(pick(['happy', 'wink', 'joy']), 1400); say(pick(['♪ ♫', 'hehe', '*wobble wobble*', 'I like you ♡', 'la la la~', `${S.name} is happy!`]), 1800); }
    }
  }

  function loop(ts) {
    const t = ts / 1000, dt = Math.min(0.05, t - (now || t));
    now = t;
    blob.update(dt, t);
    if (S && phase !== 'naming') {
      if (t - lastTick > 1) {
        lastTick = t;
        Life.tick(S, Date.now());
        if (S.asleep) {
          Life.add(S, 'energy', 1.2);
          if (S.stats.energy >= 100) wake(true);
        }
        refreshMood(); updateHUD();
      }
      if (S.asleep && t > nextZ) { nextZ = t + 1.6; const r = blob.rect(); spawn(pick(['z', 'Z', 'z']), r.right - r.width * 0.2, r.top + r.height * 0.2, 'zzz', 2700); }
      idle();
      if (t - lastSave > 5) { lastSave = t; save(); }
    }
    requestAnimationFrame(loop);
  }

  // ---------- boot ----------
  setTimeOfDay(); setInterval(setTimeOfDay, 60000);
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  if (S) beginVisit();
  else { blob.setScale(0.62, true); blob.setBase('peek'); startNaming(false); }
  requestAnimationFrame(loop);
})();
