/* Bloble – the blob itself: squishy body, big shiny eyes, emotions, hats */
const NS = 'http://www.w3.org/2000/svg';
const INK = '#3d2f4f';
const LINE = `stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

// Emotion presets: eyes, mouth, blush amount, brows, extras, gaze override
const EMOTIONS = {
  neutral:   { eyes: 'open', mouth: 'cat', blush: 0.4 },
  happy:     { eyes: 'open', mouth: 'smile', blush: 0.55 },
  joy:       { eyes: 'happy', mouth: 'open', blush: 0.75 },
  love:      { eyes: 'heart', mouth: 'open', blush: 0.9 },
  excited:   { eyes: 'sparkle', mouth: 'open', blush: 0.75 },
  wink:      { eyes: ['open', 'happy'], mouth: 'smile', blush: 0.6 },
  shy:       { eyes: 'shy', mouth: 'wobbly', blush: 1, sweat: true, gaze: [-0.75, 0.7] },
  peek:      { eyes: 'shy', mouth: 'osmall', blush: 0.9, gaze: [0.2, 0.2] },
  surprised: { eyes: 'surprised', mouth: 'o', blush: 0.45 },
  sad:       { eyes: 'sad', mouth: 'sad', blush: 0.2, brows: true, tear: true, gaze: [0, 0.5] },
  down:      { eyes: 'sad', mouth: 'pout', blush: 0.25, brows: true },
  sleepy:    { eyes: 'half', mouth: 'osmall', blush: 0.35 },
  sleeping:  { eyes: 'closed', mouth: 'osmall', blush: 0.5, gaze: [0, 0.3] },
  eating:    { eyes: 'happy', mouth: 'nom', blush: 0.65 },
  full:      { eyes: 'happy', mouth: 'pout', blush: 0.5 },
  hungry:    { eyes: 'open', mouth: 'osmall', blush: 0.35 },
};

function eyeSvg(type, c) {
  const hl = `<circle class="hl" cx="-6" cy="-9" r="7.5" fill="#fff"/><circle class="hl" cx="7" cy="7" r="3.4" fill="#fff"/>`;
  switch (type) {
    case 'happy':   return `<path d="M-16 5 Q0 -17 16 5" ${LINE} stroke-width="6"/>`;
    case 'closed':  return `<path d="M-15 -2 Q0 11 15 -2" ${LINE} stroke-width="5"/>`;
    case 'heart':   return `<path d="M0 15 C-28 -2 -20 -26 0 -11 C20 -26 28 -2 0 15Z" fill="#ff6fa8" stroke="${INK}" stroke-width="3.5"/><circle cx="-8" cy="-8" r="4" fill="#fff"/>`;
    case 'half':    return `<path d="M-18 -2 A18 20 0 0 0 18 -2Z" fill="url(#eyeGrad)"/><path d="M-19 -2 H19" ${LINE} stroke-width="4.5"/><circle cx="-5" cy="5" r="3.5" fill="#fff"/>`;
    case 'surprised': return `<ellipse rx="13" ry="16" fill="url(#eyeGrad)"/><circle cx="-4" cy="-6" r="5" fill="#fff"/><circle cx="5" cy="6" r="2" fill="#fff"/>`;
    case 'sparkle': return `<ellipse rx="19" ry="23" fill="url(#eyeGrad)"/><ellipse cy="12" rx="12" ry="7" fill="${c.light}" opacity=".35"/>
      <path d="M-6 -20 l3.5 7.5 7.5 3.5 -7.5 3.5 -3.5 7.5 -3.5 -7.5 -7.5 -3.5 7.5 -3.5z" fill="#fff"/><circle cx="8" cy="8" r="3.4" fill="#fff"/><circle cx="-8" cy="10" r="1.8" fill="#fff"/>`;
    case 'sad':     return `<ellipse rx="18" ry="22" fill="url(#eyeGrad)"/><path d="M-14 12 Q0 22 14 12" stroke="#bfe6ff" stroke-width="4" fill="none" opacity=".9"/>
      <circle cx="-6" cy="-8" r="8.5" fill="#fff"/><circle cx="7" cy="6" r="4" fill="#fff"/><circle cx="-1" cy="12" r="2" fill="#fff"/>`;
    case 'shy':     return `<g transform="scale(1 .88)"><ellipse rx="17" ry="21" fill="url(#eyeGrad)"/><ellipse cy="11" rx="11" ry="7" fill="${c.light}" opacity=".3"/>${hl}</g>`;
    default:        return `<ellipse rx="18" ry="22" fill="url(#eyeGrad)"/><ellipse cy="12" rx="12" ry="7" fill="${c.light}" opacity=".35"/>${hl}`;
  }
}

function mouthSvg(type) {
  const fillM = `fill="#8a3d62" stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
  switch (type) {
    case 'smile':  return `<path d="M-12 -3 Q0 10 12 -3" ${LINE} stroke-width="4.5"/>`;
    case 'open':   return `<path d="M-14 -4 Q0 -1 14 -4 Q12 16 0 17 Q-12 16 -14 -4Z" ${fillM}/><ellipse cy="10" rx="6.5" ry="4" fill="#ff93b6"/>`;
    case 'sad':    return `<path d="M-10 5 Q0 -5 10 5" ${LINE} stroke-width="4.5"/>`;
    case 'pout':   return `<path d="M-7 3 Q0 -3 7 3" ${LINE} stroke-width="4.5"/>`;
    case 'wobbly': return `<path d="M-12 2 q3 -4 6 0 t6 0 t6 0 t6 0" ${LINE} stroke-width="4"/>`;
    case 'o':      return `<ellipse cy="3" rx="7" ry="8.5" ${fillM}/>`;
    case 'osmall': return `<ellipse cy="2" rx="4" ry="4.6" ${fillM}/>`;
    case 'nom':    return `<g class="nom-a"><ellipse cy="3" rx="9" ry="9" ${fillM}/></g><g class="nom-b"><path d="M-10 0 Q-5 6 0 1 Q5 6 10 0" ${LINE} stroke-width="4.5"/></g>`;
    default:       return `<path d="M-10 -2 Q-5 5 0 -1 Q5 5 10 -2" ${LINE} stroke-width="4.5"/>`;
  }
}

