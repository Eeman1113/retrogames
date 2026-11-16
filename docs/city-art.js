/* ───────────────────────────────────────────────────────────────────────────
   retrogames · city-art.js — pixel art for the living town layer.

   REFERENCE: Pokémon FireRed / LeafGreen (GBA, 2004) overworld — Pallet Town,
   Viridian City, Route 1. Bright saturated register, 16×16 metatiles, 16×24
   overworld NPCs, big-roofed houses with cream walls.

   Pure data. No DOM, no motion, no rendering — city.js owns all of that.
   Every grid is an array of equal-length strings; one character per pixel,
   "." is transparent, every other character is a key into `palette`.

   CRAFT RULES, applied everywhere:
   · Light source top-left, without exception.
   · 1px dark outline on the SIDE and BOTTOM of a form; lighter or absent on
     the top-left, so forms catch the light rather than being stickered on.
   · Outlines are warm brown-black (#382818), never pure black.
   · Minimum three tones per object — base, shadow, highlight. No flat fills.

   HOW THE ACTORS ARE BUILT: the four archetypes share one body system (same
   proportions, same walk mechanics, same hand positions) and differ by
   authored headgear grids and authored held-item pixel overlays. That is a
   deliberate production choice, not a shortcut — FireRed's own NPCs are built
   the same way, and it keeps the four reading as citizens of one town.
   ─────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  /* ── palette ─────────────────────────────────────────────────────────── */
  const palette = {
    /* outlines — warm, never pure black */
    o: "#382818", // standard outline
    k: "#202020", // darkest: door mouths, deep shadow
    S: "#00000038", // soft drop shadow (used as a flat RGBA fill)

    /* grass & ground cover */
    G: "#58a830", // grass base
    H: "#80c850", // grass highlight
    D: "#389038", // grass shadow / tuft
    T: "#1d5020", // tall grass, the encounter tile

    /* tree canopy */
    E: "#286830", // canopy dark
    F: "#389040", // canopy mid
    C: "#58b858", // canopy light

    /* route path (sand) */
    s: "#e8d0a0", // path light
    d: "#c8a870", // path mid
    e: "#a08048", // path edge / worn

    /* water */
    w: "#5090d8", // water base
    b: "#78b8f0", // water light
    W: "#ffffff", // white highlight, window glint

    /* roofs */
    R: "#d85038", // roof red
    r: "#a83020", // roof red shadow
    L: "#f07858", // roof red highlight
    B: "#4878c8", // roof blue (PokéMart)
    n: "#2850a0", // roof blue shadow
    N: "#6898e8", // roof blue highlight
    J: "#584868", // roof slate (lab)
    j: "#382c48", // roof slate shadow

    /* walls */
    c: "#f8f0e0", // cream wall
    m: "#d8c8a8", // cream wall shadow

    /* wood */
    a: "#a07040", // wood light
    u: "#684828", // wood dark

    /* windows */
    p: "#90c0f0", // pane
    P: "#5888c0", // pane shadow
    Y: "#ffe070", // LIT pane — meta.windowLit

    /* stone & paving */
    1: "#8898a8", // stone light
    2: "#687888", // stone mid
    3: "#485868", // stone dark

    /* flowers */
    f: "#e05858", // bloom red
    y: "#f0d040", // bloom yellow

    /* people */
    A: "#f8c8a0", // skin
    K: "#d09868", // skin shadow
    z: "#3858a8", // cloth blue
    x: "#e04848", // cloth red
    X: "#a02828", // cloth red shadow
    v: "#f0f0f0", // cloth white
    V: "#c0c0c8", // cloth white shadow
    h: "#f0c040", // straw / hard hat
    i: "#c09020", // straw / hard hat shadow
    t: "#504038", // trousers
    g: "#2f7d3a", // gardener green
    Q: "#1e5526", // gardener green shadow
  };

  const meta = {
    reference: "Pokémon FireRed / LeafGreen (GBA, 2004) overworld",
    tile: 16, // metatiles are 16×16; lay the town out on a 16px grid
    light: "top-left",
    outline: "o (#382818) on side + bottom; top-left left open",
    windowLit: "Y", // city.js swaps pane pixels to this to light a window
    actor: {
      w: 16,
      h: 24,
      dirs: ["s", "n", "e"],
      mirror: "e -> w at runtime",
      frames: "[stand, step1, stand, step2]; step frames drop the head 1px to bob",
    },
    accents: { f: "flower red", y: "flower yellow", W: "white glint", Y: "lit window" },
    note:
      "Palette is deliberately bright — the page scrims the reading column, " +
      "so the town is meant to be legible out in the margins.",
  };

  /* helpers: spans guarantee row width by construction */
  const rep = (ch, n) => ch.repeat(n);
  const row = (...spans) => spans.join("");
  const rect = (x, y, w, h) => {
    const out = [];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) out.push([x + i, y + j]);
    return out;
  };

  /* ── ground tiles · 16×16, seamless ──────────────────────────────────── */
  const grass = [
    "GGGGGGGGGGGGGGGG",
    "GGHGGGGGGGGHGGGG",
    "GGGGGGDGGGGGGGGG",
    "GGGGGDDGGGGGGHGG",
    "GGGGGGGGGGGGGGGG",
    "GHGGGGGGGGDGGGGG",
    "GGGGGGGGGGDDGGGG",
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGHG",
    "GGGDGGGGGGGGGGGG",
    "GGDDGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
    "GHGGGGGGGHGGGGGG",
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
  ];

  /* the encounter tile: notched blade tops over a dark field */
  const tallGrass = [
    "GGGGGGGGGGGGGGGG",
    "GGDGGGGGGGDGGGGG",
    "GDDDGGGGGDDDGGGG",
    "TDDDDGGGTDDDDGGG",
    "TTTTTDGGTTTTTDGG",
    "TTTTTTDDTTTTTTDD",
    "TTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTT",
    "DTTTTTTTDTTTTTTT",
    "DDTTTTTTDDTTTTTT",
    "TDTTTTTTTDTTTTTT",
    "TTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTT",
    "oTTTTTTToTTTTTTT",
    "ooTTTTTToooTTTTT",
    "oooooooooooooooo",
  ];

  const path = [
    "ssssssssssssssss",
    "sssdssssssssssss",
    "ssssssssssdsssss",
    "ssssssssssssssss",
    "sdssssssssssssds",
    "ssssssdsssssssss",
    "ssssssssssssssss",
    "ssssssssssdsssss",
    "ssdsssssssssssss",
    "ssssssssssssssss",
    "sssssssssssssdss",
    "ssssdsssssssssss",
    "ssssssssssssssss",
    "ssssssssdsssssss",
    "sdssssssssssssss",
    "ssssssssssssssss",
  ];

  /* worn border where a route path meets grass: light on top, dark at the lip */
  const pathEdge = [
    "ssssssssssssssss",
    "ssssdsssssssdsss",
    "ssssssssssssssss",
    "ssdssssssdssssss",
    "ssssssssssssssss",
    "ssssssssssssssss",
    "dddsddddddsddddd",
    "dddddddddddddddd",
    "eedeeeeeedeeeeee",
    "eeeeeeeeeeeeeeee",
    "oeoeeoeeoeeoeeoe",
    "GoGGoGGGoGGoGGGo",
    "GGGGGGGGGGGGGGGG",
    "GGDGGGGGGGGDGGGG",
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
  ];

  /* town paving: 16px slab, seam on the top and left, lit top-left corner */
  const pavement = [
    "3333333333333333",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3222222222222222",
  ];

  /* city street: darker paving with a dashed centre line */
  const roadLineH = [
    "3333333333333333",
    "3222222222222222",
    "3222222222222222",
    "3222222222222222",
    "3222222222222222",
    "3222222222222222",
    "3111111111113333",
    "3111111111113333",
    "3222222222222222",
    "3222222222222222",
    "3222222222222222",
    "3222222222222222",
    "3222222222222222",
    "3222222222222222",
    "3222222222222222",
    "3222222222222222",
  ];

  /* two-frame shimmer: the highlights step sideways, the base holds */
  const water0 = [
    "wwwwwwwwwwwwwwww",
    "wwbbwwwwwwwbbwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwbWbwwwwwww",
    "wwwwwwwwwwwwwwww",
    "wbwwwwwwwwwwbbww",
    "wwwwwwwwwwwwwwww",
    "wwwwbbwwwwwwwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwwwwbWbwwww",
    "wwwwwwwwwwwwwwww",
    "wbbwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwwwbbwwwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwww",
  ];
  const water1 = [
    "wwwwwwwwwwwwwwww",
    "wwwbbwwwwwwbbwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwwbWbwwwwww",
    "wwwwwwwwwwwwwwww",
    "wwbwwwwwwwwwbbww",
    "wwwwwwwwwwwwwwww",
    "wwwwwbbwwwwwwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwwwwwbWbwww",
    "wwwwwwwwwwwwwwww",
    "wwbbwwwwwwwwwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwwwwbbwwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwww",
  ];

  /* the one-way hop-down ledge: grass, then a lit lip, then its cast shadow */
  const ledge = [
    "GGGGGGGGGGGGGGGG",
    "GGHGGGGGGGGHGGGG",
    "GGGGGGDGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
    "GGDGGGGGGGGGGDGG",
    "GGGGGGGGGGGGGGGG",
    "oooooooooooooooo",
    "ssssssssssssssss",
    "dddddddddddddddd",
    "eeeeeeeeeeeeeeee",
    "oooooooooooooooo",
    "kkkkkkkkkkkkkkkk",
    "DDDDDDDDDDDDDDDD",
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
  ];

  const flowers = [
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
    "GGGfGGGGGGGGGGGG",
    "GGfWfGGGGGGyGGGG",
    "GGGfGGGGGGyWyGGG",
    "GGGDGGGGGGGyGGGG",
    "GGGGGGGGGGGGDGGG",
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGyGGGGGGG",
    "GGGGGGGyWyGGGfGG",
    "GGGGGGGGyGGGfWfG",
    "GGGGGGGGDGGGGfGG",
    "GGGGGGGGGGGGGDGG",
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
  ];

  /* pavement above, kerb lip, route path below */
  const kerb = [
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "3111111111111112",
    "1111111111111111",
    "2222222222222222",
    "3333333333333333",
    "oooooooooooooooo",
    "ssssssssssssssss",
    "sssdssssssssssss",
    "ssssssssssssssss",
    "ssssssssssdsssss",
    "ssssssssssssssss",
    "ssssssssssssssss",
  ];

  const tiles = {
    grass,
    tallGrass,
    path,
    pathEdge,
    pavement,
    road: pavement, // alias: renderer's required key
    roadLineH,
    water: [water0, water1],
    ledge,
    flowers,
    kerb,
  };

  /* ── props ───────────────────────────────────────────────────────────── */
  /* Chunky round canopy, scalloped rim, three greens reading light→dark from
     the top-left, short stubby trunk. The FireRed route tree. */
  const treeA = [
    "......oooo......",
    "....ooCCCCoo....",
    "...oCCCCCCCCo...",
    "..oCCCCCCCCCCo..",
    ".oCCCCFFFFCCCCo.",
    ".oCCCFFFFFFFCCo.",
    "oCCCFFFFFFFFFECo",
    "oCCFFFFFFFFFFECo",
    "oCFFFFFFFFFFEECo",
    "oCFFFFFFFFFEEECo",
    "oCFFFFFFFFEEEECo",
    "oCFFFFFFFEEEEECo",
    ".oCFFFFFEEEEECo.",
    ".oCFFFFEEEEEECo.",
    "..oCFEEEEEEECo..",
    "...ooEEEEEEoo...",
    ".....oauuao.....",
    ".....oauuao.....",
    ".....oauuao.....",
    ".....oauuao.....",
    "....ooauuaoo....",
    "...oDDDDDDDDo...",
    "..oDDDDDDDDDDo..",
    "................",
  ];
  const treeB = [
    "................",
    "....oooooooo....",
    "..ooCCCCCCCCoo..",
    ".oCCCCFFFFCCCCo.",
    "oCCCFFFFFFFFCCCo",
    "oCCFFFFFFFFFFECo",
    "oCFFFFFFFFFEEECo",
    "oCFFFFFFFFEEEECo",
    "oCFFFFFFFEEEEECo",
    ".oCFFFFFEEEEECo.",
    ".oCFFFFEEEEEECo.",
    "..oCFEEEEEEECo..",
    "...ooEEEEEEoo...",
    "......oauo......",
    "....ooauuaoo....",
    "...oDDDDDDDDo...",
  ];

  const props = {
    treeA,
    treeB,
    /* wooden route board on a post */
    sign: [
      "................",
      "..oooooooooooo..",
      "..oaaaaaaaaaao..",
      "..oauuuuuuuuao..",
      "..oauuuuuuuuao..",
      "..oauuuuuuuuao..",
      "..oaaaaaaaaaao..",
      "..oooooooooooo..",
      "......oauo......",
      "......oauo......",
      "......oauo......",
      "......oauo......",
      "......oauo......",
      ".....ooauoo.....",
      "....oDDDDDDo....",
      "................",
    ],
    /* rails run the full 16px so a run of these butts seamlessly */
    fence: [
      "................",
      ".oao.....oao....",
      ".oao.....oao....",
      ".oao.....oao....",
      "oooooooooooooooo",
      "aaaaaaaaaaaaaaaa",
      "uuuuuuuuuuuuuuuu",
      ".oao.....oao....",
      ".oao.....oao....",
      "oooooooooooooooo",
      "aaaaaaaaaaaaaaaa",
      "uuuuuuuuuuuuuuuu",
      ".oao.....oao....",
      ".oao.....oao....",
      ".ouo.....ouo....",
      ".ooo.....ooo....",
    ],
    /* same rail heights as `fence`, so a gate drops into a run */
    fenceGate: [
      "................",
      ".oao.....oao....",
      ".oao.....oao....",
      ".oao.....oao....",
      "oooooooooooooooo",
      "aaaaaaaaaaaaaaaa",
      "uuuuuuuuuuuuuuuu",
      ".oao..a..oao....",
      ".oao.a...oao....",
      "oooooooooooooooo",
      "aaaaaaaaaaaaaaaa",
      "uuuuuuuuuuuuuuuu",
      ".oaoa....oao....",
      ".oao.....oao....",
      ".ouo.....ouo....",
      ".ooo.....ooo....",
    ],
    ledgeRock: [
      "................",
      "................",
      "....oooooo......",
      "..oo111111oo....",
      ".o1111111122o...",
      "o111111222222o..",
      "o111122222223o..",
      "o11222222233o...",
      ".o2222222233o...",
      "..oo22223333oo..",
      "....oooooooo....",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
    flowerPatch: [
      "................",
      "................",
      "...f.......y....",
      "..fWf.....yWy...",
      "...f.......y....",
      "...D.......D....",
      "...D...y...D....",
      "......yWy.......",
      ".......y........",
      "...f...D....y...",
      "..fWf..D...yWy..",
      "...f........y...",
      "...D........D...",
      "................",
      "................",
      "................",
    ],
    bench: [
      "........................",
      ".oooooooooooooooooooooo.",
      ".oaaaaaaaaaaaaaaaaaaaao.",
      ".ouuuuuuuuuuuuuuuuuuuuo.",
      ".oooooooooooooooooooooo.",
      "..o..................o..",
      "oooooooooooooooooooooooo",
      "oaaaaaaaaaaaaaaaaaaaaaao",
      "ouuuuuuuuuuuuuuuuuuuuuuo",
      "oooooooooooooooooooooooo",
      "..ou..............uo....",
      "..ou..............uo....",
      "..ou..............uo....",
      "..oo..............oo....",
      "...SSS..........SSS.....",
      "........................",
    ],
    lamp: [
      "......oooo......",
      ".....oYYYYo.....",
      "....oYWWWWYo....",
      "....oYWWWWYo....",
      ".....oYYYYo.....",
      "......oooo......",
      ".......oo.......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      "......o22o......",
      ".....o2222o.....",
      "....oo2222oo....",
      "....oooooooo....",
    ],
    crate: [
      "..oooooooooooo..",
      "..oaaaaaaaaaao..",
      "..ouuuuuuuuuuo..",
      "..oaaaaaaaaaao..",
      "..ouuuuuuuuuuo..",
      "..oaaaaaaaaaao..",
      "..ouuuuuuuuuuo..",
      "..oaaaaaaaaaao..",
      "..ouuuuuuuuuuo..",
      "..oaaaaaaaaaao..",
      "..ouuuuuuuuuuo..",
      "..oaaaaaaaaaao..",
      "..oooooooooooo..",
      "...SSSSSSSSSS...",
      "................",
      "................",
    ],
    barrel: [
      "....oooooooo....",
      "...oaaaaaaaao...",
      "..oouuuuuuuuoo..",
      "..oaaaaaaaaaao..",
      "..ouuuuuuuuuuo..",
      "..oooooooooooo..",
      "..oaaaaaaaaaao..",
      "..ouuuuuuuuuuo..",
      "..oaaaaaaaaaao..",
      "..oooooooooooo..",
      "..ouuuuuuuuuuo..",
      "..oaaaaaaaaaao..",
      "...ouuuuuuuuo...",
      "....oooooooo....",
      "....SSSSSSSS....",
      "................",
    ],
    well: [
      row(rep(".", 11), "oo", rep(".", 11)),
      row(rep(".", 10), "o", "RR", "o", rep(".", 10)),
      row(rep(".", 9), "o", rep("R", 4), "o", rep(".", 9)),
      row(rep(".", 8), "o", rep("L", 6), "o", rep(".", 8)),
      row(rep(".", 7), "o", rep("R", 8), "o", rep(".", 7)),
      row(rep(".", 6), "o", rep("R", 10), "o", rep(".", 6)),
      row(rep(".", 5), "o", rep("R", 12), "o", rep(".", 5)),
      row(rep(".", 4), "o", rep("r", 14), "o", rep(".", 4)),
      row(rep(".", 3), "o", rep("r", 16), "o", rep(".", 3)),
      row("..", rep("o", 20), ".."),
      row(rep(".", 5), "oao", rep(".", 8), "oao", rep(".", 5)),
      row(rep(".", 5), "oao", rep(".", 8), "oao", rep(".", 5)),
      row(rep(".", 5), "oao", rep(".", 8), "oao", rep(".", 5)),
      row(rep(".", 5), "ouo", rep(".", 8), "ouo", rep(".", 5)),
      row("..", rep("o", 20), ".."),
      row(".o", rep("1", 20), "o."),
      row(".o", "1", rep("2", 17), "3", "3", "o."),
      row(".o", "1", "2", rep("k", 17), "2", "o."),
      row(".o", "1", "2", rep("k", 17), "2", "o."),
      row(".o", "1", "2", rep("k", 17), "3", "o."),
      row(".o", "1", rep("2", 17), "3", "3", "o."),
      row(".o", rep("3", 20), "o."),
      row("..", rep("o", 20), ".."),
      row("...", rep("S", 18), "..."),
    ],
    mailbox: [
      "............",
      "..oooooo....",
      ".oRRRRRRo...",
      ".oRWWWWRo...",
      ".orrrrrro...",
      ".oooooooo...",
      "....oao.....",
      "....oao.....",
      "....oao.....",
      "....oao.....",
      "....oao.....",
      "...ooauoo...",
      "..oDDDDDDo..",
      "...SSSSSS...",
      "............",
      "............",
    ],
    rockSmall: [
      "................",
      "......oooo......",
      "....oo1111oo....",
      "...o11112222o...",
      "..o1111222223o..",
      "..o1122222233o..",
      "...oo222333oo...",
      ".....oooooo.....",
      "......SSSS......",
      "................",
      "................",
      "................",
    ],
    stump: [
      "................",
      "................",
      "....oooooooo....",
      "..oouuuuuuuuoo..",
      "..oauaaaaaauao..",
      "..oauauuuuauao..",
      "..oauauaauauao..",
      "..oauauuuuauao..",
      "..oauaaaaaauao..",
      "..oauuuuuuuuao..",
      "..ouuuuuuuuuuo..",
      "..oauuuuuuuuao..",
      "...oooooooooo...",
      "....SSSSSSSS....",
      "................",
      "................",
    ],
  };

  /* ── buildings ───────────────────────────────────────────────────────── */
  /* The FireRed house silhouette: a big coloured roof overhanging cream walls,
     a dark doorway with a step, square windows with a light-blue pane and a
     white corner glint. Long wall runs are span-composed so the width is
     guaranteed; the art is in the span layout, not in counting characters. */

  /* roof: highlight course, body, shadow course, eave, eave underside */
  const roofSlab = (w, hi, base, sh, rows) => {
    const inner = w - 6; // 2 margin + 1 outline each side
    const out = [row("..", rep("o", w - 4), "..")];
    out.push(row("..", "o", rep(hi, inner), "o", ".."));
    out.push(row("..", "o", rep(hi, inner), "o", ".."));
    for (let i = 0; i < rows; i++) out.push(row("..", "o", rep(base, inner), "o", ".."));
    for (let i = 0; i < 3; i++) out.push(row("..", "o", rep(sh, inner), "o", ".."));
    out.push(row("..", rep("o", w - 4), ".."));
    out.push(rep("o", w));
    out.push(row("o", rep("k", w - 2), "o"));
    return out;
  };
  /* wall course: 4px inset from the roof's overhang */
  const wallRow = (w, inner) => row(rep(".", 4), "o", inner, "o", rep(".", 4));
  /* a window: frame, then panes with the glint in the top-left pixel */
  const paneTop = n => row("W", rep("p", n - 1));
  const paneMid = n => row(rep("p", n - 1), "P");
  const paneBot = n => rep("P", n);

  /* ── house · 48×48 ───────────────────────────────────────────────────── */
  const house = roofSlab(48, "L", "R", "r", 14);
  const hW = 38; // wall inner width
  for (let i = 0; i < 4; i++) house.push(wallRow(48, rep("c", hW)));
  house.push(wallRow(48, row(rep("c", 4), rep("o", 8), rep("c", 14), rep("o", 8), rep("c", 4))));
  const hPane = p => wallRow(48, row(rep("c", 4), "o", p, "o", rep("c", 14), "o", p, "o", rep("c", 4)));
  house.push(hPane(paneTop(6)));
  for (let i = 0; i < 4; i++) house.push(hPane(paneMid(6)));
  house.push(hPane(paneBot(6)));
  house.push(wallRow(48, row(rep("c", 4), rep("o", 8), rep("c", 14), rep("o", 8), rep("c", 4))));
  for (let i = 0; i < 3; i++) house.push(wallRow(48, rep("c", hW)));
  house.push(wallRow(48, row(rep("c", 16), rep("o", 8), rep("c", 14))));
  for (let i = 0; i < 6; i++)
    house.push(wallRow(48, row(rep("c", 16), "o", rep("k", 6), "o", rep("c", 14))));
  house.push(row(rep(".", 4), rep("o", 40), rep(".", 4)));
  house.push(row(rep(".", 3), rep("m", 42), rep(".", 3)));
  house.push(row(rep(".", 2), rep("S", 44), rep(".", 2)));

  /* ── shop · 64×48 · the PokéMart blue roof, sign band, twin windows ──── */
  const shop = roofSlab(64, "N", "B", "n", 14);
  const sW = 54;
  shop.push(wallRow(64, rep("c", sW)));
  shop.push(wallRow(64, row(rep("c", 6), rep("o", 42), rep("c", 6))));
  for (let i = 0; i < 2; i++)
    shop.push(wallRow(64, row(rep("c", 6), "o", rep("W", 40), "o", rep("c", 6))));
  shop.push(wallRow(64, row(rep("c", 6), rep("o", 42), rep("c", 6))));
  for (let i = 0; i < 2; i++) shop.push(wallRow(64, rep("c", sW)));
  const sFrame = row(rep("c", 4), rep("o", 10), rep("c", 26), rep("o", 10), rep("c", 4));
  shop.push(wallRow(64, sFrame));
  const sPane = p => wallRow(64, row(rep("c", 4), "o", p, "o", rep("c", 26), "o", p, "o", rep("c", 4)));
  shop.push(sPane(paneTop(8)));
  for (let i = 0; i < 4; i++) shop.push(sPane(paneMid(8)));
  shop.push(sPane(paneBot(8)));
  shop.push(wallRow(64, sFrame));
  shop.push(wallRow(64, row(rep("c", 22), rep("o", 10), rep("c", 22))));
  for (let i = 0; i < 7; i++)
    shop.push(wallRow(64, row(rep("c", 22), "o", rep("k", 8), "o", rep("c", 22))));
  shop.push(row(rep(".", 4), rep("o", 56), rep(".", 4)));
  shop.push(row(rep(".", 2), rep("S", 60), rep(".", 2)));

  /* ── gym · 64×64 · tall red roof, board sign, three windows ──────────── */
  const gym = roofSlab(64, "L", "R", "r", 18);
  const gW = 54;
  for (let i = 0; i < 3; i++) gym.push(wallRow(64, rep("c", gW)));
  gym.push(wallRow(64, row(rep("c", 8), rep("o", 38), rep("c", 8))));
  for (let i = 0; i < 3; i++)
    gym.push(wallRow(64, row(rep("c", 8), "o", rep("u", 36), "o", rep("c", 8))));
  gym.push(wallRow(64, row(rep("c", 8), rep("o", 38), rep("c", 8))));
  for (let i = 0; i < 2; i++) gym.push(wallRow(64, rep("c", gW)));
  const gFrame = row(rep("c", 4), rep("o", 8), rep("c", 11), rep("o", 8), rep("c", 11), rep("o", 8), rep("c", 4));
  gym.push(wallRow(64, gFrame));
  const gPane = p => wallRow(64, row(rep("c", 4), "o", p, "o", rep("c", 11), "o", p, "o",
                                     rep("c", 11), "o", p, "o", rep("c", 4)));
  gym.push(gPane(paneTop(6)));
  for (let i = 0; i < 5; i++) gym.push(gPane(paneMid(6)));
  gym.push(gPane(paneBot(6)));
  gym.push(wallRow(64, gFrame));
  for (let i = 0; i < 4; i++) gym.push(wallRow(64, rep("c", gW)));
  gym.push(wallRow(64, row(rep("c", 21), rep("o", 12), rep("c", 21))));
  for (let i = 0; i < 10; i++)
    gym.push(wallRow(64, row(rep("c", 21), "o", rep("k", 10), "o", rep("c", 21))));
  gym.push(row(rep(".", 4), rep("o", 56), rep(".", 4)));
  gym.push(row(rep(".", 3), rep("m", 58), rep(".", 3)));
  gym.push(row(rep(".", 2), rep("S", 60), rep(".", 2)));

  /* ── lab · 80×48 · Oak's wide slate-roofed building, four windows ────── */
  const lab = roofSlab(80, "2", "J", "j", 14);
  const lW = 70;
  for (let i = 0; i < 4; i++) lab.push(wallRow(80, rep("c", lW)));
  const lFrame = row(rep("c", 6), rep("o", 8), rep("c", 8), rep("o", 8), rep("c", 10),
                     rep("o", 8), rep("c", 8), rep("o", 8), rep("c", 6));
  lab.push(wallRow(80, lFrame));
  const lPane = p => wallRow(80, row(rep("c", 6), "o", p, "o", rep("c", 8), "o", p, "o",
                                     rep("c", 10), "o", p, "o", rep("c", 8), "o", p, "o", rep("c", 6)));
  lab.push(lPane(paneTop(6)));
  for (let i = 0; i < 4; i++) lab.push(lPane(paneMid(6)));
  lab.push(lPane(paneBot(6)));
  lab.push(wallRow(80, lFrame));
  for (let i = 0; i < 3; i++) lab.push(wallRow(80, rep("c", lW)));
  lab.push(wallRow(80, row(rep("c", 31), rep("o", 10), rep("c", 29))));
  for (let i = 0; i < 6; i++)
    lab.push(wallRow(80, row(rep("c", 31), "o", rep("k", 8), "o", rep("c", 29))));
  lab.push(row(rep(".", 4), rep("o", 72), rep(".", 4)));
  lab.push(row(rep(".", 3), rep("m", 74), rep(".", 3)));
  lab.push(row(rep(".", 2), rep("S", 76), rep(".", 2)));

  const buildings = {
    house: { grid: house, windows: [...rect(10, 28, 6, 6), ...rect(32, 28, 6, 6)] },
    shop: { grid: shop, windows: [...rect(10, 31, 8, 6), ...rect(46, 31, 8, 6)] },
    gym: {
      grid: gym,
      windows: [...rect(10, 39, 6, 7), ...rect(29, 39, 6, 7), ...rect(48, 39, 6, 7)],
    },
    lab: {
      grid: lab,
      windows: [
        ...rect(12, 28, 6, 6), ...rect(28, 28, 6, 6),
        ...rect(46, 28, 6, 6), ...rect(62, 28, 6, 6),
      ],
    },
  };

  /* ── actors · 16×24 ──────────────────────────────────────────────────── */
  /* Body templates use placeholders: @ shirt, # shirt shadow, % trousers,
     & shoes. Substituted per archetype so the four share one walk but never
     share a silhouette — headgear and held items do that work. */
  const BLANK = rep(".", 16);

  const bodyS = {
    stand: [
      "....o@@@@@@o....",
      "...o@@@@@@@@o...",
      "..oA@@@@@@@@Ao..",
      "..oA@@@@@@@@Ao..",
      "...o@@@@@@@@o...",
      "...o@@@@@@@@o...",
      "....o######o....",
      "....o%%%%%%o....",
      "....o%%%%%%o....",
      "....o%%..%%o....",
      "....o%%..%%o....",
      "....o%%..%%o....",
      "....o&&..&&o....",
      "....ooo..ooo....",
      ".....SSSSSS.....",
    ],
    step1: [
      "...o@@@@@@@@o...",
      "...o@@@@@@@@Ao..",
      "...o@@@@@@@@Ao..",
      "..oA@@@@@@@@o...",
      "..oA@@@@@@@@o...",
      "....o######o....",
      "....o%%%%%%o....",
      "....o%%%%%%o....",
      "....o%%..%%o....",
      "....o%%..%%o....",
      "....o%%...%%o...",
      "....o&&...&&o...",
      "....ooo...ooo...",
      ".....SSSSSS.....",
    ],
    step2: [
      "...o@@@@@@@@o...",
      "..oA@@@@@@@@o...",
      "..oA@@@@@@@@o...",
      "...o@@@@@@@@Ao..",
      "...o@@@@@@@@Ao..",
      "....o######o....",
      "....o%%%%%%o....",
      "....o%%%%%%o....",
      "....o%%..%%o....",
      "....o%%..%%o....",
      "...o%%...%%o....",
      "...o&&...&&o....",
      "...ooo...ooo....",
      ".....SSSSSS.....",
    ],
  };

  const bodyE = {
    stand: [
      ".....o@@@@@o....",
      "....o@@@@@@@o...",
      "....o@@@@@@@Ao..",
      "....o@@@@@@@Ao..",
      "....o@@@@@@@o...",
      "....o@@@@@@@o...",
      ".....o#####o....",
      ".....o%%%%%o....",
      ".....o%%%%%o....",
      ".....o%%%%%o....",
      ".....o%%.%%o....",
      ".....o%%.%%o....",
      ".....o&&.&&o....",
      ".....ooo.ooo....",
      "......SSSSS.....",
    ],
    step1: [
      "....o@@@@@@@o...",
      "....o@@@@@@@Ao..",
      "....o@@@@@@@Ao..",
      "....o@@@@@@@o...",
      "....o@@@@@@@o...",
      ".....o#####o....",
      ".....o%%%%%o....",
      ".....o%%%%%o....",
      ".....o%%%%%o....",
      "....o%%...%%o...",
      "....o%%...%%o...",
      "....o&&...&&o...",
      "....ooo...ooo...",
      "......SSSSS.....",
    ],
    step2: [
      "....o@@@@@@@o...",
      "...oA@@@@@@@o...",
      "...oA@@@@@@@o...",
      "....o@@@@@@@o...",
      "....o@@@@@@@o...",
      ".....o#####o....",
      ".....o%%%%%o....",
      ".....o%%%%%o....",
      ".....o%%%%%o....",
      ".....o%%%%%o....",
      ".....o%%%%%o....",
      ".....o&&&&&o....",
      ".....ooooooo....",
      "......SSSSS.....",
    ],
  };

  const sub = (rows, m) =>
    rows.map(r => r.replace(/[@#%&]/g, ch => m[ch]));

  /* paint a list of [x, y, ch] onto a copy of a grid */
  const stamp = (grid, px) => {
    const g = grid.map(r => r.split(""));
    px.forEach(([x, y, ch]) => {
      if (y >= 0 && y < g.length && x >= 0 && x < g[y].length) g[y][x] = ch;
    });
    return g.map(r => r.join(""));
  };

  const vline = (x, y0, y1, ch) => {
    const out = [];
    for (let y = y0; y <= y1; y++) out.push([x, y, ch]);
    return out;
  };

  /* assemble one 24-row actor frame from a 9-row head and a body template */
  const frame = (head, body, isStep) =>
    isStep ? [BLANK, ...head, ...body] : [...head, ...body];

  function makeActor(head, chars, items) {
    const S = m => sub(bodyS[m], chars);
    const E = m => sub(bodyE[m], chars);
    const mk = (h, b, isStep, px) => stamp(frame(h, b, isStep), px || []);
    return {
      s: [
        mk(head.s, S("stand"), false, items.s),
        mk(head.s, S("step1"), true, items.s),
        mk(head.s, S("stand"), false, items.s),
        mk(head.s, S("step2"), true, items.s),
      ],
      n: [
        mk(head.n, S("stand"), false, items.n),
        mk(head.n, S("step1"), true, items.n),
        mk(head.n, S("stand"), false, items.n),
        mk(head.n, S("step2"), true, items.n),
      ],
      e: [
        mk(head.e, E("stand"), false, items.e),
        mk(head.e, E("step1"), true, items.e),
        mk(head.e, E("stand"), false, items.e),
        mk(head.e, E("step2"), true, items.e),
      ],
      work: [
        mk(head.s, S("stand"), false, items.work0 || items.s),
        mk(head.s, S("stand"), false, items.work1 || items.s),
      ],
    };
  }

  /* ── heads ───────────────────────────────────────────────────────────── */
  const capHead = c => ({
    s: [
      "......oooo......",
      `....oo${c}${c}${c}${c}oo....`,
      `...o${rep(c, 8)}o...`,
      `...o${rep(c, 8)}o...`,
      "...ooooooooooo..",
      "...oAAAAAAAAo...",
      "...oAkAAAAkAo...",
      "...oAAAAAAAAo...",
      "....oKKKKKKo....",
    ],
    n: [
      "......oooo......",
      `....oo${c}${c}${c}${c}oo....`,
      `...o${rep(c, 8)}o...`,
      `...o${rep(c, 8)}o...`,
      "...ooooooooooo..",
      "...ouuuuuuuuo...",
      "...ouuuuuuuuo...",
      "...ouuuuuuuuo...",
      "....oKKKKKKo....",
    ],
    e: [
      "......oooo......",
      `....oo${c}${c}${c}${c}oo....`,
      `...o${rep(c, 8)}o...`,
      `...o${rep(c, 9)}o..`,
      "...oooooooooooo.",
      "....oAAAAAAAo...",
      "....oAAAkAAAo...",
      "....oAAAAAAAo...",
      ".....oKKKKKo....",
    ],
  });

  const hardHatHead = {
    s: [
      "......oooo......",
      "....oohhhhoo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhho..",
      "..oooooooooooo..",
      "...oAAAAAAAAo...",
      "...oAkAAAAkAo...",
      "...oAAAAAAAAo...",
      "....oKKKKKKo....",
    ],
    n: [
      "......oooo......",
      "....oohhhhoo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhho..",
      "..oooooooooooo..",
      "...ouuuuuuuuo...",
      "...ouuuuuuuuo...",
      "...ouuuuuuuuo...",
      "....oKKKKKKo....",
    ],
    e: [
      "......oooo......",
      "....oohhhhoo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhhho.",
      "..ooooooooooooo.",
      "....oAAAAAAAo...",
      "....oAAAkAAAo...",
      "....oAAAAAAAo...",
      ".....oKKKKKo....",
    ],
  };

  const strawHatHead = {
    s: [
      "......oooo......",
      "....oohhhhoo....",
      "...ohhhhhhhho...",
      ".oohhhhhhhhhhoo.",
      "oiiiiiiiiiiiiiio",
      "oooooooooooooooo",
      "....oAAAAAAo....",
      "....oAkAAkAo....",
      ".....oKKKKo.....",
    ],
    n: [
      "......oooo......",
      "....oohhhhoo....",
      "...ohhhhhhhho...",
      ".oohhhhhhhhhhoo.",
      "oiiiiiiiiiiiiiio",
      "oooooooooooooooo",
      "....ouuuuuuo....",
      "....ouuuuuuo....",
      ".....oKKKKo.....",
    ],
    e: [
      "......oooo......",
      "....oohhhhoo....",
      "...ohhhhhhhho...",
      ".oohhhhhhhhhhhoo",
      "oiiiiiiiiiiiiiio",
      "oooooooooooooooo",
      "....oAAAAAAo....",
      "....oAAAkAo.....",
      ".....oKKKKo.....",
    ],
  };

  /* ── held items ──────────────────────────────────────────────────────── */
  const rod = (x, y0, y1, side) => [
    ...vline(x, y0, y1, "a"),
    ...vline(x + side, y0, y1, "o"),
    [x, y0 - 1, "o"],
  ];
  const parcel = (x, y) => {
    const px = [];
    for (let i = 0; i < 6; i++) { px.push([x + i, y, "o"]); px.push([x + i, y + 5, "o"]); }
    for (let j = 1; j < 5; j++) {
      px.push([x, y + j, "o"], [x + 5, y + j, "o"]);
      for (let i = 1; i < 5; i++) px.push([x + i, y + j, "a"]);
    }
    px.push([x + 2, y + 2, "y"], [x + 3, y + 2, "y"]);
    px.push([x + 1, y + 1, "d"]);
    return px;
  };
  const wrench = y => [
    [13, y, "1"], [14, y, "1"], [15, y, "o"],
    [13, y + 1, "o"], [14, y + 1, "1"], [15, y + 1, "o"],
    ...vline(14, y + 2, y + 4, "2"), ...vline(15, y + 2, y + 4, "o"),
    [13, y + 5, "o"], [14, y + 5, "o"],
  ];
  /* The can hangs entirely clear of the body (x >= 12) so it never punches a
     hole in the figure's outline, and it pours off the sprite's right edge
     rather than through the gardener's own legs. */
  const can = (pour) => {
    const px = [
      [13, 14, "o"], [14, 14, "o"],
      [12, 15, "o"], [13, 15, "2"], [14, 15, "2"], [15, 15, "o"],
      [12, 16, "o"], [13, 16, "2"], [14, 16, "3"], [15, 16, "o"],
      [12, 17, "o"], [13, 17, "2"], [14, 17, "3"], [15, 17, "o"],
      [12, 18, "o"], [13, 18, "3"], [14, 18, "3"], [15, 18, "o"],
      [12, 19, "o"], [13, 19, "o"], [14, 19, "o"], [15, 19, "o"],
    ];
    if (pour) px.push([15, 20, "b"], [15, 21, "b"], [14, 22, "b"], [15, 22, "W"]);
    return px;
  };

  const actors = {
    surveyor: makeActor(
      capHead("z"),
      { "@": "v", "#": "V", "%": "t", "&": "u" },
      {
        s: rod(14, 4, 22, 1),
        n: rod(1, 4, 22, -1),
        e: rod(13, 4, 22, 1),
        work0: rod(14, 4, 22, 1),
        work1: rod(14, 0, 18, 1),
      }
    ),
    courier: makeActor(
      capHead("x"),
      { "@": "x", "#": "X", "%": "t", "&": "u" },
      {
        s: parcel(5, 14),
        n: [...vline(6, 10, 15, "u"), ...vline(9, 10, 15, "u")],
        e: parcel(9, 14),
        work0: parcel(5, 13),
        work1: parcel(5, 17),
      }
    ),
    engineer: makeActor(
      hardHatHead,
      { "@": "h", "#": "i", "%": "z", "&": "u" },
      { s: wrench(14), n: wrench(14), e: wrench(13), work0: wrench(12), work1: wrench(16) }
    ),
    gardener: makeActor(
      strawHatHead,
      { "@": "g", "#": "Q", "%": "t", "&": "u" },
      { s: can(false), n: can(false), e: can(false), work0: can(false), work1: can(true) }
    ),
  };

  window.CITY_ART = { palette, meta, tiles, props, buildings, actors };
})();
