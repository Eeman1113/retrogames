#!/usr/bin/env python3
"""build_markdown.py — renders TOP5_GAMES.md from data/*.csv. Never hand-edit the md."""
import csv, os
from collections import defaultdict

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(HERE, "data")

rd = lambda n: list(csv.DictReader(open(os.path.join(D, n))))
systems, games, tools = rd("systems.csv"), rd("games.csv"), rd("tools.csv")

by_sys = defaultdict(list)
for g in games:
    by_sys[g["sys_id"]].append(g)
for v in by_sys.values():
    v.sort(key=lambda r: int(r["rank"]))

# user's original grouping, in order
GROUPS = [
    ("Nintendo", ["nes","famicom","snes","sfc","n64","gb","gbc","gba","vb","pkmn_mini","gw"]),
    ("Sega", ["md","sms","gg","sg1000","segacd"]),
    ("NEC", ["pce","pcecd","sgfx"]),
    ("Sony", ["ps1","psp"]),
    ("Arcade", ["cps1","cps2","cps3","neogeo","mame"]),
    ("Handhelds", ["ngp","ngpc","ws","wsc","lynx"]),
    ("Atari & early consoles", ["a2600","a7800","o2","intv","coleco"]),
    ("Computers", ["msx","msx2","zx","cpc"]),
    ("Ports", ["ports"]),
]
S = {s["id"]: s for s in systems}
assert sum(len(v) for _, v in GROUPS) == len(systems), "grouping drift"

EXCL = {"exclusive": "exclusive", "regional": "region-locked",
        "multi": "multi-platform", "arcade-only": "never ported"}

out = []
w = out.append
w("# Top 5 Unique Games per System")
w("")
w("One pass through all 41 emulated systems in this collection. **\"Unique\" is the "
  "selection rule, not a tiebreaker:** each pick had to be a game you can only "
  "really have *on that system* — a hardware exclusive, a region-locked release, "
  "or a version so far ahead of its ports that the others don't count. Where a "
  "platform's whole identity is arcade conversions (CPS boards, ColecoVision), the "
  "pick is the board/console the game was *built for*.")
w("")
w("Each entry carries a `canon_score` — a **curated 0–100 index** of how strongly "
  "the title sits in the retro canon (contemporary reception + retrospective "
  "standing + how often it gets re-released or re-ranked). It is an editorial "
  "construct built for this collection, not a scraped Metacritic figure, and "
  "`analysis.ipynb` treats it as exactly that: an ordinal judgement to be tested "
  "against independent data (hardware install base, library size, release timing).")
w("")
w("Source of truth is `data/games.csv` + `data/systems.csv`. This file is generated — "
  "run `python3 scripts/build_markdown.py` after editing the data.")
w("")

# ---- contents
w("## Contents")
w("")
n = 0
for gname, ids in GROUPS:
    w(f"**{gname}** — " + " · ".join(
        f"[{S[i]['system']}](#{n + k + 1}-" +
        S[i]["system"].lower().replace(" / ", "--").replace(" ", "-").replace("&", "").replace(".", "")
        + ")" for k, i in enumerate(ids)))
    n += len(ids)
    w("")

idx = 0
for gname, ids in GROUPS:
    w(f"---")
    w("")
    w(f"# {gname}")
    w("")
    for sid in ids:
        idx += 1
        s = S[sid]
        u = s["units_m"]
        if u and float(u) > 0:
            hw = f"{float(u):,.2f}M units"
        elif u:
            hw = "<0.01M units"
        else:
            hw = ("no install base (source ports)" if s["category"] == "Ports"
                  else "no install base (arcade board)")
        w(f"## {idx}. {s['system']}")
        w("")
        w(f"> {s['maker']} · {s['category']} · launched {s['launch']} · gen {s['gen']} · "
          f"{s['media']} · {s['cpu_bits']}-bit · {hw} · ~{s['library_size'].lstrip('~')} titles")
        w(f">")
        w(f"> {s['note']}.")
        w("")
        w("| # | Game | Year | Genre | Developer | Availability | canon |")
        w("|---|------|------|-------|-----------|--------------|-------|")
        for g in by_sys[sid]:
            w(f"| {g['rank']} | **{g['game']}** | {g['year']} | {g['genre']} | "
              f"{g['developer']} | {EXCL[g['exclusive']]} | {g['canon_score']} |")
        w("")
        for g in by_sys[sid]:
            w(f"- **{g['game']}** — {g['note']}.")
        w("")

w("---")
w("")
w("# Tools")
w("")
w("The one category with no games in it. Listed for completeness — these are what "
  "actually run everything above.")
w("")
w("| Tool | Purpose | Why it matters |")
w("|------|---------|----------------|")
for t in tools:
    w(f"| **{t['tool']}** | {t['purpose']} | {t['note']} |")
w("")
w("---")
w("")
w("## Method & caveats")
w("")
w("- **Availability** is judged at original release. `region-locked` means it never "
  "got an official release outside Japan (or, for a few PAL titles, outside Europe) "
  "during the system's life; later Virtual Console / collection re-releases are "
  "ignored, because they are not what made the game unique to the hardware.")
w("- **Hardware units** are lifetime shipped figures from published manufacturer or "
  "encyclopaedic sources. Two caveats carried in the data: the 61.91M NES figure is "
  "NES+Famicom combined (same for SNES/Super Famicom at 49.10M), and Nintendo only "
  "ever reported Game Boy and Game Boy Color together (118.69M) — the 64.42M / 54.27M "
  "split used here is the common estimate, not an official number.")
w("- **Software sales** are left blank wherever no credible figure is published. That "
  "is most of the obscure library on purpose: the notebook analyses the missingness "
  "rather than imputing through it, because the gaps are not random — they track "
  "commercial obscurity, which is exactly the variable under test.")
w("- **ColecoVision at 6.00M** is the as-of-1984 figure; lower numbers circulate.")
w("- **`canon_score` is editorial.** It is reproducible (one author, one pass, one "
  "rubric) but not independent of the author. The notebook's central check is "
  "whether it correlates with things nobody curated — and where it doesn't.")
w("")

p = os.path.join(HERE, "TOP5_GAMES.md")
open(p, "w").write("\n".join(out) + "\n")
print(f"wrote {p}  ({len(out)} lines, {len(games)} games, {len(systems)} systems)")
