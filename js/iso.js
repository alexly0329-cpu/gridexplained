// Tiny isometric SVG toolkit. Author scenes in grid units (x → right-down, y → left-down, z → up).
export const S = 30, OX = 380, OY = 170, K = 0.866;
export const W = 760, H = 480;
export const P = (x, y, z = 0) => [OX + (x - y) * K * S, OY + (x + y) * 0.5 * S - z * S];
const f = (n) => +n.toFixed(1);
const pt = (p) => `${f(p[0])},${f(p[1])}`;
const pts = (a) => a.map(pt).join(' ');

// [top, left face, right face]
export const PAL = {
  cream: ['#f3e9dc', '#e4d6c4', '#d3c3ae'], white: ['#fbf8f3', '#ebe5db', '#d9d1c4'],
  grey: ['#c9ccd1', '#a9adb4', '#8b9098'], steel: ['#b8c4d1', '#97a5b5', '#7a8999'],
  dark: ['#5a606b', '#454a53', '#363a42'], green: ['#cfe3b2', '#b2d491', '#98c07a'],
  grass: ['#c4dca3', '#a9c887', '#93b574'], blue: ['#9fcdf0', '#7db4e0', '#5f9ccb'],
  navy: ['#4a6f9c', '#3b5b83', '#2f4a6c'], orange: ['#fcdcbd', '#f0c08f', '#e0a870'],
  flame: ['#f7a35c', '#e8834d', '#d0683a'], yellow: ['#fde3a7', '#f1c96f', '#dfb04e'],
  violet: ['#e7ddf5', '#cfc0e8', '#b8a6d8'], red: ['#f2a79b', '#e5534b', '#c0392b'],
  teal: ['#9fdcd3', '#6cc4b8', '#2a9d8f'], rock: ['#c9b9a0', '#a8977e', '#8c7c65'],
  dirt: ['#d9c4a0', '#c2a97f', '#a98f66'], concrete: ['#dcd9d3', '#c2beb6', '#a9a59d'],
  water: ['#a8d4f2', '#7fb9e3', '#62a0cf'], black: ['#4a4743', '#35322f', '#262421'],
  panel: ['#5b7fb8', '#3f5d90', '#2f4876'],
};
export const gradDefs = () =>
  '<defs>' + Object.entries(PAL).map(([k, c]) =>
    `<linearGradient id="g-${k}" x1="0" x2="1"><stop offset="0" stop-color="${c[1]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>`).join('') + '</defs>';

const col = (c) => PAL[c] || c;

