import { P } from '../iso.js';
import { list } from './cards.js';

// Source: the "Renewable Energy Projects" course notes (feasibility, concept, data gathering, go/no-go, timeline).
const STAGES = [
  ['concept', 'concept', 'cream'], ['data', 'data gathering', 'blue'], ['feas', 'feasibility', 'yellow'],
  ['plan', 'planning', 'violet'], ['exec', 'execution', 'green'],
];
const X0 = 0.5, W = 1.5, GAP = 0.3;
const cx = (i) => X0 + i * (W + GAP) + W / 2;                         // stage centre along iso x
const mv = (i) => ({ '--mx': `${((cx(i) - 0.3) * 25.98).toFixed(1)}px`, '--my': `${((cx(i) - 0.3) * 15).toFixed(1)}px` });

const pyramid = `
  <rect x="85" y="34" width="130" height="38" fill="#e9fc82" stroke="var(--obj-edge)" stroke-width="2"/><text x="150" y="50" text-anchor="middle" style="font-size:10px;font-weight:700;fill:#172720">MISSION</text><text x="150" y="63" text-anchor="middle" style="font-size:8.5px;fill:#172720">why it exists, in plain words</text>
  <rect x="55" y="76" width="190" height="42" fill="#cfe3b2" stroke="var(--obj-edge)" stroke-width="2"/><text x="150" y="92" text-anchor="middle" style="font-size:10px;font-weight:700;fill:#172720">GOALS</text><text x="150" y="105" text-anchor="middle" style="font-size:8.5px;fill:#172720">understandable · suitable · acceptable · flexible</text>
  <rect x="25" y="122" width="250" height="52" fill="#a6d38b" stroke="var(--obj-edge)" stroke-width="2"/><text x="150" y="138" text-anchor="middle" style="font-size:10px;font-weight:700;fill:#172720">SMART OBJECTIVES</text><text x="150" y="151" text-anchor="middle" style="font-size:8.5px;fill:#172720">specific · measurable · attainable</text><text x="150" y="163" text-anchor="middle" style="font-size:8.5px;fill:#172720">relevant · time-bound</text>`;

// 12-factor go/no-go scorecard, ratings 1 (poor) – 5 (excellent). Illustrative.
const ROWS = [
  ['TECHNICAL & SITE', ['Resource', 'Sites', 'Technology', 'O&M support'], [4, 5, 4, 3]],
  ['REGULATORY & MARKET', ['Regulation', 'Incentives', 'Vendors', 'Stakeholders'], [3, 4, 4, 5]],
  ['FINANCIAL & STRATEGIC', ['Costs vs bench.', 'Off-takers', 'Revenue ≥ costs', 'Meets goals'], [4, 5, 2, 4]],
];
const RC = { 5: '#7fc278', 4: '#cfe3b2', 3: '#f6d77e', 2: '#f1b3a3', 1: '#e5534b' };
const score = ROWS.map(([cat, names, vals], r) => `<text x="12" y="${34 + r * 48}" style="font-size:8px;font-weight:700;letter-spacing:.06em;fill:var(--muted)">${cat}</text>` + names.map((n, i) => `<rect x="${12 + i * 70}" y="${39 + r * 48}" width="64" height="31" fill="${RC[vals[i]]}" stroke="var(--obj-edge)" stroke-width="${vals[i] === 2 ? 2.8 : 1.5}"/><text x="${12 + i * 70 + 32}" y="${53 + r * 48}" text-anchor="middle" style="font-size:7.5px;fill:#172720">${n}</text><text x="${12 + i * 70 + 32}" y="${66 + r * 48}" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#172720">${vals[i]}</text>`).join('')).join('')
  + `<text x="12" y="${39 + 3 * 48 + 2}" style="font-size:8.5px">rating 1 poor → 5 excellent · weakest factor outlined</text>`;

