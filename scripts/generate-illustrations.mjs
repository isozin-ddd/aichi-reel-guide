/**
 * Generates the site's original placeholder illustrations with sharp.
 *
 * Every image produced here is drawn from code in this file, so the project
 * owns it outright (credit: "Illustration: Aichi Reel Guide"). Replace them
 * with your own photography whenever you like — keep the same file names or
 * update the paths in the content JSON.
 *
 *   npm run images
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/assets/', import.meta.url));

const C = {
  ivory: '#F4EFE3',
  paper: '#FAF7F0',
  sand: '#E6DCC6',
  clay: '#C9A57A',
  gold: '#B08D4A',
  olive: '#6B7045',
  deepOlive: '#424A2C',
  sage: '#9AA07A',
  charcoal: '#2E2D2A',
  mist: '#D8D3C4',
  sea: '#8FA3A0',
  deepSea: '#4F6B6A',
  persimmon: '#B5643C',
  rose: '#C98F7A',
};

/** Deterministic pseudo-random generator so output is stable between runs. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A soft mountain ridge filled to the bottom of the canvas. */
function ridge(w, h, base, amp, seed, fill, opacity = 1) {
  const r = rng(seed);
  const f1 = 1 + r() * 2;
  const f2 = 3 + r() * 4;
  const p1 = r() * Math.PI * 2;
  const p2 = r() * Math.PI * 2;
  const pts = [];
  for (let x = 0; x <= w; x += w / 60) {
    const t = x / w;
    const y = base - amp * (0.6 * Math.sin(t * Math.PI * f1 + p1) + 0.4 * Math.sin(t * Math.PI * f2 + p2));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `<polygon points="0,${h} ${pts.join(' ')} ${w},${h}" fill="${fill}" opacity="${opacity}"/>`;
}

function waterLines(w, y0, y1, color, gap = 22, seed = 1) {
  const r = rng(seed);
  let out = '';
  for (let y = y0; y < y1; y += gap) {
    const x = r() * w * 0.5;
    const len = w * (0.15 + r() * 0.35);
    out += `<line x1="${x.toFixed(0)}" y1="${y}" x2="${(x + len).toFixed(0)}" y2="${y}" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="0.55"/>`;
  }
  return out;
}

function grain(w, h) {
  return `<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.18  0 0 0 0 0.15  0 0 0 0.06 0"/></filter><rect width="${w}" height="${h}" filter="url(#g)"/>`;
}

/** Stylised castle keep: stacked, upturned roofs. */
function castle(cx, baseY, s, roof = C.charcoal, wall = C.paper) {
  let out = `<rect x="${cx - 70 * s}" y="${baseY - 40 * s}" width="${140 * s}" height="${40 * s}" fill="${C.mist}"/>`;
  const tiers = [
    [120, 60],
    [96, 52],
    [70, 46],
  ];
  let y = baseY - 40 * s;
  for (const [hw, th] of tiers) {
    out += `<rect x="${cx - hw * 0.62 * s}" y="${y - th * s}" width="${hw * 1.24 * s}" height="${th * s}" fill="${wall}"/>`;
    out += `<path d="M${cx - hw * s},${y - th * s + 8 * s} Q${cx},${y - th * s - 22 * s} ${cx + hw * s},${y - th * s + 8 * s} L${cx + hw * 0.7 * s},${y - th * s - 6 * s} L${cx - hw * 0.7 * s},${y - th * s - 6 * s} Z" fill="${roof}"/>`;
    y -= th * s + 6 * s;
  }
  out += `<path d="M${cx - 40 * s},${y + 6 * s} L${cx},${y - 34 * s} L${cx + 40 * s},${y + 6 * s} Z" fill="${roof}"/>`;
  out += `<circle cx="${cx - 26 * s}" cy="${y - 4 * s}" r="${6 * s}" fill="${C.gold}"/><circle cx="${cx + 26 * s}" cy="${y - 4 * s}" r="${6 * s}" fill="${C.gold}"/>`;
  return out;
}

function svg(w, h, body, bg = C.ivory) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/>${body}${grain(w, h)}</svg>`;
}

const scenes = {
  // ----- Site -----
  'site/hero.jpg': [2400, 1600, (w, h) =>
    `<circle cx="${w * 0.7}" cy="${h * 0.32}" r="${h * 0.14}" fill="${C.gold}" opacity="0.85"/>` +
    ridge(w, h, h * 0.52, 90, 11, C.mist) +
    ridge(w, h, h * 0.6, 110, 23, C.sage, 0.9) +
    castle(w * 0.3, h * 0.6, 1.5) +
    ridge(w, h, h * 0.68, 70, 7, C.olive) +
    `<rect y="${h * 0.74}" width="${w}" height="${h * 0.26}" fill="${C.sea}"/>` +
    waterLines(w, h * 0.77, h, C.paper, 26, 5) +
    ridge(w, h, h * 0.93, 30, 3, C.deepOlive)],
  'site/og-default.jpg': [1200, 630, (w, h) =>
    `<circle cx="${w * 0.78}" cy="${h * 0.34}" r="${h * 0.16}" fill="${C.gold}" opacity="0.85"/>` +
    ridge(w, h, h * 0.62, 50, 11, C.mist) +
    ridge(w, h, h * 0.72, 55, 23, C.sage) +
    `<rect y="${h * 0.8}" width="${w}" height="${h * 0.2}" fill="${C.deepSea}"/>` +
    waterLines(w, h * 0.83, h, C.paper, 18, 5) +
    `<text x="72" y="190" font-family="Georgia, 'Times New Roman', serif" font-size="84" fill="${C.charcoal}">Aichi Reel Guide</text>` +
    `<text x="76" y="250" font-family="Helvetica, Arial, sans-serif" font-size="30" letter-spacing="2" fill="${C.olive}">DISCOVER AICHI THROUGH LOCAL VIDEOS</text>`],

  // ----- Areas -----
  'areas/nagoya.jpg': [1600, 1100, (w, h) =>
    `<circle cx="${w * 0.78}" cy="${h * 0.26}" r="110" fill="${C.gold}" opacity="0.8"/>` +
    ridge(w, h, h * 0.62, 30, 4, C.mist) +
    castle(w * 0.45, h * 0.66, 1.9) +
    `<rect y="${h * 0.66}" width="${w}" height="${h * 0.34}" fill="${C.olive}"/>` +
    `<rect y="${h * 0.74}" width="${w}" height="${h * 0.26}" fill="${C.deepSea}"/>` +
    waterLines(w, h * 0.77, h, C.paper, 24, 9)],
  'areas/inuyama.jpg': [1600, 1100, (w, h) =>
    ridge(w, h, h * 0.45, 60, 31, C.mist) +
    ridge(w, h, h * 0.55, 80, 2, C.sage) +
    castle(w * 0.62, h * 0.43, 1.2) +
    ridge(w, h, h * 0.64, 40, 8, C.olive) +
    `<rect y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="${C.sea}"/>` +
    waterLines(w, h * 0.72, h, C.paper, 20, 4) +
    `<path d="M${w * 0.15},${h * 0.86} l120,0 l-20,24 l-80,0 z" fill="${C.charcoal}"/><line x1="${w * 0.15 + 60}" y1="${h * 0.86}" x2="${w * 0.15 + 60}" y2="${h * 0.79}" stroke="${C.charcoal}" stroke-width="4"/><circle cx="${w * 0.15 + 60}" cy="${h * 0.78}" r="12" fill="${C.persimmon}"/>`],
  'areas/tokoname.jpg': [1600, 1100, (w, h) => {
    let pots = '';
    const r = rng(42);
    for (let i = 0; i < 9; i++) {
      const x = 140 + i * 160;
      const rr = 50 + r() * 40;
      const y = h * 0.72 - rr;
      pots += `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${rr * 1.05}" fill="${[C.persimmon, C.clay, C.rose, C.charcoal][i % 4]}"/>`;
    }
    return `<rect width="${w}" height="${h * 0.72}" fill="${C.sand}"/>` +
      `<rect x="${w * 0.66}" y="${h * 0.12}" width="70" height="${h * 0.5}" fill="${C.persimmon}"/>` +
      `<rect x="${w * 0.66 - 10}" y="${h * 0.1}" width="90" height="22" fill="${C.charcoal}"/>` +
      pots + `<rect y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="${C.clay}"/>` +
      waterLines(w, h * 0.76, h, C.paper, 30, 12);
  }],
  'areas/nagakute.jpg': [1600, 1100, (w, h) => {
    let trees = '';
    const r = rng(77);
    for (let i = 0; i < 14; i++) {
      const x = r() * w;
      const y = h * (0.55 + r() * 0.25);
      const s = 50 + r() * 60;
      trees += `<ellipse cx="${x}" cy="${y - s}" rx="${s * 0.7}" ry="${s}" fill="${[C.olive, C.sage, C.deepOlive][i % 3]}"/><rect x="${x - 6}" y="${y - 10}" width="12" height="40" fill="${C.charcoal}"/>`;
    }
    return `<circle cx="${w * 0.25}" cy="${h * 0.24}" r="90" fill="${C.gold}" opacity="0.75"/>` +
      ridge(w, h, h * 0.55, 50, 15, C.mist) + ridge(w, h, h * 0.7, 30, 16, C.sage, 0.7) + trees +
      ridge(w, h, h * 0.92, 20, 17, C.olive);
  }],
  'areas/toyota.jpg': [1600, 1100, (w, h) => {
    let leaves = '';
    const r = rng(9);
    for (let i = 0; i < 40; i++) {
      leaves += `<circle cx="${r() * w}" cy="${r() * h * 0.7}" r="${10 + r() * 34}" fill="${[C.persimmon, C.gold, C.rose, C.clay][i % 4]}" opacity="0.85"/>`;
    }
    return ridge(w, h, h * 0.4, 60, 50, C.mist) + leaves +
      `<path d="M0,${h * 0.55} Q${w * 0.3},${h * 0.65} ${w * 0.45},${h} L0,${h} Z" fill="${C.olive}"/>` +
      `<path d="M${w},${h * 0.5} Q${w * 0.65},${h * 0.62} ${w * 0.58},${h} L${w},${h} Z" fill="${C.deepOlive}"/>` +
      `<path d="M${w * 0.45},${h} Q${w * 0.5},${h * 0.7} ${w * 0.52},${h * 0.58} Q${w * 0.55},${h * 0.7} ${w * 0.58},${h} Z" fill="${C.sea}"/>` +
      `<path d="M${w * 0.3},${h * 0.66} Q${w * 0.5},${h * 0.56} ${w * 0.7},${h * 0.64}" stroke="${C.persimmon}" stroke-width="14" fill="none"/>`;
  }],
  'areas/gamagori.jpg': [1600, 1100, (w, h) =>
    `<circle cx="${w * 0.72}" cy="${h * 0.3}" r="100" fill="${C.gold}" opacity="0.85"/>` +
    ridge(w, h, h * 0.52, 30, 70, C.mist) +
    `<rect y="${h * 0.52}" width="${w}" height="${h * 0.48}" fill="${C.sea}"/>` +
    waterLines(w, h * 0.56, h, C.paper, 24, 71) +
    `<ellipse cx="${w * 0.62}" cy="${h * 0.56}" rx="200" ry="90" fill="${C.deepOlive}"/>` +
    `<path d="M${w * 0.62 - 120},${h * 0.58} Q${w * 0.3},${h * 0.62} 0,${h * 0.7}" stroke="${C.persimmon}" stroke-width="10" fill="none"/>`],

  // ----- Sample spots (fictional places) -----
  'spots/sample-cafe.jpg': [1600, 1100, (w, h) =>
    `<rect width="${w}" height="${h}" fill="${C.sand}"/>` +
    `<rect y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="${C.clay}"/>` +
    `<ellipse cx="${w * 0.5}" cy="${h * 0.66}" rx="300" ry="54" fill="${C.paper}"/>` +
    `<path d="M${w * 0.5 - 170},${h * 0.38} L${w * 0.5 + 170},${h * 0.38} Q${w * 0.5 + 160},${h * 0.66} ${w * 0.5},${h * 0.66} Q${w * 0.5 - 160},${h * 0.66} ${w * 0.5 - 170},${h * 0.38} Z" fill="${C.charcoal}"/>` +
    `<ellipse cx="${w * 0.5}" cy="${h * 0.38}" rx="170" ry="30" fill="${C.persimmon}"/>` +
    `<path d="M${w * 0.5 + 160},${h * 0.44} q90,10 40,110" stroke="${C.charcoal}" stroke-width="26" fill="none"/>` +
    `<path d="M${w * 0.47},${h * 0.3} q-30,-60 0,-120 M${w * 0.53},${h * 0.3} q30,-60 0,-120" stroke="${C.paper}" stroke-width="10" fill="none" stroke-linecap="round"/>`],
  'spots/sample-shrine.jpg': [1600, 1100, (w, h) =>
    ridge(w, h, h * 0.5, 40, 90, C.mist) + ridge(w, h, h * 0.62, 30, 91, C.sage) +
    `<rect x="${w * 0.35}" y="${h * 0.3}" width="36" height="${h * 0.5}" fill="${C.persimmon}"/>` +
    `<rect x="${w * 0.65 - 36}" y="${h * 0.3}" width="36" height="${h * 0.5}" fill="${C.persimmon}"/>` +
    `<path d="M${w * 0.28},${h * 0.26} Q${w * 0.5},${h * 0.3} ${w * 0.72},${h * 0.26} L${w * 0.72},${h * 0.3} Q${w * 0.5},${h * 0.34} ${w * 0.28},${h * 0.3} Z" fill="${C.charcoal}"/>` +
    `<rect x="${w * 0.32}" y="${h * 0.38}" width="${w * 0.36}" height="22" fill="${C.persimmon}"/>` +
    `<rect y="${h * 0.8}" width="${w}" height="${h * 0.2}" fill="${C.sand}"/>`],
  'spots/sample-pottery.jpg': [1600, 1100, (w, h) =>
    `<rect width="${w}" height="${h}" fill="${C.mist}"/>` +
    `<ellipse cx="${w * 0.5}" cy="${h * 0.78}" rx="420" ry="90" fill="${C.charcoal}"/>` +
    `<ellipse cx="${w * 0.5}" cy="${h * 0.72}" rx="380" ry="70" fill="${C.deepSea}"/>` +
    `<path d="M${w * 0.5 - 150},${h * 0.7} Q${w * 0.5 - 220},${h * 0.45} ${w * 0.5 - 90},${h * 0.3} L${w * 0.5 + 90},${h * 0.3} Q${w * 0.5 + 220},${h * 0.45} ${w * 0.5 + 150},${h * 0.7} Z" fill="${C.clay}"/>` +
    `<ellipse cx="${w * 0.5}" cy="${h * 0.3}" rx="90" ry="20" fill="${C.persimmon}"/>` +
    waterLines(w, h * 0.42, h * 0.6, C.paper, 30, 33)],
  'spots/sample-market.jpg': [1600, 1100, (w, h) => {
    let lanterns = '';
    for (let i = 0; i < 6; i++) {
      const x = 200 + i * 240;
      lanterns += `<line x1="${x}" y1="0" x2="${x}" y2="${h * 0.22}" stroke="${C.charcoal}" stroke-width="4"/><ellipse cx="${x}" cy="${h * 0.3}" rx="70" ry="100" fill="${i % 2 ? C.persimmon : C.gold}"/><rect x="${x - 40}" y="${h * 0.2}" width="80" height="14" fill="${C.charcoal}"/><rect x="${x - 40}" y="${h * 0.39}" width="80" height="14" fill="${C.charcoal}"/>`;
    }
    return `<rect width="${w}" height="${h}" fill="${C.deepOlive}"/>` + lanterns +
      `<rect y="${h * 0.6}" width="${w}" height="${h * 0.4}" fill="${C.sand}"/>` +
      `<rect x="${w * 0.1}" y="${h * 0.6}" width="${w * 0.8}" height="40" fill="${C.clay}"/>`;
  }],
  'spots/sample-gorge.jpg': [1600, 1100, (w, h) =>
    ridge(w, h, h * 0.35, 80, 120, C.mist) + ridge(w, h, h * 0.5, 100, 121, C.sage) +
    ridge(w, h, h * 0.65, 60, 122, C.olive) +
    `<path d="M${w * 0.4},${h} Q${w * 0.48},${h * 0.75} ${w * 0.5},${h * 0.66} Q${w * 0.53},${h * 0.75} ${w * 0.62},${h} Z" fill="${C.sea}"/>` +
    `<circle cx="${w * 0.2}" cy="${h * 0.55}" r="60" fill="${C.persimmon}" opacity="0.9"/><circle cx="${w * 0.8}" cy="${h * 0.6}" r="80" fill="${C.gold}" opacity="0.9"/>`],
  'spots/sample-alley.jpg': [1600, 1100, (w, h) =>
    `<rect width="${w}" height="${h}" fill="${C.charcoal}"/>` +
    `<polygon points="0,0 ${w * 0.4},${h * 0.35} ${w * 0.4},${h * 0.75} 0,${h}" fill="${C.deepOlive}"/>` +
    `<polygon points="${w},0 ${w * 0.6},${h * 0.35} ${w * 0.6},${h * 0.75} ${w},${h}" fill="${C.olive}"/>` +
    `<polygon points="0,${h} ${w * 0.4},${h * 0.75} ${w * 0.6},${h * 0.75} ${w},${h}" fill="${C.clay}"/>` +
    `<rect x="${w * 0.4}" y="${h * 0.35}" width="${w * 0.2}" height="${h * 0.4}" fill="${C.sand}"/>` +
    `<ellipse cx="${w * 0.22}" cy="${h * 0.4}" rx="44" ry="64" fill="${C.persimmon}"/><ellipse cx="${w * 0.78}" cy="${h * 0.42}" rx="40" ry="58" fill="${C.gold}"/>`],
  'spots/sample-onsen.jpg': [1600, 1100, (w, h) =>
    `<circle cx="${w * 0.3}" cy="${h * 0.28}" r="90" fill="${C.gold}" opacity="0.8"/>` +
    ridge(w, h, h * 0.5, 30, 140, C.mist) +
    `<rect y="${h * 0.5}" width="${w}" height="${h * 0.5}" fill="${C.deepSea}"/>` +
    waterLines(w, h * 0.54, h, C.mist, 22, 141) +
    `<path d="M${w * 0.55},${h * 0.48} q-30,-60 0,-120 M${w * 0.6},${h * 0.48} q30,-60 0,-120 M${w * 0.65},${h * 0.48} q-30,-60 0,-120" stroke="${C.paper}" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8"/>`],
};

for (const [file, [w, h, draw]] of Object.entries(scenes)) {
  const out = root + file;
  mkdirSync(out.slice(0, out.lastIndexOf('/')), { recursive: true });
  await sharp(Buffer.from(svg(w, h, draw(w, h))))
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(out);
  console.log('wrote', file);
}
