/* retrogames · stat screen
   Every number and every mark on this page comes from docs/data.json, which
   scripts/build_site.py recomputes from the same CSVs the notebook uses. */

const C = { d1:"#3987e5", d2:"#d95926", d3:"#199e70", d4:"#c98500", neg:"#e66767",
            ink:"#f3f1ff", ink2:"#a9a3d8", ink3:"#776fae",
            panel:"#141033", panel2:"#1b1545", edge:"#e9e6ff" };
/* one-hue sequential ramp for magnitude (heatmaps) — never a rainbow */
const SEQ = ["#171a3d","#1b2f5e","#1d4380","#1d57a2","#2a78d6","#5598e7","#86b6ef","#b7d3f6"];

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
  coin: ["............","....1111....","..11222211..","..12111121..",
         ".1211331121.",".1211331121.",".1211331121.",".1211331121.",
         "..12111121..","..11222211..","....1111....","............"],
  clock:["............","...111111...","..11111111..",".1111111111.",
         ".1113111111.",".1113111111.",".1113331111.",".1111111111.",
         ".1111111111.","..11111111..","...111111...","............"],
  skull:["............","...111111...","..11111111..",".1111111111.",
         ".1133113311.",".1133113311.",".1111111111.",".1111221111.",
         "..11111111..","..1.1111.1..","..1.1..1.1..","............"],
  heart:["............","..111..111..",".1111111111.",".1111111111.",
         ".1111111111.","..11111111..","...111111...","....1111....",
         ".....11.....","............","............","............"],
};
const SKIN = {
  hero:{1:C.d1,2:"#2a5fa8",3:C.edge},    ship:{1:C.d3,2:C.d2,3:C.edge},
  fist:{1:C.d2,2:"#9c3d19",3:C.edge},    slime:{1:C.d3,2:"#10654a",3:C.edge},
  key:{1:"#c9a227",2:"#8a6f16",3:C.edge},ghost:{1:"#8e86d8",2:"#5b55a0",3:C.panel},
  crown:{1:"#c9a227",2:"#8a6f16",3:C.panel}, suit:{1:C.d1,2:"#2a5fa8",3:C.panel},
  box:{1:"#a07a4a",2:"#6b4e2c",3:C.edge},cart:{1:"#6153d6",2:"#2b2270",3:C.panel},
  coin:{1:"#c9a227",2:"#8a6f16",3:C.edge}, clock:{1:C.edge,2:"#8a86b8",3:"#2b2270"},
  skull:{1:C.edge,2:"#8a86b8",3:"#2b2270"}, heart:{1:C.neg,2:"#9c2f2f",3:C.edge},
};
function sprite(name, px = 4) {
  const g = SPRITES[name] || SPRITES.cart, skin = SKIN[name] || SKIN.cart, cells = [];
  g.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== ".") cells.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${skin[ch]||C.edge}"/>`);
  }));
  return `<svg class="sprite" width="${12*px}" height="${12*px}" viewBox="0 0 12 12"
    aria-hidden="true" shape-rendering="crispEdges">${cells.join("")}</svg>`;
}

