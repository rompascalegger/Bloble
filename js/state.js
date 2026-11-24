/* Bloble – save state, needs, growth */
const Bus = {
  h: {},
  on(e, f) { (this.h[e] || (this.h[e] = [])).push(f); },
  emit(e, d) { (this.h[e] || []).forEach((f) => { try { f(d); } catch (err) { console.error(err); } }); },
};
const Store = (() => {
  const KEY = 'bloble.save.v1';
  const PREF = 'bloble.prefs.v1';
  const read = (k) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: play without saving */ } };
  return {
    load: () => read(KEY),
    save: (s) => write(KEY, s),
    reset: () => { try { localStorage.removeItem(KEY); } catch (e) {} },
    prefs: () => read(PREF) || { music: true },
    savePrefs: (p) => write(PREF, p),
  };
})();

const COLORS = [
  { id: 'pink',   body: '#ffb8d4', shade: '#f08fb9', light: '#ffe6f1', cheek: '#ff7fae' },
  { id: 'mint',   body: '#aeecd2', shade: '#7dd3b2', light: '#e6fff4', cheek: '#ff9bb9' },
  { id: 'sky',    body: '#b8dcff', shade: '#8bbff0', light: '#ebf6ff', cheek: '#ff9bc0' },
  { id: 'lav',    body: '#d6c6ff', shade: '#ae98f0', light: '#f3edff', cheek: '#ff8fbe' },
  { id: 'peach',  body: '#ffd3b5', shade: '#f2a982', light: '#fff2e8', cheek: '#ff8f9e' },
  { id: 'butter', body: '#ffeba6', shade: '#efcb6a', light: '#fffbe6', cheek: '#ff9f9f' },
];
const colorById = (id) => COLORS.find((c) => c.id === id) || COLORS[0];

const dayKey = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

const STAGES = [
  { d: 1, n: 'Tiny Bloblet' },
  { d: 3, n: 'Little Blob' },
  { d: 7, n: 'Bloble' },
  { d: 14, n: 'Big Bloble' },
  { d: 30, n: 'Grand Bloble' },
];

const Life = {
  create(name, color) {
    const now = Date.now();
    return {
      v: 1, name, color, born: now, lastSeen: now,
      stats: { hunger: 75, fun: 70, clean: 90, energy: 85 },
      coins: 30, hats: {}, equipped: null,
      daysCount: 1, lastDay: dayKey(now), lastGift: null,
      pets: 0, games: 0, asleep: false, sleptAt: null,
    };
  },

  growth(s) {
    const n = s.daysCount;
    const scale = 0.62 + 0.38 * (1 - Math.exp(-(n - 1) / 9));
    let stage = STAGES[0].n;
    for (const st of STAGES) if (n >= st.d) stage = st.n;
    return { days: n, scale, stage };
  },

  // Gentle needs decay. Never drops so low that it feels stressful.
  tick(s, now) {
    const hrs = Math.max(0, (now - s.lastSeen) / 3600000);
    s.lastSeen = now;
    if (hrs <= 0) return 0;
    const st = s.stats;
    const FLOOR = { hunger: 20, fun: 20, clean: 22, energy: 45 }; // it naps while you're away
    const dec = (k, r) => { st[k] = Math.max(Math.min(st[k], FLOOR[k]), st[k] - r * hrs); };
    if (s.asleep) {
      st.energy = Math.min(100, st.energy + 30 * hrs);
      dec('hunger', 2); dec('fun', 1); dec('clean', 1);
    } else {
      dec('hunger', 5); dec('fun', 4); dec('clean', 3); dec('energy', 3);
    }
    return hrs;
  },

  // Called once on page load. Returns info about the visit.
  visit(s, now) {
    const away = (now - s.lastSeen) / 3600000;
    const today = dayKey(now);
    let grew = false;
    if (s.lastDay !== today) { s.daysCount += 1; s.lastDay = today; grew = true; }
    Life.tick(s, now);
    return { awayHours: away, missed: away >= 24, grew, giftReady: s.lastGift !== today };
  },

  mood(s) {
    const st = s.stats;
    const avg = (st.hunger + st.fun + st.clean + st.energy) / 4;
    const lowest = Object.entries(st).sort((a, b) => a[1] - b[1])[0];
    return { avg, need: lowest[1] < 35 ? lowest[0] : null };
  },

  add(s, k, v) { s.stats[k] = Math.max(0, Math.min(100, s.stats[k] + v)); },
};
