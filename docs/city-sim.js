/* retrogames · city simulation layer
 * ---------------------------------------------------------------------------
 * Pure logic. No drawing, no DOM, no timers of its own. city.js owns the canvas
 * and calls town.update(dtMs) once per frame, then reads town.agents to draw.
 *
 * COORDINATES  — read this before writing a renderer or a test
 *   The town is a grid of `tile` px cells; `tile` is a constructor option and
 *   nothing in this file assumes any particular value.
 *
 *   (x, y) is the agent's FEET ANCHOR: horizontally centred on its cell,
 *   vertically on the cell's BOTTOM EDGE. For a sprite of any size, draw it at
 *       (x - spriteWidth / 2, y - spriteHeight)
 *   so a 16x24 actor on a 16px grid is drawn at (x - 8, y - 24).
 *
 *   Because y is a bottom EDGE and not a centre, `floor(y / tile)` is OFF BY
 *   ONE ROW — it names the cell below the agent. Do not derive cells that way.
 *   Use the fields provided instead:
 *       cx, cy    the agent's position at the CENTRE of its cell, both axes
 *       col, row  the cell it is standing on, already computed
 *   `col === floor(cx / tile)` and `row === floor(cy / tile)` always hold.
 *
 * WHAT city.js READS PER AGENT
 *   x, y        int px, feet anchor (see above) — use this to draw
 *   cx, cy      int px, cell-centre position — use this to reason about place
 *   col, row    int, the cell the agent occupies
 *   archetype   'surveyor' | 'courier' | 'engineer' | 'gardener'
 *   sprite      'walk' | 'work' | 'stand'   — which animation to play
 *   dir         's' | 'n' | 'e' | 'w'       — 'w' means draw 'e' mirrored
 *   flip        true when dir === 'w'
 *   frame       index into that animation's frame array (walk 0..3, work 0..1)
 *   carrying    true only on a courier's loaded leg
 *   speech      string or null
 *   speechTimer ms remaining on the bubble (0 when speech is null)
 *   state       'idle' | 'travel' | 'work' | 'chat' | 'rest'  (useful for debug)
 *
 * PERFORMANCE BUDGET
 *   Target: < 1ms per frame for 12 agents. Achieved by (a) pre-allocating every
 *   A* working array once at construction and stamping them with a generation
 *   counter instead of clearing, (b) reusing one Int32Array path buffer per
 *   agent, (c) serving at most `tune.pathBudgetPerFrame` A* searches per frame
 *   from a queue so a burst of simultaneous repaths can never spike a frame,
 *   (d) caching plot-to-plot paths, and (e) running the O(n^2) chat proximity
 *   check only every `tune.chatCheckMs`. The steady-state hot loop allocates
 *   nothing.
 */
