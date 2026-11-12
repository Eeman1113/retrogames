# retrogames

Two deliverables over the same 41-system collection:

| File | What it is |
|------|------------|
| **[`TOP5_GAMES.md`](TOP5_GAMES.md)** | The top 5 most *unique* games for each of the 41 systems — 205 picks, with why each one belongs to that hardware and nowhere else |
| **[`analysis.ipynb`](analysis.ipynb)** | The audit: the curation treated as data, joined to hardware facts, with 11 figures and the statistics to back (or kill) each claim |

## Layout

```
data/
  systems.csv            41 systems: maker, launch, generation, media, units shipped, library size
  games.csv              205 picks:  rank, year, genre, developer, availability, sales, canon_score
  tools.csv              the one category with no games in it
  derived/               written by the notebook: platform summary, enriched games, residuals
scripts/
  build_dataset.py       the ONLY place data is edited; asserts integrity, emits data/*.csv
  build_markdown.py      renders TOP5_GAMES.md from the CSVs — never hand-edit the md
  build_notebook.py      authors analysis.ipynb cell by cell
  run_notebook.py        executes the notebook end to end and fails on any cell error
TOP5_GAMES.md            generated
analysis.ipynb           generated, with outputs committed
```

To change a pick or a fact, edit `scripts/build_dataset.py` and re-run everything:

```bash
python3 scripts/build_dataset.py      # rebuilds data/*.csv, fails loudly on bad data
python3 scripts/build_markdown.py     # rebuilds TOP5_GAMES.md
python3 -m venv .venv && .venv/bin/pip install pandas numpy scipy matplotlib \
        scikit-learn statsmodels nbformat nbclient ipykernel
.venv/bin/python scripts/build_notebook.py
.venv/bin/python scripts/run_notebook.py analysis.ipynb
```

`build_dataset.py` refuses to emit data that fails any of: 41 unique systems, exactly
5 picks per system, unique ranks 1–5 within a system, every `sys_id` resolvable,
`canon_score` in 0–100, release years in range, and **no negative lag** — a game
dated before its own platform launched, which is what a mixed Japanese/Western
date convention produces and what the first draft of this dataset actually did.

`run_notebook.py` executes with `allow_errors=True` and then exits non-zero if any
cell raised, so a broken notebook can never be committed with its outputs looking fine.

## What the analysis found

1. **The canon is back-loaded — median 3 years after launch** — but handhelds invert
   it (median 1 year): short lives, and the pack-in is often the defining game.
2. **"Later games are better" is a Simpson's paradox.** Pooled ρ = +0.348 (p < 1e-6);
   *within* a platform ρ = −0.088 (p = 0.21); *between* platforms ρ = +0.521. The
   pooled number measures which platforms lasted, not which games were good.
3. **Library size beats install base.** Mean canon regresses on both (adj. R² = 0.57),
   and the library-size coefficient (+5.14/decade) is larger and better-determined
   than install base (+3.49/decade).
4. **Biggest over-performer: the Neo Geo** (+14.6 residual on 410k units). Biggest
   under-performer: the **SG-1000** (−15.9).
5. **Only 22% of picks have a published sales figure**, and the missingness is
   structured — 0% of arcade-only titles, 2.6% of region-locked ones. That is MNAR
   data; the notebook tests it rather than dropping it.
6. **66 developers, HHI 468 — unconcentrated**, yet Gini 0.548 and the top five
   studios hold 42% of the canon. The two statistics disagree on purpose.

Caveats are stated in the notebook's final cell, including the two install-base
figures that are estimates (NES/Famicom and GB/GBC are reported combined) and the
fact that `canon_score` is an editorial index, reproducible but not independent.

## Method note on `canon_score`

It is a curated 0–100 index of how strongly a title sits in the retro canon, written
for this collection. It is **not** a scraped review aggregate, and the notebook
treats it as the suspect variable throughout: §9 re-runs the headline result 2,000
times with ±5 points of simulated curator disagreement (sign holds in 100% of draws)
and collapses the scale to rank-only as a second check.

Platform and software facts were checked against published sources during
compilation — hardware unit totals, the complete small libraries (Pokémon Mini's 10
games, the SuperGrafx's 5 dedicated titles, CPS-3's 6, the Neo Geo Pocket's
monochrome run), and community rankings for the systems where no critical record
exists (SG-1000, Amstrad CPC, Atari 7800, WonderSwan Color).
