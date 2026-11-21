import { P } from '../iso.js';
import { panel } from './solar.js';
import { turbine } from './wind.js';
import { pylon } from './common.js';
import { list, table } from './cards.js';

// Source: the "Renewable Energy Projects" notes (site execution, EPC / owner-managed / EPCM, vendor selection, O&M, repowering vs decommissioning).
const GANTT = [['Roads & civil works', 0, 4], ['Foundations & racking', 3, 8], ['Modules & inverters', 6, 11], ['Substation & grid link', 4, 10], ['Testing & commissioning', 10, 12]];
const gx = (m) => 128 + m * 12;
const gantt = GANTT.map(([n, a, b], i) => `<text x="12" y="${48 + i * 26}" style="font-size:9px;fill:var(--ink)">${n}</text><rect x="${gx(a)}" y="${38 + i * 26}" width="${(gx(b) - gx(a)).toFixed(1)}" height="14" fill="${['#d9c4a0', '#b8c4d1', '#f6d77e', '#cfc0e8', '#a6d38b'][i]}" stroke="var(--obj-edge)" stroke-width="1.5"/>`).join('')
  + `<path class="ax" d="M128,${38 + 5 * 26}H${gx(12)}"/><text x="${gx(0) - 2}" y="${38 + 5 * 26 + 12}">0</text><text x="${gx(6) - 4}" y="${38 + 5 * 26 + 12}">6</text><text x="${gx(12) - 44}" y="${38 + 5 * 26 + 12}">12 mo · COD</text>`
  + `<text x="12" y="${38 + 5 * 26 + 28}" style="font-size:8.5px">illustrative schedule for a mid-size solar plant</text>`;

const crane = (x, y) => `<path class="ln" d="M${P(x, y, 0).map((n) => n.toFixed(1)).join(',')}L${P(x, y, 3.6).map((n) => n.toFixed(1)).join(',')}M${P(x - 2.2, y, 3.6).map((n) => n.toFixed(1)).join(',')}L${P(x + 1.4, y, 3.6).map((n) => n.toFixed(1)).join(',')}M${P(x - 1.8, y, 3.6).map((n) => n.toFixed(1)).join(',')}L${P(x - 1.8, y, 2.2).map((n) => n.toFixed(1)).join(',')}" style="stroke-width:3"/><path d="M${P(x - 1.8, y, 2.2).map((n) => n.toFixed(1)).join(',')}l-5,10h10z" fill="#f7a35c" stroke="var(--obj-edge)" stroke-width="1.6"/>`;

