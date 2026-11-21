import { P } from '../iso.js';
import { panel } from './solar.js';
import { turbine } from './wind.js';
import { house, pylon } from './common.js';

// ---- a made-up day on a made-up grid, in GW ----
const DEM = [[0, 38], [5, 30], [8, 52], [12, 52], [16, 54], [19, 80], [22, 56], [24, 40]];
const dem = (h) => { for (let i = 1; i < DEM.length; i++) if (h <= DEM[i][0]) { const [a, b] = [DEM[i - 1], DEM[i]]; return 1.1 * (a[1] + ((h - a[0]) / (b[0] - a[0])) * (b[1] - a[1])); } return 44; };
const NUC = 20, HYD = 8;
const sol = (h) => (Math.abs(h - 12) > 6.5 ? 0 : 34 * Math.exp(-0.5 * ((h - 12) / 3.2) ** 2));
const wnd = (h) => 12 + 8 * Math.cos(((h - 2) / 24) * 2 * Math.PI);
const clean = (h) => NUC + HYD + wnd(h) + sol(h);
const gas0 = (h) => Math.max(dem(h) - clean(h), 0);
const surplus = (h) => Math.max(clean(h) - dem(h), 0);
const stored = Array.from({ length: 24 }, (_, h) => Math.min(surplus(h), 16)).reduce((a, b) => a + b, 0);
const rawDis = Array.from({ length: 24 }, (_, h) => (h >= 17 && h <= 22 ? gas0(h) : 0)).reduce((a, b) => a + b, 0);
const kDis = stored / rawDis;
const dis = (h) => (h >= 17 && h <= 22 ? Math.min(gas0(h) * kDis, gas0(h)) : 0);
const gas1 = (h) => gas0(h) - dis(h);
const rampBefore = Math.round(gas0(19) - Math.min(...[10, 11, 12, 13, 14].map(gas0)));
const rampAfter = Math.round(gas1(19) - Math.min(...[10, 11, 12, 13, 14].map(gas1)));
const peak = Math.round(Math.max(...Array.from({ length: 25 }, (_, h) => dem(h))));

