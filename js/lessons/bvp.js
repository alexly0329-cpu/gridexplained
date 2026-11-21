import { house, pylon } from './common.js';
import { list, table } from './cards.js';

// A comparison lesson. Technology ranges are typical values, rounded; sources: the pumped-hydro and battery material in the course notes plus
// widely published ranges. Individual projects vary.
const CX = (h) => 28 + h * 20, CY = (v) => 160 - v * 0.9;
const costLines = `<path class="ax" d="M28,160H284M28,160V40"/>
  <polyline points="${[0, 2, 4, 6, 8, 10, 12].map((h) => `${CX(h)},${CY(15 + 11 * h)}`).join(' ')}" fill="none" stroke="#6f9a3c" stroke-width="2.8"/>
  <polyline points="${[0, 2, 4, 6, 8, 10, 12].map((h) => `${CX(h)},${CY(70 + 5 * h)}`).join(' ')}" fill="none" stroke="#2f86ce" stroke-width="2.8"/>
  <text x="28" y="174">0 h</text><text x="${CX(6) - 8}" y="174">6 h</text><text x="${CX(12) - 16}" y="174">12 h</text>
  <text x="${CX(8.2)}" y="${CY(15 + 11 * 8.2) - 6}" style="font-size:8.5px;font-weight:700;fill:#2f6b22">battery</text><text x="${CX(7)}" y="${CY(70 + 5 * 7) + 14}" style="font-size:8.5px;font-weight:700;fill:#1f63a0">pumped hydro</text>
  <text x="12" y="188" style="font-size:8.5px">relative cost by hours stored (illustrative)</text>`;