export default {
  id: 'build', group: 'projects', title: 'Building & Running It', icon: 'factory', time: 10, level: 'Intermediate',
  tagline: 'From signed contracts to a spinning plant: who builds it, how it is run for decades, and what happens at the end.',
  stats: [
    { id: 'phase', label: 'Phase', icon: 'layers' }, { id: 'model', label: 'Contract model', icon: 'cog' },
    { id: 'cod', label: 'Build time', icon: 'clock' }, { id: 'life', label: 'Plant life', icon: 'gauge' },
  ],
  legend: [['#d9c4a0', 'civil works'], ['#4f74b0', 'solar rows going up'], ['#cfc0e8', 'grid link']],
  learn: [
    { t: 'The six steps of preparing a site', at: 0 }, { t: 'EPC, owner-managed and EPCM contracts', at: 1 },
    { t: 'How to choose bidders, not just prices', at: 2 }, { t: 'What “COD” means and what comes before it', at: 3 },
    { t: 'Repowering versus decommissioning', at: 5 },
  ],
  build(s) {
    s.floor(10, 10, 'dirt');
    s.box('road', 0.2, 8.6, 0, 9.6, 0.9, 0.06, 'concrete', { shadow: false, k: 3 });
    s.box('yard', 0.8, 1.0, 0, 1.2, 0.9, 0.7, 'steel', { label: { t: 'laydown yard', icon: 'layers' } });
    s.box('yard', 2.2, 1.0, 0, 1.2, 0.9, 0.7, 'steel');
    s.raw('crane', crane(1.8, 3.2), { k: 30, from: 1, until: 3 });
    s.label('crane:l', 1.8, 3.2, 3.5, { t: 'crane', icon: 'cog' }, { from: 1, until: 3 });
    s.raw('rows', panel(4.0, 1.2, 1.8, 1.4) + panel(5.9, 1.2, 1.8, 1.4), { k: 8, from: 2 });
    s.raw('rows', panel(4.0, 3.0, 1.8, 1.4) + panel(5.9, 3.0, 1.8, 1.4), { k: 12, from: 3 });
    s.raw('rows', panel(4.0, 4.8, 1.8, 1.4) + panel(5.9, 4.8, 1.8, 1.4), { k: 16, from: 4 });
    s.box('sub', 8.4, 2.4, 0, 1.2, 1.2, 0.9, 'concrete', { from: 3, label: { t: 'substation', icon: 'zap' } });
    s.raw('pylon', pylon(9.5, 4.4), { from: 3, k: 20 });
    s.box('omb', 1.0, 5.6, 0, 1.8, 1.5, 1.1, 'white', { from: 3, label: { t: 'O&M building', icon: 'cog' } });
    turbine(s, { x: 6.8, y: 6.2, sc: 0.55, suf: 'Old', from: 5 });
    turbine(s, { x: 8.6, y: 6.2, sc: 0.8, suf: 'New', from: 5 });
    s.flow('toGrid', [[9.0, 3.6, 0.05], [9.5, 4.2, 0.05]], 'electric', { from: 4 });
    s.card('six', 'SIX STEPS ON SITE', list([['Secure site control', 'buy, or a 25+ year lease'], ['Check the ground', 'soil, slope, drainage, access'], ['Draw the layout', 'row spacing, wind direction'], ['Design civil works', 'roads, drainage, substation'], ['Start permits early', 'before heavy design spend'], ['Talk to neighbours', 'avoid late redesign']], { gap: 28 }), { w: 300, h: 206, from: 0, until: 0 });
    s.card('models', 'THREE WAYS TO BUILD', table(['Model', 'Risk sits with', 'Owner effort'], [['Turnkey EPC', 'the contractor', 'low'], ['Owner-managed', 'the owner', 'high'], ['EPCM', 'mostly the owner', 'medium']], { cols: [12, 120, 222], rowH: 26 }) + `<text x="12" y="132" style="font-size:8.5px">EPC costs more, but one party is accountable</text>`, { w: 300, h: 148, from: 1, until: 1 });
    s.card('rfp', 'CHOOSING BIDDERS', list([['Write the RFP', 'scope, performance, schedule'], ['Score capability', 'track record, crews, financial strength'], ['Then price', 'the cheapest bid is not always cheapest'], ['Agree one master timeline', 'owner and contractor together']], { gap: 32 }), { w: 300, h: 168, from: 2, until: 2 });
    s.card('gantt', 'BUILD TO COMMERCIAL OPERATION', gantt, { w: 300, h: 204, from: 3, until: 3 });
    s.card('om', 'KEEPING IT RUNNING', list([['Low upkeep', 'solar PV, onshore wind'], ['High upkeep', 'geothermal, biomass, offshore wind, CSP'], ['Operations team', 'operators, accountants, security'], ['Maintenance team', 'electricians, mechanics, OEM specialists'], ['Commercial admin', 'monitoring, power sales, billing, insurance']], { gap: 30 }), { w: 300, h: 190, from: 4, until: 4 });
    s.card('end', 'END OF LIFE', table(['', 'Repower', 'Decommission'], [['What', 'swap in new kit', 'remove, restore'], ['Output', 'often 25%+ up', 'none'], ['Life', '+20 years', 'ends'], ['Reuses', 'roads, grid', 'nothing']], { cols: [12, 66, 184], rowH: 24 }) + `<text x="12" y="146" style="font-size:8.5px">decommissioning is bonded before building</text>`, { w: 300, h: 160, from: 5, until: 5 });
  },
  steps: [
    {
      short: 'On site', tag: 'CONCEPT', title: 'Turning land into a building site',
      body: ['After a site is chosen, six jobs run in parallel: secure long-term control (buy or lease for 25 years or more), audit the ground, draw the layout, design roads and drainage, start permits early, and bring the neighbours in.',
        'Skipping one is how projects meet late redesigns, from drainage to the substation position to a neighbour’s objection.'],
      callout: { k: 'key', t: 'A lease has to cover more than the panels or turbines: access roads, cable trenches and laydown yards too.' },
      focus: ['yard', 'road'], stats: { phase: 'Site control', life: '25–30 yrs' },
    },
    {
      short: 'Who builds', tag: 'METHOD', title: 'Three ways to get it built',
      body: ['With a turnkey EPC contract, one contractor engineers, procures and builds the whole plant and carries completion risk. It is simple for the owner but costs more.',
        'Owner-managed means the owner hires and coordinates every contractor: more control and lower nominal cost, but all the risk and work. EPCM sits between: a firm manages construction while the owner contracts directly.'],
      callout: { k: 'know', t: 'The extra cost of an EPC is a price for transferring risk. Whether it is worth paying depends on how much construction experience the owner has.' },
      focus: ['yard', 'crane'], stats: { phase: 'Contracting', model: 'EPC / self / EPCM' },
    },
    {
      short: 'Bidders', tag: 'METHOD', title: 'Pick capability, then price',
      body: ['A request for proposals (RFP) states the scope, performance and schedule. Bidders are judged on technical ability and delivery record, and only then on price.',
        'Vendor choices matter beyond the invoice: module, inverter and tracker suppliers carry warranties that lenders read closely, so supplier strength is part of bankability.'],
      callout: { k: 'warn', t: 'A bid that is cheapest on paper but weak on execution can cost far more in delay and rework.' },
      focus: ['yard', 'rows'], stats: { phase: 'Vendors & RFP' },
    },
    {
      short: 'To COD', tag: 'NUMBERS', title: 'Building to the first sale of power',
      body: ['Civil works, foundations, racking, modules, the substation and grid link overlap on one schedule, ending in testing and commissioning.',
        'The commercial operation date (COD) is when the plant is accepted and starts selling power. In this illustrative schedule a mid-size solar plant takes about a year to build.'],
      callout: { k: 'key', t: 'Delay is expensive in both directions: debt interest keeps accruing while no electricity is sold, and contract deadlines can trigger penalties.' },
      focus: ['rows', 'sub', 'crane', 'pylon', 'road', 'omb'], flows: [], stats: { phase: 'Construction', cod: '≈ 12 mo' },
    },
    {
      short: 'Operating', tag: 'CONCEPT', title: 'The long, quiet part',
      body: ['After COD an owner has 20–30 years of operations and maintenance. Solar PV and onshore wind have few moving parts and low upkeep. Geothermal, biomass, offshore wind and solar thermal need much more work.',
        'A plant needs operators, maintenance crews and a commercial back office for monitoring, power sales, invoices and insurance.'],
      callout: { k: 'know', t: 'Upkeep is a cost that arrives every year, so it belongs in the cash-flow model from day one, not as an afterthought.' },
      focus: ['omb', 'rows', 'sub'], flows: ['toGrid'], stats: { phase: 'Operations' },
    },
    {
      short: 'End of life', tag: 'TRADE-OFF', title: 'Repower or retire',
      body: ['At the end of its design life an owner either repowers (replaces the generating equipment and keeps roads, grid link and permits) or decommissions (removes equipment, recycles materials and restores the land).',
        'Repowering often lifts output by 25% or more and adds roughly 20 years. Decommissioning is paid for by bonds set aside before construction begins, so the cost is planned from the start.'],
      callout: { k: 'warn', t: 'Solar panels contain small amounts of lead and cadmium and must stay out of ordinary landfill. Frames and glass recycle easily; recovering silver and semiconductors costs more.' },
      focus: ['towerOld', 'nacelleOld', 'rotorOld', 'towerNew', 'nacelleNew', 'rotorNew'], vars: { '--rotor': '5s' }, stats: { phase: 'End of life', life: '+20 yrs repowered' },
    },
  ],
};