const X = (h) => 18 + h * 10.8, Y = (v) => 160 - v * 1.35;
const hrs = Array.from({ length: 25 }, (_, h) => h);
const line = (f) => hrs.map((h) => `${X(h).toFixed(1)},${Y(f(h)).toFixed(1)}`).join(' ');
const band = (lo, hi, fill, op = 1) => `<polygon points="${hrs.map((h) => `${X(h).toFixed(1)},${Y(hi(h)).toFixed(1)}`).join(' ')} ${hrs.slice().reverse().map((h) => `${X(h).toFixed(1)},${Y(lo(h)).toFixed(1)}`).join(' ')}" fill="${fill}" opacity="${op}" stroke="#2b2722" stroke-width=".6"/>`;
const axes = `<path class="ax" d="M18,160H280M18,160V38"/><text x="14" y="173">0h</text><text x="${X(12) - 10}" y="173">noon</text><text x="${X(24) - 14}" y="173">24h</text><text x="${X(0) + 2}" y="36" style="font-size:8px">GW</text>`;
const demandLine = (dashed) => `<polyline points="${line(dem)}" fill="none" stroke="var(--ink)" stroke-width="${dashed ? 1.6 : 2.6}" ${dashed ? 'stroke-dasharray="4 3"' : ''} stroke-linejoin="round"/>`;
const C = { nuc: '#cfc0e8', hyd: '#9fcdf0', wnd: '#a9d6c9', sol: '#f6d77e', gas: '#f7a35c', bat: '#8fd07f' };
const layers = {
  nuc: [() => 0, () => NUC], hyd: [() => NUC, () => NUC + HYD],
  wnd: [() => NUC + HYD, (h) => NUC + HYD + wnd(h)], sol: [(h) => NUC + HYD + wnd(h), clean],
};
const gasTop = (h) => clean(h) + gas0(h);
const key = (items) => `<text x="14" y="189" style="font-size:8.5px">${items.map(([c, t]) => `<tspan fill="${c}" font-weight="700">■</tspan> ${t}  `).join('')}</text>`;
const chart = {
  b0: axes + demandLine(false) + `<text x="${X(14)}" y="${Y(dem(16)) - 8}" style="font-size:9px;font-weight:700;fill:var(--ink)">demand</text>` + key([['#172720', 'what everyone is using']]),
  b1: axes + band(...layers.nuc, C.nuc) + band(...layers.hyd, C.hyd) + demandLine(false) + `<text x="26" y="${Y(14)}" style="font-size:8.5px">nuclear</text><text x="26" y="${Y(24)}" style="font-size:8.5px">hydro</text>` + key([[C.nuc, 'nuclear'], [C.hyd, 'hydro'], ['#172720', 'demand']]),
  b2: axes + band(...layers.nuc, C.nuc) + band(...layers.hyd, C.hyd) + band(...layers.wnd, C.wnd) + band(...layers.sol, C.sol)
    + `<polygon points="${hrs.filter((h) => surplus(h) > 0).map((h) => `${X(h).toFixed(1)},${Y(clean(h)).toFixed(1)}`).join(' ')} ${hrs.filter((h) => surplus(h) > 0).reverse().map((h) => `${X(h).toFixed(1)},${Y(dem(h)).toFixed(1)}`).join(' ')}" fill="#e5534b" opacity=".75"/>`
    + demandLine(false) + `<text x="${X(9.4)}" y="${Y(clean(12)) - 6}" style="font-size:8.5px;font-weight:700;fill:#c0392b">surplus</text>` + key([[C.wnd, 'wind'], [C.sol, 'solar'], ['#e5534b', 'more than anyone needs']]),
  b3: axes + band(...layers.nuc, C.nuc) + band(...layers.hyd, C.hyd) + band(...layers.wnd, C.wnd) + band(...layers.sol, C.sol) + band(clean, gasTop, C.gas) + demandLine(false)
    + `<text x="${X(17.2)}" y="${Y(gasTop(19)) - 10}" style="font-size:8.5px;font-weight:700;fill:#a5470f">evening ramp</text>` + key([[C.gas, 'gas fills the rest'], ['#e5534b', '']].slice(0, 1)),
  b4: axes + band(...layers.nuc, C.nuc) + band(...layers.hyd, C.hyd) + band(...layers.wnd, C.wnd) + band(...layers.sol, C.sol)
    + `<polygon points="${hrs.filter((h) => surplus(h) > 0).map((h) => `${X(h).toFixed(1)},${Y(clean(h)).toFixed(1)}`).join(' ')} ${hrs.filter((h) => surplus(h) > 0).reverse().map((h) => `${X(h).toFixed(1)},${Y(dem(h)).toFixed(1)}`).join(' ')}" fill="${C.bat}" opacity=".9" stroke="#2b2722" stroke-width=".6"/>`
    + band(clean, (h) => clean(h) + dis(h), C.bat) + band((h) => clean(h) + dis(h), (h) => clean(h) + dis(h) + gas1(h), C.gas) + demandLine(false)
    + `<text x="${X(9.6)}" y="${Y(clean(12)) - 6}" style="font-size:8.5px;font-weight:700;fill:#2f6b22">stored</text><text x="${X(17)}" y="${Y(dem(19)) - 8}" style="font-size:8.5px;font-weight:700;fill:#2f6b22">released</text>` + key([[C.bat, 'battery & pumped storage'], [C.gas, 'gas']]),
};
chart.b5 = chart.b4.replace(key([[C.bat, 'battery & pumped storage'], [C.gas, 'gas']]), '')
  + `<polyline points="${line((h) => dem(h) * 1.08)}" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-dasharray="2 3"/><text x="${X(0.5)}" y="${Y(dem(0) * 1.08) - 6}" style="font-size:8.5px;font-weight:700;fill:#c0392b">demand + reserve</text>` + key([[C.bat, 'storage'], [C.gas, 'gas'], ['#c0392b', 'spare capacity']]);

const WIND = ['towerW', 'nacelleW', 'rotorW'];

