/* Bloble – generated lofi pixel music + cute sound effects (Web Audio, no files) */
const Sound = (() => {
  let ctx = null, master, musicBus, musicFilter, sfxBus, noiseBuf, crackle = null;
  let playing = false, timer = null, step = 0, nextTime = 0, melodyNote = 4, sleepy = false;
  let enabled = Store.prefs().music !== false;

  const BPM = 70;
  const S16 = 60 / BPM / 4;
  // Fmaj7 – Em7 – Dm7 – Cmaj7  (warm, calm loop)
  const CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
  const BASS = [41, 40, 38, 36];
  const SCALE = [69, 72, 74, 76, 79, 81, 84]; // pentatonic-ish
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
    musicFilter = ctx.createBiquadFilter(); musicFilter.type = 'lowpass'; musicFilter.frequency.value = 2400; musicFilter.Q.value = 0.4;
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(musicFilter); musicFilter.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.5; sfxBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function env(g, t, a, peak, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + rel);
  }

  function tone(dest, t, freq, type, a, peak, rel, detune = 0) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = detune;
    env(g, t, a, peak, rel);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + a + rel + 0.05);
    return o;
  }

  function noise(dest, t, dur, peak, ftype, freq) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; f.type = ftype; f.frequency.value = freq;
    env(g, t, 0.002, peak, dur);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }

  // ---------- music ----------
  function pad(t, notes, dur) {
    notes.forEach((n, i) => {
      tone(musicBus, t + i * 0.025, mtof(n), 'triangle', 0.35, 0.05, dur, -6);
      tone(musicBus, t + i * 0.025, mtof(n), 'sine', 0.4, 0.04, dur, 7);
    });
  }
  function bass(t, n, dur) { tone(musicBus, t, mtof(n), 'sine', 0.02, 0.22, dur); }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    env(g, t, 0.004, 0.42, 0.28);
    o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.35);
  }
  function snare(t) { noise(musicBus, t, 0.16, 0.1, 'bandpass', 1700); tone(musicBus, t, 190, 'triangle', 0.002, 0.05, 0.08); }
  function hat(t, v) { noise(musicBus, t, 0.035, v, 'highpass', 7500); }
  function lead(t, n) {
    // soft "pixel" square lead, filtered so it stays gentle
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1500; f.connect(musicBus);
    tone(f, t, mtof(n), 'square', 0.01, 0.035, 0.45);
    tone(f, t + S16 * 1.5, mtof(n), 'square', 0.01, 0.012, 0.3); // tiny echo
  }

  function schedule(s, t) {
    const bar = Math.floor(s / 16) % 4, pos = s % 16;
    const section = Math.floor(s / 64) % 4; // light arrangement changes
    if (pos === 0) { pad(t, CHORDS[bar], S16 * 15); bass(t, BASS[bar], S16 * 6); }
    if (pos === 10) bass(t, BASS[bar] + (bar === 3 ? 7 : 0), S16 * 4);
    if (sleepy) { if (pos === 0 && Math.random() < 0.6) lead(t + S16 * 4, SCALE[Math.floor(Math.random() * 4)]); return; }
    if (section !== 0 || bar > 0) {
      if (pos === 0 || pos === 7 || (pos === 10 && bar % 2)) kick(t);
      if (pos === 4 || pos === 12) snare(t);
    }
    if (pos % 2 === 0) hat(t, pos % 4 === 0 ? 0.035 : 0.02);
    if (section >= 1 && [0, 3, 6, 8, 11, 14].includes(pos) && Math.random() < 0.42) {
      melodyNote = Math.max(0, Math.min(SCALE.length - 1, melodyNote + Math.floor(Math.random() * 5) - 2));
      lead(t, SCALE[melodyNote]);
    }
  }

  function loop() {
    while (nextTime < ctx.currentTime + 0.15) {
      const swing = step % 2 ? S16 * 0.18 : 0;
      schedule(step, nextTime + swing);
      nextTime += S16; step++;
    }
  }

  function startCrackle() {
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.0006 ? (Math.random() - 0.5) * 0.7 : 0);
    crackle = ctx.createBufferSource(); crackle.buffer = buf; crackle.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3000; f.Q.value = 0.5;
    const g = ctx.createGain(); g.gain.value = 0.5;
    crackle.connect(f); f.connect(g); g.connect(musicBus); crackle.start();
  }

  function startMusic() {
    if (!ctx || playing) return;
    playing = true; step = 0; nextTime = ctx.currentTime + 0.1;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(0, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.5);
    startCrackle();
    timer = setInterval(loop, 40);
  }
  function stopMusic() {
    if (!ctx || !playing) return;
    playing = false; clearInterval(timer);
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    const c = crackle; setTimeout(() => { try { c.stop(); } catch (e) {} }, 1500);
  }

  // ---------- sfx ----------
  const sfx = {
    boop(p = 1) { const t = ctx.currentTime, o = tone(sfxBus, t, 420 * p, 'sine', 0.01, 0.3, 0.18); o.frequency.exponentialRampToValueAtTime(760 * p, t + 0.12); },
    pop() { const t = ctx.currentTime, o = tone(sfxBus, t, 900 + Math.random() * 400, 'sine', 0.002, 0.3, 0.08); o.frequency.exponentialRampToValueAtTime(1800, t + 0.06); noise(sfxBus, t, 0.03, 0.08, 'highpass', 3000); },
    giggle() { const t = ctx.currentTime; [0, 0.09, 0.18].forEach((d, i) => { const o = tone(sfxBus, t + d, 620 + i * 90, 'triangle', 0.005, 0.22, 0.07); o.frequency.exponentialRampToValueAtTime(900 + i * 90, t + d + 0.06); }); },
    purr() { const t = ctx.currentTime, o = tone(sfxBus, t, 300, 'triangle', 0.05, 0.16, 0.3); o.frequency.linearRampToValueAtTime(380, t + 0.15); o.frequency.linearRampToValueAtTime(330, t + 0.3); },
    nom() { const t = ctx.currentTime; [0, 0.2, 0.4].forEach((d) => { const o = tone(sfxBus, t + d, 260, 'square', 0.005, 0.06, 0.08); o.frequency.exponentialRampToValueAtTime(170, t + d + 0.08); }); },
    chime() { const t = ctx.currentTime; [72, 76, 79, 84].forEach((n, i) => tone(sfxBus, t + i * 0.08, mtof(n), 'triangle', 0.005, 0.2, 0.5)); },
    coin() { const t = ctx.currentTime; tone(sfxBus, t, mtof(83), 'square', 0.003, 0.08, 0.08); tone(sfxBus, t + 0.07, mtof(88), 'square', 0.003, 0.08, 0.25); },
    aww() { const t = ctx.currentTime, o = tone(sfxBus, t, 520, 'sine', 0.05, 0.22, 0.6); o.frequency.exponentialRampToValueAtTime(300, t + 0.6); },
    yay() { const t = ctx.currentTime; [67, 72, 76, 79, 84].forEach((n, i) => tone(sfxBus, t + i * 0.06, mtof(n), 'square', 0.003, 0.06, 0.2)); },
    surprise() { const t = ctx.currentTime, o = tone(sfxBus, t, 500, 'sine', 0.005, 0.25, 0.15); o.frequency.exponentialRampToValueAtTime(1100, t + 0.1); },
    shake() { const t = ctx.currentTime; noise(sfxBus, t, 0.12, 0.12, 'bandpass', 600); },
    bubble() { const t = ctx.currentTime, o = tone(sfxBus, t, 700 + Math.random() * 600, 'sine', 0.003, 0.1, 0.06); o.frequency.exponentialRampToValueAtTime(1500, t + 0.05); },
    yawn() { const t = ctx.currentTime, o = tone(sfxBus, t, 340, 'triangle', 0.15, 0.14, 0.7); o.frequency.linearRampToValueAtTime(460, t + 0.3); o.frequency.linearRampToValueAtTime(260, t + 0.85); },
  };

  return {
    unlock() {
      init();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (enabled) startMusic();
    },
    toggle() {
      enabled = !enabled;
      Store.savePrefs({ ...Store.prefs(), music: enabled });
      init();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      enabled ? startMusic() : stopMusic();
      return enabled;
    },
    get enabled() { return enabled; },
    setSleepy(v) {
      sleepy = v;
      if (ctx) musicFilter.frequency.setTargetAtTime(v ? 800 : 2400, ctx.currentTime, 0.6);
    },
    play(name, arg) { if (ctx && sfx[name]) try { sfx[name](arg); } catch (e) {} },
  };
})();
