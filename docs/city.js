/* retrogames · the city
   Renderer + world builder. Art lives in city-art.js (CITY_ART), behaviour in
   city-sim.js (CITY_SIM). This file owns the canvas, the town layout, the
   parallax, and the draw loop — nothing else.

   The city sits on a fixed canvas behind the page. Content panels are opaque,
   so they read as the city's buildings and the streets run through the gaps
   between sections. Agents walking behind a panel are occluded by it, which is
   free depth. */
(function () {
  "use strict";
  const ART = window.CITY_ART, SIM = window.CITY_SIM;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!ART || !SIM) return;                       // no art or no brain, no city

  /* FireRed composes its overworld from 16x16 metatiles; at 3x a tile is 48
     screen pixels, which puts roughly as many tiles on screen as a GBA did. */
  const TILE = 16;
  const scaleFor = w => (w < 760 ? 2 : 3);
  const popFor   = w => (w < 760 ? 5 : w < 1200 ? 9 : 13);

  /* ── sprite baking: every grid becomes an offscreen canvas once ───────── */
  const cache = new Map();
  function bake(grid, key, flip) {
    const id = key + (flip ? "|f" : "");
    if (cache.has(id)) return cache.get(id);
    const h = grid.length, w = grid[0].length;
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const g = cv.getContext("2d");
    for (let y = 0; y < h; y++) {
      const row = grid[y];
      for (let x = 0; x < w; x++) {
        const ch = row[x];
        if (ch === "." || ch === " ") continue;
        const col = ART.palette[ch];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(flip ? w - 1 - x : x, y, 1, 1);
      }
    }
    cache.set(id, cv);
    return cv;
  }

  /* ── deterministic layout ─────────────────────────────────────────────── */
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* A Kanto-style town: a sand route running through grass, house plots
     fronting onto it, tree lines at the edges, a pond, and tall grass where
     nothing was built. Plots are the walkable cells the sim sends agents to. */
  function buildTown(cols, rows, seed) {
    const rnd = mulberry(seed);
    const at = (c, r) => c + r * cols;
    const walk = new Uint8Array(cols * rows);       // 1 = walkable
    const ground = new Uint8Array(cols * rows);     // index into GROUND
    const GROUND = ["grass", "path", "pavement", "tallGrass", "water", "flowers"];
    const G = { grass: 0, path: 1, pavement: 2, tallGrass: 3, water: 4, flowers: 5 };

    const vRoads = [], hRoads = [];
    const BW = 9, BH = 7;
    for (let c = 2; c < cols - 2; c += BW) vRoads.push(c);
    for (let r = 2; r < rows - 2; r += BH) hRoads.push(r);
    vRoads.forEach(c => { for (let r = 0; r < rows; r++) for (let d = 0; d < 2; d++) {
      const i = at(c + d, r); if (c + d < cols) { walk[i] = 1; ground[i] = G.path; } } });
    hRoads.forEach(r => { for (let c = 0; c < cols; c++) for (let d = 0; d < 2; d++) {
      const i = at(c, r + d); if (r + d < rows) { walk[i] = 1; ground[i] = ground[i] === G.path ? G.pavement : G.path; } } });

    const props = [], buildings = [], plots = [];
    const B = ART.buildings || {}, P = ART.props || {};
    const bKeys = Object.keys(B);
    const treeKeys = ["treeA", "treeB"].filter(k => P[k]);

    for (let bi = 0; bi < vRoads.length - 1; bi++) {
      for (let bj = 0; bj < hRoads.length - 1; bj++) {
        const c0 = vRoads[bi] + 2, r0 = hRoads[bj] + 2;
        const c1 = vRoads[bi + 1] - 1, r1 = hRoads[bj + 1] - 1;
        if (c1 - c0 < 2 || r1 - r0 < 2) continue;
        const roll = rnd();

        if (roll < 0.46 && bKeys.length) {           // a house plot
          const key = bKeys[(rnd() * bKeys.length) | 0];
          const def = B[key], g = def.grid || def;
          const bw = Math.ceil(g[0].length / TILE), bh = Math.ceil(g.length / TILE);
          if (c0 + bw - 1 <= c1 && r0 + bh - 1 <= r1) {
            const bc = c0, br = r1 - bh + 1;
            buildings.push({ key, c: bc, r: br,
                             windows: (def.windows || []).map(w => w.slice()),
                             lit: (def.windows || []).map(() => rnd() < 0.45) });
            /* the doorstep: one path tile in front of the door, facing the road */
            const door = at(bc + ((bw / 2) | 0), r1 + 1);
            if (r1 + 1 < rows) { walk[door] = 1; ground[door] = G.path; }
            plots.push({ id: `h${plots.length}`, c: bc + ((bw / 2) | 0), r: r1 + 1, kind: "house" });
          }
        } else if (roll < 0.62) {                    // a pond
          for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++)
            if (c > c0 && c < c1 && r > r0 && r < r1) ground[at(c, r)] = G.water;
          plots.push({ id: `w${plots.length}`, c: c0, r: r1 + 1, kind: "well" });
        } else if (roll < 0.82 && treeKeys.length) { // a grove
          for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) {
            if (rnd() < 0.42) props.push({ key: treeKeys[(rnd() * treeKeys.length) | 0], c, r });
            else if (rnd() < 0.35) ground[at(c, r)] = G.tallGrass;
          }
          plots.push({ id: `t${plots.length}`, c: ((c0 + c1) / 2) | 0, r: r1 + 1, kind: "tree" });
        } else {                                     // a yard
          for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++)
            if (rnd() < 0.3) ground[at(c, r)] = rnd() < 0.5 ? G.flowers : G.tallGrass;
          if (P.fence) for (let c = c0; c <= c1; c++) props.push({ key: "fence", c, r: r1 });
          const kit = ["crate", "barrel", "well", "mailbox", "rockSmall", "stump", "bench"]
            .filter(k => P[k]);
          for (let i = 0; i < 2 && kit.length; i++)
            props.push({ key: kit[(rnd() * kit.length) | 0],
                         c: c0 + ((rnd() * (c1 - c0 + 1)) | 0),
                         r: r0 + ((rnd() * Math.max(1, r1 - r0)) | 0) });
          plots.push({ id: `y${plots.length}`, c: c0, r: r1 + 1, kind: rnd() < .5 ? "depot" : "sign" });
        }
      }
    }
    /* street furniture along the kerbs, never on a walkable cell */
    vRoads.forEach(c => { for (let r = 3; r < rows - 2; r += 6) {
      if (P.lamp && !walk[at(c - 1, r)]) props.push({ key: "lamp", c: c - 1, r });
      if (P.sign && rnd() < .35 && !walk[at(c + 2, r + 2)]) props.push({ key: "sign", c: c + 2, r: r + 2 });
    }});
    /* one chart plot per horizontal route so the surveyors always have work */
    hRoads.forEach((r, i) => {
      const c = 3 + ((i * 11) % Math.max(1, cols - 6));
      if (walk[at(c, r)]) plots.push({ id: `c${i}`, c, r, kind: "chart" });
    });

    return { cols, rows, walk, ground, GROUND, props, buildings, plots,
             groundAt: (c, r) => GROUND[ground[at(c, r)]],
             isWalkable: (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && walk[at(c, r)] === 1 };
  }

  /* ── canvas ───────────────────────────────────────────────────────────── */
  document.body.classList.add("has-city");   // scopes the legibility scrim
  const cv = document.createElement("canvas");
  cv.id = "city";
  cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const ctx = cv.getContext("2d", { alpha: true });

  let scale = scaleFor(innerWidth), town = null, sim = null;
  let cols = 0, rows = 0, worldH = 0, dpr = 1;

  function layout() {
    scale = scaleFor(innerWidth);
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.ceil(innerWidth * dpr);
    cv.height = Math.ceil(innerHeight * dpr);
    cv.style.width = innerWidth + "px";
    cv.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    cols = Math.ceil(innerWidth / (TILE * scale)) + 2;
    /* the world is taller than the viewport: scrolling pans across the map */
    rows = Math.ceil((innerHeight * 2.6) / (TILE * scale)) + 2;
    town = buildTown(cols, rows, 1313);
    worldH = rows * TILE * scale;

    sim = new SIM.Town({ cols, rows, tile: TILE, seed: 20261112,
                         isWalkable: town.isWalkable, plots: town.plots });
    sim.setPopulation(reduced ? 0 : popFor(innerWidth));
    /* a plot the layout walled in is unreachable and the sim skips it in
       silence — better to know, since it means a whole job type can starve */
    const buried = (sim.plots || town.plots).filter(p => p.approach < 0);
    if (buried.length) console.warn(`city: ${buried.length} plot(s) unreachable:`,
      buried.map(p => `${p.id}/${p.kind}`).join(" "));
  }

  /* parallax: the page scrolls faster than the city, so the town drifts */
  function camY() {
    const doc = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const t = Math.min(1, Math.max(0, scrollY / doc));
    return t * Math.max(0, worldH - innerHeight);
  }

  function drawGrid(oy, now) {
    const T = TILE * scale, t = ART.tiles || {};
    const r0 = Math.max(0, Math.floor(oy / T) - 1);
    const r1 = Math.min(rows - 1, Math.ceil((oy + innerHeight) / T) + 1);
    const wf = reduced ? 0 : (now / 520 | 0) % 2;      // water shimmer
    for (let r = r0; r <= r1; r++) {
      for (let c = 0; c < cols; c++) {
        let key = town.groundAt(c, r);
        if (key === "path" && t.roadLineH && r % 7 === 3 && c % 2 === 0) key = "roadLineH";
        let g = t[key] || t.grass;
        if (Array.isArray(g) && Array.isArray(g[0])) g = g[wf % g.length];   // framed tile
        if (!g) continue;
        ctx.drawImage(bake(g, "t:" + key + (Array.isArray(t[key]) ? ":" + wf : "")),
                      c * T, r * T - oy, T, T);
      }
    }
  }

  function drawProps(oy) {
    const T = TILE * scale, P = ART.props;
    for (const p of town.props) {
      const g = P[p.key]; if (!g) continue;
      const h = g.length * scale, y = p.r * T - oy - (h - T);
      if (y > innerHeight || y + h < 0) continue;
      ctx.drawImage(bake(g, "p:" + p.key), p.c * T, y, g[0].length * scale, h);
    }
  }

  function drawBuildings(oy, now) {
    const T = TILE * scale, B = ART.buildings;
    for (const b of town.buildings) {
      const def = B[b.key]; if (!def) continue;
      const g = def.grid || def;
      const h = g.length * scale, y = b.r * T - oy;
      if (y > innerHeight || y + h < 0) continue;
      ctx.drawImage(bake(g, "B:" + b.key), b.c * T, y, g[0].length * scale, h);
      if (!b.windows.length) continue;
      ctx.fillStyle = ART.palette[ART.meta?.windowLit || "W"] || "#c98500";
      for (let i = 0; i < b.windows.length; i++) {
        /* windows breathe slowly and out of phase — the town is awake */
        const on = reduced ? b.lit[i]
          : b.lit[i] !== (Math.sin(now / 4000 + i * 2.1 + b.c) > 0.93);
        if (!on) continue;
        const w = b.windows[i];
        ctx.fillRect(b.c * T + w[0] * scale, y + w[1] * scale, scale, scale);
      }
    }
  }

  function drawAgents(oy) {
    const T = TILE * scale;
    for (const a of sim.agents) {
      const set = ART.actors[a.archetype]; if (!set) continue;
      const west = a.dir === "w";
      const frames = a.state === "work" ? (set.work || set.s) : set[west ? "e" : a.dir] || set.s;
      const g = frames[a.frame % frames.length];
      if (!g) continue;
      const w = g[0].length * scale, h = g.length * scale;
      /* a.x/a.y is the FEET anchor: centred on the cell horizontally, on the
         cell's bottom edge vertically. The sprite hangs above and left of it. */
      const x = Math.round(a.x * scale - w / 2);
      const y = Math.round(a.y * scale - h) - oy;
      if (y > innerHeight || y + h < 0 || x > innerWidth || x + w < 0) continue;
      /* a 1px contact shadow stops them floating over the road */
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(x + scale, y + h - scale, w - 2 * scale, scale);
      ctx.drawImage(bake(g, `a:${a.archetype}:${a.state}:${a.frame}`, west), x, y, w, h);
      if (a.carrying && ART.props.crate)
        ctx.drawImage(bake(ART.props.crate, "p:crate"),
                      Math.round(x + (west ? -6 : w - 2)), Math.round(y + h * 0.42),
                      ART.props.crate[0].length * scale, ART.props.crate.length * scale);
      if (a.speech) drawBark(a, x, y);
    }
  }

  function drawBark(a, x, y) {
    const pad = 5, fs = Math.max(9, 3.4 * scale);
    ctx.font = `${fs}px "Space Grotesk", system-ui, sans-serif`;
    const w = Math.min(ctx.measureText(a.speech).width + pad * 2, 190);
    const bx = Math.min(Math.max(x - w / 2 + 6 * scale, 4), innerWidth - w - 4);
    const by = y - fs - pad * 2 - 2;
    ctx.fillStyle = "rgba(27,21,69,.92)";
    ctx.fillRect(bx, by, w, fs + pad * 2);
    ctx.fillStyle = "#6153d6";
    ctx.fillRect(bx, by, w, 2);
    ctx.fillRect(bx, by + fs + pad * 2 - 2, w, 2);
    ctx.fillStyle = "#c8c3ee";
    ctx.textBaseline = "middle";
    ctx.fillText(a.speech, bx + pad, by + (fs + pad * 2) / 2, w - pad * 2);
  }

  /* ── loop ─────────────────────────────────────────────────────────────── */
  let last = 0, raf = 0, running = true;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(50, now - last || 16);
    last = now;
    if (!running) return;
    if (!reduced) sim.update(dt);
    const oy = camY();
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    drawGrid(oy, now);
    drawProps(oy);
    drawBuildings(oy, now);
    if (!reduced) drawAgents(oy);
  }

  function start() {
    decorate();
    layout();
    cancelAnimationFrame(raf);
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(start, 180); });
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { last = 0; sim && sim.setPopulation(popFor(innerWidth)); }
    else sim && sim.setPopulation(Math.min(3, sim.agents.length));
  });

  /* ── page furniture ───────────────────────────────────────────────────
     The same art is planted in the document itself: a signpost beside every
     section label, a tree or two where sections meet. Inline SVG so it
     inherits the page's pixel rendering and costs nothing to animate. */
  function svgOf(key, px) {
    const g = (ART.props || {})[key];
    if (!g) return "";
    const h = g.length, w = g[0].length, out = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = g[y][x];
      if (ch === "." || ch === " ") continue;
      const col = ART.palette[ch];
      if (col) out.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`);
    }
    return `<svg class="${key} sprite" width="${w * px}" height="${h * px}" viewBox="0 0 ${w} ${h}"
      aria-hidden="true" shape-rendering="crispEdges">${out.join("")}</svg>`;
  }

  let decorated = false;
  function decorate() {
    if (decorated) return;
    decorated = true;
    const signs = svgOf("signpost", 2);
    document.querySelectorAll(".lbl").forEach((el, i) => {
      if (signs) el.insertAdjacentHTML("afterbegin", signs);
      const kit = ["treeA", "treeB", "bush", "lamp", "bench", "hydrant"]
        .filter(k => (ART.props || {})[k]);
      if (!kit.length) return;
      const sec = el.closest("section");
      if (!sec || i % 2) return;
      const row = document.createElement("div");
      row.className = "trees";
      row.setAttribute("aria-hidden", "true");
      row.innerHTML = [kit[i % kit.length], kit[(i + 2) % kit.length]]
        .map(k => svgOf(k, 2)).join("");
      sec.insertBefore(row, el);
    });
  }

  /* the city is decoration: it must never delay the data */
  if (document.readyState === "complete") start();
  else addEventListener("load", start);

  window.CITY = { restart: start, get town() { return town; }, get sim() { return sim; } };
})();
