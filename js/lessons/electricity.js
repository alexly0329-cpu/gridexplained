import { house, pylon, flywheel } from './common.js';
import { list, table, bars } from './cards.js';

// Source: the "Renewable Energy Technology Fundamentals" notes (what electricity is, measuring it, how it is generated, transmission and distribution).
// Numbers in the charts are computed here from Ohm's law and P²R/V².
const V0 = 12, RS = [2, 4, 6];
const AMPS = RS.map((r) => V0 / r);
const LOSS = [1, 2, 4].map((m) => 100 / (m * m));   // line loss at m× the voltage, same power and wire

const sine = (y0, amp) => `<polyline fill="none" stroke="#7c63d0" stroke-width="2.4" points="${Array.from({ length: 61 }, (_, i) => `${(22 + i * 4.3).toFixed(1)},${(y0 - amp * Math.sin((i / 60) * Math.PI * 4)).toFixed(1)}`).join(' ')}"/>`;
const acdc = `<text x="12" y="40" style="font-size:9px;font-weight:700;fill:var(--ink)">DC: one steady direction</text>
  <path class="ax" d="M22,48H284"/><path d="M22,66H284" stroke="#e8a33a" stroke-width="2.6"/>
  <text x="12" y="98" style="font-size:9px;font-weight:700;fill:var(--ink)">AC: reverses, two cycles shown</text>
  <path class="ax" d="M22,128H284"/>${sine(128, 20)}
  <text x="12" y="172" style="font-size:8.5px">AC reverses 60 times a second (US), 50 (Europe)</text>`;

