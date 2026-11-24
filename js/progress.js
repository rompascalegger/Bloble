/* Bloble – progress: daily streak, quests, sticker book, tricks, gift box upgrades */
(() => {
  const B = window.Bloble, $ = (s) => document.querySelector(s), blob = B.blob;
  const S = () => Juice.ensure(B.S);
  const DAY = 86400000;

  // ================= daily streak =================
  const STREAK_REWARDS = [10, 15, 20, 25, 30, 40, 50];
  let streakClaimable = 0;
  function renderStreak(claimMode) {
    const s = S(), day = ((Math.max(1, s.streak) - 1) % 7) + 1;
    $('#streakNum').textContent = s.streak;
    $('#streakTitle').textContent = `${s.streak}-day streak!`;
    $('#streakSub').textContent = claimMode ? `${s.name} is so happy you came back. Here's a little thank-you ♡` : 'Visit every day to keep the flame cozy. Day 7 gives a free gift!';
    $('#streakTrack').innerHTML = STREAK_REWARDS.map((r, i) => {
      const d = i + 1, cls = d < day || (d === day && !claimMode) ? 'got' : d === day ? 'today' : '';
      return `<div class="sday ${cls}"><span class="e">${d === 7 ? '🎁' : '🪙'}</span>${r}</div>`;
    }).join('');
    $('#streakClaim').hidden = !claimMode;
    $('#streakClaim').textContent = `Claim ${STREAK_REWARDS[day - 1]} coins${day === 7 ? ' + gift' : ''}!`;
  }
  Bus.on('greeted', () => {
    const s = S(), today = dayKey(Date.now()), yesterday = dayKey(Date.now() - DAY);
    if (s.lastStreakDay === today) { renderStreak(false); return; }
    s.streak = s.lastStreakDay === yesterday ? s.streak + 1 : 1;
    s.lastStreakDay = today; streakClaimable = ((s.streak - 1) % 7) + 1;
    B.save();
    setTimeout(() => { renderStreak(true); B.openModal('streakModal'); Sound.play('chime'); }, 1600);
  });
  $('#streakClaim').onclick = () => {
    const s = S(); if (!streakClaimable) return;
    const r = STREAK_REWARDS[streakClaimable - 1];
    if (streakClaimable === 7) { s.freeBoxes++; B.updateHUD(); }
    streakClaimable = 0;
    B.closeModal('streakModal');
    Juice.confetti(90, innerWidth / 2, innerHeight * 0.5); Juice.vibrate(30);
    B.addCoins(r); Juice.xp(10);
    checkStickers();
  };
  $('#streakBtn').onclick = () => { if (!B.S) return; renderStreak(false); B.openModal('streakModal'); };

  // ================= daily quests =================
  const QUESTS = [
    { id: 'pet', e: '💗', t: 'Pet {n} 15 times', goal: 15, ev: 'pet' },
    { id: 'feed', e: '🍙', t: 'Share 2 snacks', goal: 2, ev: 'feed' },
    { id: 'bath', e: '🫧', t: 'Give a bubble bath', goal: 1, ev: 'bath' },
    { id: 'game', e: '🎮', t: 'Play 2 mini-games', goal: 2, ev: 'game' },
    { id: 'stars', e: '⭐', t: 'Catch 15 stars in one game', goal: 15, ev: 'game', val: (d) => (d.id === 'stars' ? d.score : 0), max: true },
    { id: 'box', e: '🎁', t: 'Open a gift box', goal: 1, ev: 'box' },
    { id: 'trick', e: '🪄', t: 'Practice tricks 3 times', goal: 3, ev: 'trick' },
    { id: 'visitor', e: '🎈', t: 'Catch a surprise visitor', goal: 1, ev: 'visitor' },
    { id: 'love', e: '💖', t: 'Fill the love meter', goal: 1, ev: 'loveBurst' },
    { id: 'hat', e: '🎩', t: 'Try on a hat', goal: 1, ev: 'hat' },
  ];
  const qdef = (id) => QUESTS.find((q) => q.id === id);
  function quests() {
    const s = S(), today = dayKey(Date.now());
    if (!s.quests || s.quests.day !== today) {
      const pool = [...QUESTS].sort(() => Math.random() - 0.5).slice(0, 3);
      s.quests = { day: today, bonus: false, list: pool.map((q) => ({ id: q.id, p: 0, claimed: false })) };
    }
    return s.quests;
  }
  function questBadge() {
    if (!B.S) return;
    const n = quests().list.filter((q) => !q.claimed && q.p >= qdef(q.id).goal).length;
    const b = $('#questBadge'); b.textContent = n; b.classList.toggle('show', n > 0);
    $('#questBtn').classList.toggle('glow', n > 0);
  }
  function renderQuests() {
    const Q = quests(), s = S();
    $('#questList').innerHTML = Q.list.map((q, i) => {
      const d = qdef(q.id), done = q.p >= d.goal;
      return `<div class="quest ${done ? 'done' : ''}"><span class="e">${d.e}</span>
        <span><b>${d.t.replace('{n}', s.name)}</b><div class="qbar"><i style="width:${Math.min(100, (q.p / d.goal) * 100)}%"></i></div></span>
        <button data-q="${i}" class="${done && !q.claimed ? 'claim' : ''}" ${!done || q.claimed ? 'disabled' : ''}>${q.claimed ? '✓' : done ? 'Claim' : `${Math.min(q.p, d.goal)}/${d.goal}`}</button></div>`;
    }).join('') + `<div class="quest-bonus">${Q.bonus ? 'All done today! ♡' : 'Finish all 3 for a bonus gift 🎁'}</div>`;
    $('#questList').querySelectorAll('button.claim').forEach((b) => b.onclick = (e) => claimQuest(+b.dataset.q, e));
  }
  function claimQuest(i, e) {
    const Q = quests(), q = Q.list[i]; if (q.claimed) return;
    q.claimed = true;
    Juice.from(e.clientX, e.clientY); B.addCoins(15); Juice.xp(20); Juice.confetti(50, e.clientX, e.clientY); Juice.vibrate(20);
    if (!Q.bonus && Q.list.every((x) => x.claimed)) {
      Q.bonus = true; S().freeBoxes++;
      setTimeout(() => { Juice.banner('🎁', 'All quests done!', '+1 free gift box'); Juice.confetti(120, innerWidth / 2, innerHeight / 2, true); Sound.play('fanfare'); }, 500);
    }
    B.save(); B.updateHUD(); renderQuests(); questBadge();
  }
  function questEvent(ev, d) {
    if (!B.S) return;
    quests().list.forEach((q) => {
      const def = qdef(q.id); if (def.ev !== ev || q.claimed) return;
      const was = q.p >= def.goal;
      q.p = def.max ? Math.max(q.p, def.val(d || {})) : q.p + 1;
      if (!was && q.p >= def.goal) Juice.banner(def.e, 'Quest complete!', def.t.replace('{n}', B.S.name));
    });
    questBadge();
  }
  ['pet', 'feed', 'bath', 'game', 'box', 'trick', 'visitor', 'loveBurst', 'hat'].forEach((ev) => Bus.on(ev, (d) => questEvent(ev, d)));
  $('#questBtn').onclick = () => { if (!B.S) return; renderQuests(); B.openModal('questModal'); };

  // ================= sticker book =================
  const STICKERS = [
    { id: 'boop', e: '👆', n: 'First Boop', d: 'Pet your blob', t: (s) => s.pets >= 1 },
    { id: 'cuddle', e: '🤗', n: 'Cuddle Expert', d: 'Pet 100 times', t: (s) => s.pets >= 100 },
    { id: 'snack', e: '🍙', n: 'Snack Buddy', d: 'Share 10 snacks', t: (s) => s.feeds >= 10 },
    { id: 'clean', e: '🛁', n: 'Squeaky Clean', d: 'Give 5 baths', t: (s) => s.baths >= 5 },
    { id: 'gamer', e: '🎮', n: 'Game Pal', d: 'Play 10 mini-games', t: (s) => s.games >= 10 },
    { id: 'stargazer', e: '🌠', n: 'Star Gazer', d: 'Catch 25 stars in one game', t: (s) => s.bestStars >= 25 },
    { id: 'gifts', e: '🎁', n: 'Gift Hunter', d: 'Open 10 gift boxes', t: (s) => s.boxes >= 10 },
    { id: 'fashion', e: '👒', n: 'Fashionista', d: 'Collect 5 hats', t: (s) => Object.keys(s.hats).length >= 5 },
    { id: 'hatmaster', e: '🎩', n: 'Hat Master', d: 'Collect every hat', t: (s) => Object.keys(s.hats).length >= HATS.length },
    { id: 'lucky', e: '🍀', n: 'Lucky Star', d: 'Find a legendary hat', t: (s) => s.legendaries >= 1 },
    { id: 'bff', e: '💞', n: 'Best Friends', d: 'Reach friendship level 5', t: (s) => s.level >= 5 },
    { id: 'soul', e: '💍', n: 'Soulmates', d: 'Reach friendship level 10', t: (s) => s.level >= 10 },
    { id: 'regular', e: '🔥', n: 'Regular', d: 'Keep a 3-day streak', t: (s) => s.streak >= 3 },
    { id: 'weekly', e: '📅', n: 'Weekly Visitor', d: 'Keep a 7-day streak', t: (s) => s.streak >= 7 },
    { id: 'burst', e: '💖', n: 'Love Burst', d: 'Fill the love meter', t: (s) => s.loveBursts >= 1 },
    { id: 'performer', e: '🎭', n: 'Little Performer', d: 'Master a trick', t: (s) => Object.values(s.tricks).some((v) => v >= 5) },
    { id: 'catcher', e: '🎈', n: 'Sky Catcher', d: 'Catch 10 surprise visitors', t: (s) => s.visitors >= 10 },
    { id: 'sparkle', e: '✨', n: 'Sparkle Fever', d: 'Keep every need above 80', t: (s) => !!s.hadFever },
    { id: 'grown', e: '🌱', n: 'Growing Up', d: 'Visit on 7 different days', t: (s) => s.daysCount >= 7 },
    { id: 'owl', e: '🦉', n: 'Night Owl', d: 'Visit late at night', t: () => { const h = new Date().getHours(); return h >= 22 || h < 5; } },
  ];
  function checkStickers() {
    const s = S(); if (!s || B.phase === 'naming') return;
    STICKERS.forEach((st) => {
      if (s.stickers[st.id] || !st.t(s)) return;
      s.stickers[st.id] = Date.now(); s.newStickers[st.id] = true;
      Juice.banner(st.e, st.n, 'Sticker unlocked! +10 coins');
      setTimeout(() => { Juice.confetti(60, innerWidth / 2, 60); B.addCoins(10); }, 300);
    });
    const n = Object.keys(s.newStickers).length, b = $('#stickerBadge');
    b.textContent = n; b.classList.toggle('show', n > 0);
  }
  function renderStickers() {
    const s = S(), got = STICKERS.filter((x) => s.stickers[x.id]).length;
    $('#stickerCount').textContent = `${got}/${STICKERS.length}`;
    $('#stickerGrid').innerHTML = STICKERS.map((st) => {
      const has = s.stickers[st.id];
      return `<div class="sticker-cell" data-d="${has ? st.n + ': ' : '???: '}${st.d}"><div class="sticker ${has ? '' : 'locked'} ${s.newStickers[st.id] ? 'fresh' : ''}"><span>${st.e}</span></div><small>${has ? st.n : '???'}</small></div>`;
    }).join('') + '';
    $('#stickerGrid').querySelectorAll('.sticker-cell').forEach((c) => c.onclick = () => B.toast(c.dataset.d, 2000));
  }
  $('#stickerBtn').onclick = () => { if (!B.S) return; renderStickers(); B.openModal('stickerModal'); S().newStickers = {}; checkStickers(); B.save(); };

  // ================= tricks =================
  const TRICKS = [
    { id: 'jump', e: '🦘', n: 'Jump', lv: 1 },
    { id: 'spin', e: '🌀', n: 'Spin', lv: 2 },
    { id: 'dance', e: '💃', n: 'Dance', lv: 3 },
    { id: 'bow', e: '🎀', n: 'Bow', lv: 5 },
    { id: 'twirl', e: '🌟', n: 'Twirl Jump', lv: 7 },
  ];
  function renderTricks() {
    const s = S();
    $('#trickList').innerHTML = TRICKS.map((t) => {
      const sk = s.tricks[t.id] || 0, locked = s.level < t.lv;
      const stars = [0, 1, 2, 3, 4].map((i) => `<span class="${i < sk ? '' : 'off'}">★</span>`).join('');
      return `<div class="trick ${locked ? 'locked' : ''}"><span class="e">${t.e}</span><span><b>${t.n}</b><div class="stars">${locked ? `Unlocks at level ${t.lv}` : stars}</div></span>
        <button data-t="${t.id}" ${locked ? 'disabled' : ''}>${locked ? '🔒' : sk >= 5 ? 'Show!' : 'Practice'}</button></div>`;
    }).join('');
    $('#trickList').querySelectorAll('button[data-t]').forEach((b) => b.onclick = () => practice(b.dataset.t));
  }
  function perform(id, done) {
    const fx = () => { const r = blob.rect(); Juice.confetti(25, r.left + r.width / 2, r.top + r.height * 0.3); };
    if (id === 'jump') { blob.hop(680); Sound.play('boop', 1.3); setTimeout(fx, 600); setTimeout(done, 900); }
    if (id === 'spin') { blob.hop(320); blob.spin(0.7); Sound.play('whoosh'); setTimeout(fx, 500); setTimeout(done, 900); }
    if (id === 'bow') { blob.sqv += 9; blob.emote('happy', 1200); setTimeout(() => { blob.sqv += 7; B.say('ta-da~ ♡', 1400); fx(); }, 450); setTimeout(done, 1300); }
    if (id === 'twirl') { blob.hop(760); blob.spin(0.9); Sound.play('whoosh'); setTimeout(() => { fx(); fx(); Sound.play('sparkle'); }, 750); setTimeout(done, 1200); }
    if (id === 'dance') {
      let i = 0; const r = blob.rect();
      const step = () => {
        if (i >= 8) { done(); return; }
        if (i % 2) blob.wiggle(); else blob.hop(260);
        blob.emote(i % 4 < 2 ? 'joy' : 'wink', 500);
        B.spawn(B.pick(['♪', '♫', '♬']), r.left + Math.random() * r.width, r.top + r.height * 0.2, 'note', 1600);
        Sound.play('boop', 1 + (i % 4) * 0.15); i++; setTimeout(step, 380);
      };
      step();
    }
  }
  function practice(id) {
    const s = S(), t = TRICKS.find((x) => x.id === id);
    B.closeModal('trickModal');
    if (B.phase !== 'idle') return;
    if (s.asleep) { B.toast(`💤 ${s.name} is sleeping.`); return; }
    if (s.stats.energy < 10) { blob.emote('sleepy', 1600); B.say('too sleepy for tricks…', 1800); return; }
    const sk = s.tricks[id] || 0, ok = sk >= 5 || Math.random() < 0.35 + sk * 0.16;
    B.phase = 'busy'; Life.add(s, 'energy', -2);
    B.say(`${t.n}!`, 900); blob.emote('excited', 900);
    setTimeout(() => {
      if (!ok) {
        blob.wiggle(); blob.emote('surprised', 700); Sound.play('oops');
        setTimeout(() => { blob.emote('wink', 1400); B.say(B.pick(['oops! hehe', 'almost had it!', 'one more time?']), 1600); B.phase = 'idle'; }, 700);
        Juice.xp(2); Bus.emit('trick', { id, ok }); B.save(); return;
      }
      perform(id, () => {
        B.phase = 'idle'; blob.emote('joy', 1500);
        if (sk < 5) {
          s.tricks[id] = sk + 1;
          if (sk + 1 === 5) { Juice.banner(t.e, `${t.n} mastered!`, `${s.name} learned a new trick`); Sound.play('fanfare'); Juice.confetti(100, undefined, undefined, true); B.addCoins(15); }
          else B.say(B.pick(['I did it!', 'getting better!', 'yay! ★']), 1500);
        } else B.say('★ ta-da! ★', 1400);
        Juice.xp(sk >= 5 ? 3 : 6); Life.add(s, 'fun', 4);
        Bus.emit('trick', { id, ok }); checkStickers(); B.save(); B.updateHUD();
      });
    }, 700);
  }
  function trickBadge() {
    const s = S(); if (!s) return;
    const unlocked = TRICKS.filter((t) => s.level >= t.lv).length;
    const b = $('#trickBadge'); b.textContent = '!'; b.classList.toggle('show', unlocked > (s.tricksSeen || 0));
  }
  $('#trickBtn').onclick = () => {
    if (!B.S) return; const s = S();
    s.tricksSeen = TRICKS.filter((t) => s.level >= t.lv).length; trickBadge();
    renderTricks(); B.openModal('trickModal');
  };
  Bus.on('level', trickBadge);

  // ================= gift box upgrades =================
  const baseRoll = window.rollHat;
  window.rollHat = () => {
    const s = S(); let h = baseRoll();
    if (s.boxesSinceEpic >= 9 && h.rarity !== 'epic' && h.rarity !== 'legendary') {
      const pool = HATS.filter((x) => x.rarity === (Math.random() < 0.15 ? 'legendary' : 'epic'));
      h = pool[Math.floor(Math.random() * pool.length)];
    }
    return h;
  };
  const RAR = ['rar-common', 'rar-rare', 'rar-epic', 'rar-legendary'];
  const GLOW = ['glow-rare', 'glow-epic', 'glow-legendary'];
  function pityText() {
    const s = S(); let p = $('#boxModal .pity');
    if (!p) { p = document.createElement('p'); p.className = 'pity'; $('#boxInfo').after(p); }
    const left = 10 - s.boxesSinceEpic;
    p.textContent = `✨ Epic or better guaranteed within ${left} box${left === 1 ? '' : 'es'}`;
  }
  Bus.on('boxRefresh', () => {
    $('#giftbox').classList.remove(...GLOW); $('#boxStage').classList.remove(...RAR);
    const st = $('#reveal .new-stamp'); if (st) st.remove();
    pityText();
  });
  Bus.on('boxRoll', (h) => {
    $('#giftbox').classList.remove(...GLOW); $('#boxStage').classList.remove(...RAR);
    Juice.vibrate([10, 440, 10, 440, 10]);
    if (h.rarity !== 'common') setTimeout(() => $('#giftbox').classList.add('glow-' + h.rarity), 650);
  });
  Bus.on('box', ({ hat, dup }) => {
    const s = S(); s.boxes++;
    $('#giftbox').classList.remove(...GLOW);
    $('#boxStage').classList.add('rar-' + hat.rarity);
    if (hat.rarity === 'epic' || hat.rarity === 'legendary') s.boxesSinceEpic = 0; else s.boxesSinceEpic++;
    if (!dup) { const st = document.createElement('span'); st.className = 'new-stamp'; st.textContent = 'NEW!'; $('#reveal').appendChild(st); }
    if (hat.rarity === 'legendary') { s.legendaries++; Juice.flash(true); Juice.vibrate([40, 40, 40, 40, 120]); setTimeout(() => Sound.play('fanfare'), 200); Juice.confetti(180, innerWidth / 2, innerHeight * 0.4, true); }
    else if (hat.rarity === 'epic') { Juice.vibrate([30, 40, 60]); Juice.confetti(90, innerWidth / 2, innerHeight * 0.4); }
    else if (hat.rarity === 'rare') Juice.confetti(35, innerWidth / 2, innerHeight * 0.4);
    pityText(); checkStickers(); B.save();
  });

  // ================= counters & checks =================
  Bus.on('feed', () => { S().feeds++; checkStickers(); });
  Bus.on('bath', () => { S().baths++; checkStickers(); });
  Bus.on('game', (d) => { if (d.id === 'stars') S().bestStars = Math.max(S().bestStars, d.score); setTimeout(checkStickers, 1500); });
  Bus.on('fever', () => { S().hadFever = true; checkStickers(); });
  ['pet', 'loveBurst', 'visitor', 'hat', 'level'].forEach((ev) => Bus.on(ev, () => setTimeout(checkStickers, 300)));
  Bus.on('greeted', () => { questBadge(); trickBadge(); setTimeout(checkStickers, 4000); });

  $('#lvlBtn').onclick = () => {
    if (!B.S) return; const s = S();
    B.toast(`♥ Friendship level ${s.level} · ${Math.floor(s.xp)}/${50 + (s.level - 1) * 35} XP to the next level`);
  };
  if (B.S) { renderStreak(false); questBadge(); trickBadge(); }
})();