export default {
  id: 'balance', group: 'grid', title: 'Balancing the Grid', icon: 'gauge', time: 10, level: 'Intermediate',
  tagline: 'Follow one day on one grid: how six sources and storage keep supply equal to demand, second by second.',
  stats: [
    { id: 'dem', label: 'Peak demand', icon: 'house' }, { id: 'gas', label: 'Gas ramp', icon: 'flame' },
    { id: 'ramp', label: 'Ramp with storage', icon: 'battery' }, { id: 'res', label: 'Spare capacity', icon: 'shield' },
  ],
  legend: [['#e8a33a', 'power flowing to the hub'], ['#7c63d0', 'power to homes']],
  learn: [
    { t: 'Why supply must equal demand every second', at: 0 }, { t: 'What steady sources can and cannot do', at: 1 },
    { t: 'Why midday solar and wind can be too much', at: 2 }, { t: 'What the “evening ramp” asks of gas', at: 3 },
    { t: 'How storage and reserves keep the lights on', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.raw('solar', panel(0.4, 1.6, 2, 1.6) + panel(2.6, 1.6, 2, 1.6), { k: 8 });
    s.label('solar:l', 2.5, 2.4, 1.9, { t: 'solar', icon: 'sun' });
    turbine(s, { x: 1.2, y: 6.2, sc: 0.62, suf: 'W' });
    s.labelS('towerW:l', P(1.2, 6.2, 0)[0], P(1.2, 6.2, 0)[1] - 132 * 0.62 - 54 * 0.62 - 14, { t: 'wind', icon: 'wind' }, { dy: 0 });
    s.dome('nuclear', 6.6, 2.1, 0, 0.8, 1.2, 0.5, 'concrete', { label: { t: 'nuclear', icon: 'atom' } });
    s.box('hydro', 8.3, 3.0, 0, 1.4, 1.4, 1.0, 'concrete', { label: { t: 'hydro', icon: 'droplet' }, extra: '' });
    s.box('gas', 2.6, 3.4, 0, 1.7, 1.3, 1.0, 'steel', { label: { t: 'gas', icon: 'flame' } });
    s.cyl('gas', 3.9, 3.7, 1.0, 0.18, 0.9, 'concrete', { k: 9, shadow: false });
    s.box('battery', 3.3, 8.2, 0, 1.4, 1.1, 0.9, 'green', { label: { t: 'storage', icon: 'battery' } });
    s.box('hub', 4.6, 4.6, 0, 0.9, 0.9, 0.8, 'concrete', { k: 11, label: { t: 'the grid', icon: 'tower' } });
    house(s, 'city', 6.4, 6.4); house(s, 'city', 8.1, 6.4); house(s, 'city', 7.2, 8.2, { label: { t: 'demand', icon: 'house' } });
    s.raw('pylon', pylon(5.1, 5.6, 2), { k: 12 });

    const hub = [4.9, 4.9, 0.05];
    s.flow('f-solar', [[2.5, 3.3, 0.05], hub], 'electric', {});
    s.flow('f-wind', [[1.2, 6.2, 0.05], hub], 'electric', {});
    s.flow('f-nuke', [[6.6, 2.9, 0.05], hub], 'electric', {});
    s.flow('f-hydro', [[8.3, 3.7, 0.05], hub], 'electric', {});
    s.flow('f-gas', [[3.4, 4.4, 0.05], hub], 'electric', {});
    s.flow('f-batt-in', [hub, [4.0, 6.0, 0.05], [4.0, 8.2, 0.05]], 'electric', {});
    s.flow('f-batt-out', [[4.0, 8.2, 0.05], [4.0, 6.0, 0.05], hub], 'electric', {});
    s.flow('f-city', [[5.5, 5.1, 0.05], [6.2, 5.1, 0.05], [6.2, 7.0, 0.05], [8.0, 7.0, 0.05]], 'ac', {});

    s.card('b0', 'ONE DAY OF DEMAND', chart.b0, { y: 4, w: 300, h: 196, from: 0, until: 0 });
    s.card('b1', 'STEADY SOURCES', chart.b1, { y: 4, w: 300, h: 196, from: 1, until: 1 });
    s.card('b2', 'ADD WIND AND SUN', chart.b2, { y: 4, w: 300, h: 196, from: 2, until: 2 });
    s.card('b3', 'GAS FILLS THE GAP', chart.b3, { y: 4, w: 300, h: 196, from: 3, until: 3 });
    s.card('b4', 'ADD STORAGE', chart.b4, { y: 4, w: 300, h: 196, from: 4, until: 4 });
    s.card('b5', 'KEEP SOME IN RESERVE', chart.b5, { y: 4, w: 300, h: 196, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Supply = demand', tag: 'CONCEPT', title: 'Every second, the same number',
      body: ['Electricity has to be used the instant it is made. The grid stores almost nothing, so operators match what the power stations produce to what homes and factories draw, second by second.',
        `Demand is not flat. On this grid it swings from about 40 GW at night to ${peak} GW on an evening peak.`],
      callout: { k: 'key', t: 'Too little supply and the grid slows down; too much and it speeds up. The next lesson shows exactly what that means.' },
      focus: ['city', 'hub'], flows: ['f-city'], stats: { dem: `${peak} GW` },
    },
    {
      short: 'Steady sources', tag: 'CONCEPT', title: 'Nuclear and hydro: the foundation',
      body: [`Nuclear (${NUC} GW here) runs flat out day and night. Hydro (${HYD} GW) can move, but its water is a budget to spend carefully.`,
        'Together they cover the night. By morning they are far below demand, and they cannot follow its daily swing.'],
      callout: { k: 'know', t: 'Plants with high build cost and low fuel cost are run as many hours as possible: they earn the most when they never stop.' },
      focus: ['nuclear', 'hydro', 'hub', 'city'], flows: ['f-nuke', 'f-hydro', 'f-city'],
    },
    {
      short: 'Wind & sun', tag: 'TRADE-OFF', title: 'Free fuel, free timing',
      body: ['Wind and solar produce whenever the weather lets them. Here wind blows hardest at night and solar peaks at noon.',
        'At midday the clean sources together make more than the grid needs. That red area is surplus: without somewhere to put it, plants must be switched down or output wasted (curtailed).'],
      callout: { k: 'warn', t: 'The more solar a grid has, the bigger and more regular the midday surplus. Cheap generation does not remove the timing problem.' },
      focus: ['solar', 'towerW', 'nacelleW', 'rotorW', 'nuclear', 'hydro', 'hub', 'city'], flows: ['f-solar', 'f-wind', 'f-nuke', 'f-hydro', 'f-city'],
    },
    {
      short: 'Gas fills the gap', tag: 'NUMBERS', title: 'The evening ramp',
      body: ['Whatever demand still needs after the steady and variable sources is called net demand. It is met by sources you can turn up and down on command, mostly gas and reservoir hydro.',
        `Between early afternoon and 7 pm this grid asks its gas plants for about ${rampBefore} GW more output.`],
      callout: { k: 'key', t: 'A grid is not sized for average demand. It is sized for the steepest, hardest hour of the year, and the machines that cover it sit idle most of the time.' },
      focus: ['gas', 'hub', 'city', 'solar', 'nuclear'], flows: ['f-solar', 'f-wind', 'f-nuke', 'f-hydro', 'f-gas', 'f-city'], stats: { gas: `+${rampBefore} GW` },
    },
    {
      short: 'Storage', tag: 'METHOD', title: 'Move midday power into the evening',
      body: ['Storage soaks up the surplus when sun and wind are strong and gives it back at the evening peak. Pumped storage and batteries do this today.',
        `With the same demand, the gas ramp falls from about ${rampBefore} GW to about ${Math.max(rampAfter, 0)} GW, and midday power is no longer thrown away.`],
      callout: { k: 'know', t: 'Storage does not make energy. It trades time: cheap surplus now for useful supply later, minus conversion losses.' },
      focus: ['battery', 'hub', 'solar', 'gas'], flows: ['f-solar', 'f-wind', 'f-nuke', 'f-hydro', 'f-batt-in', 'f-city'], stats: { ramp: `+${Math.max(rampAfter, 0)} GW` },
    },
    {
      short: 'Reserves', tag: 'CONCEPT', title: 'Always keep some in hand',
      body: ['Plants trip, lines fail and forecasts miss. So operators keep spare capacity ready: a margin above expected demand, plus reserves that can respond within seconds to minutes.',
        'A common rule is “N−1”: the grid must ride through the loss of its single largest unit without cutting anyone off.'],
      callout: { k: 'key', t: 'Reliability is a stack of cushions: planning margin, reserves, interconnections, storage. Each handles a different timescale.' },
      focus: ['hub', 'gas', 'battery', 'city'], flows: ['f-solar', 'f-wind', 'f-nuke', 'f-hydro', 'f-gas', 'f-batt-out', 'f-city'], stats: { res: '≈ 8%' },
    },
  ],
};