// Illustrative post-feasibility timeline, in months (~24 to commercial operation).
const GANTT = [['Site selection', 0, 4], ['Resource assessment', 3, 9], ['Technology & vendors', 8, 12], ['Financial model & financing', 9, 16], ['Construction', 14, 24]];
const gx = (m) => 128 + m * 6.6;
const gantt = GANTT.map(([n, a, b], i) => `<text x="12" y="${48 + i * 26}" style="font-size:9px;fill:var(--ink)">${n}</text><rect x="${gx(a)}" y="${38 + i * 26}" width="${(gx(b) - gx(a)).toFixed(1)}" height="14" fill="${['#9fcdf0', '#a9d6c9', '#cfc0e8', '#f6d77e', '#a6d38b'][i]}" stroke="var(--obj-edge)" stroke-width="1.5"/>`).join('')
  + `<path class="ax" d="M128,${38 + 5 * 26}H${gx(24)}"/><text x="${gx(0) - 2}" y="${38 + 5 * 26 + 12}">0</text><text x="${gx(12) - 6}" y="${38 + 5 * 26 + 12}">12</text><text x="${gx(24) - 32}" y="${38 + 5 * 26 + 12}">24 mo</text>`;

export default {
  id: 'feasibility', group: 'projects', title: 'Is It Worth Building?', icon: 'gauge', time: 9, level: 'Beginner',
  tagline: 'Before anyone pours concrete: how a renewable project goes from an idea to a go or no-go decision.',
  stats: [
    { id: 'stage', label: 'Stage', icon: 'layers' }, { id: 'factors', label: 'Decision factors', icon: 'check' },
    { id: 'call', label: 'Decision', icon: 'gauge' }, { id: 'months', label: 'To operation', icon: 'clock' },
  ],
  legend: [['#cfe3b2', 'early, cheap stages'], ['#a6d38b', 'expensive stages'], ['#e9fc82', 'where we are']],
  learn: [
    { t: 'Mission, goals and SMART objectives', at: 0 }, { t: 'The five-stage planning funnel', at: 1 },
    { t: 'Seven kinds of data to gather', at: 2 }, { t: 'How a 12-factor scorecard makes the go/no-go call', at: 3 },
    { t: 'Why a “go” still means about two more years', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'grass');
    STAGES.forEach(([id, name, col], i) => {
      const h = 0.45 + i * 0.4;
      s.box(id, X0 + i * (W + GAP), 5.2, 0, W, 3, h, col, { label: { t: name }, lopt: { dy: -16 } });
    });
    // the feasibility gate: two posts and a lintel over the middle stage
    const gx0 = X0 + 2 * (W + GAP);
    s.box('gate', gx0 - 0.1, 5.0, 0, 0.18, 0.18, 2.4, 'dark', { k: 30 });
    s.box('gate', gx0 + W - 0.08, 5.0, 0, 0.18, 0.18, 2.4, 'dark', { k: 30.1 });
    s.box('gate', gx0 - 0.1, 5.0, 2.4, W + 0.36, 0.18, 0.2, 'dark', { k: 30.2 });
    const pl = [[0.3, 4.6, 0], [0.3, 8.6, 0], [0.3, 8.6, 3.1], [0.3, 4.6, 3.1]].map((p) => P(...p).map((n) => n.toFixed(1)).join(',')).join(' ');
    s.raw('marker', `<g style="transform:translate(var(--mx,0px),var(--my,0px));transition:transform 1.1s cubic-bezier(.4,0,.2,1)"><polygon points="${pl}" fill="#e9fc82" fill-opacity=".4" stroke="#2b2722" stroke-width="2.2" stroke-dasharray="6 4"/></g>`, { k: 60 });
    s.card('pyr', 'THE PROJECT CONCEPT PYRAMID', pyramid, { w: 300, h: 186, from: 0, until: 0 });
    s.card('data', 'SEVEN KINDS OF DATA', list(['Resource availability', 'Candidate sites', 'Incentives & permitting', 'Technology & vendors', 'Costs (CAPEX, OPEX)', 'Revenues & off-takers', 'Stakeholders'], { gap: 23 }), { w: 260, h: 204, from: 2, until: 2 });
    s.card('score', 'THE 12-FACTOR SCORECARD', score, { w: 300, h: 196, from: 3, until: 4 });
    s.card('gantt', 'AFTER A “GO”: ABOUT 24 MONTHS', gantt, { w: 300, h: 196, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'Mission', tag: 'CONCEPT', title: 'Start with a mission, not a machine',
      body: ['A project begins as a short, jargon-free mission statement, such as building a community solar garden for affordable neighbourhood power. Goals turn it into outcomes: understandable, suitable, acceptable and flexible.',
        'SMART objectives then make the goals concrete: a 500 kW facility built in 3 months; or a PPA signed, a land lease agreed and a turbine contract placed within 2 years.'],
      callout: { k: 'key', t: 'Signing a power purchase agreement or securing the land are objectives, not afterthoughts. They are the milestones that de-risk the project.' },
      focus: ['concept'], vars: mv(0), stats: { stage: 'Concept' },
    },
    {
      short: 'The funnel', tag: 'CONCEPT', title: 'Five stages from idea to operation',
      body: ['Every project passes five stages: concept, data gathering, feasibility analysis, detailed planning, and execution (construction plus decades of operation).',
        'Money and commitment grow at every stage. The cheap early stages exist to decide whether the expensive later ones should happen at all.'],
      callout: { k: 'know', t: 'Developing without a feasibility study wastes capital and effort: without knowing where you are going, any direction will do.' },
      focus: ['concept', 'data', 'feas', 'plan', 'exec'], vars: mv(1), stats: { stage: 'Data gathering' },
    },
    {
      short: 'Seven data types', tag: 'METHOD', title: 'Get the lay of the land',
      body: ['Feasibility needs directional data, not engineering detail: resource, site, incentives and permits, technology and vendors, costs, revenues, and stakeholders.',
        'Talk to people as well as databases. Current operators, regional sales reps and local contractors reveal bottlenecks that desktop research misses.'],
      callout: { k: 'key', t: 'Revenue is not only electricity sold to the grid. Power you use yourself avoids a retail bill, which also hedges against future price rises.' },
      focus: ['data'], vars: mv(1), stats: { stage: 'Data gathering' },
    },
    {
      short: 'Scorecard', tag: 'NUMBERS', title: 'Twelve questions, scored 1 to 5',
      body: ['A weighted scorecard makes the decision less subjective. It covers technical and site factors, regulatory and market factors, and financial and strategic factors, each rated from poor to excellent.',
        'Small residential systems can use a back-of-the-envelope check. Commercial and utility projects need a written report (summary, goals, market, resources, revenue, costs, stakeholders) to win funding and support.'],
      callout: { k: 'know', t: 'The twelfth question, will the project fulfil its stated goals, ranks as the most critical. A project can pass every other test and still miss its point.' },
      focus: ['feas', 'gate'], vars: mv(2), stats: { stage: 'Feasibility', factors: '12' },
    },
    {
      short: 'Go / no-go', tag: 'CONCEPT', title: 'A “no” is a good result too',
      body: ['In this example most factors are good or excellent, but forecast revenue barely covers costs. That does not kill the project: it points exactly to the risk that needs deeper work, perhaps a better off-taker or a lower cost estimate.',
        'Concluding that a project will not work is a valuable outcome. It saves the capital that a failed build would have burned.'],
      callout: { k: 'warn', t: 'Feasibility is meant to find the weak spot early, while fixing it still costs a few weeks of analysis rather than a few million dollars of construction.' },
      focus: ['feas', 'gate'], vars: mv(2), stats: { call: 'Go, check revenue' },
    },
    {
      short: 'After “go”', tag: 'NUMBERS', title: 'A “go” still means about two years',
      body: ['A positive study is the gate to detailed planning, not to construction. Site selection takes several months; a bankable resource assessment takes around six; then vendors, a full financial model, and financing, before any build.',
        'In this illustrative schedule the whole path, from the end of feasibility to a plant that is operating, takes about 24 months. Large hydro or offshore projects take far longer.'],
      callout: { k: 'key', t: 'A feasibility estimate of the resource is not a bankable one. Lenders want measured data, such as a year on a wind mast or logged sunlight, before they finance the build.' },
      focus: ['plan', 'exec'], vars: mv(4), stats: { stage: 'Planning → build', months: '≈ 24' },
    },
  ],
};