class BlobView {
  constructor(svg) {
    this.svg = svg;
    this.color = COLORS[0];
    this.scale = 0.7; this.targetScale = 0.7;
    this.y = 0; this.vy = 0; this.sq = 0; this.sqv = 0;
    this.jiggle = 0; this.wig = 0; this.t = 0;
    this.gaze = { x: 0, y: 0 }; this.gazeT = { x: 0, y: 0 };
    this.base = 'neutral'; this.temp = null; this.tempUntil = 0; this.shown = null;
    this.blinkAt = 2; this.blink = 1; this.dirt = 0; this.sleeping = false;
    this.build();
  }

  build() {
    const c = this.color;
    this.svg.innerHTML = `
      <defs>
        <radialGradient id="bodyGrad" cx="38%" cy="30%" r="75%">
          <stop offset="0" stop-color="${c.light}"/><stop offset=".45" stop-color="${c.body}"/><stop offset="1" stop-color="${c.shade}"/>
        </radialGradient>
        <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#241a33"/><stop offset=".65" stop-color="#3d2f4f"/><stop offset="1" stop-color="#6e5294"/>
        </linearGradient>
        <style>
          .tear { animation: tearFall 1.8s ease-in infinite; }
          @keyframes tearFall { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(34px); opacity: 0; } }
          .hat-bob { animation: hatBob 2.4s ease-in-out infinite; }
          @keyframes hatBob { 50% { transform: translateY(-6px); } }
          .sweat { animation: sweat 2s ease-in-out infinite; }
          @keyframes sweat { 50% { transform: translateY(3px); } }
        </style>
      </defs>
      <ellipse class="shadow" cx="0" cy="4" rx="100" ry="13" fill="#5b4a6b" opacity=".18"/>
      <g class="root">
        <g class="tilt">
          <path class="body hit" fill="url(#bodyGrad)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
          <g class="dirt" opacity="0" fill="#a07e68">
            <ellipse cx="-62" cy="-48" rx="9" ry="6"/><ellipse cx="-50" cy="-36" rx="4" ry="3"/>
            <ellipse cx="58" cy="-26" rx="8" ry="5"/><ellipse cx="28" cy="-136" rx="6" ry="4"/>
          </g>
          <ellipse cx="-52" cy="-128" rx="24" ry="12" fill="#fff" opacity=".55" transform="rotate(-28 -52 -128)"/>
          <circle cx="-20" cy="-148" r="5" fill="#fff" opacity=".6"/>
          <g class="face">
            <g class="blush"><ellipse cx="-58" cy="14" rx="14" ry="8"/><ellipse cx="58" cy="14" rx="14" ry="8"/></g>
            <g class="brows"></g>
            <g class="eye eyeL" transform="translate(-38 -8)"><g class="lid"></g></g>
            <g class="eye eyeR" transform="translate(38 -8)"><g class="lid"></g></g>
            <g class="mouth" transform="translate(0 20)"></g>
            <g class="extras"></g>
          </g>
          <g class="hat"></g>
        </g>
      </g>`;
    const q = (s) => this.svg.querySelector(s);
    this.el = {
      root: q('.root'), tilt: q('.tilt'), body: q('.body'), face: q('.face'), shadow: q('.shadow'),
      eyeL: q('.eyeL'), eyeR: q('.eyeR'), lidL: q('.eyeL .lid'), lidR: q('.eyeR .lid'),
      mouth: q('.mouth'), blush: q('.blush'), brows: q('.brows'), extras: q('.extras'), hat: q('.hat'), dirt: q('.dirt'),
    };
    this.el.blush.setAttribute('fill', c.cheek);
    this.shown = null;
    if (this.hatData) this.setHat(this.hatData);
  }