export function makeScene() {
  const items = [];
  const add = (id, key, html, o = {}) => items.push({ id, key, html, from: o.from ?? 0, until: o.until ?? 99, cls: o.cls || '', always: o.always });
  const api = {
    P, vb: [0, 0, 760, 500],
    view(x, y, w, h) { api.vb = [x, y, w, h]; },
    floor(w, d, color = 'cream') {
      const [t, l, r] = col(color), z = -0.35;
      const top = [P(0, 0, 0), P(w, 0, 0), P(w, d, 0), P(0, d, 0)];
      let g = '';
      for (let i = 1; i < w; i++) g += `M${pt(P(i, 0))}L${pt(P(i, d))}`;
      for (let j = 1; j < d; j++) g += `M${pt(P(0, j))}L${pt(P(w, j))}`;
      add('floor', -9, `<polygon class="o" fill="${l}" points="${pts([P(0, d, 0), P(w, d, 0), P(w, d, z), P(0, d, z)])}"/><polygon class="o" fill="${r}" points="${pts([P(w, 0, 0), P(w, d, 0), P(w, d, z), P(w, 0, z)])}"/><polygon class="o" fill="${t}" points="${pts(top)}"/><path class="gridl" d="${g}"/>`, { always: true });
    },
    box(id, x, y, z, w, d, h, color, o = {}) {
      const [t, l, r] = col(color);
      const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
      const left = [P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)];
      const right = [P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)];
      const sh = z === 0 && o.shadow !== false ? `<polygon fill="#3c28142e" points="${pts([P(x + .25, y + .25, 0), P(x + w + .35, y + .25, 0), P(x + w + .35, y + d + .35, 0), P(x + .25, y + d + .35, 0)])}"/>` : '';
      add(id, o.k ?? (x + w + y + d), `${sh}<polygon class="o" fill="${l}" points="${pts(left)}"/><polygon class="o" fill="${r}" points="${pts(right)}"/><polygon class="o" fill="${t}" points="${pts(top)}"/>${o.extra || ''}`, o);
      if (o.label) api.label(id + ':l', x + w / 2, y + d / 2, z + h, o.label, { from: o.from, until: o.until, ...(o.lopt || {}) });
    },
    cyl(id, cx, cy, z, r, h, color, o = {}) {
      const [t] = col(color), [bx, by] = P(cx, cy, z), [, ty] = P(cx, cy, z + h);
      const rx = 1.2247 * r * S, ry = 0.7071 * r * S;
      const sh = z === 0 && o.shadow !== false ? `<ellipse cx="${f(bx + 5)}" cy="${f(by + 5)}" rx="${f(rx)}" ry="${f(ry)}" fill="#3c28142e"/>` : '';
      add(id, o.k ?? (cx + cy) * 2 + r * 2, `${sh}<path class="o" fill="url(#g-${color in PAL ? color : 'cream'})" d="M${f(bx - rx)},${f(ty)}L${f(bx - rx)},${f(by)}A${f(rx)},${f(ry)} 0 0 0 ${f(bx + rx)},${f(by)}L${f(bx + rx)},${f(ty)}Z"/><ellipse class="o" fill="${t}" cx="${f(bx)}" cy="${f(ty)}" rx="${f(rx)}" ry="${f(ry)}"/>${o.extra || ''}`, o);
      if (o.label) api.label(id + ':l', cx, cy, z + h, o.label, { from: o.from, until: o.until });
    },
    dome(id, cx, cy, z, r, h, dh, color, o = {}) { // cylinder with a domed lid
      const [t] = col(color), [bx, by] = P(cx, cy, z), [, ty] = P(cx, cy, z + h);
      const rx = 1.2247 * r * S, ry = 0.7071 * r * S, dy = dh * S;
      const sh = `<ellipse cx="${f(bx + 6)}" cy="${f(by + 5)}" rx="${f(rx)}" ry="${f(ry)}" fill="#3c28142e"/>`;
      add(id, o.k ?? (cx + cy) * 2 + r * 2, `${sh}<path class="o" fill="url(#g-${color})" d="M${f(bx - rx)},${f(ty)}L${f(bx - rx)},${f(by)}A${f(rx)},${f(ry)} 0 0 0 ${f(bx + rx)},${f(by)}L${f(bx + rx)},${f(ty)}A${f(rx)},${f(dy)} 0 0 0 ${f(bx - rx)},${f(ty)}Z"/><path class="thin" d="M${f(bx - rx)},${f(ty)}A${f(rx)},${f(ry)} 0 0 0 ${f(bx + rx)},${f(ty)}"/>${o.extra || ''}`, o);
      if (o.label) api.label(id + ':l', cx, cy, z + h + dh, o.label, { from: o.from, until: o.until });
    },
    cooling(id, cx, cy, z, r, h, color, o = {}) { // hyperbolic cooling tower
      const [t] = col(color), [bx, by] = P(cx, cy, z), [, ty] = P(cx, cy, z + h);
      const rb = 1.2247 * r * S, rt = rb * 0.74, rw = rb * 0.62, ry = 0.7071 * r * S, ryt = ry * 0.74, hp = h * S;
      const sh = `<ellipse cx="${f(bx + 6)}" cy="${f(by + 5)}" rx="${f(rb)}" ry="${f(ry)}" fill="#3c28142e"/>`;
      add(id, o.k ?? (cx + cy) * 2 + r * 2, `${sh}<path class="o" fill="url(#g-${color})" d="M${f(bx - rb)},${f(by)}C${f(bx - rw)},${f(by - hp * .4)} ${f(bx - rw)},${f(ty + hp * .25)} ${f(bx - rt)},${f(ty)}L${f(bx + rt)},${f(ty)}C${f(bx + rw)},${f(ty + hp * .25)} ${f(bx + rw)},${f(by - hp * .4)} ${f(bx + rb)},${f(by)}A${f(rb)},${f(ry)} 0 0 1 ${f(bx - rb)},${f(by)}Z"/><ellipse class="o" fill="${t}" cx="${f(bx)}" cy="${f(ty)}" rx="${f(rt)}" ry="${f(ryt)}"/>${o.extra || ''}`, o);
      if (o.label) api.label(id + ':l', cx, cy, z + h + 0.6, o.label, { from: o.from, until: o.until });
    },
    poly(id, p3, fill, o = {}) {
      add(id, o.k ?? 0, `<polygon class="o" fill="${PAL[fill] ? PAL[fill][0] : fill}" points="${pts(p3.map((p) => P(...p)))}"${o.style ? ` style="${o.style}"` : ''}/>${o.extra || ''}`, o);
    },
    line(id, p3, o = {}) {
      add(id, o.k ?? 0, `<path class="ln" ${o.w ? `style="stroke-width:${o.w}"` : ''} d="M${p3.map((p) => pt(P(...p))).join('L')}"/>${o.extra || ''}`, o);
    },
    raw(id, svg, o = {}) { add(id, o.k ?? 0, svg, o); },
    screen(id, svg, o = {}) { add(id, 3000, svg, { ...o, always: true }); },
    water(id, x, y, z, w, d, h, o = {}) {
      let lines = '';
      for (let i = 1; i <= 3; i++) {
        const yy = y + (d * i) / 4;
        lines += `<path class="thin wave" style="animation-delay:${i * .5}s;stroke:#fff;opacity:.8" d="M${pt(P(x + w * .15, yy, z + h))}L${pt(P(x + w * .4, yy, z + h))}M${pt(P(x + w * .58, yy + .2, z + h))}L${pt(P(x + w * .82, yy + .2, z + h))}"/>`;
      }
      api.box(id, x, y, z, w, d, h, o.color || 'water', { ...o, extra: lines });
    },
    label(id, x, y, z, text, o = {}) {
      const [px, py] = P(x, y, z);
      api.labelS(id, px, py, text, o);
    },
    labelS(id, px, py, text, o = {}) {
      const icon = typeof text === 'object' ? text.icon : o.icon, t = typeof text === 'object' ? text.t : text;
      const w = Math.round(t.length * 7.3 + 20 + (icon ? 20 : 0)), dy = (o.dy ?? -22), ox = o.dx ?? 0;
      add(id, 2000, `<g class="pill" transform="translate(${f(px + ox)},${f(py + dy)})"><rect class="shadow" x="${-w / 2 + 1.5}" y="-10.5" width="${w}" height="24" rx="12"/><rect x="${-w / 2}" y="-12" width="${w}" height="24" rx="12"/>${icon ? `<use href="#ic-${icon}" x="${-w / 2 + 8}" y="-7" width="14" height="14"/>` : ''}<text x="${icon ? 10 : 0}" text-anchor="middle">${t}</text></g>`, { from: o.from, until: o.until });
    },
    flow(id, p3, kind, o = {}) { api.flowS(id, p3.map((p) => P(...p)), kind, o); },
    flowS(id, p2, kind, o = {}) {
      const d = 'M' + p2.map(pt).join('L');
      add(id, 1000, `<path class="track" d="${d}"/>${o.pipe ? `<path class="fill" d="${d}"/>` : ''}<path class="dash" d="${d}"/>`, { from: o.from, until: o.until, cls: `flow k-${kind} ${o.pipe ? 'pipe' : ''} ${o.cls || ''} flowel` });
    },
    card(id, title, inner, o = {}) {
      const w = o.w ?? 205, h = o.h ?? 150, x = o.x ?? api.vb[0] + api.vb[2] - w - 14, y = o.y ?? api.vb[1] + 12;
      api.screen(id, `<g class="chartcard" transform="translate(${x},${y})"><rect class="bg" x="2" y="2" width="${w}" height="${h}" rx="12" style="fill:var(--obj-edge)"/><rect class="bg" width="${w}" height="${h}" rx="12"/><text class="ttl" x="12" y="18">${title}</text>${inner}</g>`, o);
    },
    render() {
      return gradDefs() + items.slice().sort((a, b) => a.key - b.key).map((i) =>
        `<g class="el ${i.cls}" data-id="${i.id}" data-from="${i.from}" data-until="${i.until}"${i.always ? ' data-always="1"' : ''}>${i.html}</g>`).join('');
    },
  };
  return api;
}

