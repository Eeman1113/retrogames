/* retrogames · stat screen
   Everything on this page is drawn from docs/data.json, which scripts/build_site.py
   recomputes from the same CSVs the notebook uses. No numbers are typed by hand. */

const C = { d1: "#3987e5", d2: "#d95926", d3: "#199e70", neg: "#e66767",
            ink: "#f3f1ff", ink2: "#a9a3d8", ink3: "#776fae",
            panel: "#141033", panel2: "#1b1545", edge: "#e9e6ff" };

/* ── pixel sprites: 12×12 grids, '.' transparent ───────────────────────── */
const SPRITES = {
  hero: ["............","....2222....","...211112...","...213312...",
         "...211112...","....2222....","..11111111..",".3111111113.",
         "...111111...","...11..11...","...22..22...","............"],
  ship: [".....11.....",".....11.....","....1111....","....1331....",
         "...111111...","...111111...","..11111111..",".1111111111.",
         ".11.1111.11.",".1...22...1.",".....22.....","............"],
  fist: ["............","...11.11....","..11111111..",".1111111111.",
         ".1111111111.",".1111111111.",".1111111111.",".111111111..",
         "..21111111..","..22111122..","...222222...","............"],
  slime:["............","............","....1111....","...111111...",
         "..13111131..","..11111111..",".1111111111.",".1111111111.",
         ".1111111111.","..11111111..","...222222...","............"],
  key:  ["...1111.....","..11..11....","..11..11....","...1111.....",
         "....11......","....11......","....1111....","....11......",
         "....11......","....1111....","............","............"],
  ghost:["............","....1111....","..11111111..",".1111111111.",
         ".1133113311.",".1133113311.",".1111111111.",".1111111111.",
         ".1111111111.",".1111111111.",".11.11.11.11","............"],
  crown:["............","............","..1..1..1...","..1..1..1...",
         "..11.11.11..","..11111111..","..11111111..","..13113113..",
         "..11111111..","..22222222..","............","............"],
  suit: ["............","...111111...","..11111111..","..13311331..",
         "..11111111..","..11111111..","...111111...","..11111111..",
         ".1111111111.",".11.1111.11.","....1..1....","............"],
  box:  ["............","............",".1111111111.",".1211111121.",
         ".1121112111.",".1112211211.",".1112211211.",".1121112111.",
         ".1211111121.",".1111111111.","............","............"],
  cart: ["............","..11111111..","..13333331..","..13333331..",
         "..11111111..","..11111111..","..11111111..",".1111111111.",
         ".1122222211.",".1122222211.",".1111111111.","............"],
};
const SKIN = {
  hero:{1:C.d1,2:"#2a5fa8",3:C.edge}, ship:{1:C.d3,2:C.d2,3:C.edge},
  fist:{1:C.d2,2:"#9c3d19",3:C.edge}, slime:{1:C.d3,2:"#10654a",3:C.edge},
  key:{1:"#c9a227",2:"#8a6f16",3:C.edge}, ghost:{1:"#8e86d8",2:"#5b55a0",3:C.panel},
  crown:{1:"#c9a227",2:"#8a6f16",3:C.panel}, suit:{1:C.d1,2:"#2a5fa8",3:C.panel},
  box:{1:"#a07a4a",2:"#6b4e2c",3:C.edge}, cart:{1:"#6153d6",2:"#2b2270",3:C.panel},
};

function sprite(name, px = 4) {
  const g = SPRITES[name] || SPRITES.cart, skin = SKIN[name] || SKIN.cart;
  const n = g.length, cells = [];
  g.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== ".") cells.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${skin[ch] || C.edge}"/>`);
  }));
  return `<svg class="sprite" width="${n * px}" height="${n * px}" viewBox="0 0 ${n} ${n}"
    role="img" aria-hidden="true" shape-rendering="crispEdges">${cells.join("")}</svg>`;
}

