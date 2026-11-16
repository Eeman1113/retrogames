/* check_city.js — headless contract test between city-art.js, city-sim.js and
   city.js. Run: node scripts/check_city.js
   city.js needs a DOM so it is only parsed here, not executed; what this
   checks is that the two data/logic files satisfy the interface it assumes. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const docs = path.join(__dirname, "..", "docs");
const fail = [], note = [];
const sandbox = { window: {}, console, Math, Date, performance: { now: () => Date.now() } };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

function load(f) {
  const p = path.join(docs, f);
  if (!fs.existsSync(p)) { fail.push(`${f} missing`); return false; }
  try { vm.runInContext(fs.readFileSync(p, "utf8"), sandbox, { filename: f }); return true; }
  catch (e) { fail.push(`${f} threw: ${e.message}`); return false; }
}
load("city-art.js"); load("city-sim.js");
const ART = sandbox.window.CITY_ART, SIM = sandbox.window.CITY_SIM;

/* ---- art contract ------------------------------------------------------ */
if (!ART) fail.push("CITY_ART not set");
else {
  const chars = new Set(Object.keys(ART.palette || {}));
  let grids = 0, px = 0;
  const walk = (o, where) => {
    if (Array.isArray(o) && Array.isArray(o[0]) && typeof o[0][0] === "string") {
      o.forEach((f, i) => walk(f, `${where}[${i}]`));   // framed tile / anim
      return;
    }
    if (Array.isArray(o) && typeof o[0] === "string") {
      grids++;
      const w = o[0].length;
      o.forEach((row, i) => {
        if (row.length !== w) fail.push(`${where}: row ${i} is ${row.length}, expected ${w}`);
        for (const ch of row) {
          if (ch === "." || ch === " ") continue;
          px++;
          if (!chars.has(ch)) fail.push(`${where}: '${ch}' not in palette`);
        }
      });
      return;
    }
    if (o && typeof o === "object")
      for (const k of Object.keys(o)) walk(o[k], `${where}.${k}`);
  };
  ["tiles", "props", "buildings", "actors"].forEach(k => {
    if (!ART[k]) fail.push(`CITY_ART.${k} missing`); else walk(ART[k], k);
  });
  note.push(`art: ${grids} grids, ${px} drawn pixels, ${chars.size} palette entries`);

  for (const k of ["grass", "path", "pavement", "tallGrass", "water", "flowers"])
    if (!ART.tiles?.[k]) fail.push(`tiles.${k} required by the town generator`);
  const T = 16;
  for (const [k, g] of Object.entries(ART.tiles || {})) {
    const one = Array.isArray(g[0]) ? g[0] : g;
    if (one.length !== T || one[0].length !== T)
      fail.push(`tile ${k} is ${one[0].length}x${one.length}, expected ${T}x${T}`);
  }
  for (const name of ["surveyor", "courier", "engineer", "gardener"]) {
    const a = ART.actors?.[name];
    if (!a) { fail.push(`actor ${name} missing`); continue; }
    for (const d of ["s", "n", "e"])
      if (!Array.isArray(a[d]) || a[d].length !== 4) fail.push(`${name}.${d} needs 4 frames`);
    if (!Array.isArray(a.work) || a.work.length < 2) fail.push(`${name}.work needs 2 frames`);
  }
  for (const [k, b] of Object.entries(ART.buildings || {})) {
    const g = b.grid || b;
    if (!Array.isArray(g)) { fail.push(`building ${k} has no grid`); continue; }
    (b.windows || []).forEach(([x, y]) => {
      if (y >= g.length || x >= g[0].length) fail.push(`building ${k}: window ${x},${y} outside grid`);
    });
  }
}

/* ---- sim contract ------------------------------------------------------ */
if (!SIM) fail.push("CITY_SIM not set");
else if (!SIM.Town) fail.push("CITY_SIM.Town missing");
else {
  const cols = 90, rows = 60;
  const road = (c, r) => c % 11 < 2 || r % 9 < 2;
  /* plots must sit ON the walkable grid: a destination inside a building
     would force the agent off-road and the off-road assertion below would be
     measuring the test's mistake, not the sim's. */
  const plots = [];
  for (let i = 0, c = 0, r = 0; plots.length < 14 && r < rows; i++) {
    c = (i * 7) % cols; r = ((i * 5) % (rows - 2)) + 1;
    if (!road(c, r)) continue;
    plots.push({ id: "p" + plots.length, c, r,
                 kind: ["chart", "house", "tree", "well", "depot", "sign"][plots.length % 6] });
  }
  if (plots.length < 6) fail.push(`test setup only found ${plots.length} walkable plots`);
  const town = new SIM.Town({ cols, rows, tile: 16, seed: 42, isWalkable: road, plots });
  town.setPopulation(13);
  if (town.agents.length !== 13) fail.push(`setPopulation(13) gave ${town.agents.length}`);

  const states = new Map(), arche = new Set();
  let offRoad = 0, t0 = Date.now();
  const FRAMES = 20000;
  for (let i = 0; i < FRAMES; i++) {
    town.update(16.7);
    for (const a of town.agents) {
      arche.add(a.archetype);
      const key = a.archetype;
      if (!states.has(key)) states.set(key, new Set());
      states.get(key).add(a.state);
      /* a.x/a.y is a feet anchor: x is a cell centre but y is a cell BOTTOM
         EDGE, so floor(y/tile) names the cell below the agent. That off-by-one
         was this test's bug, not the sim's. Use the precomputed cell. */
      const c = a.col, r = a.row;
      if (a.col === undefined || a.row === undefined)
        fail.push("agent missing col/row"), i = FRAMES;
      if (Math.floor(a.cx / 16) !== a.col || Math.floor(a.cy / 16) !== a.row)
        fail.push(`cell identity broken: ${a.cx},${a.cy} vs ${a.col},${a.row}`), i = FRAMES;
      if (!road(c, r)) offRoad++;
      for (const f of ["x", "y", "dir", "frame", "state"])
        if (a[f] === undefined || (typeof a[f] === "number" && !Number.isFinite(a[f])))
          fail.push(`agent field ${f} is ${a[f]}`), i = FRAMES;
    }
  }
  const ms = Date.now() - t0;
  note.push(`sim: ${FRAMES} frames in ${ms}ms = ${(ms / FRAMES * 1000).toFixed(1)}µs/frame for ${town.agents.length} agents`);
  if (offRoad) fail.push(`${offRoad} agent-frames off the walkable grid`);
  const buried = town.plots.filter(p => p.approach < 0);
  note.push(`plots: ${town.plots.length} total, ${buried.length} unreachable`);
  if (arche.size < 4) fail.push(`only ${arche.size} archetypes appeared: ${[...arche]}`);
  for (const [k, set] of states)
    if (set.size < 2) fail.push(`${k} never left state '${[...set][0]}'`);
  note.push("sim states: " + [...states].map(([k, v]) => `${k}=${[...v].join("/")}`).join("  "));
}

/* ---- renderer parses --------------------------------------------------- */
try { new vm.Script(fs.readFileSync(path.join(docs, "city.js"), "utf8")); note.push("city.js parses"); }
catch (e) { fail.push("city.js syntax: " + e.message); }

note.forEach(n => console.log("  " + n));
if (fail.length) { console.log("\n" + fail.length + " FAILURES:"); fail.slice(0, 25).forEach(f => console.log("  ✗ " + f)); process.exit(1); }
console.log("\nall city contracts satisfied");