export default {
  id: 'electricity', group: 'foundations', title: 'What Electricity Is', icon: 'zap', time: 12, level: 'Beginner',
  tagline: 'Charge, voltage, current and resistance, how a spinning magnet makes power, and why the grid runs at high voltage.',
  stats: [
    { id: 'v', label: 'Voltage', icon: 'zap' }, { id: 'i', label: 'Current', icon: 'gauge' },
    { id: 'r', label: 'Resistance', icon: 'cog' }, { id: 'kv', label: 'Line voltage', icon: 'tower' },
  ],
  legend: [['#e8a33a', 'DC current'], ['#7c63d0', 'AC current'], ['#d0683a', 'high voltage']],
  learn: [
    { t: 'What a closed circuit needs', at: 0 }, { t: 'Voltage, current and resistance as water in a pipe', at: 1 },
    { t: 'Ohm’s law: V = I × R', at: 2 }, { t: 'How a magnet and a coil make power', at: 3 },
    { t: 'The difference between AC and DC', at: 4 }, { t: 'Why long lines use high voltage', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'cream');
    s.box('src', 0.8, 1.0, 0, 1.4, 1.2, 1.0, 'green', { label: { t: 'source', icon: 'battery' } });
    s.box('lampb', 6.6, 1.0, 0, 1.2, 1.2, 0.4, 'concrete', { k: 9 });
    s.dome('lamp', 7.2, 1.6, 0.4, 0.45, 0.25, 0.45, 'yellow', { k: 10, label: { t: 'load', icon: 'bulb' } });
    s.box('gen', 0.8, 5.6, 0, 2.4, 2.0, 1.2, 'steel', { from: 3, label: { t: 'generator', icon: 'cog' } });
    s.raw('gen', flywheel(2.0, 6.6, 1.2, 0.75, '1.4s'), { from: 3, k: 12 });
    house(s, 'home', 7.0, 6.0, { from: 3, label: { t: 'homes', icon: 'house' } });
    s.box('tx1', 3.6, 5.8, 0, 0.9, 0.9, 0.8, 'violet', { from: 5, label: { t: 'step-up', icon: 'zap' } });
    s.box('tx2', 6.0, 6.0, 0, 0.8, 0.8, 0.7, 'violet', { from: 5, k: 14 });
    s.raw('pyl', pylon(4.9, 6.2, 2.4) + pylon(5.6, 6.2, 2.4), { from: 5, k: 11 });
    s.flow('f-in', [[2.2, 1.6, 0.05], [6.6, 1.6, 0.05]], 'electric', {});
    s.flow('f-back', [[7.8, 1.6, 0.05], [8.8, 1.6, 0.05], [8.8, 3.8, 0.05], [1.5, 3.8, 0.05], [1.5, 2.2, 0.05]], 'electric', { cls: 'slow' });
    s.flow('f-gen', [[3.2, 6.6, 0.05], [7.0, 6.6, 0.05]], 'ac', { from: 3, until: 4 });
    s.flow('f-hv', [[3.2, 6.6, 0.05], [3.6, 6.4, 0.05], [4.5, 6.2, 2.4], [5.9, 6.2, 2.4], [6.0, 6.4, 0.05], [7.0, 6.6, 0.05]], 'hv', { from: 5 });
    s.card('loop', 'EVERY CIRCUIT HAS THREE PARTS', list([['Source', 'battery, solar panel or generator pushes charge'], ['Conductors', 'insulated wire out to the load and back'], ['Load', 'lamp, motor or heater turns it into work']], { gap: 36 }), { w: 300, h: 150, from: 0, until: 0 });
    s.card('pipe', 'THE WATER-PIPE PICTURE', table(['Quantity', 'Unit', 'In a pipe'], [['Charge', 'coulomb (C)', 'volume of water'], ['Voltage', 'volt (V)', 'pressure'], ['Current', 'ampere (A)', 'flow rate'], ['Resistance', 'ohm (Ω)', 'a narrow section']], { cols: [12, 92, 186], rowH: 26 }), { w: 300, h: 160, from: 1, until: 1 });
    s.card('ohm', `${V0} VOLTS ACROSS THREE LOADS`, bars(RS.map((r, i) => ({ label: `${r} Ω load`, value: AMPS[i], color: ['#f1b3a3', '#f6d77e', '#a6d38b'][i] })), { w: 300, labelW: 72, max: 7, fmt: (v) => `${v} A`, y0: 40, h: 20, gap: 14, note: 'more resistance, less current' }), { w: 300, h: 160, from: 2, until: 2 });
    s.card('mirror', 'GENERATORS AND MOTORS ARE MIRRORS', list([['Current makes a magnetic field', 'wire around a core is an electromagnet'], ['Moving a magnet past a coil makes current', 'this is induction'], ['Coils multiply the effect', 'more turns, more voltage'], ['Fuel does not matter', 'steam, wind, water or diesel can spin it']], { gap: 33 }), { w: 300, h: 170, from: 3, until: 3 });
    s.card('acdc', 'DC AND AC', acdc, { w: 300, h: 184, from: 4, until: 4 });
    s.card('i2r', 'LOSS FALLS WITH VOLTAGE SQUARED', bars([1, 2, 4].map((m, i) => ({ label: `${m}× voltage`, value: LOSS[i], color: ['#f1b3a3', '#f6d77e', '#a6d38b'][i] })), { w: 300, labelW: 78, max: 100, fmt: (v) => `${+v.toFixed(2)}%`, y0: 40, h: 20, gap: 14, note: 'same power, same wire; loss = P² × R ÷ V²' }), { w: 300, h: 160, from: 5, until: 5 });
    s.card('ladder', 'THE VOLTAGE LADDER', table(['Stage', 'Typical level'], [['Power plant', '11 – 13 kV'], ['Long-distance lines', '138 – 765 kV'], ['City distribution', '4 – 69 kV'], ['Your home', '120 / 240 V (US)']], { cols: [12, 156], rowH: 26 }), { w: 300, h: 160, from: 6, until: 6 });
  },
  steps: [
    {
      short: 'Circuit', tag: 'CONCEPT', title: 'Electricity is charge going round a loop',
      body: ['Electricity is the flow of electrons through a closed loop of conductive material. A source pushes them, insulated wires carry them out to a load and back, and the load turns the flow into light, heat or motion.',
        'Break the loop anywhere and the flow stops at once.'],
      callout: { k: 'key', t: 'Copper and aluminium are conductors. Rubber and glass are insulators. Silicon sits in between and is the heart of solar cells.' },
      focus: ['src', 'lamp', 'lampb'], flows: ['f-in', 'f-back'], stats: { v: `${V0} V` },
    },
    {
      short: 'Four units', tag: 'CONCEPT', title: 'Charge, voltage, current, resistance',
      body: ['Charge is the quantity (coulombs). Voltage is the push per unit of charge, like pressure. Current is how much charge passes a point each second (amperes), like flow. Resistance is what opposes the flow (ohms), like a narrow pipe.',
        'A load such as a motor or heater is useful resistance. Wire friction is resistance you would rather not have.'],
      callout: { k: 'know', t: 'The pipe analogy carries the whole subject: pressure pushes, flow carries, constrictions resist.' },
      focus: ['src', 'lamp', 'lampb'], flows: ['f-in', 'f-back'], stats: { v: `${V0} V`, r: '4 Ω' },
    },
    {
      short: 'Ohm’s law', tag: 'NUMBERS', title: 'V = I × R',
      body: [`The three are tied together. Twelve volts across a 4 Ω load drives ${AMPS[1]} A. Halve the resistance to 2 Ω and the current doubles to ${AMPS[0]} A. Triple it to 6 Ω and the current falls to ${AMPS[2]} A.`,
        'Change any one quantity and at least one other must adjust.'],
      callout: { k: 'key', t: 'Power in watts is voltage times current. Raise either and the same load does more work, or burns out.' },
      focus: ['src', 'lamp', 'lampb'], flows: ['f-in', 'f-back'], stats: { v: `${V0} V`, i: `${AMPS[1]} A`, r: '4 Ω' },
    },
    {
      short: 'Induction', tag: 'METHOD', title: 'A spinning magnet makes current',
      body: ['Moving electrons create a magnetic field, and a moving magnetic field pushes electrons along a conductor. That second fact is how nearly all power is made: spin magnets past coils of wire.',
        'The generator does not care what spins it. Steam from coal, gas, nuclear or geothermal heat, falling water, wind and ocean currents all turn the same machine.'],
      callout: { k: 'know', t: 'Solar panels and fuel cells are the exceptions. They make electricity with no moving parts.' },
      focus: ['gen', 'home'], flows: ['f-gen'], stats: { v: '~ 12 kV' },
    },
    {
      short: 'AC and DC', tag: 'CONCEPT', title: 'Two ways to push',
      body: ['Direct current flows one way. Batteries and solar panels make it, and every computer and phone needs it. Alternating current reverses many times a second: 60 in North America, 50 in Europe and most of the world.',
        'AC won the grid because a transformer can step its voltage up or down. A plain transformer cannot do that to DC.'],
      callout: { k: 'know', t: 'Modern power electronics convert between them, so very long undersea or cross-country lines can now use DC, which loses less over distance.' },
      focus: ['src', 'gen', 'home'], flows: ['f-in', 'f-back', 'f-gen'],
    },
    {
      short: 'High voltage', tag: 'METHOD', title: 'Why the grid runs at high voltage',
      body: ['A wire heats up in proportion to current squared. For a fixed power, raising the voltage lowers the current. Doubling the voltage cuts line loss to a quarter, quadrupling it to one sixteenth.',
        'So a transformer at the plant steps the voltage up for the journey. Utilities also use thick aluminium cable, lighter and cheaper than copper for overhead spans.'],
      callout: { k: 'key', t: 'The grid carries three AC waveforms offset by a third of a cycle. That uses half the wire of single-phase and gives motors a smooth push.' },
      focus: ['gen', 'tx1', 'tx2', 'pyl', 'home'], flows: ['f-hv'], stats: { kv: '138–765 kV' },
    },
    {
      short: 'Step down', tag: 'CONCEPT', title: 'Stepping back down to your home',
      body: ['A transformer is a steel core wrapped with two coils. The ratio of turns sets the ratio of voltages, so the same device steps up at the plant and down near you, with very little energy lost.',
        'The voltage drops in stages, through city distribution lines down to 120/240 V in North American homes, and 230 V in much of the rest of the world.'],
      callout: { k: 'know', t: 'Each stage has different equipment and safety rules. The higher the voltage, the more space and insulation the line needs.' },
      focus: ['tx1', 'tx2', 'pyl', 'home'], flows: ['f-hv'], stats: { kv: '120 / 240 V' },
    },
  ],
};
