import { P } from '../iso.js';
import { panel } from './solar.js';
import { turbine } from './wind.js';
import { pylon } from './common.js';
import { list, table, bars } from './cards.js';

// Source: the "Renewable Energy Projects" notes (site selection, stakeholders, resource assessment, technology planning).
const CRIT = [['Resource', 40, [3, 5, 4]], ['Grid access', 20, [5, 3, 2]], ['Permits', 15, [4, 3, 2]], ['Economics', 15, [3, 4, 3]], ['Stakeholders', 10, [4, 3, 2]]];
const total = (k) => CRIT.reduce((a, [, w, s]) => a + (w / 100) * s[k], 0);
const TOT = [0, 1, 2].map(total), BEST = TOT.indexOf(Math.max(...TOT)), NAME = ['A', 'B', 'C'];
const rank = table(['Criterion', 'Weight', 'A', 'B', 'C'], [...CRIT.map(([n, w, s]) => [n, `${w}%`, s[0], s[1], s[2]]), ['Weighted score', '100%', ...TOT.map((v) => v.toFixed(2))]], { cols: [12, 100, 160, 200, 240], rowH: 19, hl: CRIT.length })
  + `<text x="12" y="${32 + 22 + 6 * 19 + 6}" style="font-size:8.5px">scores 1 (worst) to 5 (best) · illustrative</text>`;

const A_MWH = 7466, B_MWH = 7914, PRICE = 100;                 // same site, two 2 MW turbines (power-curve example from the notes)
const gain = (B_MWH - A_MWH) * PRICE;