// Hidden icon sprite (24×24 stroke icons, lucide-style).
export const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
  wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4.1 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  atom: '<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2-2 0-7.4-4.5-11.9-4.5-4.5-9.9-6.5-11.9-4.5-2 2 0 7.4 4.5 11.9 4.5 4.5 9.9 6.5 11.9 4.5z"/><path d="M15.7 15.7c4.5-4.5 6.5-9.9 4.5-11.9-2-2-7.4 0-11.9 4.5-4.5 4.5-6.5 9.9-4.5 11.9 2 2 7.4 0 11.9-4.5z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
  thermo: '<path d="M14 4v10.5a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  house: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H4a2 2 0 0 0-2 2z"/><path d="M17 18h1M12 18h1M7 18h1"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>', sunmode: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
  replay: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>', play: '<path d="M6 3 20 12 6 21z"/>',
  next: '<path d="M5 12h14M12 5l7 7-7 7"/>', back: '<path d="m12 19-7-7 7-7M19 12H5"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  sparkle: '<path d="M9.9 15.5A2 2 0 0 0 8.5 14.1l-6.1-1.6a.5.5 0 0 1 0-1L8.5 9.9a2 2 0 0 0 1.4-1.4l1.6-6.1a.5.5 0 0 1 1 0l1.6 6.1a2 2 0 0 0 1.4 1.4l6.1 1.6a.5.5 0 0 1 0 1l-6.1 1.6a2 2 0 0 0-1.4 1.4l-1.6 6.1a.5.5 0 0 1-1 0z"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
  battery: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.500 20.500 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.500-1.200 6.200-2.700a1.200 1.200 0 0 1 1.500 0C14.500 3.800 17 5 19 5a1 1 0 0 1 1 1z"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  layers: '<path d="m12.8 2.2a2 2 0 0 0-1.6 0L2.600 6.100a1 1 0 0 0 0 1.800l8.600 3.900a2 2 0 0 0 1.600 0l8.600-3.900a1 1 0 0 0 0-1.800z"/><path d="m22 17.700-9.200 4.100a2 2 0 0 1-1.600 0L2 17.700M22 12.700l-9.200 4.100a2 2 0 0 1-1.600 0L2 12.700"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.200 4.200l2.100 2.100M17.700 17.700l2.100 2.100M2 12h3M19 12h3M4.200 19.800l2.100-2.100M17.700 6.300l2.100-2.100"/>',
  tower: '<path d="M12 2 6 22M12 2l6 20M8 14h8M9.500 8h5"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
};
export const spriteHTML = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(ICONS).map(([k, v]) => `<symbol id="ic-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`;
export const ic = (n, c = '') => `<svg class="ic ${c}"><use href="#ic-${n}"/></svg>`;