  setColor(c) { this.color = c; this.build(); }
  setScale(s, instant) { this.targetScale = s; if (instant) this.scale = s; }
  setHat(h) { this.hatData = h; this.el.hat.innerHTML = h ? h.svg : ''; }
  setDirt(v) { this.dirt = v; this.el.dirt.setAttribute('opacity', (v * 0.55).toFixed(2)); }
  setBase(e) { this.base = e; }
  emote(e, ms = 1500) { this.temp = e; this.tempUntil = this.t + ms / 1000; }
  clearEmote() { this.temp = null; }
  get emotion() { return this.temp && this.t < this.tempUntil ? this.temp : this.base; }
  lookAt(x, y) { this.gazeT.x = Math.max(-1, Math.min(1, x)); this.gazeT.y = Math.max(-1, Math.min(1, y)); }

  hop(power = 480) { if (this.y >= -1) { this.vy = -power; this.sqv -= 3; } }
  poke() { this.sqv += 5; this.jiggle = 1; }
  wiggle() { this.wig = 1; }

  renderFace(name) {
    const e = EMOTIONS[name] || EMOTIONS.neutral, c = this.color;
    const [l, r] = Array.isArray(e.eyes) ? e.eyes : [e.eyes, e.eyes];
    this.el.lidL.innerHTML = eyeSvg(l, c);
    this.el.lidR.innerHTML = eyeSvg(r, c);
    this.el.mouth.innerHTML = mouthSvg(e.mouth);
    this.el.blush.setAttribute('opacity', e.blush);
    this.el.brows.innerHTML = e.brows ? `<path d="M-54 -38 L-28 -46" ${LINE} stroke-width="4"/><path d="M54 -38 L28 -46" ${LINE} stroke-width="4"/>` : '';
    let ex = '';
    if (e.tear) ex += `<path class="tear" d="M-48 12 q-6 9 0 12 q6 -3 0 -12z" fill="#a8d8ff" stroke="${INK}" stroke-width="2"/>`;
    if (e.sweat) ex += `<path class="sweat" d="M72 -46 q-8 12 0 16 q8 -4 0 -16z" fill="#c8ecff" stroke="${INK}" stroke-width="2.5"/>`;
    if (e.blush >= 0.9) ex += `<g stroke="${c.cheek}" stroke-width="2.5" stroke-linecap="round"><path d="M-66 10 l4 -6 M-58 10 l4 -6 M-50 10 l4 -6 M50 10 l4 -6 M58 10 l4 -6 M66 10 l4 -6"/></g>`;
    this.el.extras.innerHTML = ex;
    this.blinkable = l === 'open' || l === 'shy' || l === 'sparkle' || l === 'sad';
    this.shown = name;
  }