(function (global) {
  'use strict';

  // ── tuning ───────────────────────────────────────────────────────────────
  // Every distance here is expressed in TILES, never pixels, and is scaled by
  // the town's tile size at construction.
  var tune = {
    tile: 16,           // default only; Town takes `tile` as an option

    // Speeds are TILES PER SECOND and are multiplied by the town's tile size at
    // construction, so changing the grid from 8px to 16px does not silently
    // halve the apparent pace. Distinct speeds per archetype are most of what
    // makes the town look populated by people rather than by instances of one
    // sprite. At tile 16 these are 13.6 / 16.8 / 20 / 28 px/sec, which at the
    // 2x-3x CSS scale the renderer uses reads as ambling to brisk.
    speedTiles: {
      gardener: 0.85,   // amble, stops at everything
      surveyor: 1.05,   // deliberate, measuring as it goes
      engineer: 1.25,   // steady working pace
      courier: 1.75     // hurried, has a round to finish
    },

    // Walk frame advances every `frameDistTiles` of a tile TRAVELLED, never by
    // wall-clock, so a slow gardener and a fast courier both plant their feet
    // correctly and nothing skates. 0.25 means one full 4-frame cycle per tile
    // crossed, which is the classic overworld look: 3.4 steps/sec for the
    // gardener, 7 for the courier.
    frameDistTiles: 0.25,

    workMsMin: 2200, workMsMax: 4000,   // long enough to read the work pose
    chatMsMin: 1800, chatMsMax: 3200,
    restMsMin: 4000, restMsMax: 7000,
    idleMsMin: 400,  idleMsMax: 1600,   // beat between finishing and deciding

    wanderChance: 0.25,   // of idle decisions that pick a nearby cell, not a job
    wanderRadius: 7,      // cells

    chatCheckMs: 250,     // how often the proximity sweep runs
    chatChance: 0.22,     // per sweep, per adjacent pair
    chatCooldownMs: 12000,// per agent, so the same two never loop on it
    chatRadiusTiles: 1.6, // scaled by tile size at construction

    barkChance: 0.45,     // on entering work or chat
    barkCooldownMs: 9000,
    barkMs: 2600,

    restAfterJobsMin: 3, restAfterJobsMax: 6,

    pathBudgetPerFrame: 1,  // A* searches served per frame, across the whole town
    maxExpansions: 4000,    // hard cap so a pathological search cannot hang
    turnEps: 0.001,         // tie-break toward straight lines (see note below)
    maxPathCache: 256,
    maxAgents: 24,
    maxPathLen: 512,
    failBeforeWander: 4
  };

  // ── seeded PRNG (mulberry32) ─────────────────────────────────────────────
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ── barks ────────────────────────────────────────────────────────────────
  // Dry, in-world, about the actual subject. One line, no exclamation marks.
  var BARKS = {
    surveyor: [
      'Residual reads plus fourteen.',
      'Neo Geo is off the trend line again.',
      'Measuring the SG-1000. Bring a shorter rod.',
      'Library size beats install base. Every time.',
      'This bar is taller than the model predicted.',
      'Forty-one platforms. Thirty-five with a denominator.'
    ],
    courier: [
      'Two hundred and five crates. All catalogued.',
      'Cartridge for the roster. Sign here.',
      'This one never left Japan.',
      'Depot says the CSV is the source of truth.',
      'Heavy. It is a CD add-on.',
      'Delivering to the scoreboard. Again.'
    ],
    engineer: [
      'The chart axis was drifting. Fixed.',
      'Someone wired this on a 1983 bus.',
      'Checked the joins. Nothing orphaned.',
      'Pixel grid was off by one. It is not now.',
      'This facade needs a load-bearing assumption.',
      'Median lag holding at three years.'
    ],
    gardener: [
      'The canon grows late. Like everything here.',
      'Back-loaded. Same as the data.',
      'Three years before anything flowers.',
      'Handhelds bloom early and die young.',
      'Watering the long tail.',
      'This one came up in the tenth year.'
    ]
  };

  // ── job tables ───────────────────────────────────────────────────────────
  // Which plot kinds each archetype will choose as a work destination.
  var JOBS = {
    surveyor: ['chart', 'sign'],
    engineer: ['house', 'chart'],
    gardener: ['tree'],
    courier: ['chart', 'house', 'tree', 'sign', 'well']  // delivery targets
  };
  var ARCHETYPES = ['surveyor', 'courier', 'engineer', 'gardener'];

  var DIRS = ['s', 'n', 'e', 'w'];

  // ── Agent ────────────────────────────────────────────────────────────────
  function Agent(town, archetype, id) {
    this.town = town;
    this.id = id;
    this.archetype = archetype;

    // exposed render state
    this.x = 0; this.y = 0;      // feet anchor: cell centre X, cell bottom Y
    this.cx = 0; this.cy = 0;    // cell-centre on both axes
    this.col = 0; this.row = 0;  // the cell being stood on
    this.sprite = 'stand';
    this.dir = 's';
    this.flip = false;
    this.frame = 0;
    this.carrying = false;
    this.speech = null;
    this.speechTimer = 0;
    this.state = 'idle';

    // internal
    this.fx = 0; this.fy = 0;        // unrounded position
    this.cell = 0;                   // current cell index
    this.distAcc = 0;                // px travelled, drives the walk frame
    this.timer = 0;                  // ms left in the current timed state
    this.path = new Int32Array(tune.maxPathLen);
    this.pathLen = 0;
    this.pathPos = 0;
    this.goalPlot = -1;
    this.leg = 0;                    // courier: 0 = to depot, 1 = loaded
    this.jobsDone = 0;
    this.jobsUntilRest = 0;
    this.stateChanges = 0;
    this.pathFails = 0;
    this.chatCooldown = 0;
    this.barkCooldown = 0;
    this.chatPartner = -1;
    this.pendingPath = false;
    // declared here so the shape never changes once the pool is warm
    this._goalCell = -1;
    this._useCache = false;
    this.speed = 0;   // px/sec, set from the town's tile size on spawn
  }

  // Single place that derives everything a renderer or a test reads from the
  // unrounded position, so the two can never disagree about which cell an
  // agent is on.
  Agent.prototype.sync = function () {
    var t = this.town, half = t.tile * 0.5;
    this.x = Math.round(this.fx);
    this.y = Math.round(this.fy);
    // col/row are derived from the ROUNDED centre, not the raw float, so the
    // documented identity `col === floor(cx / tile)` holds exactly. An agent
    // only ever interpolates between the centres of two walkable cells, so the
    // rounded value can never name a blocked one.
    this.cx = Math.round(this.fx);
    this.cy = Math.round(this.fy - half);
    this.col = Math.floor(this.cx / t.tile);
    this.row = Math.floor(this.cy / t.tile);
  };

  Agent.prototype.setState = function (s) {
    if (this.state !== s) { this.state = s; this.stateChanges++; }
  };

  Agent.prototype.placeAtCell = function (cell) {
    var t = this.town;
    this.cell = cell;
    this.fx = (cell % t.cols) * t.tile + t.tile * 0.5;
    this.fy = ((cell / t.cols) | 0) * t.tile + t.tile;
    this.sync();
  };

  Agent.prototype.say = function (rng) {
    if (this.barkCooldown > 0) return;
    if (rng() > tune.barkChance) return;
    var lines = BARKS[this.archetype];
    this.speech = lines[(rng() * lines.length) | 0];
    this.speechTimer = tune.barkMs;
    this.barkCooldown = tune.barkCooldownMs;
  };

  // ── Town ─────────────────────────────────────────────────────────────────
  function Town(opts) {
    opts = opts || {};
    this.cols = opts.cols | 0;
    this.rows = opts.rows | 0;
    this.tile = opts.tile || tune.tile;
    this.seed = (opts.seed === undefined) ? 1337 : (opts.seed | 0);
    this.rng = mulberry32(this.seed);
    this.n = this.cols * this.rows;

    // everything distance-based is derived from the tile size, so an 8px or a
    // 16px grid both read at the same pace
    this.frameDist = tune.frameDistTiles * this.tile;
    this.chatRadiusPx = tune.chatRadiusTiles * this.tile;
    this.speedPx = {};
    for (var k in tune.speedTiles) this.speedPx[k] = tune.speedTiles[k] * this.tile;

    // bake walkability once; city.js can call refreshWalkable() after a relayout
    this.isWalkable = opts.isWalkable || function () { return true; };
    this.walk = new Uint8Array(this.n);
    this.refreshWalkable();

    // plots, with an approach cell (the nearest walkable neighbour) so agents
    // can work on buildings that are themselves solid
    this.plots = [];
    var list = opts.plots || [];
    for (var i = 0; i < list.length; i++) this.addPlot(list[i]);

    // ---- A* working set, allocated once ----------------------------------
    this.gScore = new Float32Array(this.n);
    this.fScore = new Float32Array(this.n);
    this.cameFrom = new Int32Array(this.n);
    this.stamp = new Uint32Array(this.n);   // generation marker, avoids clearing
    this.closed = new Uint8Array(this.n);
    this.closedStamp = new Uint32Array(this.n);
    // A node can be pushed more than once (no decrease-key), so the heap must
    // hold more than `n` entries. A typed array SILENTLY DROPS out-of-range
    // writes, which corrupts the open set and yields paths that cut through
    // walls — size it generously and refuse to push past the end.
    this.heap = new Int32Array(this.n * 4 + 16);
    this.heapLen = 0;
    this.gen = 0;
    this.scratch = new Int32Array(tune.maxPathLen);

    this.pathCache = new Map();

    // ---- agents ----------------------------------------------------------
    this.pool = [];
    this.agents = [];
    for (var a = 0; a < tune.maxAgents; a++) {
      this.pool.push(new Agent(this, ARCHETYPES[a % ARCHETYPES.length], a));
    }
    this.pathQueue = [];
    this.chatClock = 0;
    this.lastUpdateMs = 0;

    this.setPopulation(opts.population === undefined ? 12 : opts.population);
  }

  Town.prototype.refreshWalkable = function () {
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        this.walk[r * this.cols + c] = this.isWalkable(c, r) ? 1 : 0;
      }
    }
  };

  Town.prototype.idx = function (c, r) { return r * this.cols + c; };

  // Nearest walkable cell to (c,r), searched in rings. Returns -1 if none near.
  Town.prototype.nearestWalkable = function (c, r, maxRing) {
    if (c >= 0 && r >= 0 && c < this.cols && r < this.rows && this.walk[r * this.cols + c]) {
      return r * this.cols + c;
    }
    maxRing = maxRing || 4;
    for (var ring = 1; ring <= maxRing; ring++) {
      for (var dr = -ring; dr <= ring; dr++) {
        for (var dc = -ring; dc <= ring; dc++) {
          if (Math.abs(dr) !== ring && Math.abs(dc) !== ring) continue;
          var nc = c + dc, nr = r + dr;
          if (nc < 0 || nr < 0 || nc >= this.cols || nr >= this.rows) continue;
          if (this.walk[nr * this.cols + nc]) return nr * this.cols + nc;
        }
      }
    }
    return -1;
  };

  Town.prototype.addPlot = function (p) {
    var ac = this.nearestWalkable(p.c, p.r, 4);
    var plot = {
      id: p.id, c: p.c, r: p.r, kind: p.kind,
      approach: ac,
      facing: 's'
    };
    if (ac >= 0) {
      var acC = ac % this.cols, acR = (ac / this.cols) | 0;
      var dx = p.c - acC, dy = p.r - acR;
      if (Math.abs(dx) > Math.abs(dy)) plot.facing = dx > 0 ? 'e' : 'w';
      else if (dy !== 0) plot.facing = dy > 0 ? 's' : 'n';
      else plot.facing = 's';
    }
    this.plots.push(plot);
    return plot;
  };

  // ── A* ───────────────────────────────────────────────────────────────────
  // 4-connected, Manhattan heuristic. The step cost is 1 plus `turnEps` when the
  // direction changes. turnEps is small enough (0.001 x max path length << 1)
  // that it can never make a longer path win — it only breaks ties, which
  // straightens the route. Diagonal-looking staircases read badly in pixel art;
  // a long straight run down a street reads as intent.
  Town.prototype.heapPush = function (node) {
    var h = this.heap, f = this.fScore;
    if (this.heapLen + 2 >= h.length) { this.heapOverflow = true; return; }
    var i = ++this.heapLen;
    h[i] = node;
    while (i > 1) {
      var p = i >> 1;
      if (f[h[p]] <= f[h[i]]) break;
      var t = h[p]; h[p] = h[i]; h[i] = t;
      i = p;
    }
  };

  Town.prototype.heapPop = function () {
    var h = this.heap, f = this.fScore;
    var top = h[1];
    h[1] = h[this.heapLen--];
    var i = 1;
    for (;;) {
      var l = i << 1, r = l + 1, m = i;
      if (l <= this.heapLen && f[h[l]] < f[h[m]]) m = l;
      if (r <= this.heapLen && f[h[r]] < f[h[m]]) m = r;
      if (m === i) break;
      var t = h[m]; h[m] = h[i]; h[i] = t;
      i = m;
    }
    return top;
  };

  // Writes the path into `out` (an Int32Array) and returns its length, or -1.
  Town.prototype.findPath = function (start, goal, out) {
    if (start === goal) { out[0] = goal; return 1; }
    if (start < 0 || goal < 0 || !this.walk[start] || !this.walk[goal]) return -1;

    var cols = this.cols, n = this.n;
    var g = this.gScore, f = this.fScore, from = this.cameFrom;
    var stamp = this.stamp, closed = this.closed, cstamp = this.closedStamp;
    var gen = ++this.gen;
    this.heapLen = 0;
    this.heapOverflow = false;

    var gc = goal % cols, gr = (goal / cols) | 0;
    stamp[start] = gen; g[start] = 0;
    f[start] = Math.abs((start % cols) - gc) + Math.abs(((start / cols) | 0) - gr);
    from[start] = -1;
    this.heapPush(start);

    var expansions = 0;
    while (this.heapLen > 0) {
      var cur = this.heapPop();
      if (cur === goal) return this.rebuild(cur, out);
      if (cstamp[cur] === gen && closed[cur]) continue;
      cstamp[cur] = gen; closed[cur] = 1;
      if (++expansions > tune.maxExpansions || this.heapOverflow) return -1;

      var cc = cur % cols, cr = (cur / cols) | 0;
      var prev = from[cur];
      var pdx = 0, pdy = 0;
      if (prev >= 0) { pdx = cc - (prev % cols); pdy = cr - ((prev / cols) | 0); }

      for (var k = 0; k < 4; k++) {
        var nc = cc + (k === 2 ? 1 : k === 3 ? -1 : 0);
        var nr = cr + (k === 0 ? 1 : k === 1 ? -1 : 0);
        if (nc < 0 || nr < 0 || nc >= cols || nr >= this.rows) continue;
        var nb = nr * cols + nc;
        if (!this.walk[nb]) continue;
        if (cstamp[nb] === gen && closed[nb]) continue;

        var dx = nc - cc, dy = nr - cr;
        var turn = (prev >= 0 && (dx !== pdx || dy !== pdy)) ? tune.turnEps : 0;
        var ng = g[cur] + 1 + turn;

        if (stamp[nb] !== gen || ng < g[nb]) {
          stamp[nb] = gen;
          g[nb] = ng;
          from[nb] = cur;
          f[nb] = ng + Math.abs(nc - gc) + Math.abs(nr - gr);
          this.heapPush(nb);
        }
      }
    }
    return -1;
  };

  Town.prototype.rebuild = function (goal, out) {
    var s = this.scratch, len = 0, cur = goal;
    while (cur >= 0 && len < tune.maxPathLen) { s[len++] = cur; cur = this.cameFrom[cur]; }
    if (len >= tune.maxPathLen) return -1;
    for (var i = 0; i < len; i++) out[i] = s[len - 1 - i];
    return len;
  };

  Town.prototype.cachedPath = function (start, goal, out) {
    var key = start * this.n + goal;
    var hit = this.pathCache.get(key);
    if (hit !== undefined) {
      if (hit === null) return -1;
      out.set(hit, 0);
      return hit.length;
    }
    var len = this.findPath(start, goal, out);
    if (this.pathCache.size < tune.maxPathCache) {
      this.pathCache.set(key, len < 0 ? null : out.slice(0, len));
    }
    return len;
  };

  // ── population ───────────────────────────────────────────────────────────
  Town.prototype.setPopulation = function (n) {
    n = Math.max(0, Math.min(n | 0, tune.maxAgents));
    while (this.agents.length > n) {
      var gone = this.agents.pop();
      gone.pendingPath = false;
      this.pool.push(gone);
    }
    while (this.agents.length < n && this.pool.length) {
      var a = this.pool.pop();
      this.spawn(a);
      this.agents.push(a);
    }
  };

  Town.prototype.randomWalkableCell = function () {
    for (var tries = 0; tries < 200; tries++) {
      var i = (this.rng() * this.n) | 0;
      if (this.walk[i]) return i;
    }
    for (var j = 0; j < this.n; j++) if (this.walk[j]) return j;
    return -1;
  };

  Town.prototype.spawn = function (a) {
    a.speed = this.speedPx[a.archetype] || this.tile;
    var cell = this.randomWalkableCell();
    a.placeAtCell(cell < 0 ? 0 : cell);
    a.setState('idle');
    a.sprite = 'stand';
    a.dir = DIRS[(this.rng() * 4) | 0];
    a.flip = a.dir === 'w';
    a.frame = 0;
    a.carrying = false;
    a.speech = null; a.speechTimer = 0;
    a.pathLen = 0; a.pathPos = 0;
    a.goalPlot = -1; a.leg = 0;
    a.timer = tune.idleMsMin + this.rng() * (tune.idleMsMax - tune.idleMsMin);
    a.jobsUntilRest = tune.restAfterJobsMin +
      ((this.rng() * (tune.restAfterJobsMax - tune.restAfterJobsMin + 1)) | 0);
    a.pathFails = 0;
    a.chatCooldown = 0; a.barkCooldown = 0; a.chatPartner = -1;
    a.pendingPath = false;
  };

  // ── goal selection ───────────────────────────────────────────────────────
  Town.prototype.pickPlot = function (kinds, rng) {
    var candidates = -1, count = 0, chosen = -1;
    for (var i = 0; i < this.plots.length; i++) {
      var p = this.plots[i];
      if (p.approach < 0) continue;
      if (kinds.indexOf(p.kind) === -1) continue;
      count++;
      if (rng() < 1 / count) chosen = i;   // reservoir sample, no array alloc
    }
    void candidates;
    return chosen;
  };

  Town.prototype.wanderCell = function (a) {
    var c = a.cell % this.cols, r = (a.cell / this.cols) | 0;
    for (var t = 0; t < 24; t++) {
      var nc = c + ((this.rng() * (tune.wanderRadius * 2 + 1)) | 0) - tune.wanderRadius;
      var nr = r + ((this.rng() * (tune.wanderRadius * 2 + 1)) | 0) - tune.wanderRadius;
      if (nc < 0 || nr < 0 || nc >= this.cols || nr >= this.rows) continue;
      var i = nr * this.cols + nc;
      if (this.walk[i] && i !== a.cell) return i;
    }
    return -1;
  };

  // Request a path; served from the queue so a burst cannot spike one frame.
  Town.prototype.requestPath = function (a, goalCell, usesCache) {
    if (a.pendingPath) return;
    a.pendingPath = true;
    this.pathQueue.push(a);
    a._goalCell = goalCell;
    a._useCache = !!usesCache;
  };

  Town.prototype.servePaths = function () {
    var served = 0;
    while (this.pathQueue.length && served < tune.pathBudgetPerFrame) {
      var a = this.pathQueue.shift();
      a.pendingPath = false;
      if (this.agents.indexOf(a) === -1) { served++; continue; }
      var len = a._useCache
        ? this.cachedPath(a.cell, a._goalCell, a.path)
        : this.findPath(a.cell, a._goalCell, a.path);
      if (len > 0) {
        a.pathLen = len;
        // Start at path[0] — the cell we already occupy — rather than skipping
        // to path[1]. A chat can interrupt travel mid-step, leaving the agent
        // between two cell centres; heading straight for path[1] from there is
        // a DIAGONAL, and a diagonal clips the corner of a blocked cell. Pulling
        // back to the current centre first keeps every leg axis-aligned. When
        // the agent is already centred the zero-length leg is consumed in the
        // same frame, so it costs nothing.
        a.pathPos = 0;
        a.setState('travel');
        a.sprite = 'walk';
        a.pathFails = 0;
      } else {
        a.pathFails++;
        a.goalPlot = -1;
        a.setState('idle');
        a.sprite = 'stand';
        a.timer = tune.idleMsMin;
      }
      served++;
    }
  };

  // ── per-agent decision ───────────────────────────────────────────────────
  Town.prototype.decide = function (a) {
    var rng = this.rng;

    if (a.jobsUntilRest <= 0) {
      var restPlot = this.pickPlot(['well', 'sign'], rng);
      a.jobsUntilRest = tune.restAfterJobsMin +
        ((rng() * (tune.restAfterJobsMax - tune.restAfterJobsMin + 1)) | 0);
      if (restPlot >= 0) {
        a.goalPlot = restPlot;
        a.leg = 2;                       // 2 marks "going to rest"
        this.requestPath(a, this.plots[restPlot].approach, true);
        return;
      }
    }

    // after repeated path failures, stop trying plots and just wander
    if (a.pathFails >= tune.failBeforeWander || rng() < tune.wanderChance) {
      var w = this.wanderCell(a);
      a.goalPlot = -1;
      a.leg = 3;                         // 3 marks "wandering"
      if (w >= 0) this.requestPath(a, w, false);
      else { a.timer = tune.idleMsMin; }
      return;
    }

    if (a.archetype === 'courier') {
      // depot (load) -> target (unload) -> back to depot
      if (!a.carrying) {
        var depot = this.pickPlot(['depot'], rng);
        if (depot < 0) depot = this.pickPlot(['well', 'sign'], rng);
        if (depot >= 0) {
          a.goalPlot = depot; a.leg = 0;
          this.requestPath(a, this.plots[depot].approach, true);
          return;
        }
      } else {
        var dest = this.pickPlot(JOBS.courier, rng);
        if (dest >= 0) {
          a.goalPlot = dest; a.leg = 1;
          this.requestPath(a, this.plots[dest].approach, true);
          return;
        }
      }
    } else {
      var job = this.pickPlot(JOBS[a.archetype], rng);
      if (job >= 0) {
        a.goalPlot = job; a.leg = 0;
        this.requestPath(a, this.plots[job].approach, true);
        return;
      }
    }

    // nothing to do — wander instead of standing forever
    var w2 = this.wanderCell(a);
    a.goalPlot = -1; a.leg = 3;
    if (w2 >= 0) this.requestPath(a, w2, false);
    else a.timer = tune.idleMsMin;
  };

  // Arrived at the end of a path.
  Town.prototype.arrive = function (a) {
    a.pathLen = 0; a.pathPos = 0;

    if (a.leg === 3) {                    // was wandering
      a.setState('idle');
      a.sprite = 'stand';
      a.timer = tune.idleMsMin + this.rng() * (tune.idleMsMax - tune.idleMsMin);
      return;
    }

    if (a.leg === 2) {                    // arrived to rest
      a.setState('rest');
      a.sprite = 'stand';
      a.timer = tune.restMsMin + this.rng() * (tune.restMsMax - tune.restMsMin);
      if (a.goalPlot >= 0) { a.dir = this.plots[a.goalPlot].facing; a.flip = a.dir === 'w'; }
      return;
    }

    // a work stop
    a.setState('work');
    a.sprite = 'work';
    a.frame = 0;
    a.timer = tune.workMsMin + this.rng() * (tune.workMsMax - tune.workMsMin);
    if (a.goalPlot >= 0) { a.dir = this.plots[a.goalPlot].facing; a.flip = a.dir === 'w'; }
    a.say(this.rng);
  };

  // Finished a work stop.
  Town.prototype.finishWork = function (a) {
    if (a.archetype === 'courier') {
      if (a.leg === 0) { a.carrying = true; }      // loaded at the depot
      else { a.carrying = false; a.jobsDone++; a.jobsUntilRest--; }
    } else {
      a.jobsDone++; a.jobsUntilRest--;
    }
    a.setState('idle');
    a.sprite = 'stand';
    a.timer = tune.idleMsMin + this.rng() * (tune.idleMsMax - tune.idleMsMin);
  };

  // ── movement ─────────────────────────────────────────────────────────────
  Town.prototype.move = function (a, dt) {
    var remain = a.speed * dt / 1000;
    var cols = this.cols, tile = this.tile;

    while (remain > 0 && a.pathPos < a.pathLen) {
      var target = a.path[a.pathPos];
      var tx = (target % cols) * tile + tile * 0.5;
      var ty = ((target / cols) | 0) * tile + tile;
      var dx = tx - a.fx, dy = ty - a.fy;
      var d = Math.sqrt(dx * dx + dy * dy);

      if (d < 1e-6) { a.cell = target; a.pathPos++; continue; }

      // direction from the step vector; 4-connected so it is unambiguous
      if (Math.abs(dx) >= Math.abs(dy)) a.dir = dx > 0 ? 'e' : 'w';
      else a.dir = dy > 0 ? 's' : 'n';
      a.flip = a.dir === 'w';

      if (d <= remain) {
        a.fx = tx; a.fy = ty;
        remain -= d; a.distAcc += d;
        a.cell = target; a.pathPos++;
      } else {
        a.fx += dx / d * remain;
        a.fy += dy / d * remain;
        a.distAcc += remain;
        remain = 0;
      }
    }

    a.sync();
    a.frame = ((a.distAcc / this.frameDist) | 0) % 4;

    if (a.pathPos >= a.pathLen) this.arrive(a);
  };

  // ── chat sweep ───────────────────────────────────────────────────────────
  Town.prototype.chatSweep = function () {
    var ags = this.agents, n = ags.length, r2 = this.chatRadiusPx * this.chatRadiusPx;
    for (var i = 0; i < n; i++) {
      var A = ags[i];
      if (A.chatCooldown > 0 || A.state === 'chat' || A.state === 'work' || A.state === 'rest') continue;
      for (var j = i + 1; j < n; j++) {
        var B = ags[j];
        if (B.chatCooldown > 0 || B.state === 'chat' || B.state === 'work' || B.state === 'rest') continue;
        var dx = A.x - B.x, dy = A.y - B.y;
        if (dx * dx + dy * dy > r2) continue;
        if (this.rng() > tune.chatChance) continue;

        var ms = tune.chatMsMin + this.rng() * (tune.chatMsMax - tune.chatMsMin);
        this.enterChat(A, B, ms);
        this.enterChat(B, A, ms);
        break;
      }
    }
  };

  Town.prototype.enterChat = function (a, other, ms) {
    a.setState('chat');
    a.sprite = 'stand';
    a.timer = ms;
    a.chatCooldown = tune.chatCooldownMs;
    a.chatPartner = other.id;
    a.pathLen = 0; a.pathPos = 0;
    // face each other
    var dx = other.x - a.x, dy = other.y - a.y;
    if (Math.abs(dx) >= Math.abs(dy)) a.dir = dx > 0 ? 'e' : 'w';
    else a.dir = dy > 0 ? 's' : 'n';
    a.flip = a.dir === 'w';
    a.say(this.rng);
  };

  // ── frame update ─────────────────────────────────────────────────────────
  Town.prototype.update = function (dtMs) {
    var dt = dtMs > 100 ? 100 : dtMs;      // clamp after a tab stall
    if (dt <= 0) return;

    this.servePaths();

    this.chatClock += dt;
    var doChat = false;
    if (this.chatClock >= tune.chatCheckMs) { this.chatClock = 0; doChat = true; }

    var ags = this.agents;
    for (var i = 0; i < ags.length; i++) {
      var a = ags[i];

      if (a.speechTimer > 0) {
        a.speechTimer -= dt;
        if (a.speechTimer <= 0) { a.speechTimer = 0; a.speech = null; }
      }
      if (a.chatCooldown > 0) a.chatCooldown -= dt;
      if (a.barkCooldown > 0) a.barkCooldown -= dt;

      switch (a.state) {
        case 'travel':
          this.move(a, dt);
          break;

        case 'work':
          a.timer -= dt;
          // 2-frame work cycle, ~2.2 cycles/sec. Clamp first: on the tick the
          // timer crosses zero a negative value would make `% 2` return -1 and
          // hand city.js a frame index that does not exist.
          a.frame = (((a.timer > 0 ? a.timer : 0) / 220) | 0) % 2;
          if (a.timer <= 0) this.finishWork(a);
          break;

        case 'chat':
        case 'rest':
          a.timer -= dt;
          if (a.timer <= 0) {
            a.chatPartner = -1;
            a.setState('idle');
            a.sprite = 'stand';
            a.timer = tune.idleMsMin;
          }
          break;

        default: // idle
          a.timer -= dt;
          if (a.timer <= 0 && !a.pendingPath) this.decide(a);
          break;
      }
    }

    if (doChat) this.chatSweep();
  };

  global.CITY_SIM = { Agent: Agent, Town: Town, tune: tune, BARKS: BARKS, JOBS: JOBS };

})(typeof window !== 'undefined' ? window : globalThis);
