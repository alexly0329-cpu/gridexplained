import { panel } from './solar.js';
import { house, flywheel } from './common.js';
import { list, table, bars } from './cards.js';

// Qualitative lesson built on the inertia and frequency material earlier in the site. Response times are orders of magnitude, not specifications.
export default {
  id: 'inverters', group: 'tools', title: 'Grid-Forming Inverters', icon: 'zap', time: 10, level: 'Advanced',
  tagline: 'Solar, wind and batteries connect through power electronics. How inverters learn to lead the grid instead of following it.',
  stats: [
    { id: 'sm', label: 'Synchronous machine', icon: 'cog' }, { id: 'gfl', label: 'Grid-following', icon: 'sun' },
    { id: 'gfm', label: 'Grid-forming', icon: 'battery' }, { id: 'ffr', label: 'Fast response', icon: 'clock' },
  ],
  legend: [['#7c63d0', 'AC grid'], ['#e8a33a', 'DC / inverter side']],
  learn: [
    { t: 'What a synchronous machine does for free', at: 0 }, { t: 'What “following” the grid means (the PLL)', at: 1 },
    { t: 'Why weak grids trouble inverters', at: 2 }, { t: 'How a grid-forming inverter differs', at: 3 },
    { t: 'The limits that remain', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'concrete');
    s.box('sync', 0.6, 1.2, 0, 2.4, 2.0, 1.2, 'steel', { label: { t: 'synchronous generator', icon: 'cog' } });
    s.raw('sync', flywheel(1.8, 2.2, 1.2, 0.75, '1.2s'), { k: 12 });
    s.raw('solar', panel(0.6, 5.0, 1.8, 1.4) + panel(2.6, 5.0, 1.8, 1.4), { k: 14 });
    s.box('gfl', 4.6, 5.2, 0, 1.0, 1.0, 0.8, 'white', { label: { t: 'following inverter', icon: 'sun' } });
    s.box('batt', 6.4, 5.2, 0, 1.4, 1.2, 0.8, 'green', { label: { t: 'battery', icon: 'battery' } });
    s.box('gfm', 6.4, 3.4, 0, 1.0, 1.0, 0.8, 'violet', { label: { t: 'forming inverter', icon: 'zap' } });
    s.box('bus', 4.6, 2.6, 0, 0.9, 0.9, 0.8, 'concrete', { k: 10, label: { t: 'the grid', icon: 'tower' } });
    house(s, 'city', 7.4, 0.8, { label: { t: 'demand', icon: 'house' } }); house(s, 'city', 8.6, 2.2);
    s.flow('f-sync', [[3.0, 2.4, 0.05], [4.6, 2.8, 0.05]], 'ac', {});
    s.flow('f-gfl', [[4.4, 5.8, 0.05], [5.0, 5.8, 0.05], [5.0, 3.5, 0.05]], 'electric', { from: 1 });
    s.flow('f-gfm', [[6.9, 3.4, 0.05], [6.0, 3.0, 0.05], [5.5, 3.0, 0.05]], 'electric', { from: 3 });
    s.flow('f-batt', [[6.9, 5.2, 0.05], [6.9, 4.4, 0.05]], 'electric', { from: 3, cls: 'fast' });
    s.flow('f-city', [[5.5, 2.8, 0.05], [7.4, 1.8, 0.05]], 'ac', {});
    s.flowS('ref', [P2(5.1, 3.0, 1.1), P2(4.9, 5.2, 1.3)], 'light', { from: 1, until: 2, cls: 'slow' });
    s.card('roles', 'WHAT A ROTATING MACHINE GIVES', list([['Sets the beat', 'its speed is the grid frequency'], ['Holds the voltage', 'a strong, stiff source'], ['Stores motion', 'inertia buys seconds'], ['Pushes hard in a fault', 'large fault current trips breakers']], { gap: 33 }), { w: 300, h: 170, from: 0, until: 0 });
    s.card('cmp', 'THREE BEHAVIOURS', table(['', 'Following', 'Forming'], [['Acts as', 'current source', 'voltage source'], ['Needs a grid', 'yes, to lock on', 'no, sets its own'], ['Black start', 'no', 'possible'], ['Inertia', 'none', 'synthetic']], { cols: [12, 100, 200], rowH: 26 }), { w: 300, h: 156, from: 3, until: 3 });
    s.card('speed', 'HOW FAST EACH LAYER ACTS', bars([{ label: 'Rotor inertia', value: 1, color: '#f6d77e' }, { label: 'Inverter response', value: 2, color: '#a6d38b' }, { label: 'Plant governor', value: 6, color: '#9fcdf0' }, { label: 'Dispatch signal', value: 8, color: '#cfc0e8' }], { w: 300, labelW: 118, max: 8, fmt: (v) => ['', 'instant', 'ms to cycles', '', '', '', 'seconds', '', 'minutes'][v] || '', note: 'orders of magnitude; longer bar = slower' }), { w: 300, h: 160, from: 4, until: 4 });
    s.card('limits', 'WHAT STILL LIMITS THEM', list([['Current limit', 'little fault current to trip breakers'], ['Needs energy', 'a battery or spare wind/solar headroom'], ['Grid codes', 'rules and tests are still catching up'], ['Existing fleet', 'some inverters can change by software']], { gap: 33 }), { w: 300, h: 170, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Who leads', tag: 'CONCEPT', title: 'Rotating machines lead by physics',
      body: ['A big synchronous generator is locked to the grid. Its spinning mass sets the frequency, holds the voltage, stores kinetic energy, and pushes large currents into a fault. None of that needs electronics or software.',
        'Solar panels and batteries have no spinning mass. Everything they do is decided by the inverter that connects them.'],
      callout: { k: 'key', t: 'Inverters can behave however their control code says. The question is which behaviour the grid needs.' },
      focus: ['sync', 'bus'], flows: ['f-sync', 'f-city'], stats: { sm: 'physical inertia' },
    },
    {
      short: 'Following', tag: 'METHOD', title: 'Most inverters follow',
      body: ['A grid-following inverter measures the grid’s voltage angle with a phase-locked loop and injects current in step with it. It behaves like a controlled current source.',
        'That works well when the grid is stiff, because the rotating machines hold the voltage steady. The inverter is a good follower, but it cannot lead.'],
      callout: { k: 'know', t: 'A follower needs something to follow. With no stable reference voltage, a grid-following inverter has nothing to lock onto.' },
      focus: ['solar', 'gfl', 'bus'], flows: ['f-gfl', 'f-sync'], stats: { gfl: 'current source' },
    },
    {
      short: 'Weak grid', tag: 'PROBLEM', title: 'When the leaders disappear',
      body: ['As synchronous plants are replaced, the grid gets “weak”: less inertia, less fault current, and a softer voltage. Followers react to a wobbling reference by wobbling themselves, and in the worst case oscillate or trip.',
        'Low inertia also means frequency moves faster after a loss, as the frequency lesson showed.'],
      callout: { k: 'warn', t: 'The problem is not that solar and wind are bad. It is that a grid made only of followers has no one holding the reference.' },
      focus: ['solar', 'gfl', 'bus', 'sync'], flows: ['f-gfl', 'f-sync'],
    },
    {
      short: 'Forming', tag: 'METHOD', title: 'An inverter that leads',
      body: ['A grid-forming inverter acts as a voltage source. It sets its own frequency and voltage reference and lets power flow follow, using droop control or by imitating a synchronous machine (a “virtual” machine).',
        'It can supply synthetic inertia within a few cycles, support weak grids, and with a battery behind it can restart a dead section of grid.'],
      callout: { k: 'key', t: 'Synthetic inertia is a response, not a mass. It must be paid for from stored energy, which is why most grid-forming units are batteries.' },
      focus: ['gfm', 'batt', 'bus'], flows: ['f-gfm', 'f-batt', 'f-sync', 'f-city'], stats: { gfm: 'voltage source' },
    },
    {
      short: 'Speed', tag: 'NUMBERS', title: 'Faster than any turbine',
      body: ['A rotor responds instantly and automatically. A plant governor responds in seconds, because steam and fuel valves must move. A dispatch signal takes minutes.',
        'Inverters respond in milliseconds to a few cycles, faster than turbine governors, which is why batteries are used for fast frequency response.'],
      callout: { k: 'know', t: 'Speed is only useful if there is energy to deliver. A fast response from an empty battery is no response.' },
      focus: ['gfm', 'batt', 'sync'], flows: ['f-gfm', 'f-batt'], stats: { ffr: 'milliseconds' },
    },
    {
      short: 'Limits', tag: 'TRADE-OFF', title: 'What is still hard',
      body: ['Inverters are current-limited, so they cannot match a rotating machine’s large fault current. Protection systems designed around big fault currents may need rethinking.',
        'Rules are still catching up: grid codes, test procedures and interoperability between vendors. Some existing inverters can be changed by software, but many lack the hardware headroom.'],
      callout: { k: 'warn', t: 'Treat grid-forming as a tool in a mix, alongside synchronous condensers and conventional plants, not a switch that fixes every stability problem.' },
      focus: ['gfm', 'sync', 'gfl', 'batt'], flows: ['f-gfm', 'f-sync', 'f-gfl'],
    },
  ],
};
const P2 = (x, y, z) => [380 + (x - y) * 0.866 * 30, 170 + (x + y) * 0.5 * 30 - z * 30];