/* ── helpers ───────────────────────────────────────────────────────────── */
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const q = s => document.querySelector(s);
const tip = () => document.getElementById("tip");
function hoverable(el, html) {
  el.addEventListener("pointerenter", e => { tip().innerHTML = html; tip().style.opacity = 1; move(e); });
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", () => (tip().style.opacity = 0));
  function move(e) {
    const r = tip().getBoundingClientRect();
    tip().style.left = Math.min(e.clientX + 16, innerWidth - r.width - 12) + "px";
    tip().style.top = Math.max(e.clientY - r.height - 14, 10) + "px";
  }
}
const bindTips = root => root.querySelectorAll("[data-tip]").forEach(m => hoverable(m, m.dataset.tip));
function svg(el, w, h, body, label) {
  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" role="img"
     aria-label="${esc(label)}">${body}</svg>`;
  bindTips(el);
}
function table(head, rows, numCols = []) {
  const th = head.map((h,i) => `<th class="${numCols.includes(i)?"num":""}">${h}</th>`).join("");
  const tr = rows.map(r => "<tr>" + r.map((v,i) =>
    `<td class="${numCols.includes(i)?"num":""}">${esc(v)}</td>`).join("") + "</tr>").join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}
const EXLBL = {exclusive:"platform exclusive", regional:"region-locked",
               "arcade-only":"never ported", multi:"multi-platform"};
const catColor = c => c === "Console" ? C.d1 : c === "Handheld" ? C.d2 : C.d3;

/* ── main ──────────────────────────────────────────────────────────────── */
let D;
fetch("data.json").then(r => r.json()).then(data => { D = data; build(); });

function build() {
  const c = D.counts;

  q("#crew").innerHTML = ["hero","slime","ship","ghost","fist"].map(s => sprite(s,5)).join("");

  /* tiles */
  q("#tiles").innerHTML = [
    [c.systems, "systems, Game &amp; Watch to PSP"],
    [c.games, "games picked, 5 per system"],
    [c.developers, "studios behind them"],
    [c.span + "y", `of releases, ${c.years[0]}–${c.years[1]}`],
    [c.exclusive_pct + "%", "locked to one platform"],
    [c.total_units + "M", "units of hardware shipped"],
    [c.total_library.toLocaleString(), "titles in the libraries searched"],
    [c.adj_r2, "adj. R² of the quality model"],
  ].map(([v,k]) => `<div class="win win--flat tile">
      <span class="stat-v">${v}</span><span class="stat-k">${k}</span></div>`).join("");

  /* records */
  q("#records").innerHTML = D.records.map(r => `<div class="win win--flat rec">
      ${sprite(r.s, 3)}
      <div><span class="rec-k">${esc(r.k)}</span>
      <span class="rec-v">${esc(r.v)}</span>
      <span class="rec-d">${esc(r.d)}</span></div></div>`).join("");

  /* paradox meters */
  const mid = 50;
  q("#paradox").innerHTML = D.paradox.map(p => {
    const w = Math.abs(p.rho)*45, pos = p.rho < 0 ? mid - w : mid;
    const col = p.rho < 0 ? C.neg : C.d1;
    const sig = p.p < 0.001 ? "p &lt; 0.001" : `p = ${p.p.toFixed(2)}`;
    return `<div class="meter-row">
      <span class="meter-k">${p.label}<br><span class="small dim">n = ${p.n} · ${sig}</span></span>
      <span class="meter-track" data-tip="${esc(p.note)}"><u style="left:${mid}%"></u>
        <i style="left:${pos}%;width:${w}%;background:${col}"></i>
        <span class="meter-v" style="${p.rho<0?`right:${100-pos+1.5}%`:`left:${mid+w+1.5}%`};color:${col}">${p.rho>0?"+":""}${p.rho.toFixed(3)}</span>
      </span></div>`;
  }).join("");
  bindTips(q("#paradox"));
  q("#paradox-table").innerHTML = table(["view","ρ","n"],
    D.paradox.map(p => [p.label,(p.rho>0?"+":"")+p.rho.toFixed(3),p.n]), [1,2]);

  hist(q("#lag"), D.lag_hist, c.median_lag);
  dots(q("#lagcat"), D.lag_by_cat);
  years(q("#years"), D.year_hist);
  timeline(q("#timeline"), D.timeline);
  scatter(q("#scatter"), D.scatter);
  bars(q("#resid"), D.residuals);
  unitsBar(q("#units"), D.units_bar);
  biplot(q("#pca"), D.pca);
  heatmap(q("#heat"), D.heat);
  lorenz(q("#lorenz"), D.lorenz, c.gini);
  stacked(q("#lockin"), D.excl_by_maker);
  missing(q("#missing"), D.missing);
  mediaBar(q("#media"), D.media_mix);

  /* tables behind the charts */
  q("#scatter-table").innerHTML = table(["system","units (M)","library","mean canon","residual"],
    [...D.scatter].sort((a,b)=>b.canon-a.canon)
      .map(d=>[d.name,d.units.toFixed(2),d.lib,d.canon,(d.resid>0?"+":"")+d.resid.toFixed(1)]),[1,2,3,4]);
  q("#resid-table").innerHTML = table(["system","units (M)","mean canon","residual"],
    D.residuals.map(d=>[d.name,d.units.toFixed(2),d.canon,(d.resid>0?"+":"")+d.resid.toFixed(1)]),[1,2,3]);
  q("#timeline-table").innerHTML = table(["system","launched","first pick","last pick","mean canon"],
    D.timeline.map(t=>[t.name,t.launch,t.first,t.last,t.canon]),[1,2,3,4]);

  /* genre party */
  const gmax = Math.max(...D.genres.map(g=>g.n));
  q("#party").innerHTML = D.genres.map(g => `<div class="party-row"
      data-tip="<b>${esc(g.family)}</b><br>${g.n} of ${c.games} picks · mean canon ${g.mean}<br>strongest: ${esc(g.top)}">
      ${sprite(g.sprite,3)}<span class="small">${g.family}</span>
      <span class="party-bar" style="width:${(g.n/gmax)*100}%"></span>
      <span class="party-n">${g.n}</span></div>`).join("");
  bindTips(q("#party"));

  /* studios */
  const dmax = D.devs[0].n;
  q("#devs").innerHTML = D.devs.map(d => `<div class="party-row"
      data-tip="<b>${esc(d.name)}</b><br>${d.n} picks across ${d.systems} system${d.systems>1?"s":""}<br>strongest: ${esc(d.top)}">
      <span class="dev-n">${d.n}</span><span class="small">${esc(d.name)}</span>
      <span class="party-bar" style="width:${(d.n/dmax)*100}%"></span>
      <span class="party-n">${d.systems}×</span></div>`).join("");
  bindTips(q("#devs"));

  /* the full roster */
  roster();
  /* the searchable index of all 205 */
  explorer();

  q("#top").innerHTML = table(["game","system","developer","year","canon"],
    D.top.map(t=>[t.game,t.system,t.dev,t.year,t.score]),[3,4]);
  q("#tools").innerHTML = table(["tool","purpose","why it matters"],
    D.tools.map(t=>[t.tool,t.purpose,t.note]));

  document.querySelectorAll("[data-n]").forEach(el => {
    const v = el.dataset.n.split(".").reduce((o,k)=>o?.[k], D);
    if (v !== undefined) el.textContent = v;
  });
}

/* ── charts ────────────────────────────────────────────────────────────── */
function hist(el, data, median) {
  const W=760,H=240,M={l:44,r:12,t:14,b:44};
  const max=Math.max(...data.map(d=>d.n)), bw=(W-M.l-M.r)/data.length;
  let g="";
  data.forEach((d,i)=>{ const h=(d.n/max)*(H-M.t-M.b);
    g+=`<rect class="mark" x="${M.l+i*bw+3}" y="${H-M.b-h}" width="${bw-6}" height="${h}" fill="${C.d1}"
         data-tip="${d.n} picks arrived ${d.lag} year${d.lag===1?"":"s"} after launch"/>
        <text x="${M.l+i*bw+bw/2}" y="${H-M.b+20}" text-anchor="middle" font-size="12">${d.lag}</text>`; });
  const mi=data.findIndex(d=>d.lag===median), mx=M.l+mi*bw+bw/2;
  g+=`<line x1="${mx}" x2="${mx}" y1="${M.t}" y2="${H-M.b}" stroke="${C.d2}" stroke-width="3"/>
      <text class="vlab" x="${mx+10}" y="${M.t+12}" fill="${C.d2}">median ${median}y</text>
      <text x="${(M.l+W-M.r)/2}" y="${H-8}" text-anchor="middle" font-size="13" fill="${C.ink3}">years after the platform launched</text>`;
  svg(el,W,H,g,"Picks by years elapsed since their platform launched");
}

function dots(el, data) {
  const W=380,rowH=34,M={l:110,r:54,t:10,b:30}, H=M.t+data.length*rowH+M.b;
  const max=Math.max(...data.map(d=>d.median))*1.3;
  let g="";
  data.forEach((d,i)=>{ const y=M.t+i*rowH+rowH/2, x=M.l+(d.median/max)*(W-M.l-M.r);
    g+=`<line x1="${M.l}" x2="${x}" y1="${y}" y2="${y}" stroke="${C.panel2}" stroke-width="3"/>
        <rect class="mark" x="${x-6}" y="${y-6}" width="12" height="12" fill="${C.d1}"
          data-tip="<b>${esc(d.cat)}</b><br>median ${d.median} years after launch · ${d.n} picks"/>
        <text x="${M.l-12}" y="${y+5}" text-anchor="end" font-size="13" fill="${C.ink}">${esc(d.cat)}</text>
        <text class="vlab" x="${x+12}" y="${y+4}" fill="${C.ink2}">${d.median}y</text>`; });
  g+=`<text x="${(M.l+W-M.r)/2}" y="${H-6}" text-anchor="middle" font-size="12" fill="${C.ink3}">median lag by platform type</text>`;
  svg(el,W,H,g,"Median release lag by platform category");
}

function years(el, data) {
  const W=760,H=200,M={l:40,r:12,t:16,b:40};
  const y0=data[0].year, y1=data[data.length-1].year, span=y1-y0+1;
  const bw=(W-M.l-M.r)/span, max=Math.max(...data.map(d=>d.n));
  const byYear=Object.fromEntries(data.map(d=>[d.year,d.n]));
  let g="";
  for(let y=y0;y<=y1;y++){
    const n=byYear[y]||0, h=(n/max)*(H-M.t-M.b), x=M.l+(y-y0)*bw;
    g+=`<rect class="mark" x="${x+1.5}" y="${H-M.b-h}" width="${bw-3}" height="${Math.max(h,1)}"
         fill="${n?C.d1:C.panel2}" data-tip="${y}: ${n} pick${n===1?"":"s"}"/>`;
    if(y%5===0) g+=`<text x="${x+bw/2}" y="${H-M.b+18}" text-anchor="middle" font-size="12">${y}</text>`;
  }
  g+=`<text x="${(M.l+W-M.r)/2}" y="${H-6}" text-anchor="middle" font-size="12" fill="${C.ink3}">picks per release year</text>`;
  svg(el,W,H,g,"Number of picks released in each year");
}

function timeline(el, data) {
  const W=760,rowH=19,M={l:190,r:24,t:16,b:34}, H=M.t+data.length*rowH+M.b;
  const x0=Math.min(...data.map(d=>d.launch))-1, x1=Math.max(...data.map(d=>d.last))+1;
  const X=v=>M.l+(v-x0)/(x1-x0)*(W-M.l-M.r);
  let g="";
  for(let y=1980;y<=2010;y+=5)
    g+=`<line x1="${X(y)}" x2="${X(y)}" y1="${M.t-6}" y2="${H-M.b}" stroke="${C.panel2}" stroke-width="2"/>
        <text x="${X(y)}" y="${H-M.b+18}" text-anchor="middle" font-size="12">${y}</text>`;
  data.forEach((d,i)=>{ const y=M.t+i*rowH+rowH/2;
    g+=`<g class="mark" data-tip="<b>${esc(d.name)}</b><br>launched ${d.launch} · picks span ${d.first}–${d.last}<br>mean canon ${d.canon}">
        <rect x="${M.l-6}" y="${y-rowH/2}" width="${W-M.l-M.r+10}" height="${rowH}" fill="transparent"/>
        <line x1="${X(d.first)}" x2="${X(d.last)}" y1="${y}" y2="${y}" stroke="${catColor(d.cat)}" stroke-width="7" opacity=".55"/>
        <rect x="${X(d.launch)-1.5}" y="${y-7}" width="3" height="14" fill="${C.ink3}"/>
        <rect x="${X(d.first)-3}" y="${y-3}" width="6" height="6" fill="${catColor(d.cat)}"/>
        <rect x="${X(d.last)-3}" y="${y-3}" width="6" height="6" fill="${catColor(d.cat)}"/>
        <text x="${M.l-14}" y="${y+4}" text-anchor="end" font-size="11.5" fill="${C.ink}">${esc(d.name)}</text></g>`; });
  svg(el,W,H,g,"Each system's hardware launch and the span of its five picks");
}

function scatter(el, data) {
  const W=760,H=430,M={l:54,r:18,t:16,b:50};
  const xs=data.map(d=>Math.log10(d.units)), ys=data.map(d=>d.canon);
  const x0=Math.min(...xs)-.15,x1=Math.max(...xs)+.15;
  const y0=Math.floor(Math.min(...ys)/5)*5, y1=Math.ceil(Math.max(...ys)/5)*5;
  const X=v=>M.l+(v-x0)/(x1-x0)*(W-M.l-M.r), Y=v=>H-M.b-(v-y0)/(y1-y0)*(H-M.t-M.b);
  let g="";
  for(let v=y0;v<=y1;v+=10)
    g+=`<line x1="${M.l}" x2="${W-M.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C.panel2}" stroke-width="2"/>
        <text x="${M.l-10}" y="${Y(v)+5}" text-anchor="end" font-size="13">${v}</text>`;
  [-1,0,1,2].forEach(v=>{ if(v>=x0&&v<=x1)
    g+=`<text x="${X(v)}" y="${H-M.b+24}" text-anchor="middle" font-size="13">${["0.1M","1M","10M","100M"][v+1]}</text>`;});
  g+=`<text x="${(M.l+W-M.r)/2}" y="${H-8}" text-anchor="middle" font-size="13" fill="${C.ink3}">lifetime hardware units shipped</text>`;
  const n=xs.length,mx=xs.reduce((a,b)=>a+b)/n,my=ys.reduce((a,b)=>a+b)/n;
  const b1=xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/xs.reduce((s,x)=>s+(x-mx)**2,0);
  const pts=[];for(let i=0;i<=14;i++){const xv=x0+(x1-x0)*i/14;pts.push(`${X(xv)},${Y(my+b1*(xv-mx))}`);}
  g+=`<polyline points="${pts.join(" ")}" fill="none" stroke="${C.ink3}" stroke-width="3" stroke-dasharray="8 8"/>`;
  data.forEach(d=>{ g+=`<rect class="mark" x="${X(Math.log10(d.units))-5}" y="${Y(d.canon)-5}" width="10" height="10"
      fill="${catColor(d.cat)}" data-tip="<b>${esc(d.name)}</b><br>${d.units}M units · ${d.lib} titles<br>mean canon ${d.canon} · residual ${d.resid>0?"+":""}${d.resid.toFixed(1)}"/>`;});
  [data.reduce((a,b)=>a.units>b.units?a:b), data.reduce((a,b)=>a.canon<b.canon?a:b),
   data.reduce((a,b)=>a.resid>b.resid?a:b)].forEach(d=>{
    g+=`<text class="vlab" x="${X(Math.log10(d.units))}" y="${Y(d.canon)-14}" text-anchor="middle">${esc(d.name)}</text>`;});
  svg(el,W,H,g,"Lifetime hardware units versus mean canon score per platform");
}

function bars(el, data) {
  const W=760,rowH=32,M={l:200,r:40,t:10,b:32}, H=M.t+data.length*rowH+M.b;
  const max=Math.max(...data.map(d=>Math.abs(d.resid)))*1.02;
  const zero=M.l+(W-M.l-M.r)/2, scale=(W-M.l-M.r)/2/max;
  let g=`<line x1="${zero}" x2="${zero}" y1="${M.t}" y2="${H-M.b}" stroke="${C.ink3}" stroke-width="2"/>`;
  data.forEach((d,i)=>{ const y=M.t+i*rowH+5, w=Math.abs(d.resid)*scale;
    const x=d.resid<0?zero-w:zero, col=d.resid<0?C.neg:C.d1;
    g+=`<rect class="mark" x="${x}" y="${y}" width="${w}" height="${rowH-13}" fill="${col}"
         data-tip="<b>${esc(d.name)}</b><br>${d.units}M units · mean canon ${d.canon}<br>${d.resid>0?"+":""}${d.resid} vs predicted"/>
        <text x="${M.l-14}" y="${y+rowH-19}" text-anchor="end" font-size="13" fill="${C.ink}">${esc(d.name)}</text>
        <text class="vlab" x="${d.resid<0?x+8:x+w-8}" y="${y+rowH-19}" text-anchor="${d.resid<0?"start":"end"}"
          fill="#0b0820">${d.resid>0?"+":""}${d.resid}</text>`;});
  g+=`<text x="${zero}" y="${H-8}" text-anchor="middle" font-size="13" fill="${C.ink3}">← under predicted · canon points · over predicted →</text>`;
  svg(el,W,H,g,"Residual canon score by platform");
}

function unitsBar(el, data) {
  const W=760,rowH=20,M={l:190,r:70,t:10,b:30}, H=M.t+data.length*rowH+M.b;
  const max=Math.log10(Math.max(...data.map(d=>d.units)))+.15;
  const min=Math.log10(Math.min(...data.map(d=>d.units)))-.15;
  const X=v=>(Math.log10(v)-min)/(max-min)*(W-M.l-M.r);
  let g="";
  [0.1,1,10,100].forEach(v=>{ if(Math.log10(v)>=min&&Math.log10(v)<=max)
    g+=`<line x1="${M.l+X(v)}" x2="${M.l+X(v)}" y1="${M.t-4}" y2="${H-M.b}" stroke="${C.panel2}" stroke-width="2"/>
        <text x="${M.l+X(v)}" y="${H-M.b+18}" text-anchor="middle" font-size="12">${v<1?"0.1M":v+"M"}</text>`;});
  data.forEach((d,i)=>{ const y=M.t+i*rowH+3;
    g+=`<rect class="mark" x="${M.l}" y="${y}" width="${Math.max(X(d.units),2)}" height="${rowH-7}" fill="${catColor(d.cat)}"
         data-tip="<b>${esc(d.name)}</b><br>${d.units}M units shipped"/>
        <text x="${M.l-12}" y="${y+rowH-9}" text-anchor="end" font-size="11.5" fill="${C.ink}">${esc(d.name)}</text>
        <text class="vlab" x="${M.l+X(d.units)+8}" y="${y+rowH-9}" fill="${C.ink2}">${d.units}</text>`;});
  svg(el,W,H,g,"Lifetime hardware units shipped per system, log scale");
}

function biplot(el, p) {
  const W=760,H=470,M=40;
  const xs=p.points.map(d=>d.x), ys=p.points.map(d=>d.y);
  const x0=Math.min(...xs)-.6,x1=Math.max(...xs)+.6,y0=Math.min(...ys)-.5,y1=Math.max(...ys)+.5;
  const X=v=>M+(v-x0)/(x1-x0)*(W-2*M), Y=v=>H-M-(v-y0)/(y1-y0)*(H-2*M-14);
  let g=`<line x1="${M}" x2="${W-M}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.panel2}" stroke-width="2"/>
         <line x1="${X(0)}" x2="${X(0)}" y1="${M}" y2="${H-M}" stroke="${C.panel2}" stroke-width="2"/>`;
  p.loadings.forEach((l,j)=>{ const sc=2.6;
    g+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(l[0]*sc)}" y2="${Y(l[1]*sc)}" stroke="${C.ink3}" stroke-width="2"/>
        <text x="${X(l[0]*sc*1.14)}" y="${Y(l[1]*sc*1.14)}" text-anchor="middle" font-size="11" fill="${C.ink3}">${p.features[j]}</text>`;});
  const col=[C.d1,C.d2,C.d3];
  p.points.forEach(d=>{ g+=`<rect class="mark" x="${X(d.x)-6}" y="${Y(d.y)-6}" width="12" height="12" fill="${col[d.c]}"
      data-tip="<b>${esc(d.name)}</b><br>${esc(p.names[d.c])}"/>`;});
  const out=p.points.filter(d=>Math.abs(d.x)>2||Math.abs(d.y)>1.9)
                    .sort((a,b)=>a.y-b.y||a.x-b.x);
  out.forEach((d,i)=>{ g+=`<text class="vlab" x="${X(d.x)}" y="${Y(d.y)+(i%2?20:-13)}" text-anchor="middle">${esc(d.name)}</text>`;});
  svg(el,W,H,g,"PCA of six platform features with k-means clusters");
  q("#pca-legend").innerHTML = [0,1,2].map(k =>
    `<span><i style="background:${col[k]}"></i>${esc(p.names[k])} (${p.sizes[k]})</span>`).join("")
    + `<span><i style="background:${C.ink3}"></i>feature loading</span>`;
}

