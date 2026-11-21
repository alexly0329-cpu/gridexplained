// "Build your own grid": an interactive one-day dispatch model. Not a step lesson: it mounts its own controls.
// Simplified on purpose: one representative day, one region, perfect transmission, no outages. Inputs are capacities in GW.

const PEAK = 100;                                                         // GW peak demand
const DEM = [[0, 38], [5, 30], [8, 52], [12, 52], [16, 54], [19, 80], [22, 56], [24, 40]];
const demand = (h) => { for (let i = 1; i < DEM.length; i++) if (h <= DEM[i][0]) { const [a, b] = [DEM[i - 1], DEM[i]]; return ((a[1] + ((h - a[0]) / (b[0] - a[0])) * (b[1] - a[1])) * PEAK) / 80; } return 50; };
const solarShape = (h) => (Math.abs(h - 12.5) > 6.5 ? 0 : Math.exp(-0.5 * ((h - 12.5) / 2.8) ** 2));
const windShape = (h) => 0.35 + 0.15 * Math.cos(((h - 3) / 24) * 2 * Math.PI);
const WEATHER = { typical: { label: 'Typical day', sun: 0.8, wind: 1.0 }, sunnycalm: { label: 'Sunny and calm', sun: 1.0, wind: 0.2 }, windy: { label: 'Sunny and windy', sun: 1.0, wind: 1.7 }, dunkel: { label: 'Cloudy and windless', sun: 0.15, wind: 0.1 } };
// lifecycle emissions in g CO₂-eq per kWh (IPCC AR5 medians, as in the comparison earlier in the site)
const CO2 = { solar: 48, wind: 11, nuclear: 12, hydro: 24, gas: 490 };
const PRESETS = {
  today: ['Today-ish', { solar: 20, wind: 25, nuclear: 15, hydro: 10, gas: 80, batt: 2 }],
  solar: ['Solar-heavy', { solar: 120, wind: 20, nuclear: 10, hydro: 10, gas: 60, batt: 40 }],
  wind: ['Wind + hydro', { solar: 30, wind: 100, nuclear: 0, hydro: 20, gas: 40, batt: 20 }],
  firm: ['Nuclear + hydro', { solar: 10, wind: 10, nuclear: 40, hydro: 25, gas: 40, batt: 5 }],
  clean: ['Nearly all clean', { solar: 150, wind: 120, nuclear: 20, hydro: 25, gas: 30, batt: 50 }],
};
const SLIDERS = [['solar', 'Solar', 150, '#f6d77e'], ['wind', 'Wind', 150, '#a9d6c9'], ['nuclear', 'Nuclear', 50, '#cfc0e8'], ['hydro', 'Hydro', 30, '#9fcdf0'], ['gas', 'Gas (flexible)', 140, '#f7a35c'], ['batt', 'Battery power (4 h)', 60, '#8fd07f']];