  bodyPath(t) {
    const N = 16, cy = -84, rx = 108, ry = 86, pts = [];
    const breathe = this.sleeping ? 0.03 * Math.sin(t * 1.3) : 0.016 * Math.sin(t * 2.2);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, s = Math.sin(a), co = Math.cos(a);
      const w = 1 + 0.014 * Math.sin(t * 2.1 + i * 1.7) + this.jiggle * 0.05 * Math.sin(t * 16 + i * 2.3);
      let x = co * rx * w * (1 - 0.1 * Math.max(0, -s)) * (1 + 0.07 * Math.max(0, s));
      let y = cy + s * ry * w * (1 + (s < 0 ? breathe : 0));
      if (y > 0) y = 0;
      pts.push([x, y]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < N; i++) {
      const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C${c1x.toFixed(1)} ${Math.min(0, c1y).toFixed(1)} ${c2x.toFixed(1)} ${Math.min(0, c2y).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + 'Z';
  }

  update(dt, t) {
    this.t = t;
    const emo = this.emotion;
    if (emo !== this.shown) this.renderFace(emo);
    const conf = EMOTIONS[emo] || EMOTIONS.neutral;

    // physics: hop + squash spring
    if (this.y < 0 || this.vy < 0) {
      this.vy += 2600 * dt; this.y += this.vy * dt;
      if (this.y >= 0) { this.y = 0; this.sqv += this.vy / 120; this.vy = 0; }
    }
    this.sqv += (-320 * this.sq - 13 * this.sqv) * dt;
    this.sq += this.sqv * dt;
    this.sq = Math.max(-0.35, Math.min(0.35, this.sq));
    this.jiggle *= Math.pow(0.12, dt);
    this.wig *= Math.pow(0.08, dt);
    this.scale += (this.targetScale - this.scale) * Math.min(1, dt * 2);

    const air = this.y < -1 ? -0.08 : 0;
    const sx = 1 + this.sq - air, sy = 1 - this.sq + air;
    const s = this.scale;
    this.el.root.setAttribute('transform', `translate(0 ${this.y.toFixed(1)}) scale(${(s * sx).toFixed(3)} ${(s * sy).toFixed(3)})`);
    const rot = this.wig * 9 * Math.sin(t * 28) + this.gaze.x * 2.5;
    this.el.tilt.setAttribute('transform', `rotate(${rot.toFixed(2)} 0 -10)`);
    this.el.body.setAttribute('d', this.bodyPath(t));
    const shadowS = 1 / (1 - this.y / 260);
    this.el.shadow.setAttribute('rx', (100 * s * sx * shadowS).toFixed(1));
    this.el.shadow.setAttribute('ry', (13 * s * shadowS).toFixed(1));

    // gaze
    const gt = conf.gaze ? { x: conf.gaze[0], y: conf.gaze[1] } : this.gazeT;
    const k = Math.min(1, dt * (conf.gaze ? 3 : 7));
    this.gaze.x += (gt.x - this.gaze.x) * k; this.gaze.y += (gt.y - this.gaze.y) * k;
    const fx = this.gaze.x * 16, fy = -84 + this.gaze.y * 10;
    this.el.face.setAttribute('transform', `translate(${fx.toFixed(1)} ${fy.toFixed(1)})`);
    this.el.hat.setAttribute('transform', `translate(${(this.gaze.x * 7).toFixed(1)} -160) rotate(${(this.gaze.x * 4).toFixed(1)})`);

    // blink
    if (t > this.blinkAt) { this.blinkAt = t + 2.2 + Math.random() * 3.5; this.blinkEnd = t + 0.14; }
    const b = this.blinkable && t < this.blinkEnd ? 0.1 : 1;
    const px = this.gaze.x * 4, py = this.gaze.y * 3;
    this.el.eyeL.setAttribute('transform', `translate(${(-38 + px).toFixed(1)} ${(-8 + py).toFixed(1)}) scale(1 ${b})`);
    this.el.eyeR.setAttribute('transform', `translate(${(38 + px).toFixed(1)} ${(-8 + py).toFixed(1)}) scale(1 ${b})`);

    if (conf.mouth === 'nom') {
      const open = Math.floor(t * 6) % 2 === 0;
      const a = this.el.mouth.querySelector('.nom-a'), bb = this.el.mouth.querySelector('.nom-b');
      if (a) { a.style.display = open ? '' : 'none'; bb.style.display = open ? 'none' : ''; }
    }
  }

  rect() { return this.el.body.getBoundingClientRect(); }
  contains(x, y) {
    const r = this.rect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = (x - cx) / (r.width / 2 + 8), dy = (y - cy) / (r.height / 2 + 8);
    return dx * dx + dy * dy <= 1;
  }
  mouthPoint() { const r = this.el.mouth.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
}