function heatmap(el, h) {
  const W=760,M={l:130,r:70,t:14,b:40};
  const cw=(W-M.l-M.r)/h.cols.length, rh=40, H=M.t+h.rows.length*rh+M.b;
  const max=Math.max(...h.v.flat());
  let g="";
  h.rows.forEach((r,i)=>h.cols.forEach((cc,j)=>{
    const v=h.v[i][j], t=max?v/max:0, col=SEQ[Math.min(SEQ.length-1,Math.round(t*(SEQ.length-1)))];
    g+=`<rect class="mark" x="${M.l+j*cw+1}" y="${M.t+i*rh+1}" width="${cw-2}" height="${rh-2}" fill="${col}"
         data-tip="<b>${esc(r)}</b> · ${cc}s<br>${v} pick${v===1?"":"s"}"/>`;
    if(v) g+=`<text x="${M.l+j*cw+cw/2}" y="${M.t+i*rh+rh/2+5}" text-anchor="middle" font-size="13"
          fill="${t>.55?"#0b0820":C.ink}">${v}</text>`;
  }));
  h.rows.forEach((r,i)=>{ g+=`<text x="${M.l-12}" y="${M.t+i*rh+rh/2+5}" text-anchor="end" font-size="13" fill="${C.ink}">${esc(r)}</text>`;});
  h.cols.forEach((cc,j)=>{ g+=`<text x="${M.l+j*cw+cw/2}" y="${H-M.b+22}" text-anchor="middle" font-size="13">${cc}s</text>`;});
  for(let k=0;k<SEQ.length;k++)
    g+=`<rect x="${W-M.r+20}" y="${M.t+k*16}" width="14" height="15" fill="${SEQ[k]}"/>`;
  g+=`<text x="${W-M.r+40}" y="${M.t+11}" font-size="11" fill="${C.ink3}">0</text>
      <text x="${W-M.r+40}" y="${M.t+SEQ.length*16}" font-size="11" fill="${C.ink3}">${max}</text>`;
  svg(el,W,H,g,"Genre family by decade, counts of picks");
}