/* ── tooltip ───────────────────────────────────────────────────────────── */
const tip = document.getElementById("tip");
function hoverable(el, html) {
  el.addEventListener("pointerenter", e => {
    tip.innerHTML = html; tip.style.opacity = 1; move(e);
  });
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", () => (tip.style.opacity = 0));
  function move(e) {
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.min(e.clientX + 16, innerWidth - r.width - 12) + "px";
    tip.style.top = Math.max(e.clientY - r.height - 14, 10) + "px";
  }
}
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

/* ── build ─────────────────────────────────────────────────────────────── */
fetch("data.json").then(r => r.json()).then(D => {
  const q = s => document.querySelector(s);

  /* title-screen sprite row */
  q("#crew").innerHTML = ["hero", "slime", "ship", "ghost", "fist"]
    .map(s => sprite(s, 5)).join("");

  /* stat tiles */
  const c = D.counts;
  q("#tiles").innerHTML = [
    [c.systems, "systems, Game &amp; Watch to PSP"],
    [c.games, "games picked, 5 per system"],
    [c.developers, "studios behind them"],
    [c.adj_r2, "adj. R² of the quality model"],
  ].map(([v, k]) => `<div class="win win--flat tile">
      <span class="stat-v">${v}</span><span class="stat-k">${k}</span></div>`).join("");

  /* ── the paradox: three correlations, signed → diverging ─────────────── */
  const mid = 50; // % position of zero
  q("#paradox").innerHTML = D.paradox.map(p => {
    const w = Math.abs(p.rho) * 45, pos = p.rho < 0 ? mid - w : mid;
    const col = p.rho < 0 ? C.neg : C.d1;
    const sig = p.p < 0.001 ? "p &lt; 0.001" : `p = ${p.p.toFixed(2)}`;
    return `<div class="meter-row">
      <span class="meter-k">${p.label}<br><span class="small dim">n = ${p.n} · ${sig}</span></span>
      <span class="meter-track" data-tip="${esc(p.note)}">
        <u style="left:${mid}%"></u>
        <i style="left:${pos}%;width:${w}%;background:${col}"></i>
        <span class="meter-v" style="${p.rho < 0 ? `right:${100 - pos + 1.5}%` : `left:${mid + w + 1.5}%`};color:${col}">${p.rho > 0 ? "+" : ""}${p.rho.toFixed(3)}</span>
      </span></div>`;
  }).join("");
  document.querySelectorAll("#paradox .meter-track").forEach(el =>
    hoverable(el, el.dataset.tip));
  q("#paradox-table").innerHTML = table(
    ["view", "ρ", "n"],
    D.paradox.map(p => [p.label, (p.rho > 0 ? "+" : "") + p.rho.toFixed(3), p.n]), [1, 2]);

  /* ── scatter: install base vs library quality ────────────────────────── */
  scatter(q("#scatter"), D.scatter);
  q("#scatter-table").innerHTML = table(
    ["system", "units (M)", "library", "mean canon"],
    [...D.scatter].sort((a, b) => b.canon - a.canon)
      .map(d => [d.name, d.units.toFixed(2), d.lib, d.canon]), [1, 2, 3]);

  /* ── residual leaderboard ────────────────────────────────────────────── */
  bars(q("#resid"), D.residuals);
  q("#resid-table").innerHTML = table(
    ["system", "units (M)", "mean canon", "residual"],
    D.residuals.map(d => [d.name, d.units.toFixed(2), d.canon,
      (d.resid > 0 ? "+" : "") + d.resid.toFixed(1)]), [1, 2, 3]);

  /* ── party: genre families ───────────────────────────────────────────── */
  const gmax = Math.max(...D.genres.map(g => g.n));
  q("#party").innerHTML = D.genres.map(g => `<div class="party-row" data-tip="${esc(g.family)}: ${g.n} of ${c.games} picks">
      ${sprite(g.sprite, 3)}
      <span class="small">${g.family}</span>
      <span class="party-bar" style="width:${(g.n / gmax) * 100}%"></span>
      <span class="party-n">${g.n}</span></div>`).join("");
  document.querySelectorAll("#party .party-row").forEach(el => hoverable(el, el.dataset.tip));

  /* ── lag histogram ───────────────────────────────────────────────────── */
  hist(q("#lag"), D.lag_hist, c.median_lag);

  /* ── high scores ─────────────────────────────────────────────────────── */
  q("#top").innerHTML = table(
    ["game", "system", "year", "canon"],
    D.top.map(t => [t.game, t.system, t.year, t.score]), [2, 3]);

  /* inline numbers in the prose */
  document.querySelectorAll("[data-n]").forEach(el => {
    const v = el.dataset.n.split(".").reduce((o, k) => o?.[k], D);
    if (v !== undefined) el.textContent = v;
  });
});

