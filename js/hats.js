/* Bloble – hats. Each hat is drawn with (0,0) at the top of the blob's head, growing upward. */
const O = 'stroke="#5b4a6b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';

const HATS = [
  // ---------- common ----------
  { id: 'party', name: 'Party Cone', rarity: 'common', svg: `
    <path d="M-30 8 L2 -78 L32 8 Q2 18 -30 8Z" fill="#ffb8d4" ${O}/>
    <path d="M-17 -22 L22 -22 M-24 -4 L27 -4 M-9 -42 L15 -42" stroke="#fff3a8" stroke-width="7" stroke-linecap="round" opacity=".9"/>
    <circle cx="2" cy="-80" r="10" fill="#ffe08a" ${O}/>` },
  { id: 'beanie', name: 'Cozy Beanie', rarity: 'common', svg: `
    <path d="M-56 10 Q-58 -52 0 -54 Q58 -52 56 10Z" fill="#a8d8ff" ${O}/>
    <path d="M-30 -40 V2 M-10 -50 V4 M10 -50 V4 M30 -40 V2" stroke="#8cc0ee" stroke-width="4" stroke-linecap="round"/>
    <rect x="-60" y="-4" width="120" height="20" rx="9" fill="#d6ecff" ${O}/>
    <circle cx="0" cy="-60" r="13" fill="#fff" ${O}/>` },
  { id: 'sprout', name: 'Little Sprout', rarity: 'common', svg: `
    <path d="M0 6 Q-2 -20 2 -36" fill="none" ${O}/>
    <path d="M2 -34 Q-30 -56 -40 -30 Q-14 -18 2 -34Z" fill="#9ee6b0" ${O}/>
    <path d="M2 -36 Q28 -66 42 -40 Q20 -24 2 -36Z" fill="#b6f0c2" ${O}/>` },
  { id: 'bow', name: 'Ribbon Bow', rarity: 'common', svg: `
    <g transform="translate(30 0) rotate(14)">
    <path d="M0 -10 Q-34 -40 -40 -12 Q-42 14 0 -6Z" fill="#ff9ec2" ${O}/>
    <path d="M0 -10 Q34 -40 40 -12 Q42 14 0 -6Z" fill="#ff9ec2" ${O}/>
    <circle cx="0" cy="-8" r="9" fill="#ffc2da" ${O}/></g>` },
  { id: 'cap', name: 'Sporty Cap', rarity: 'common', svg: `
    <path d="M-52 6 Q-52 -50 0 -52 Q52 -50 52 6Z" fill="#9ee6c9" ${O}/>
    <path d="M14 4 Q60 -6 86 10 Q60 22 14 14Z" fill="#7fd3b0" ${O}/>
    <circle cx="0" cy="-52" r="6" fill="#fff" ${O}/>
    <path d="M-20 -26 h20" stroke="#fff" stroke-width="7" stroke-linecap="round"/>` },
  { id: 'cherry', name: 'Cherry Clip', rarity: 'common', svg: `
    <path d="M-14 -30 Q-4 -66 18 -70 M22 -30 Q16 -56 18 -70" fill="none" ${O}/>
    <path d="M18 -70 Q34 -82 44 -68 Q30 -62 18 -70Z" fill="#9ee6b0" ${O}/>
    <circle cx="-16" cy="-16" r="16" fill="#ff7f9e" ${O}/><circle cx="24" cy="-16" r="16" fill="#ff7f9e" ${O}/>
    <circle cx="-21" cy="-21" r="4" fill="#fff"/><circle cx="19" cy="-21" r="4" fill="#fff"/>` },

  // ---------- rare ----------
  { id: 'strawberry', name: 'Strawberry Hat', rarity: 'rare', svg: `
    <path d="M-54 8 Q-60 -62 0 -66 Q60 -62 54 8 Q0 20 -54 8Z" fill="#ff8fa8" ${O}/>
    <g fill="#fff3a8"><ellipse cx="-30" cy="-20" rx="3" ry="4"/><ellipse cx="-8" cy="-38" rx="3" ry="4"/><ellipse cx="18" cy="-22" rx="3" ry="4"/><ellipse cx="34" cy="-40" rx="3" ry="4"/><ellipse cx="0" cy="-8" rx="3" ry="4"/><ellipse cx="-36" cy="-44" rx="3" ry="4"/></g>
    <path d="M-26 -60 L-8 -66 L0 -84 L8 -66 L26 -60 L10 -54 L0 -46 L-10 -54Z" fill="#9ee6b0" ${O}/>` },
  { id: 'frog', name: 'Froggy Hood', rarity: 'rare', svg: `
    <path d="M-60 12 Q-62 -50 0 -50 Q62 -50 60 12Z" fill="#a7e8a0" ${O}/>
    <circle cx="-30" cy="-52" r="18" fill="#a7e8a0" ${O}/><circle cx="30" cy="-52" r="18" fill="#a7e8a0" ${O}/>
    <circle cx="-30" cy="-54" r="9" fill="#3d2f4f"/><circle cx="30" cy="-54" r="9" fill="#3d2f4f"/>
    <circle cx="-33" cy="-57" r="3.5" fill="#fff"/><circle cx="27" cy="-57" r="3.5" fill="#fff"/>
    <path d="M-14 -24 Q0 -14 14 -24" fill="none" ${O}/>
    <ellipse cx="-40" cy="-20" rx="7" ry="4" fill="#ff9ec2" opacity=".7"/><ellipse cx="40" cy="-20" rx="7" ry="4" fill="#ff9ec2" opacity=".7"/>` },
  { id: 'chef', name: 'Chef Toque', rarity: 'rare', svg: `
    <rect x="-34" y="-30" width="68" height="38" rx="6" fill="#fff" ${O}/>
    <path d="M-34 -28 Q-60 -40 -46 -66 Q-34 -86 -14 -74 Q-4 -98 18 -84 Q44 -92 48 -66 Q62 -42 34 -28Z" fill="#fff" ${O}/>
    <path d="M-12 -26 V4 M12 -26 V4" stroke="#e8dff0" stroke-width="4"/>` },
  { id: 'tophat', name: 'Fancy Top Hat', rarity: 'rare', svg: `
    <ellipse cx="0" cy="4" rx="58" ry="12" fill="#5b4a6b" ${O}/>
    <path d="M-34 2 L-30 -70 Q0 -78 30 -70 L34 2Z" fill="#6c5a80" ${O}/>
    <path d="M-33 -14 L33 -14 L33.6 -2 L-33.6 -2Z" fill="#ff9ec2"/>
    <circle cx="20" cy="-8" r="7" fill="#fff3a8" ${O}/>` },
  { id: 'flowers', name: 'Flower Crown', rarity: 'rare', svg: `
    <path d="M-58 4 Q0 -20 58 4" fill="none" stroke="#7fd3a0" stroke-width="6" stroke-linecap="round"/>
    ${[[-48, -2, '#ffb8d4'], [-24, -12, '#fff3a8'], [0, -16, '#d6c6ff'], [24, -12, '#a8d8ff'], [48, -2, '#ffd0b0']].map(([x, y, c]) => `
      <g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="6" ry="9" cy="-8" transform="rotate(${a})" fill="${c}" stroke="#5b4a6b" stroke-width="2.5"/>`).join('')}
      <circle r="5" fill="#ffd36e" stroke="#5b4a6b" stroke-width="2.5"/></g>`).join('')}` },
  { id: 'cat', name: 'Kitty Ears', rarity: 'rare', svg: `
    <path d="M-62 14 L-52 -44 L-14 -14Z" fill="#fff1e6" ${O}/><path d="M-50 -2 L-46 -28 L-28 -12Z" fill="#ffb8d4"/>
    <path d="M62 14 L52 -44 L14 -14Z" fill="#fff1e6" ${O}/><path d="M50 -2 L46 -28 L28 -12Z" fill="#ffb8d4"/>` },

  // ---------- epic ----------
  { id: 'bunny', name: 'Bunny Ears', rarity: 'epic', svg: `
    <g transform="rotate(-12 -24 0)"><path d="M-40 10 Q-52 -96 -24 -102 Q0 -96 -10 10Z" fill="#fff" ${O}/><path d="M-32 -6 Q-38 -78 -24 -84 Q-12 -78 -18 -6Z" fill="#ffc2da"/></g>
    <g transform="rotate(16 24 0)"><path d="M10 10 Q0 -90 26 -96 Q52 -90 40 10Z" fill="#fff" ${O}/><path d="M18 -6 Q12 -72 26 -78 Q40 -72 32 -6Z" fill="#ffc2da"/></g>` },
  { id: 'crown', name: 'Royal Crown', rarity: 'epic', svg: `
    <path d="M-46 6 L-50 -50 L-24 -26 L0 -62 L24 -26 L50 -50 L46 6Z" fill="#ffd36e" ${O}/>
    <rect x="-48" y="-6" width="96" height="14" rx="4" fill="#ffc24d" ${O}/>
    <circle cx="0" cy="1" r="5" fill="#ff8fb8" stroke="#5b4a6b" stroke-width="2.5"/><circle cx="-28" cy="1" r="4" fill="#a8d8ff" stroke="#5b4a6b" stroke-width="2.5"/><circle cx="28" cy="1" r="4" fill="#a8ecc9" stroke="#5b4a6b" stroke-width="2.5"/>
    <circle cx="-50" cy="-54" r="5" fill="#fff3a8" ${O}/><circle cx="0" cy="-66" r="6" fill="#fff3a8" ${O}/><circle cx="50" cy="-54" r="5" fill="#fff3a8" ${O}/>` },
  { id: 'mushroom', name: 'Mushroom Cap', rarity: 'epic', svg: `
    <path d="M-70 6 Q-70 -70 0 -72 Q70 -70 70 6 Q0 -6 -70 6Z" fill="#ff8a8a" ${O}/>
    <ellipse cx="-34" cy="-26" rx="11" ry="9" fill="#fff"/><ellipse cx="8" cy="-50" rx="13" ry="10" fill="#fff"/><ellipse cx="40" cy="-20" rx="9" ry="8" fill="#fff"/><ellipse cx="-4" cy="-14" rx="6" ry="5" fill="#fff"/>` },
  { id: 'witch', name: 'Starry Witch Hat', rarity: 'epic', svg: `
    <ellipse cx="0" cy="4" rx="66" ry="13" fill="#9d86e0" ${O}/>
    <path d="M-38 2 Q-20 -60 14 -96 Q30 -104 34 -92 Q16 -70 38 2Z" fill="#b39cf2" ${O}/>
    <path d="M-34 -10 Q0 -2 37 -10" fill="none" stroke="#ffd36e" stroke-width="7"/>
    <path d="M2 -46 l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1z" fill="#fff3a8" stroke="#5b4a6b" stroke-width="2.5"/>` },

  // ---------- legendary ----------
  { id: 'halo', name: 'Angel Halo', rarity: 'legendary', svg: `
    <g class="hat-bob"><ellipse cx="0" cy="-34" rx="44" ry="12" fill="none" stroke="#fff6c9" stroke-width="16" opacity=".6"/>
    <ellipse cx="0" cy="-34" rx="44" ry="12" fill="none" stroke="#ffd36e" stroke-width="8"/>
    <ellipse cx="0" cy="-34" rx="44" ry="12" fill="none" stroke="#5b4a6b" stroke-width="2" opacity=".5"/></g>` },
  { id: 'rainbow', name: 'Rainbow Cloud', rarity: 'legendary', svg: `
    <g class="hat-bob">
    ${['#ff9aa8', '#ffc98a', '#fff09a', '#a8ecc0', '#a8d8ff', '#c9b0ff'].map((c, i) => `<path d="M${-56 + i * 7} -30 A${56 - i * 7} ${50 - i * 6} 0 0 1 ${56 - i * 7} -30" fill="none" stroke="${c}" stroke-width="7"/>`).join('')}
    <path d="M-74 -18 Q-80 -42 -56 -40 Q-50 -56 -32 -44 Q-24 -30 -40 -18Z" fill="#fff" ${O}/>
    <path d="M74 -18 Q80 -42 56 -40 Q50 -56 32 -44 Q24 -30 40 -18Z" fill="#fff" ${O}/></g>` },
];

const RARITY = {
  common: { label: 'Common', weight: 60 },
  rare: { label: 'Rare', weight: 28 },
  epic: { label: 'Epic', weight: 10 },
  legendary: { label: 'Legendary', weight: 2 },
};

const hatById = (id) => HATS.find((h) => h.id === id);

function rollHat() {
  const total = Object.values(RARITY).reduce((a, r) => a + r.weight, 0);
  let x = Math.random() * total, rar = 'common';
  for (const [k, r] of Object.entries(RARITY)) { if ((x -= r.weight) < 0) { rar = k; break; } }
  const pool = HATS.filter((h) => h.rarity === rar);
  return pool[Math.floor(Math.random() * pool.length)];
}

function hatPreviewSvg(h) {
  return `<svg viewBox="-80 -110 160 130" aria-hidden="true"><g transform="translate(0 0)">${h.svg}</g></svg>`;
}