function lorenz(el, pts, gini) {
  const W=380,H=330,M=44;
  const X=v=>M+v*(W-2*M), Y=v=>H-M-v*(H-2*M);
  let g=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" stroke="${C.ink3}" stroke-width="2" stroke-dasharray="6 6"/>`;
  const poly=[`${X(0)},${Y(0)}`].concat(pts.map(p=>`${X(p.x)},${Y(p.y)}`));
  g+=`<polygon points="${poly.join(" ")} ${X(1)},${Y(0)}" fill="${C.d1}" opacity=".12"/>
      <polyline points="${poly.join(" ")}" fill="none" stroke="${C.d1}" stroke-width="3"/>
      <text class="vlab" x="${X(.52)}" y="${Y(.26)}" fill="${C.d1}">Gini ${gini}</text>
      <text x="${W/2}" y="${H-10}" text-anchor="middle" font-size="12" fill="${C.ink3}">share of developers →</text>
      <text x="14" y="${H/2}" text-anchor="middle" font-size="12" fill="${C.ink3}" transform="rotate(-90 14 ${H/2})">share of picks →</text>`;
  svg(el,W,H,g,"Lorenz curve of picks per developer");
}

function stacked(el, s) {
  const W=760,rowH=30,M={l:130,r:20,t:10,b:30}, H=M.t+s.makers.length*rowH+M.b;
  const cols=[C.d1,C.d2,C.d3,C.d4];
  let g="";
  s.makers.forEach((m,i)=>{ let left=0; const y=M.t+i*rowH+4;
    s.cats.forEach((cat,j)=>{ const v=s.v[i][j]; if(!v) return;
      const w=v/100*(W-M.l-M.r), x=M.l+left/100*(W-M.l-M.r);
      g+=`<rect class="mark" x="${x+1}" y="${y}" width="${Math.max(w-2,1)}" height="${rowH-11}" fill="${cols[j]}"
           data-tip="<b>${esc(m)}</b><br>${v}% ${EXLBL[cat]}"/>`;
      if(w>52) g+=`<text x="${x+w/2}" y="${y+rowH-18}" text-anchor="middle" font-size="11"
            fill="#0b0820" font-weight="600">${Math.round(v)}%</text>`;
      left+=v; });
    g+=`<text x="${M.l-12}" y="${y+rowH-18}" text-anchor="end" font-size="12.5" fill="${C.ink}">${esc(m)}</text>`;});
  svg(el,W,H,g,"Share of each maker's picks by availability at release");
  q("#lockin-legend").innerHTML = s.cats.map((cat,j)=>
    `<span><i style="background:${cols[j]}"></i>${EXLBL[cat]}</span>`).join("");
}

