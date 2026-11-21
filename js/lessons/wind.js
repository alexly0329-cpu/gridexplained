import { P } from '../iso.js';

// 3 MW turbine: cut-in 3 m/s, rated 12 m/s, cut-out 25 m/s
const power = (v) => (v < 3 || v > 25 ? 0 : v >= 12 ? 3 : (3 * (v ** 3 - 27)) / (12 ** 3 - 27));
const CX = (v) => 24 + v * 6, CY = (p) => 128 - p * 28;
const mark = (v) => ({ '--mx': CX(v) + 'px', '--my': CY(power(v)) + 'px' });

export function turbine(s, { x, y, sc = 1, suf = '', from = 0, label }) {
  const [bx, by] = P(x, y, 0), H = 132 * sc, hy = by - H, hx = bx - 15 * sc, L = 70 * sc, k = x + y;
  s.raw('tower' + suf, `<ellipse cx="${bx + 6}" cy="${by + 3}" rx="${24 * sc}" ry="${8 * sc}" fill="#3c28142e"/><polygon class="o" fill="url(#g-white)" points="${bx - 6 * sc},${by} ${bx + 6 * sc},${by} ${bx + 3 * sc},${hy} ${bx - 3 * sc},${hy}"/>`, { k, from });
  s.raw('nacelle' + suf, `<rect class="o" x="${bx - 18 * sc}" y="${hy - 7 * sc}" width="${38 * sc}" height="${15 * sc}" rx="${5 * sc}" fill="#fbf8f3"/><rect x="${bx + 8 * sc}" y="${hy - 5 * sc}" width="${8 * sc}" height="${3 * sc}" fill="#c9ccd1"/>`, { k: k + 0.01, from });
  const blade = (r) => `<polygon class="o" fill="#fbf8f3" transform="rotate(${r})" points="-3.5,-6 -4.5,${-L * 0.28} -2,${-L} 1.5,${-L} 4.5,${-L * 0.2} 3.5,-6"/>`;
  s.raw('rotor' + suf, `<g transform="translate(${hx.toFixed(1)},${hy.toFixed(1)}) scale(.82 1)"><g class="spin" style="--spin:var(--rotor,6s)">${blade(0)}${blade(120)}${blade(240)}<circle class="o" r="${6.5 * sc}" fill="#c9ccd1"/></g></g>`, { k: k + 0.02, from });
  if (label) s.labelS('tower' + suf + ':l', bx, hy - L - 16 * sc, label, { dy: 0, from });
}

const inside = `
  <circle cx="24" cy="80" r="14" fill="#c9ccd1" stroke="var(--obj-edge)" stroke-width="2"/>
  <g transform="translate(24,80)"><g class="spin" style="--spin:4s"><path d="M0,-14V-26M12,7l10,6M-12,7l-10,6" stroke="var(--obj-edge)" stroke-width="4" stroke-linecap="round"/></g></g>
  <rect x="38" y="76" width="22" height="8" fill="#a9adb4" stroke="var(--obj-edge)" stroke-width="2"/>
  <rect x="60" y="56" width="38" height="48" rx="5" fill="#fcdcbd" stroke="var(--obj-edge)" stroke-width="2"/>
  <g transform="translate(74,72)"><g class="spin" style="--spin:5s"><circle r="9" fill="none" stroke="#35322f" stroke-width="4" stroke-dasharray="3 3.1"/></g></g>
  <g transform="translate(88,90)"><g class="spin rev-spin" style="--spin:1.6s"><circle r="5.5" fill="none" stroke="#35322f" stroke-width="3" stroke-dasharray="2.4 2.5"/></g></g>
  <rect x="98" y="78" width="16" height="4" fill="#a9adb4" stroke="var(--obj-edge)" stroke-width="2"/>
  <rect x="114" y="62" width="40" height="36" rx="6" fill="#e7ddf5" stroke="var(--obj-edge)" stroke-width="2"/>
  <path d="M122,70v20M130,70v20M138,70v20M146,70v20" stroke="#8c7ac0" stroke-width="2.5"/>
  <rect x="160" y="68" width="34" height="24" rx="4" fill="#dff0de" stroke="var(--obj-edge)" stroke-width="2"/>
  <path d="M154,80H160M194,80H202" stroke="#e8a33a" stroke-width="3"/>
  <text x="14" y="112">hub</text><text x="62" y="118">gearbox</text><text x="112" y="112" style="font-size:8.5px">generator</text><text x="156" y="64" style="font-size:8.5px">converter</text>
  <text x="26" y="62" style="fill:#d0683a;font-weight:700">15 rpm</text><text x="86" y="50" style="fill:#d0683a;font-weight:700">1,500 rpm</text>
  <text x="14" y="136" style="font-size:8.5px">magnets spin past coils → current</text>`;