// Run the day twice so the battery starts the real day in a sensible state; return the second day's hourly flows.
function simulate(cap, weather, threshold) {
  const w = WEATHER[weather], P = cap.batt, E = 4 * P, eff = Math.sqrt(0.9);
  let stored = 0, hydroLeft = cap.hydro * 10;
  let day;
  for (let pass = 0; pass < 2; pass++) {
    day = []; hydroLeft = cap.hydro * 10;
    for (let h = 0; h < 24; h++) {
      const d = demand(h), sol = cap.solar * solarShape(h) * w.sun, win = cap.wind * Math.min(1, windShape(h) * w.wind), nuc = Math.min(cap.nuclear, d);
      const r = { h, d, sol, win, nuc, hyd: 0, dis: 0, gas: 0, unmet: 0, curt: 0, chg: 0 };
      const must = nuc + sol + win;
      if (must >= d) {
        const surplus = must - d, chg = Math.min(surplus, P, (E - stored) / eff);
        stored += chg * eff; r.chg = chg; r.curt = surplus - chg;
        const cut = r.curt; const fromSol = Math.min(sol, cut); r.sol -= fromSol; r.win -= Math.min(win, cut - fromSol);
      } else {
        let need = d - must;
        if (need >= threshold) {                                          // limited-energy sources (hydro budget, battery) are saved for the hardest hours
          const hy = Math.min(cap.hydro, need, hydroLeft); r.hyd = hy; hydroLeft -= hy; need -= hy;
          const dis = Math.min(need, P, stored * eff); r.dis = dis; stored -= dis / eff; need -= dis;
        }
        const g = Math.min(cap.gas, need); r.gas = g; need -= g; r.unmet = need;
      }
      day.push(r);
    }
  }
  return day;
}
function solve(cap, weather) {
  let best = null;
  for (let t = 0; t <= 80; t += 2) {                                       // battery discharges only in hours where the remaining deficit ≥ t
    const day = simulate(cap, weather, t), unmet = day.reduce((a, r) => a + r.unmet, 0), gas = day.reduce((a, r) => a + r.gas, 0);
    const score = unmet * 1000 + gas;
    if (!best || score < best.score) best = { score, day };
  }
  return best.day;
}
function metrics(day, cap, weather) {
  const sum = (k) => day.reduce((a, r) => a + r[k], 0), total = sum('d');
  const served = total - sum('unmet');
  const gen = { solar: sum('sol'), wind: sum('win'), nuclear: sum('nuc'), hydro: sum('hyd'), gas: sum('gas') };
  const co2 = Object.entries(gen).reduce((a, [k, v]) => a + v * CO2[k], 0) / Math.max(served, 1);
  const w = WEATHER[weather], potential = day.reduce((a, r) => a + 0, 0);
  const renewPot = day.reduce((a, r) => a + cap.solar * solarShape(r.h) * w.sun + cap.wind * Math.min(1, windShape(r.h) * w.wind), 0);
  const hoursShort = day.filter((r) => r.unmet > 0.5).length;
  return { unmetPct: (sum('unmet') / total) * 100, curtPct: renewPot ? (sum('curt') / renewPot) * 100 : 0, cleanPct: ((gen.solar + gen.wind + gen.nuclear + gen.hydro + sum('dis')) / served) * 100, co2, hoursShort, installed: cap.solar + cap.wind + cap.nuclear + cap.hydro + cap.gas + cap.batt, potential };
}