function missing(el, data) {
  const W=380,rowH=42,M={l:130,r:60,t:10,b:28}, H=M.t+data.length*rowH+M.b;
  let g="";
  data.forEach((d,i)=>{ const y=M.t+i*rowH+6, w=d.pct/100*(W-M.l-M.r);
    g+=`<rect x="${M.l}" y="${y}" width="${W-M.l-M.r}" height="${rowH-18}" fill="${C.panel2}"/>
        <rect class="mark" x="${M.l}" y="${y}" width="${Math.max(w,2)}" height="${rowH-18}" fill="${C.d1}"
         data-tip="<b>${EXLBL[d.k]}</b><br>${d.pct}% of ${d.n} picks have a published sales figure"/>
        <text x="${M.l-12}" y="${y+rowH-24}" text-anchor="end" font-size="12.5" fill="${C.ink}">${EXLBL[d.k]}</text>
        <text class="vlab" x="${M.l+Math.max(w,2)+8}" y="${y+rowH-24}" fill="${C.ink2}">${d.pct}%</text>`;});
  g+=`<text x="${(M.l+W-M.r)/2}" y="${H-6}" text-anchor="middle" font-size="12" fill="${C.ink3}">share with any published sales figure</text>`;
  svg(el,W,H,g,"Share of picks with a published sales figure, by availability");
}

