# GRID / EXPLAINED — interactive guide to electricity

Step-through isometric lessons in a dashboard layout (top bar, stage + stepper on the left, step card + checklist on the right), painted in a forest / paper / acid-lime palette with DM Sans and IBM Plex Mono, inspired by gridohio100.netlify.app. No build step, no dependencies.

`archive/` holds the earlier single-page editorial version (hero, source index, comparison table). It is not loaded.

## Run

```bash
python3 -m http.server 8765   # any static server works (ES modules need http, not file://)
# open http://localhost:8765/#/solar/1
```

Keys: `←` `→` step · `Space` play / pause · `R` replay step · `⌘K` search. **Play** runs every step of a lesson in order (dwell time scales with the step's text; speed 0.5×–2×; Step, Previous and Reset buttons), the same pattern as the Protocol Explorer.

## Layout

| File | Job |
|---|---|
| `css/app.css` | Dashboard layout and palette tokens, light + dark |
| `css/scene.css` | Isometric scene, flows and animation styles (the interactive part) |
| `js/iso.js` | Isometric SVG toolkit: `box`, `cyl`, `dome`, `cooling`, `water`, `flow`, `label`, `card`; icon sprite |
| `js/main.js` | Shell, drawer menu, ⌘K search, hash router (`#/lesson/step`), stepper, stats, theme, label declutter |
| `js/lessons/*.js` | One file per lesson: `build(s)` draws the scene, `steps[]` drives it. Group 02 holds the nine source lessons, group 03 the four grid lessons (`balance`, `frequency`, `transmission`, `market`) |
| `js/lessons/{electricity,energy}.js` | Group 01, “Foundations”, written from the Renewable Energy Technology Fundamentals notes: circuits, Ohm's law, AC/DC, high-voltage lines; energy forms, efficiency, the six pathways, units |
| `js/lessons/{geothermal,bioenergy,csp}.js` | Added to group 02, “Sources”, from the same Technology Fundamentals notes |
| `js/lessons/{feasibility,siting,returns,lcoe,financing,build}.js` | Group 04, “Projects & finance”, written from the Renewable Energy Projects course notes. Money figures are computed in `fin.js`, not typed in |
| `js/lessons/{metrics,loadcurves,variable,storage,demand,models}.js` | Group 05, “Electricity systems”, written from the Renewable Power and Electricity Systems course notes |
| `js/lessons/{history,costs,enabling,der,spiral,zerocost}.js` | Group 06, “The energy transition”, written from the Renewable Energy Futures course notes; `access` and `efficiency` were added later. The spiral and cost-split numbers are computed from stated inputs |
| `js/lessons/{windeng,pveng,storagetech}.js` | Group 07, “Deep dives & sandbox”, from the Technology Fundamentals notes: wind physics and siting, PV cells and yield, storage families and costs |
| `js/lessons/{bvp,inverters,sandbox}.js` | Also group 07, “Deep dives & sandbox”. `sandbox.js` is an interactive one-day dispatch model (sliders, weather, presets); it sets `sandbox: true` and mounts its own controls instead of steps |
| `js/lessons/{wholesale,retailer,forwards,position,loadweather}.js` | Trader-track lessons mixed into groups 03, 04 and 05 (wholesale markets, retail supplier economics, forward curves and hedging, the position report, load and weather risk). Written from general market knowledge, not the course notes; figures are illustrative and computed in code |
| `js/lessons/{sqldrills,auctions,regulation,fundamentals}.js` | Group 08, “Trader desk”: Excel and SQL drills, auctions and credit, regulation and contracts, writing a market note |
| `js/lessons/cards.js`, `fin.js` | Chart-card builders (bars, lists, tables) and finance maths (NPV, IRR, annuities, loans) for the project lessons |
| `js/lessons/common.js` | Helpers for the grid lessons: houses, pylons, spinning rotors, smooth chart lines |

## Add a lesson

1. Copy a file in `js/lessons/`, change `id`, `title`, `stats`, `build`, `steps`.
2. Import it in `js/main.js` and add it to `SOURCES` or `GRID_LESSONS`.

Per step you can set: `focus` (ids kept in colour, labels shown), `flows` (animated flow ids), `stats`
(values accumulate), `vars` (CSS variables on the SVG, e.g. `--rotor` spin time), `callout`.
Items take `from` / `until` step indexes to appear/disappear. Painter's order is by `x+y` of the far
corner; pass `k` to override when two neighbours overlap wrongly.

## Next: intertwined concepts

The menu lists four upcoming topics under “Coming soon” (`SOON` in `js/main.js`). Ideas: duck curve & dispatch
order, frequency and inertia, transmission losses, capacity vs energy, a whole-grid scene mixing all six sources.

## Trader label

Set `track: 'trader'` on a lesson to give it a TRADER badge in the menu and header and to include it in the menu's All / Core / Trader filter (stored in `localStorage` as `grid-filter`).
