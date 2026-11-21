import { turbine } from './wind.js';
import { list, table, bars } from './cards.js';

// Source: the "Renewable Energy Technology Fundamentals" notes (wind characteristics, wind physics, site evaluation, offshore wind, performance metrics, economics).
// Cube-law and shear figures below are computed here: power ∝ v³ and wind speed ∝ height^(1/7).
const REL = [5, 10, 15].map((v) => (v / 5) ** 3);
const SHEAR = [2, 4, 8].map((h) => { const sp = h ** (1 / 7); return { h, sp: Math.round((sp - 1) * 100), pw: Math.round((sp ** 3 - 1) * 100) }; });

export default {
  id: 'windeng', group: 'deep', title: 'Wind Engineering', icon: 'wind', time: 13, level: 'Intermediate',
  tagline: 'Why wind power is cubed, how height and open land help, what limits a rotor, how a site is chosen, and what offshore adds.',
  stats: [
    { id: 'v', label: 'Wind vs 5 m/s', icon: 'wind' }, { id: 'h', label: 'Height gain', icon: 'mountain' },
    { id: 'cf', label: 'Capacity factor', icon: 'gauge' }, { id: 'cost', label: 'Offshore cost', icon: 'chart' },
  ],
  legend: [['#5b9bd5', 'wind'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'Why a little more wind gives much more power', at: 0 }, { t: 'What Betz’s limit and capacity factor mean', at: 1 },
    { t: 'How wind speed grows with height', at: 2 }, { t: 'Why a few strong hours carry most of the energy', at: 3 },
    { t: 'What a good wind site needs', at: 4 }, { t: 'How offshore turbines are anchored', at: 5 },
    { t: 'Where the money goes, on land and at sea', at: 6 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.water('sea', 5.0, 5.0, 0, 4.8, 4.8, 0.12, { k: 4, shadow: false });
    turbine(s, { x: 1.4, y: 1.8, sc: 0.7, suf: 'A', label: { t: 'turbine', icon: 'wind' } });
    turbine(s, { x: 3.6, y: 1.8, sc: 0.7, suf: 'B' });
    turbine(s, { x: 0.9, y: 5.4, sc: 0.34, suf: 'S' });
    turbine(s, { x: 3.0, y: 5.8, sc: 0.78, suf: 'T', label: { t: 'tall tower', icon: 'mountain' } });
    s.labelS('towerS:l', ...(() => { const [a, b] = s.P(0.9, 5.4, 0); return [a, b - 132 * 0.34 - 18]; })(), { t: 'short tower', icon: 'mountain' }, { dy: 0 });
    turbine(s, { x: 7.4, y: 7.4, sc: 0.7, suf: 'O', from: 5 });
    s.box('mast', 0.5, 0.4, 0, 0.15, 0.15, 2.4, 'grey', { k: 3, label: { t: 'met mast', icon: 'gauge' } });
    s.box('sub', 6.0, 1.0, 0, 1.0, 1.0, 0.8, 'concrete', { k: 12, label: { t: 'substation', icon: 'tower' } });
    s.flow('f-wind', [[0.2, 2.6, 2.6], [1.3, 2.6, 2.6]], 'wind', {});
    s.flow('f-hi', [[0.4, 6.2, 2.9], [2.6, 6.2, 2.9]], 'wind', { from: 2, until: 2 });
    s.flow('f-lo', [[0.2, 6.0, 0.6], [0.7, 6.0, 0.6]], 'wind', { from: 2, until: 2, cls: 'slow' });
    s.flow('f-grid', [[4.4, 2.4, 0.05], [6.0, 1.9, 0.05]], 'electric', { from: 4 });
    s.card('cube', 'POWER GROWS WITH WIND CUBED', bars([5, 10, 15].map((v, i) => ({ label: `${v} m/s`, value: REL[i], color: ['#f1b3a3', '#f6d77e', '#a6d38b'][i] })), { w: 300, labelW: 66, max: 27, fmt: (v) => `${v}×`, y0: 40, h: 20, gap: 14, note: 'P = ½ × air density × swept area × v³' }), { w: 300, h: 160, from: 0, until: 0 });
    s.card('rotor', 'WHAT A ROTOR CAPTURES', bars([{ label: 'Betz limit', value: 59.3, t: '59.3%', color: '#cfc0e8' }, { label: 'Modern rotor', value: 45, t: '40–50%', color: '#a6d38b' }, { label: 'Capacity factor', value: 42, t: 'avg 42%', color: '#9fcdf0' }], { w: 300, labelW: 106, max: 60, fmt: (v, r) => r.t, y0: 40, h: 20, gap: 14, note: 'efficiency is not capacity factor' }), { w: 300, h: 160, from: 1, until: 1 });
    s.card('shear', 'TALLER TOWER, FASTER WIND', table(['Height', 'Wind speed', 'Power'], SHEAR.map((r) => [`${r.h}×`, `+${r.sp}%`, `+${r.pw}%`]), { cols: [12, 100, 200], rowH: 26 }), { w: 300, h: 134, from: 2, until: 2 });
    s.card('dist', 'WHERE THE ENERGY IS (7 m/s SITE)', bars([{ label: 'From winds ≤ average', value: 10, color: '#f1b3a3' }, { label: 'From winds > average', value: 90, color: '#a6d38b' }, { label: 'Hours above 15 m/s', value: 5, color: '#d9d1c4' }, { label: 'Energy above 15 m/s', value: 25, color: '#9fcdf0' }], { w: 300, labelW: 136, max: 100, fmt: (v) => `${v}%`, y0: 36, h: 16, gap: 10, note: 'share of year or of annual energy' }), { w: 300, h: 162, from: 3, until: 3 });
    s.card('site', 'WHAT A GOOD SITE NEEDS', list([['Steady wind above 7 m/s', '1 to 5 years of met-mast data'], ['Spacing of 7+ rotor diameters', 'a 100 m rotor: 700 m apart'], ['Open, quiet land', 'about 0.4 ha per MW directly'], ['Road and grid access', 'heavy loads and a nearby line']], { gap: 33 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('found', 'FOUNDATION BY WATER DEPTH', table(['Foundation', 'Depth'], [['Driven monopile', 'to about 30 m'], ['Steel jacket', 'to about 50 m'], ['Floating semi-sub, tension-leg', 'over 50 m'], ['Spar buoy', 'over 120 m']], { cols: [12, 200], rowH: 26 }), { w: 300, h: 160, from: 5, until: 5 });
    s.card('capex', 'ONSHORE COST SPLIT', bars([{ label: 'Nacelle', value: 34, color: '#f6d77e' }, { label: 'Rotor', value: 20, color: '#a6d38b' }, { label: 'Tower', value: 15, color: '#9fcdf0' }, { label: 'Grid tie, install', value: 22, color: '#cfc0e8' }, { label: 'Soft costs', value: 8, color: '#f1b3a3' }], { w: 300, labelW: 118, max: 40, fmt: (v) => `${v}%`, y0: 34, h: 14, gap: 8, note: 'share of installed cost; offshore energy ≈ 3× dearer' }), { w: 300, h: 168, from: 6, until: 6 });
  },
  steps: [
    {
      short: 'Cube law', tag: 'NUMBERS', title: 'Double the wind, eight times the power',
      body: [`Wind power is half the air density, times the swept area, times wind speed cubed. Going from 5 to 10 m/s multiplies available power by ${REL[1]}. At 15 m/s it is ${REL[2]} times.`,
        'Speed is the most powerful lever. Blade length comes next, because swept area grows with the square of the radius: double the blade and capture four times the power.'],
      callout: { k: 'key', t: 'Because of the cube, a site with 10% more wind speed gives about 33% more energy. Siting is half the project.' },
      focus: ['towerA', 'nacelleA', 'rotorA', 'towerB', 'nacelleB', 'rotorB'], flows: ['f-wind'], stats: { v: '1× to 27×' },
    },
    {
      short: 'Rotor limits', tag: 'CONCEPT', title: 'A rotor cannot take all the wind',
      body: ['In 1919 Albert Betz showed that at least 40.7% of the wind’s energy must pass through the rotor, or the air would stop behind it. So no rotor can capture more than 59.3%. Modern utility turbines reach 40–50% at best.',
        'Capacity factor is a different thing: the actual annual output divided by what the nameplate would give running flat out. Onshore wind spans 26–52% and averages about 42%; offshore reaches 50% or more.'],
      callout: { k: 'warn', t: 'Efficiency says how well the rotor uses passing wind. Capacity factor says how often the wind is there. Keep them apart.' },
      focus: ['towerA', 'nacelleA', 'rotorA'], flows: ['f-wind'], stats: { cf: '26–52% onshore' },
    },
    {
      short: 'Height', tag: 'CONCEPT', title: 'Wind speeds up with height',
      body: [`Friction slows air near the ground, so wind speed rises about as the seventh root of height. Twice the height gives ${SHEAR[0].sp}% more speed, four times ${SHEAR[1].sp}%, eight times ${SHEAR[2].sp}%. Because of the cube, power gains are far bigger.`,
        'Gains flatten above about 100 m. Open water and plains slow the wind least, while forests and cities slow it most.'],
      callout: { k: 'know', t: 'This is why towers keep getting taller and why oceans and open plains are prized sites.' },
      focus: ['towerS', 'nacelleS', 'rotorS', 'towerT', 'nacelleT', 'rotorT'], flows: ['f-hi', 'f-lo'], stats: { h: `+${SHEAR[1].sp}% speed at 4×` },
    },
    {
      short: 'Gusty hours', tag: 'NUMBERS', title: 'Most energy comes from the windy hours',
      body: ['Take a site with a 7 m/s average. Winds at or below the average deliver only about 10% of annual energy. Winds above it deliver about 90%.',
        'Winds over 15 m/s blow about 5% of the year yet supply about 25% of the energy. Because of that, average speed alone misleads.'],
      callout: { k: 'know', t: 'Analysts model the full spread of speeds, not the average, usually with a Weibull distribution.' },
      focus: ['towerA', 'nacelleA', 'rotorA', 'towerB', 'nacelleB', 'rotorB', 'towerT', 'nacelleT', 'rotorT'], flows: ['f-wind'],
    },
    {
      short: 'Site', tag: 'METHOD', title: 'Choosing and spacing a site',
      body: ['Developers raise a met mast with instruments at several heights and record for one to five years to capture seasons and year-to-year swings. A good site has steady wind above 7 m/s, low turbulence, open land and nearby roads and grid.',
        'Each turbine leaves a slow, turbulent wake. Keep turbines at least 7 rotor diameters apart. With 100 m rotors that is 700 m, so a wind farm needs far more land than its direct footprint of about 0.4 hectare per MW.'],
      callout: { k: 'key', t: 'A site with great wind can still fail if wakes force huge leases, blades cannot reach it by road, or the grid is far away.' },
      focus: ['towerA', 'nacelleA', 'rotorA', 'towerB', 'nacelleB', 'rotorB', 'mast', 'sub'], flows: ['f-grid', 'f-wind'],
    },
    {
      short: 'Offshore', tag: 'CONCEPT', title: 'Same turbine, very different base',
      body: ['Above the water, an offshore turbine is the same machine. Everything below changes. Monopiles hammered into the seabed work to about 30 m, steel jackets to about 50 m, and deeper water needs floating hulls tied down by moorings or tension legs.',
        'Heavy-lift vessels do the installing, salt spray corrodes steel, technicians work in short weather windows, and a subsea cable carries the power ashore.'],
      callout: { k: 'know', t: 'The tools come from the offshore oil and gas industry, adapted to wind.' },
      focus: ['sea', 'towerO', 'nacelleO', 'rotorO'], flows: ['f-wind'], stats: { cf: '50%+ offshore' },
    },
    {
      short: 'Cost', tag: 'NUMBERS', title: 'Why offshore costs about three times more',
      body: ['On land, wind competes with new fossil plants. About three quarters of installed cost is the turbine, and the rest is grid connection and soft costs such as financing.',
        'Offshore turbine hardware costs about the same. The gap is the marine foundations and cables, higher financing for risk, and lifetime operation and maintenance, which makes offshore energy cost roughly three times onshore.'],
      callout: { k: 'key', t: 'Onshore wind is already among the cheapest new power. Offshore buys stronger, steadier wind at a higher price.' },
      focus: ['towerA', 'nacelleA', 'rotorA', 'towerB', 'nacelleB', 'rotorB', 'sea', 'towerO', 'nacelleO', 'rotorO'], flows: [], stats: { cost: '≈ 3× onshore' },
    },
  ],
};