function mediaBar(el, data) {
  const W=380,rowH=30,M={l:150,r:50,t:10,b:20}, H=M.t+data.length*rowH+M.b;
  const max=Math.max(...data.map(d=>d.n));
  let g="";
  data.forEach((d,i)=>{ const y=M.t+i*rowH+4, w=d.n/max*(W-M.l-M.r);
    g+=`<rect class="mark" x="${M.l}" y="${y}" width="${Math.max(w,2)}" height="${rowH-12}" fill="${C.d1}"
         data-tip="${d.n} system${d.n===1?"":"s"} use ${esc(d.k)}"/>
        <text x="${M.l-12}" y="${y+rowH-18}" text-anchor="end" font-size="12" fill="${C.ink}">${esc(d.k)}</text>
        <text class="vlab" x="${M.l+Math.max(w,2)+8}" y="${y+rowH-18}" fill="${C.ink2}">${d.n}</text>`;});
  svg(el,W,H,g,"Systems per storage medium");
}

/* ── roster: all 41 systems, each expandable to its five picks ──────────── */
function roster() {
  const el = q("#roster");
  el.innerHTML = D.systems.map(s => {
    const hw = s.units ? `${s.units}M units` : "no install base";
    return `<details class="sys" data-cat="${s.cat}" data-maker="${esc(s.maker)}">
      <summary><span class="sys-name">${esc(s.name)}</span>
        <span class="sys-meta">${esc(s.maker)} · ${s.launch} · ${hw} · ~${s.lib} titles</span>
        <span class="sys-canon" title="mean canon score">${s.canon}</span></summary>
      <p class="small dim sys-note">${esc(s.note)}.</p>
      <ol class="picks">${s.picks.map(p => `<li>
        ${sprite(p.sprite,2)}
        <div><b>${esc(p.game)}</b> <span class="dim small">${p.year} · ${esc(p.genre)} · ${esc(p.dev)}</span>
        <span class="pick-note small">${esc(p.note)}.</span></div>
        <span class="pill pill--${p.excl.replace("-","")}">${EXLBL[p.excl]}</span>
        <span class="party-n">${p.score}</span></li>`).join("")}</ol>
    </details>`;
  }).join("");
}