export default {
  id: 'bvp', group: 'tools', title: 'Batteries vs Pumped Storage', icon: 'battery', time: 10, level: 'Intermediate',
  tagline: 'Two ways to store the same energy: a hill and two lakes, or a warehouse of cells. Duration, efficiency, life, siting and cost decide which fits which job.',
  stats: [
    { id: 'bd', label: 'Battery duration', icon: 'clock' }, { id: 'pd', label: 'Pumped hydro duration', icon: 'clock' },
    { id: 'br', label: 'Battery round trip', icon: 'gauge' }, { id: 'pr', label: 'Pumped round trip', icon: 'gauge' },
  ],
  legend: [['#2f86ce', 'water'], ['#e8a33a', 'electricity']],
  learn: [
    { t: 'What both technologies actually do', at: 0 }, { t: 'Why duration separates them', at: 1 },
    { t: 'Round-trip efficiency and asset life', at: 2 }, { t: 'Where each can be built, and how fast', at: 3 },
    { t: 'Which job fits which tool', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    s.box('hill', 0.4, 0.6, 0, 2.6, 2.6, 1.4, 'rock', { shadow: false });
    s.water('upper', 0.6, 0.8, 1.4, 2.2, 2.2, 0.3, { k: 10, label: { t: 'upper lake', icon: 'mountain' } });
    s.box('phouse', 3.2, 1.4, 0, 1.4, 1.2, 0.9, 'white', { k: 12, label: { t: 'pump-turbine', icon: 'cog' } });
    s.water('lower', 0.8, 4.0, 0, 2.6, 1.8, 0.15, { k: 8, label: { t: 'lower lake', icon: 'waves' } });
    [[6.0, 0.8], [7.3, 0.8], [6.0, 2.0], [7.3, 2.0]].forEach(([x, y], i) => s.box('cells', x, y, 0, 1.1, 1.0, 0.7, 'green', { k: 14 + i, ...(i === 0 ? { label: { t: 'battery containers', icon: 'battery' } } : {}) }));
    s.box('inv', 8.6, 1.4, 0, 0.9, 0.9, 0.7, 'white', { label: { t: 'inverter', icon: 'zap' } });
    s.raw('pylon', pylon(5.4, 4.6, 2.6), { k: 18 });
    house(s, 'city', 6.4, 6.4, { label: { t: 'demand', icon: 'house' } }); house(s, 'city', 8.0, 7.6);
    s.flow('f-water', [[2.0, 3.0, 1.4], [3.8, 3.0, 0.4]], 'water', { pipe: true, cls: 'slow' });
    s.flow('f-ph', [[4.6, 2.0, 0.05], [5.4, 3.6, 0.05], [5.4, 4.8, 0.05]], 'electric', {});
    s.flow('f-bat', [[8.6, 2.0, 0.05], [8.6, 3.4, 0.05], [5.6, 4.8, 0.05]], 'electric', { cls: 'fast' });
    s.flow('f-city', [[5.6, 5.0, 0.05], [6.4, 6.8, 0.05]], 'ac', {});
    s.card('dur', 'HOURS AT FULL POWER', list([['Battery (lithium-ion)', 'typically 2–4 hours'], ['Pumped hydro', 'typically 6–12+ hours'], ['Why', 'batteries add cells; hydro adds water']], { gap: 36 }), { w: 300, h: 150, from: 1, until: 1 });
    s.card('eff', 'TWO PROFILES', table(['', 'Battery', 'Pumped hydro'], [['Round trip', '85–95%', '75–80%+'], ['Typical life', '10–20 yrs', '50+ yrs'], ['Reaction', 'milliseconds', 'minutes'], ['Standing loss', 'small', 'near none']], { cols: [12, 100, 190], rowH: 26 }), { w: 300, h: 160, from: 2, until: 2 });
    s.card('site', 'WHERE AND HOW FAST', list([['Battery', 'almost anywhere; months to about 2 years'], ['Pumped hydro', 'needs a hill, water, a second lake'], ['Permits', 'years of review; build often 5–10 years'], ['Where', 'US ~20–22 GW; China growing fast']], { gap: 33 }), { w: 300, h: 170, from: 3, until: 3 });
    s.card('cost', 'THE COST OF EXTRA HOURS', costLines, { w: 300, h: 198, from: 4, until: 4 });
    s.card('jobs', 'MATCHING THE JOB', table(['Job', 'Better fit'], [['Frequency support', 'battery'], ['2–4 h evening shift', 'battery'], ['6–12 h daily shift', 'pumped hydro'], ['Behind the meter', 'battery'], ['Weeks to months', 'neither (hydrogen?)']], { cols: [12, 170], rowH: 24 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Same job', tag: 'CONCEPT', title: 'Both trade time for electricity',
      body: ['Pumped hydro and batteries do the same basic thing: absorb power when it is plentiful and cheap, and return it when it is scarce. One stores it as water held high; the other as chemical energy in cells.',
        'Pumped hydro is by far the older and bigger: over 90% of grid storage worldwide. Batteries are the newer, fastest-growing arrival.'],
      callout: { k: 'key', t: 'Judge storage on two numbers: power (how hard it can push) and energy (how long it lasts). The two technologies differ most on the second.' },
      focus: ['hill', 'upper', 'lower', 'phouse', 'cells', 'inv'], flows: ['f-water', 'f-ph', 'f-bat'], stats: { bd: '2–4 h', pd: '6–12+ h' },
    },
    {
      short: 'Duration', tag: 'NUMBERS', title: 'Hours at full power',
      body: ['A typical grid battery runs about two to four hours at full output. Pumped hydro commonly runs six to twelve hours or more, and in principle days, because storing more only means a bigger reservoir.',
        'That makes batteries a natural fit for the evening peak and pumped hydro a better fit for long, slow swings.'],
      callout: { k: 'know', t: 'Adding a fourth hour to a battery needs about as much extra cells as the first. Adding hours to a reservoir is far cheaper.' },
      focus: ['cells', 'upper', 'lower'], flows: ['f-water', 'f-bat'],
    },
    {
      short: 'Efficiency & life', tag: 'NUMBERS', title: 'Efficiency, lifetime, reaction time',
      body: ['Batteries return roughly 85–95% of the energy put in; pumped hydro 75–80% or more (a 1960s plant measured about 75%, modern ones 80%+).',
        'But a pumped-hydro plant can run for 50 years or longer, while cells wear and are usually replaced within 10–20. Batteries react in milliseconds; pumped hydro in minutes.'],
      callout: { k: 'warn', t: 'A battery’s efficiency lead is real but costs recurring replacement; a hydro plant’s long life is a one-off civil investment.' },
      focus: ['cells', 'phouse'], flows: ['f-ph', 'f-bat'], stats: { br: '≈ 90%', pr: '≈ 78%' },
    },
    {
      short: 'Siting', tag: 'TRADE-OFF', title: 'A warehouse versus a landscape',
      body: ['Batteries can go beside a substation, a solar farm or a factory, and can be built in months to a couple of years. They need a fenced site and a grid connection.',
        'Pumped hydro needs a height difference, water, and room for two reservoirs. Environmental review and civil works make 5–10 years normal. The US has stayed near 20–22 GW for decades, while China builds fast.'],
      callout: { k: 'key', t: 'Speed and flexibility of siting is a large part of why most new storage today is lithium-ion.' },
      focus: ['hill', 'upper', 'lower', 'cells'],
    },
    {
      short: 'Cost of hours', tag: 'NUMBERS', title: 'Where the lines cross',
      body: ['Cost for the same power rating rises steadily with duration for batteries, because every extra hour is more cells. For pumped hydro the big cost is the civil works, so extra hours are comparatively cheap.',
        'The lines cross at some number of hours. Below it batteries win; above it water does. The crossing point moves as battery prices fall.'],
      callout: { k: 'know', t: 'The curves above are illustrative. Real crossing points depend on terrain, interest rates and battery prices, and keep moving.' },
      focus: ['cells', 'upper', 'lower'], flows: ['f-water', 'f-bat'],
    },
    {
      short: 'Right tool', tag: 'CONCEPT', title: 'Matching the tool to the job',
      body: ['Batteries suit fast response, short evening shifts and anything behind a customer’s meter. Pumped hydro suits large, long daily shifts. Neither is designed to hold energy for weeks or seasons; that is where hydrogen is discussed.',
        'Real grids use both, plus demand flexibility and the rest of the toolbox.'],
      callout: { k: 'key', t: 'It is not a contest. A grid with lots of wind and solar needs fast storage and long storage.' },
      focus: ['hill', 'cells', 'inv', 'phouse'], flows: ['f-ph', 'f-bat', 'f-city'],
    },
  ],
};
