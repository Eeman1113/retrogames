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
    M: "#b0a088", // cream wall deep shadow

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
    Z: "#203868", // cloth blue shadow
    x: "#e04848", // cloth red
    X: "#a02828", // cloth red shadow
    v: "#f0f0f0", // cloth white
    V: "#c0c0c8", // cloth white shadow
    h: "#f0c040", // straw / hard hat
    i: "#c09020", // straw / hard hat shadow
    t: "#504038", // trousers
    q: "#383028", // trousers shadow
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
      row(".o", "1", rep("2", 18), "o."),
      row(".o", "1", "2", rep("k", 16), "o."),
      row(".o", "1", "2", rep("k", 16), "o."),
      row(".o", "1", "2", rep("k", 16), "o."),
      row(".o", "1", rep("2", 18), "o."),
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
      "...o111122 2o...".replace(" ", "2"),
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