/* ── explorer: filter and search all 205 picks ──────────────────────────── */
function explorer() {
  const makers = [...new Set(D.all_games.map(g=>g.m))].sort();
  const fams   = [...new Set(D.all_games.map(g=>g.f))].sort();
  q("#filters").innerHTML = `
    <input id="search" type="search" placeholder="Search 205 games, systems or studios" aria-label="Search the picks">
    <select id="f-maker" aria-label="Filter by maker"><option value="">Every maker</option>
      ${makers.map(m=>`<option>${esc(m)}</option>`).join("")}</select>
    <select id="f-fam" aria-label="Filter by genre family"><option value="">Every genre</option>
      ${fams.map(m=>`<option>${esc(m)}</option>`).join("")}</select>
    <select id="f-excl" aria-label="Filter by availability"><option value="">Any availability</option>
      ${Object.entries(EXLBL).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select>
    <button id="f-reset" class="btn btn--ghost btn--sm" type="button">Reset</button>`;
  const render = () => {
    const s = q("#search").value.trim().toLowerCase();
    const m = q("#f-maker").value, f = q("#f-fam").value, x = q("#f-excl").value;
    const rows = D.all_games.filter(g =>
      (!m || g.m===m) && (!f || g.f===f) && (!x || g.e===x) &&
      (!s || (g.g+" "+g.s+" "+g.d+" "+g.gen).toLowerCase().includes(s)));
    q("#count").textContent = `${rows.length} of ${D.all_games.length}`;
    q("#index").innerHTML = table(
      ["#","game","system","year","genre","developer","availability","canon"],
      rows.map(g=>[g.r,g.g,g.s,g.y,g.gen,g.d,EXLBL[g.e],g.c]),[0,3,7]);
    q("#empty").hidden = rows.length > 0;
  };
  ["#search","#f-maker","#f-fam","#f-excl"].forEach(sel =>
    q(sel).addEventListener("input", render));
  q("#f-reset").addEventListener("click", () => {
    q("#search").value=""; q("#f-maker").value=""; q("#f-fam").value=""; q("#f-excl").value=""; render();
  });
  render();
}