const curve = () => {
  const pts = Array.from({ length: 29 }, (_, v) => `${CX(v)},${CY(power(v))}`).join(' ');
  return `<path class="ax" d="M24,128H196M24,128V36"/>
   <polyline points="${pts}" fill="none" stroke="#2f86ce" stroke-width="2.6" stroke-linejoin="round"/>
   <path d="M${CX(3)},128V40M${CX(12)},128V40M${CX(25)},128V40" stroke="var(--line-strong)" stroke-dasharray="3 3"/>
   <text x="${CX(3) - 12}" y="36">cut-in</text><text x="${CX(12) - 10}" y="36">rated</text><text x="${CX(25) - 14}" y="36">cut-out</text>
   <text x="2" y="48" style="font-size:8px">3 MW</text><text x="4" y="132">0</text><text x="24" y="142">0</text><text x="${CX(10)}" y="142">10</text><text x="${CX(20)}" y="142">20 m/s</text>
   
   <circle r="5.5" fill="#d0683a" stroke="var(--obj-edge)" stroke-width="2" style="transform:translate(var(--mx,24px),var(--my,128px));transition:transform .7s cubic-bezier(.3,.9,.3,1)"/>`;
};

export default {
  id: 'wind', title: 'Wind Power', icon: 'wind', time: 8, level: 'Beginner',
  tagline: 'See how moving air turns a rotor, why speed is cubed, and how a farm feeds the grid.',
  stats: [
    { id: 'wind', label: 'Wind speed', icon: 'wind' }, { id: 'rpm', label: 'Rotor', icon: 'cog' },
    { id: 'mw', label: 'Output', icon: 'zap' }, { id: 'cf', label: 'Capacity factor', icon: 'gauge' },
  ],
  legend: [['#5b9bd5', 'wind'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'Why power grows with the cube of wind speed', at: 0 }, { t: 'How blades act as wings (and the Betz limit)', at: 1 },
    { t: 'What happens inside the nacelle', at: 2 }, { t: 'Cut-in, rated and cut-out speeds', at: 3 },
    { t: 'Why wind farms need space', at: 6 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    turbine(s, { x: 2.5, y: 6.5, suf: '', label: { t: 'turbine', icon: 'wind' } });
    turbine(s, { x: 5.6, y: 3, sc: 0.8, suf: '2', from: 6 });
    turbine(s, { x: 8, y: 6.4, sc: 0.8, suf: '3', from: 6 });
    s.box('substation', 4.6, 8.0, 0, 1.4, 1.2, 1.1, 'concrete', { from: 6, label: { t: 'substation', icon: 'zap' } });
    for (const [i, y] of [78, 108, 138, 168].entries()) s.flowS('w' + i, [[28 + i * 14, y], [210 + i * 6, y]], 'wind', { cls: i % 2 ? 'slow' : '' });
    s.flow('cable', [[2.5, 6.5, 0.05], [2.5, 8.6, 0.05], [4.6, 8.6, 0.05]], 'electric', { from: 3 });
    s.flow('cable2', [[5.6, 3, 0.05], [7.2, 3, 0.05], [7.2, 8.6, 0.05], [6, 8.6, 0.05]], 'electric', { from: 6 });
    s.flow('cable3', [[8, 6.4, 0.05], [8, 8.6, 0.05]], 'electric', { from: 6 });
    s.flow('export', [[6, 9.2, 0.05], [9.6, 9.2, 0.05]], 'hv', { from: 6 });
    s.card('inside', 'INSIDE THE NACELLE', inside, { w: 205, h: 150, from: 2, until: 2 });
    s.card('curve', 'POWER CURVE · 3 MW TURBINE', curve(), { w: 205, h: 152, from: 3, until: 5 });
  },
  steps: [
    {
      short: 'Wind', tag: 'CONCEPT', title: 'Wind is moving air',
      body: ['Air has mass, so moving air carries kinetic energy. The power in wind passing through a rotor is `½ × air density × swept area × speed³`.',
        'Because speed is cubed, doubling the wind gives eight times the power.'],
      callout: { k: 'key', t: 'Wind speed is the biggest factor in a site’s value. A 5% error in expected speed becomes a 16% error in expected power.' },
      focus: ['rotor', 'tower', 'nacelle'], flows: ['w0', 'w1', 'w2', 'w3'], vars: { '--rotor': '5s' }, stats: { wind: '6 m/s', rpm: '10 rpm' },
    },
    {
      short: 'Blades', tag: 'CONCEPT', title: 'Blades are wings',
      body: ['Blades are shaped like aircraft wings. Air flowing over the curved profile creates lift, and that lift spins the rotor rather than just pushing on it.',
        'A modern onshore blade is 60–80 m long. The rotor turns slowly, around 10–20 revolutions per minute, yet the blade tips move at roughly 80 m/s.'],
      callout: { k: 'know', t: 'No turbine can take more than 59.3% of the wind’s energy (the Betz limit): the air must keep moving to make way for more air. Good turbines reach 45–50%.' },
      focus: ['rotor'], flows: ['w0', 'w1', 'w2', 'w3'], vars: { '--rotor': '4s' }, stats: { rpm: '15 rpm' },
    },
    {
      short: 'Nacelle', tag: 'METHOD', title: 'Gearbox and generator',
      body: ['In the nacelle a gearbox steps the slow rotor (≈15 rpm) up to about 1,500 rpm for the generator. Spinning magnets past coils of wire induces a current. A converter then matches the output to grid frequency.',
        'Some designs drop the gearbox for a large direct-drive generator, trading weight and cost for fewer moving parts.'],
      callout: { k: 'key', t: 'Nearly every power station works this way, from wind and hydro to gas and nuclear. Only what turns the shaft differs.' },
      focus: ['nacelle', 'rotor'], flows: ['w0', 'w1', 'w2', 'w3'], vars: { '--rotor': '4s' },
    },
    {
      short: 'Power curve', tag: 'NUMBERS', title: 'Output follows the cube',
      body: ['A 3 MW turbine starts producing at its cut-in speed, about 3 m/s. From there power climbs with the cube of speed until rated speed (≈12 m/s) delivers the full 3 MW.',
        'At 8 m/s the same turbine makes only about 0.9 MW: less than a third of rated, though the wind is two thirds as fast.'],
      callout: { k: 'know', t: 'Manufacturers measure power curves in ideal conditions. Real output also depends on air density, turbulence and wakes from neighbouring turbines.' },
      focus: ['rotor', 'tower', 'nacelle'], flows: ['w0', 'w1', 'w2', 'w3', 'cable'], vars: { '--rotor': '3.2s', ...mark(8) }, stats: { wind: '8 m/s', rpm: '15 rpm', mw: '0.9 MW' },
    },
    {
      short: 'Pitch & yaw', tag: 'METHOD', title: 'Throwing power away on purpose',
      body: ['Above rated speed the turbine sheds the extra. Motors pitch each blade to catch less wind, holding output at 3 MW. In a storm (cut-out ≈25 m/s) the blades feather fully and the rotor stops.',
        'Separate yaw motors turn the whole nacelle to face the wind.'],
      callout: { k: 'warn', t: 'Pitching out is protection, not waste. Without it the rotor would overspeed and the loads would damage the machine.' },
      focus: ['rotor', 'nacelle'], flows: ['w0', 'w1', 'w2', 'w3', 'cable'], vars: { '--rotor': '2.6s', ...mark(15) }, stats: { wind: '15 m/s', mw: '3.0 MW' },
    },
    {
      short: 'Variability', tag: 'TRADE-OFF', title: 'Variable by nature',
      body: ['Output follows the weather. Over a year, onshore turbines average roughly 35% of their rated power, and modern offshore ones often 40–50% because the wind is steadier.',
        'Wind tends to be strongest at night and in winter, when solar is weakest, so the two complement each other.'],
      callout: { k: 'key', t: 'Capacity factor is not efficiency. A turbine at 35% isn’t wasting 65%: it just spends most hours below its maximum because the wind isn’t at full speed.' },
      focus: ['rotor', 'tower', 'nacelle'], flows: ['w1', 'w3', 'cable'], vars: { '--rotor': '9s', ...mark(6) }, stats: { wind: '6 m/s', rpm: '10 rpm', mw: '0.3 MW', cf: '≈ 35%' },
    },
    {
      short: 'Wind farm', tag: 'CONCEPT', title: 'From one turbine to a farm',
      body: ['Turbines are spaced 5–10 rotor diameters apart because each leaves a slower, turbulent wake behind it. Cables join them at a substation, which raises the voltage for long-distance transmission.'],
      callout: { k: 'know', t: 'Wake losses typically cost a farm several percent of its output, so turbine layout is a serious engineering problem.' },
      flows: ['w0', 'w1', 'w2', 'w3', 'cable', 'cable2', 'cable3', 'export'], vars: { '--rotor': '5s' },
    },
  ],
};
