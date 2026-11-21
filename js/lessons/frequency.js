import { panel } from './solar.js';
import { house, flywheel, smooth } from './common.js';

// ---- dial: needle angle = (f − 60 Hz) × 80°, so ±1 Hz spans the dial ----
const pol = (r, a) => [102 + r * Math.sin((a * Math.PI) / 180), 118 - r * Math.cos((a * Math.PI) / 180)];
const arc = (r, a0, a1, col) => { const [x0, y0] = pol(r, a0), [x1, y1] = pol(r, a1); return `<path d="M${x0.toFixed(1)},${y0.toFixed(1)}A${r},${r} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${col}" stroke-width="9"/>`; };
const tick = (a, t) => { const [x, y] = pol(92, a); return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="middle">${t}</text>`; };
const dial = `
  ${arc(72, -80, -56, '#e5534b')}${arc(72, -56, -8, '#f1c04e')}${arc(72, -8, 8, '#7fc278')}${arc(72, 8, 56, '#f1c04e')}${arc(72, 56, 80, '#e5534b')}
  ${tick(-80, '59')}${tick(-40, '59.5')}${tick(0, '60')}${tick(40, '60.5')}${tick(80, '61')}
  <line x1="0" y1="0" x2="0" y2="-66" stroke="var(--obj-edge)" stroke-width="3" stroke-linecap="round" style="transform:translate(102px,118px) rotate(var(--deg,0deg));transition:transform .9s cubic-bezier(.3,1.5,.4,1)"/>
  <circle cx="102" cy="118" r="7" fill="var(--obj-edge)"/>
  <text x="102" y="142" text-anchor="middle" style="font-size:9px">hertz · 60 Hz grid</text>
  <text x="14" y="142" style="font-size:8px;fill:#c0392b">shed</text>`;

// ---- frequency after a sudden loss of 2 GW (illustrative, sized to df/dt = f0·ΔP / 2HS) ----
const TX = (t) => 34 + t * 7.7, FY = (f) => 160 - (f - 59.1) * 126;
const path = (pts) => smooth(pts.map(([t, f]) => [TX(t), FY(f)]));
const HIGH = [[0, 60], [1, 59.88], [2, 59.78], [3, 59.72], [5, 59.69], [8, 59.72], [12, 59.8], [20, 59.9], [30, 59.95]];
const LOW = [[0, 60], [1, 59.7], [2, 59.45], [3, 59.3], [4, 59.22], [6, 59.2], [9, 59.3], [14, 59.5], [20, 59.7], [30, 59.85]];
const FAST = [[0, 60], [1, 59.72], [2, 59.5], [3, 59.42], [4, 59.4], [6, 59.45], [9, 59.6], [14, 59.78], [20, 59.9], [30, 59.96]];
const frame = `<path class="ax" d="M34,160H270M34,160V40"/>
  <path d="M34,${FY(59.3)}H270" stroke="#e5534b" stroke-width="1.4" stroke-dasharray="4 3"/><text x="150" y="${FY(59.3) + 11}" style="font-size:8.5px;fill:#c0392b">load shedding · 59.3 Hz</text>
  <text x="4" y="${FY(60) + 3}">60.0</text><text x="4" y="${FY(59.5) + 3}">59.5</text><text x="4" y="${FY(59.1) + 3}">59.1</text>
  <text x="34" y="174">0 s</text><text x="${TX(15) - 8}" y="174">15 s</text><text x="${TX(30) - 14}" y="174">30 s</text>
  <text x="${TX(1)}" y="36" style="font-size:8px">2 GW plant trips at 0 s</text>`;
const cv = (d, col, w = 2.6, dash = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
const curves = {
  a: frame + cv(path(HIGH), '#2f86ce') + `<text x="${TX(9)}" y="${FY(59.69) + 14}" style="font-size:8.5px;font-weight:700;fill:#1f63a0">lots of inertia</text>`,
  b: frame + cv(path(HIGH), '#2f86ce') + cv(path(LOW), '#d0683a') + `<text x="${TX(9)}" y="${FY(59.69) - 6}" style="font-size:8.5px;font-weight:700;fill:#1f63a0">H ≈ 5 s</text><text x="${TX(10.5)}" y="${FY(59.24) + 16}" style="font-size:8.5px;font-weight:700;fill:#a5470f">H ≈ 2 s</text>`,
  c: frame + cv(path(HIGH), '#2f86ce', 1.6, '4 3') + cv(path(LOW), '#d0683a') + cv(path(FAST), '#4caf50') + `<text x="${TX(10.5)}" y="${FY(59.24) + 16}" style="font-size:8.5px;font-weight:700;fill:#a5470f">low inertia</text><text x="${TX(12)}" y="${FY(59.62)}" style="font-size:8.5px;font-weight:700;fill:#2f6b22">+ fast battery</text>`,
};

// ---- the response ladder ----
const rung = (x, w, y, col, t, s) => `<rect x="${x}" y="${y}" width="${w}" height="26" fill="${col}" stroke="var(--obj-edge)" stroke-width="1.6"/><text x="${x + 6}" y="${y + 11}" style="font-size:9px;font-weight:700;fill:#172720">${t}</text><text x="${x + 6}" y="${y + 22}" style="font-size:8px;fill:#172720">${s}</text>`;
const ladder = `<path class="ax" d="M20,150H280"/>
  ${rung(20, 60, 40, '#f6d77e', 'inertia', 'automatic')}${rung(80, 70, 70, '#9fcdf0', 'primary', 'governors, batteries')}${rung(150, 80, 100, '#a9d6c9', 'secondary', 'dispatch signal (AGC)')}${rung(230, 50, 128, '#cfc0e8', 'tertiary', 'start plants')}
  <text x="20" y="164">0</text><text x="76" y="164">2 s</text><text x="144" y="164">30 s</text><text x="226" y="164">10 min</text><text x="262" y="164">hours</text>
  <text x="20" y="184" style="font-size:8.5px">each layer hands over to the next</text>`;

export default {
  id: 'frequency', group: 'grid', title: 'Frequency & Inertia', icon: 'cog', time: 10, level: 'Advanced',
  tagline: 'Why every generator hums at the same pitch, and what happens in the seconds after one drops out.',
  stats: [
    { id: 'hz', label: 'Frequency', icon: 'gauge' }, { id: 'h', label: 'Inertia (H)', icon: 'cog' },
    { id: 'rocof', label: 'Rate of fall', icon: 'chart' }, { id: 'shed', label: 'Load shedding at', icon: 'shield' },
  ],
  legend: [['#7c63d0', 'AC power'], ['#e8a33a', 'power from inverters']],
  learn: [
    { t: 'Why frequency tells you the grid’s balance', at: 0 }, { t: 'What inertia is and why it buys time', at: 2 },
    { t: 'How fast frequency falls: df/dt = f₀·ΔP / 2HS', at: 3 }, { t: 'The four layers of frequency response', at: 4 },
    { t: 'Why a grid of solar and wind needs new tools', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    const M = [['m1', 0.5, 0.9, 'gas turbine', 'flame'], ['m2', 0.5, 3.5, 'nuclear turbine', 'atom'], ['m3', 0.5, 6.1, 'hydro generator', 'droplet']];
    for (const [id, x, y, t, ic] of M) {
      s.box(id, x, y, 0, 2.4, 2.0, 1.2, 'steel', { label: { t, icon: ic } });
      s.raw(id, flywheel(x + 1.2, y + 1.0, 1.2, 0.72, 'var(--w,1.2s)'), { k: x + 2.4 + y + 2.0 + 0.1 });
    }
    s.flow('f-bus', [[4.2, 1.9, 0.05], [4.2, 8.3, 0.05]], 'ac', { cls: 'slow' });
    s.flow('f-m1', [[2.9, 1.9, 0.05], [4.2, 1.9, 0.05]], 'ac', {});
    s.flow('f-m2', [[2.9, 4.5, 0.05], [4.2, 4.5, 0.05]], 'ac', {});
    s.flow('f-m3', [[2.9, 7.1, 0.05], [4.2, 7.1, 0.05]], 'ac', {});
    [[6.4, 1.2, 1.9], [6.4, 3.6, 4.2], [6.4, 6.0, 6.6]].forEach(([x, y, fy], i) => {
      house(s, 'city', x, y, i === 1 ? { label: { t: 'demand', icon: 'house' } } : {});
      s.flow('f-h' + i, [[4.2, fy, 0.05], [x, fy, 0.05]], 'ac', {});
    });
    s.raw('solar', panel(4.9, 7.6, 1.8, 1.4), { k: 14 });
    s.box('inverter', 7.0, 8.1, 0, 0.9, 0.9, 0.8, 'white', { label: { t: 'solar + inverter', icon: 'sun' }, lopt: { dy: -16 } });
    s.box('battery', 8.5, 7.5, 0, 1.0, 1.0, 0.8, 'green', { from: 5, label: { t: 'fast battery', icon: 'battery' }, lopt: { dy: -44 } });
    s.flow('f-inv', [[7.0, 8.5, 0.05], [4.2, 8.5, 0.05]], 'electric', {});
    s.flow('f-bat', [[8.5, 8.0, 0.05], [7.9, 8.0, 0.05]], 'electric', { from: 5, cls: 'fast' });
    s.card('dial', 'GRID FREQUENCY', dial, { w: 205, h: 152, from: 0, until: 2 });
    s.card('dial', 'GRID FREQUENCY', dial, { w: 205, h: 152, from: 6, until: 6 });
    s.card('ca', 'AFTER A 2 GW TRIP', curves.a, { w: 300, h: 186, from: 2, until: 2, x: 446, y: 8 });
    s.card('cb', 'HOW INERTIA CHANGES THE DIP', curves.b, { w: 300, h: 186, from: 3, until: 3, x: 446, y: 8 });
    s.card('cl', 'WHO RESPONDS, WHEN', ladder, { w: 300, h: 196, from: 4, until: 4, x: 446, y: 8 });
    s.card('cc', 'FAST BATTERIES TO THE RESCUE', curves.c, { w: 300, h: 186, from: 5, until: 5, x: 446, y: 8 });
  },
  steps: [
    {
      short: 'One hum', tag: 'CONCEPT', title: 'Every generator keeps the same beat',
      body: ['Alternating current reverses 60 times a second (50 in much of the world). Large generators on a grid are electrically locked together, so they all spin at the same speed: 3,600 rpm for a two-pole machine at 60 Hz.',
        'That shared beat, the frequency, is the same everywhere on the connected grid at any instant.'],
      callout: { k: 'key', t: 'Frequency is the grid’s gauge of balance. It sags when demand beats supply and rises when supply beats demand.' },
      focus: ['m1', 'm2', 'm3'], flows: ['f-bus', 'f-m1', 'f-m2', 'f-m3', 'f-h0', 'f-h1', 'f-h2'], vars: { '--w': '1.2s', '--deg': '0deg' }, stats: { hz: '60.00 Hz' },
    },
    {
      short: 'Out of balance', tag: 'PROBLEM', title: 'A plant trips: the grid slows',
      body: ['Suppose a generator suddenly disconnects. Demand is now larger than supply, but power cannot appear from nowhere.',
        'The missing energy is drawn from the spinning machines. They slow slightly, all together, and the frequency falls.'],
      callout: { k: 'warn', t: 'Operators do not decide this. It is physics: the instant supply and demand differ, frequency starts moving.' },
      focus: ['m1', 'm2', 'm3', 'city'], flows: ['f-bus', 'f-m1', 'f-m3', 'f-h0', 'f-h1', 'f-h2'], vars: { '--w': '1.45s', '--deg': '-12deg' }, stats: { hz: '59.85 Hz' },
    },
    {
      short: 'Inertia', tag: 'CONCEPT', title: 'The flywheel effect',
      body: ['A spinning mass stores kinetic energy, `½ × J × ω²`. When frequency dips, every heavy rotor gives back some of that energy instantly and automatically.',
        'Engineers measure it as H, the seconds a machine could supply its full output from rotation alone. Large generators have H of roughly 2–9 s.'],
      callout: { k: 'key', t: 'Inertia does not stop a fall. It slows it, buying a few precious seconds for other defences to act.' },
      focus: ['m1', 'm2', 'm3'], flows: ['f-bus', 'f-m1', 'f-m2', 'f-m3'], vars: { '--w': '1.3s', '--deg': '-12deg' }, stats: { h: '≈ 5 s' },
    },
    {
      short: 'How fast', tag: 'NUMBERS', title: 'The speed of the fall',
      body: ['The initial rate of fall is `df/dt = f₀ × ΔP ÷ (2 × H × S)`. Lose 2 GW from a 100 GW system with H = 5 s: 60 × 2 ÷ (2 × 5 × 100) = 0.12 Hz per second.',
        'Halve the inertia and it doubles to 0.30 Hz/s. The dip then crosses 59.3 Hz before other responses arrive, and automatic load shedding begins.'],
      callout: { k: 'know', t: 'Same disturbance, different inertia, very different outcome. This is why grid planners track inertia as carefully as capacity.' },
      focus: ['m1', 'm2', 'm3'], flows: ['f-bus', 'f-m1', 'f-m2', 'f-m3'], vars: { '--w': '1.35s', '--deg': '-30deg' }, stats: { rocof: '0.12 Hz/s' },
    },
    {
      short: 'Layers', tag: 'METHOD', title: 'Four layers of response',
      body: ['After inertia, plant governors open valves automatically within seconds (primary response). A control centre then sends new set-points every few seconds to restore 60 Hz (secondary), and operators later start more units (tertiary).',
        'Fast batteries can join the primary layer and react in a fraction of a second.'],
      callout: { k: 'key', t: 'No single tool covers every timescale. The grid works because each layer hands over to the next.' },
      focus: ['m1', 'm2', 'm3', 'city'], flows: ['f-bus', 'f-m1', 'f-m2', 'f-m3', 'f-h0', 'f-h1', 'f-h2'], vars: { '--w': '1.25s', '--deg': '-8deg' },
    },
    {
      short: 'Fewer rotors', tag: 'TRADE-OFF', title: 'When the shafts disappear',
      body: ['Solar panels, batteries and many wind turbines connect through inverters. Their output follows a signal, not a heavy shaft locked to the grid, so they add little natural inertia.',
        'As they replace spinning plants, total inertia falls and frequency moves faster. Remedies: synchronous condensers (spinning machines with no fuel), grid-forming inverters, and batteries that respond in milliseconds.'],
      callout: { k: 'know', t: 'Low inertia is not a reason to avoid solar and wind. It is a design requirement: add the fast response the missing rotors used to give for free.' },
      focus: ['inverter', 'solar', 'battery', 'm1'], flows: ['f-bus', 'f-inv', 'f-bat', 'f-m1', 'f-h0', 'f-h1', 'f-h2'], vars: { '--w': '2.2s', '--deg': '-30deg' }, stats: { h: '≈ 2 s', rocof: '0.30 Hz/s' },
    },
    {
      short: 'Safety net', tag: 'CONCEPT', title: 'Cutting a little to save the rest',
      body: ['In normal operation frequency stays within a few hundredths of a hertz. If it falls toward 59.3 Hz, automatic under-frequency relays disconnect blocks of customers within a fraction of a second.',
        'A planned, small outage rebalances the system before generators trip on their own and the fall cascades.'],
      callout: { k: 'key', t: 'A controlled small blackout beats an uncontrolled large one. Every layer before this exists to keep it from being needed.' },
      focus: ['city', 'm1', 'm2', 'm3'], flows: ['f-bus', 'f-m1', 'f-m2', 'f-m3', 'f-h0', 'f-h1', 'f-h2'], vars: { '--w': '1.2s', '--deg': '0deg' }, stats: { shed: '59.3 Hz', hz: '60.00 Hz' },
    },
  ],
};