const W = 700, H = 300, X0 = 44, X1 = 690, Y0 = 20, Y1 = 262, YMAX = 150;
const xs = (h) => X0 + (h / 24) * (X1 - X0), ys = (v) => Y1 - (v / YMAX) * (Y1 - Y0);
function drawChart(day) {
  const layers = [['nuc', '#cfc0e8'], ['hyd', '#9fcdf0'], ['win', '#a9d6c9'], ['sol', '#f6d77e'], ['dis', '#8fd07f'], ['gas', '#f7a35c']];
  const hrs = [...day, { ...day[23], h: 24 }];
  const poly = (lo, hi, col) => `<polygon points="${hrs.map((r) => `${xs(r.h).toFixed(1)},${ys(hi(r)).toFixed(1)}`).join(' ')} ${hrs.slice().reverse().map((r) => `${xs(r.h).toFixed(1)},${ys(lo(r)).toFixed(1)}`).join(' ')}" fill="${col}" stroke="#2b2722" stroke-width=".6"/>`;
  let acc = []; let out = '';
  layers.forEach(([k, col], i) => { const lo = (r) => layers.slice(0, i).reduce((a, [kk]) => a + r[kk], 0); const hi = (r) => lo(r) + r[k]; out += poly(lo, hi, col); });
  const dl = `<polyline points="${hrs.map((r) => `${xs(r.h).toFixed(1)},${ys(r.d).toFixed(1)}`).join(' ')}" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linejoin="round"/>`;
  const unmet = day.filter((r) => r.unmet > 0.5).map((r) => `<rect x="${xs(r.h).toFixed(1)}" y="${ys(r.d).toFixed(1)}" width="${(xs(1) - xs(0)).toFixed(1)}" height="${(ys(r.d - r.unmet) - ys(r.d)).toFixed(1)}" fill="#e5534b" opacity=".85"/>`).join('');
  const ticks = [0, 50, 100, 150].map((v) => `<path d="M${X0},${ys(v)}H${X1}" stroke="var(--line)" stroke-width="1"/><text x="${X0 - 6}" y="${ys(v) + 3}" text-anchor="end">${v}</text>`).join('');
  const xl = [0, 6, 12, 18, 24].map((h) => `<text x="${xs(h)}" y="${Y1 + 16}" text-anchor="middle">${h === 24 ? '24h' : h + 'h'}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="sbx-chart" role="img" aria-label="Hourly supply and demand"><g style="font:10px var(--mono);fill:var(--muted)">${ticks}${xl}<text x="${X0 - 6}" y="12" text-anchor="end">GW</text></g>${out}${dl}${unmet}</svg>`;
}

export default {
  id: 'sandbox', group: 'tools', title: 'Build Your Own Grid', icon: 'layers', time: 15, level: 'All levels', sandbox: true,
  tagline: 'Pick a mix of sources and a kind of weather, then watch one day of demand get served: or not. A simplified model, built to be played with.',
  mount(main, side) {
    const cap = { ...PRESETS.today[1] }; let weather = 'typical';
    main.innerHTML = `<div class="sbx-weather" id="sw"></div><div id="sc2"></div><div class="sbx-legend" id="sl"></div><div class="sbx-sliders" id="ss"></div>`;
    side.innerHTML = `<div class="card step"><div class="step-top"><span>RESULTS</span><span class="tag" id="sv">—</span></div><h2 id="sh">One day, six sources</h2><div class="sbx-stats" id="sst"></div>
      <p class="sbx-note" id="sn"></p></div>
      <div class="card learn"><h3>Try these</h3><div class="sbx-presets" id="sp"></div><p class="sbx-note">Presets are starting points, not forecasts. Demand peaks at ${PEAK} GW. Hydro can supply about ten full-power hours a day. Batteries hold four hours and return 90%. Emissions use lifecycle medians (g CO₂/kWh): solar 48, wind 11, nuclear 12, hydro 24, gas 490.</p></div>`;
    $('#sw').innerHTML = Object.entries(WEATHER).map(([k, w]) => `<button class="sbx-chip" data-w="${k}">${w.label}</button>`).join('');
    $('#sl').innerHTML = [['nuc', 'nuclear', '#cfc0e8'], ['hyd', 'hydro', '#9fcdf0'], ['win', 'wind', '#a9d6c9'], ['sol', 'solar', '#f6d77e'], ['dis', 'battery', '#8fd07f'], ['gas', 'gas', '#f7a35c'], ['un', 'unmet demand', '#e5534b']].map(([, n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join('') + '<span><i style="background:var(--ink)"></i>demand</span>';
    $('#ss').innerHTML = SLIDERS.map(([k, n, max, c]) => `<label class="sbx-row"><span><i style="background:${c}"></i>${n}</span><input type="range" min="0" max="${max}" step="1" value="${cap[k]}" data-k="${k}" aria-label="${n} capacity in gigawatts"><output id="o-${k}">${cap[k]} GW</output></label>`).join('');
    $('#sp').innerHTML = Object.entries(PRESETS).map(([k, [n]]) => `<button class="sbx-chip" data-p="${k}">${n}</button>`).join('');
    function update() {
      const day = solve(cap, weather), m = metrics(day, cap, weather);
      $('#sc2').innerHTML = drawChart(day);
      SLIDERS.forEach(([k]) => { $(`[data-k=${k}]`).value = cap[k]; $(`#o-${k}`).textContent = `${cap[k]} GW`; });
      document.querySelectorAll('[data-w]').forEach((b) => b.classList.toggle('on', b.dataset.w === weather));
      const ok = m.unmetPct < 0.5;
      $('#sv').textContent = ok ? 'LIGHTS ON' : 'BLACKOUT RISK'; $('#sv').className = 'tag ' + (ok ? 'METHOD' : 'PROBLEM');
      $('#sst').innerHTML = [['Unmet demand', `${m.unmetPct.toFixed(1)}%`, `${m.hoursShort} hours short`], ['Clean share', `${m.cleanPct.toFixed(0)}%`, 'of power served'], ['Wasted renewables', `${m.curtPct.toFixed(0)}%`, 'curtailed'], ['Emissions', `${Math.round(m.co2)}`, 'g CO₂ per kWh']].map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b><em>${c}</em></div>`).join('');
      $('#sn').textContent = !ok ? 'Demand goes unmet in the red hours. Add flexible capacity (gas, hydro, batteries) or clean energy for the gap, or change the weather to see how fragile it is.' : m.curtPct > 15 ? 'The lights stay on, but a lot of wind and solar is wasted at midday. Batteries or flexible demand would put it to use.' : 'Demand is met. Try the cloudy-and-windless weather to stress this mix.';
    }
    main.addEventListener('input', (e) => { const k = e.target.dataset?.k; if (k) { cap[k] = +e.target.value; update(); } });
    document.getElementById('page').onclick = (e) => {
      const w = e.target.closest('[data-w]'), p = e.target.closest('[data-p]');
      if (w) { weather = w.dataset.w; update(); } else if (p) { Object.assign(cap, PRESETS[p.dataset.p][1]); update(); }
    };
    update();
  },
};
const $ = (s) => document.querySelector(s);