/* ── chart primitives (SVG, crisp edges, chunky marks) ─────────────────── */
function svg(el, w, h, body, label) {
  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges"
     role="img" aria-label="${esc(label)}">${body}</svg>`;
}

function scatter(el, data) {
  const W = 760, H = 420, M = { l: 54, r: 18, t: 16, b: 48 };
  const xs = data.map(d => Math.log10(d.units)), ys = data.map(d => d.canon);
  const x0 = Math.min(...xs) - .15, x1 = Math.max(...xs) + .15;
  const y0 = Math.floor(Math.min(...ys) / 5) * 5, y1 = Math.ceil(Math.max(...ys) / 5) * 5;
  const X = v => M.l + (v - x0) / (x1 - x0) * (W - M.l - M.r);
  const Y = v => H - M.b - (v - y0) / (y1 - y0) * (H - M.t - M.b);
  const GRP = { Console: C.d1, Handheld: C.d2 };
  const col = d => GRP[d.cat] || C.d3;

  let g = "";
  for (let v = y0; v <= y1; v += 10)
    g += `<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.panel2}" stroke-width="2"/>
          <text x="${M.l - 10}" y="${Y(v) + 5}" text-anchor="end" font-size="13">${v}</text>`;
  [-1, 0, 1, 2].forEach(v => { if (v >= x0 && v <= x1)
    g += `<text x="${X(v)}" y="${H - M.b + 24}" text-anchor="middle" font-size="13">${["0.1M","1M","10M","100M"][v+1]}</text>`; });
  g += `<text x="${(M.l + W - M.r) / 2}" y="${H - 6}" text-anchor="middle" font-size="13" fill="${C.ink3}">lifetime hardware units shipped</text>`;

  // least-squares guide line, drawn stepped so it stays in the pixel idiom
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  const b1 = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) /
             xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const steps = [];
  for (let i = 0; i <= 14; i++) {
    const xv = x0 + (x1 - x0) * i / 14, yv = my + b1 * (xv - mx);
    steps.push(`${X(xv)},${Y(yv)}`);
  }
  g += `<polyline points="${steps.join(" ")}" fill="none" stroke="${C.ink3}"
        stroke-width="3" stroke-dasharray="8 8"/>`;

  data.forEach(d => {
    g += `<rect class="mark" x="${X(Math.log10(d.units)) - 5}" y="${Y(d.canon) - 5}"
          width="10" height="10" fill="${col(d)}"
          data-tip="<b>${esc(d.name)}</b><br>${d.units}M units · ${d.lib} titles<br>mean canon ${d.canon}"/>`;
  });
  // selective direct labels: the two extremes only
  const resid = d => d.canon - (my + b1 * (Math.log10(d.units) - mx));
  const lab = [data.reduce((a, b) => (a.units > b.units ? a : b)),
               data.reduce((a, b) => (a.canon < b.canon ? a : b)),
               data.reduce((a, b) => (resid(a) > resid(b) ? a : b))];
  lab.forEach(d => {
    g += `<text class="vlab" x="${X(Math.log10(d.units))}" y="${Y(d.canon) - 14}"
          text-anchor="middle">${esc(d.name)}</text>`;
  });
  svg(el, W, H, g, "Lifetime hardware units versus the mean canon score of each platform's five picks");
  el.querySelectorAll(".mark").forEach(m => hoverable(m, m.dataset.tip));
}

function bars(el, data) {
  const W = 760, rowH = 34, M = { l: 200, r: 60, t: 10, b: 32 };
  const H = M.t + data.length * rowH + M.b;
  const max = Math.max(...data.map(d => Math.abs(d.resid))) * 1.02;
  const zero = M.l + (W - M.l - M.r) / 2;
  const scale = (W - M.l - M.r) / 2 / max;
  let g = `<line x1="${zero}" x2="${zero}" y1="${M.t}" y2="${H - M.b}" stroke="${C.ink3}" stroke-width="2"/>`;
  data.forEach((d, i) => {
    const y = M.t + i * rowH + 6, w = Math.abs(d.resid) * scale;
    const x = d.resid < 0 ? zero - w : zero, col = d.resid < 0 ? C.neg : C.d1;
    g += `<rect class="mark" x="${x}" y="${y}" width="${w}" height="${rowH - 14}" fill="${col}"
           data-tip="<b>${esc(d.name)}</b><br>${d.units}M units · mean canon ${d.canon}<br>${d.resid > 0 ? "+" : ""}${d.resid} vs predicted"/>
          <text x="${M.l - 14}" y="${y + rowH - 20}" text-anchor="end" font-size="13" fill="${C.ink}">${esc(d.name)}</text>
          <text class="vlab" x="${d.resid < 0 ? x + 8 : x + w - 8}" y="${y + rowH - 20}"
                text-anchor="${d.resid < 0 ? "start" : "end"}" fill="#0b0820">${d.resid > 0 ? "+" : ""}${d.resid}</text>`;
  });
  g += `<text x="${zero}" y="${H - 8}" text-anchor="middle" font-size="13" fill="${C.ink3}">← under predicted · canon points · over predicted →</text>`;
  svg(el, W, H, g, "Residual canon score by platform, above or below what install base and library size predict");
  el.querySelectorAll(".mark").forEach(m => hoverable(m, m.dataset.tip));
}

function hist(el, data, median) {
  const W = 760, H = 240, M = { l: 44, r: 12, t: 14, b: 44 };
  const max = Math.max(...data.map(d => d.n));
  const bw = (W - M.l - M.r) / data.length;
  let g = "";
  data.forEach((d, i) => {
    const h = (d.n / max) * (H - M.t - M.b);
    g += `<rect class="mark" x="${M.l + i * bw + 3}" y="${H - M.b - h}" width="${bw - 6}" height="${h}"
           fill="${C.d1}" data-tip="${d.n} picks arrived ${d.lag} year${d.lag === 1 ? "" : "s"} after launch"/>
          <text x="${M.l + i * bw + bw / 2}" y="${H - M.b + 20}" text-anchor="middle" font-size="12">${d.lag}</text>`;
  });
  const mi = data.findIndex(d => d.lag === median);
  g += `<line x1="${M.l + mi * bw + bw / 2}" x2="${M.l + mi * bw + bw / 2}" y1="${M.t}" y2="${H - M.b}"
        stroke="${C.d2}" stroke-width="3"/>
        <text class="vlab" x="${M.l + mi * bw + bw / 2 + 10}" y="${M.t + 12}" fill="${C.d2}">median ${median}y</text>
        <text x="${(M.l + W - M.r) / 2}" y="${H - 8}" text-anchor="middle" font-size="13" fill="${C.ink3}">years after the platform launched</text>`;
  svg(el, W, H, g, "Distribution of how many years after launch each pick was released");
  el.querySelectorAll(".mark").forEach(m => hoverable(m, m.dataset.tip));
}

function table(head, rows, numCols = []) {
  const th = head.map((h, i) => `<th class="${numCols.includes(i) ? "num" : ""}">${h}</th>`).join("");
  const tr = rows.map(r => "<tr>" + r.map((v, i) =>
    `<td class="${numCols.includes(i) ? "num" : ""}">${esc(v)}</td>`).join("") + "</tr>").join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}