export default {
  id: 'siting', group: 'projects', title: 'Choosing the Site', icon: 'mountain', time: 10, level: 'Intermediate',
  tagline: 'Sun, wind or water is only the start: land, roads, wires, permits and neighbours decide where a project can be built.',
  stats: [
    { id: 'sites', label: 'Sites compared', icon: 'layers' }, { id: 'win', label: 'Winner', icon: 'check' },
    { id: 'dist', label: 'Grid distance', icon: 'tower' }, { id: 'gain', label: 'Yield from design', icon: 'chart' },
  ],
  legend: [['#e8a33a', 'line to the grid connection'], ['#a6d38b', 'candidate site']],
  learn: [
    { t: 'The six things a site must offer', at: 0 }, { t: 'Why permits are a project in themselves', at: 1 },
    { t: 'Six groups with a stake in every site', at: 2 }, { t: 'How weighted scoring picks a winner', at: 3 },
    { t: 'How resources are really measured', at: 4 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    const slab = (id, y) => s.box(id, 0.6, y, 0, 3.2, 2.4, 0.1, 'green', { shadow: false, label: { t: `site ${id.slice(-1)}` }, lopt: { dy: -8, dx: -50 } });
    slab('siteA', 0.8); slab('siteB', 3.6); slab('siteC', 6.4);
    s.raw('siteA', panel(1.0, 1.2, 1.4, 1.4) + panel(2.3, 1.2, 1.4, 1.4), { k: 8 });
    turbine(s, { x: 2.2, y: 4.8, sc: 0.6, suf: 'B' });
    s.box('siteC', 1.0, 7.0, 0, 1.2, 1.2, 0.9, 'concrete', { k: 16 });
    s.water('siteC', 2.4, 6.8, 0, 1.2, 1.9, 0.1, { k: 16 });
    s.raw('grid', pylon(7.6, 2.0), { k: 14 });
    s.label('grid:l', 7.6, 2.0, 3.4, { t: 'grid connection', icon: 'tower' }, {});
    s.flow('lineA', [[3.8, 2.0, 0.05], [7.5, 2.0, 0.05]], 'electric', {});
    s.flow('lineB', [[3.8, 4.8, 0.05], [7.6, 4.8, 0.05], [7.6, 2.2, 0.05]], 'electric', {});
    s.flow('lineC', [[3.8, 7.6, 0.05], [7.9, 7.6, 0.05], [7.9, 2.2, 0.05]], 'electric', {});
    s.labelS('dA:l', P(5.6, 2.0, 0)[0], P(5.6, 2.0, 0)[1], { t: '2 km' }, { dy: -4 });
    s.labelS('dB:l', P(5.8, 4.8, 0)[0], P(5.8, 4.8, 0)[1], { t: '9 km' }, { dy: -4 });
    s.labelS('dC:l', P(6.0, 7.6, 0)[0], P(6.0, 7.6, 0)[1], { t: '21 km' }, { dy: -4 });
    s.card('six', 'SIX QUESTIONS FOR ANY SITE', list([['Resource', 'sun, wind, water or feedstock'], ['Land or roof', 'who controls it, at what cost'], ['Access', 'roads, rail or port for heavy loads'], ['Grid connection', 'distance to the point of interconnection'], ['Construction', 'cranes, crews, vessels'], ['Life cycle', 'maintenance and decommissioning']], { gap: 28 }), { w: 300, h: 206, from: 0, until: 0 });
    s.card('rules', 'FIVE PERMIT WORKSTREAMS', list([['Planning & land use', 'zoning, leases, access roads'], ['Building & construction', 'structure, fire, drainage'], ['Environmental & cultural', 'impact assessment, species, heritage'], ['Grid connection agreement', 'binding contract with the operator'], ['Generation licence', 'permission to sell power']], { gap: 30 }), { w: 300, h: 190, from: 1, until: 1 });
    s.card('who', 'SIX GROUPS WITH A STAKE', list([['Governments', 'regulators, grid agencies, inspectors'], ['NGOs', 'habitat, heritage, Indigenous land, labour'], ['Local community', 'noise, shadow flicker, views, property'], ['Off-takers', 'utilities, traders, factories, schools'], ['Investors', 'equity, lenders, insurers'], ['Businesses', 'suppliers, contractors, services']], { gap: 28 }), { w: 300, h: 206, from: 2, until: 2 });
    s.card('rank', 'WEIGHTED RANK SCORING', rank, { w: 300, h: 190, from: 3, until: 3 });
    s.card('measure', 'HOW EACH RESOURCE IS MEASURED', list([['Solar', 'sun atlas + on-site irradiance logging'], ['Wind', '1+ year on a met mast, not just an atlas'], ['Hydro', 'head × flow, with seasonal swings'], ['Biomass', 'feedstock volume and moisture']], { gap: 32 }), { w: 300, h: 170, from: 4, until: 4 });
    s.card('yield', 'SAME SITE, TWO 2 MW TURBINES', bars([{ label: 'Turbine A', value: A_MWH, color: '#9fcdf0' }, { label: 'Turbine B', value: B_MWH, color: '#a6d38b' }], { w: 300, labelW: 70, max: 9000, fmt: (v) => v.toLocaleString('en-US'), note: `MWh a year. B makes +${B_MWH - A_MWH}: about $${gain.toLocaleString('en-US')} at $${PRICE}/MWh` }), { w: 300, h: 112, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Six questions', tag: 'CONCEPT', title: 'A site is more than sunshine',
      body: ['Resource is only one of six tests: land or roof, physical access, grid connection, construction capability, and the plant’s maintenance and decommissioning needs all count.',
        'Distance to the grid can decide a project. Kenya’s Lake Turkana wind farm had to build a transmission line of about 428 km to reach the national grid.'],
      callout: { k: 'key', t: 'The best resource at the wrong location is worth less than a good resource that is easy to build and connect.' },
      focus: ['siteA', 'siteB', 'siteC', 'towerB', 'nacelleB', 'rotorB', 'grid'], flows: ['lineA', 'lineB', 'lineC'], stats: { sites: '3', dist: '2 / 9 / 21 km' },
    },
    {
      short: 'Permits', tag: 'METHOD', title: 'Permitting is a project in itself',
      body: ['Five legal workstreams run in parallel: planning and land use, building codes, environmental and cultural clearance, a grid connection agreement, and a generation licence.',
        'Even small projects meet them. A commercial rooftop PV system can need a licence application running to 18 pages, and some places publish a multi-page siting workflow just to find out which approvals apply.'],
      callout: { k: 'warn', t: 'Permitting is often the longest, least predictable part of development. Starting early is cheap; discovering a blocker late is not.' },
      focus: ['siteA', 'siteB', 'siteC'], flows: [],
    },
    {
      short: 'Stakeholders', tag: 'CONCEPT', title: 'Everyone near the site has a vote',
      body: ['Governments, NGOs, neighbours, off-takers, investors and local businesses each hold some leverage over a project: legal, financial or social.',
        'Mapping their interests early prevents delay. Neighbours worry about noise, shadow flicker, views and property values; regulators about reliability and safety.'],
      callout: { k: 'know', t: 'Opposition (“not in my back yard”) is not a mystery. It is usually a list of specific concerns that early conversations can answer.' },
      focus: ['siteA', 'siteB', 'siteC'], flows: [],
    },
    {
      short: 'Scoring', tag: 'NUMBERS', title: 'Weighted scoring picks a winner',
      body: ['Instead of gut feel, give each criterion a weight that sums to 100%, score every site from 1 to 5, and add up the weighted scores.',
        `Here site B has the best resource but a longer grid connection. Its weighted score of ${TOT[BEST].toFixed(2)} beats A (${TOT[0].toFixed(2)}) and C (${TOT[2].toFixed(2)}): excellent wind outweighs the extra wire.`],
      callout: { k: 'key', t: 'Scoring does not remove judgement. It forces you to state your weights, so people can argue about the weights rather than the answer.' },
      focus: ['siteB', 'towerB', 'nacelleB', 'rotorB'], flows: ['lineB'], stats: { win: `Site ${NAME[BEST]}` },
    },
    {
      short: 'Measure it', tag: 'METHOD', title: 'How the resource is measured',
      body: ['Atlases give a first estimate. Solar PV captures both direct and diffuse light, but concentrating solar needs direct beam. Wind needs a year or more of readings from a met mast, because terrain changes speed over short distances.',
        'Hydro depends on head and flow, which vary by season and ecological limits. Biomass depends on feedstock: dry wood holds about 18 kWh per kg, wet manure about 200 kWh per tonne.'],
      callout: { k: 'know', t: 'Lenders finance measured data. An atlas figure is a starting point; a year of readings on the actual site is what they treat as bankable.' },
      focus: ['siteA', 'siteB', 'siteC', 'towerB', 'nacelleB', 'rotorB'], flows: [],
    },
    {
      short: 'Technology', tag: 'NUMBERS', title: 'Design details move the money',
      body: [`Two 2 MW turbines on the same site make ${A_MWH.toLocaleString('en-US')} and ${B_MWH.toLocaleString('en-US')} MWh a year because their power curves differ. That is ${(((B_MWH - A_MWH) / A_MWH) * 100).toFixed(0)}% more energy.`,
        `At $${PRICE}/MWh the gap is about $${gain.toLocaleString('en-US')} a year per turbine, repeated over every turbine and twenty years.`],
      callout: { k: 'key', t: 'Technology choice is a site decision. The best machine is the one whose curve fits this site’s wind, not the one with the biggest brochure number.' },
      focus: ['siteB', 'towerB', 'nacelleB', 'rotorB'], flows: ['lineB'], vars: { '--rotor': '3s' }, stats: { gain: '+6%' },
    },
  ],
};
