#!/usr/bin/env python3
"""build_site.py — emits docs/data.json for the GitHub Pages site.

Recomputes the headline statistics from data/*.csv using the same definitions as
analysis.ipynb, so the site can never drift from the notebook. Requires the venv
(pandas + scipy); everything the page renders comes out of here.
"""
import json, os
import numpy as np, pandas as pd
from scipy import stats

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(HERE, "data")

systems = pd.read_csv(f"{D}/systems.csv")
games = pd.read_csv(f"{D}/games.csv")
df = games.merge(systems, left_on="sys_id", right_on="id", validate="many_to_one")
df["lag"] = df["year"] - df["launch"]
df["has_sales"] = df["sales_m"].notna()
systems["lib"] = systems["library_size"].str.lstrip("~").astype(int)

# ---- the Simpson's paradox decomposition (notebook §3) --------------------
pooled = stats.spearmanr(df.lag, df.canon_score)
w = df.assign(l=df.lag - df.groupby("sys_id").lag.transform("mean"),
              c=df.canon_score - df.groupby("sys_id").canon_score.transform("mean"))
within = stats.spearmanr(w.l, w.c)
bt = df.groupby("sys_id").agg(l=("lag", "mean"), c=("canon_score", "mean"))
between = stats.spearmanr(bt.l, bt.c)

# ---- platform level (notebook §5) ----------------------------------------
plat = (df.groupby("sys_id")
          .agg(name=("system", "first"), cat=("category", "first"),
               maker=("maker", "first"), launch=("launch", "first"),
               units=("units_m", "first"), canon=("canon_score", "mean"))
          .reset_index().merge(systems[["id", "lib"]], left_on="sys_id", right_on="id"))
reg = plat.dropna(subset=["units"]).query("units > 0.01").copy()
X = np.c_[np.ones(len(reg)), np.log10(reg.units), np.log10(reg.lib)]
beta, *_ = np.linalg.lstsq(X, reg.canon.values, rcond=None)
reg["resid"] = reg.canon.values - X @ beta
ss_res = (reg.resid ** 2).sum(); ss_tot = ((reg.canon - reg.canon.mean()) ** 2).sum()
adj_r2 = 1 - (ss_res / (len(reg) - 3)) / (ss_tot / (len(reg) - 1))
r_simple = stats.pearsonr(np.log10(reg.units), reg.canon)[0]

# ---- genre families (same mapping as the notebook) -----------------------
FAMILY = {
    "Platformer": "Platform", "Action-platformer": "Platform",
    "Puzzle-platformer": "Platform", "Action": "Platform",
    "Metroidvania": "Metroidvania", "RPG": "RPG", "Action RPG": "RPG",
    "Dungeon crawler": "RPG", "Tactical RPG": "Strategy", "Tactical": "Strategy",
    "Strategy": "Strategy", "Turn-based strategy": "Strategy",
    "Shoot 'em up": "Shooter", "FPS": "Shooter", "Twin-stick shooter": "Shooter",
    "Run and gun": "Shooter", "Light gun": "Shooter",
    "Fighting": "Fighting", "Beat 'em up": "Fighting",
    "Action-adventure": "Adventure", "Adventure": "Adventure",
    "Isometric adventure": "Adventure", "Survival horror": "Adventure",
    "Puzzle": "Puzzle", "Maze": "Puzzle", "Puzzle/Horror": "Puzzle",
    "Stealth": "Stealth",
}
df["family"] = df.genre.map(FAMILY).fillna("Other")

SPRITE = {"Platform": "hero", "Shooter": "ship", "Fighting": "fist", "RPG": "slime",
          "Adventure": "key", "Puzzle": "ghost", "Strategy": "crown",
          "Metroidvania": "suit", "Stealth": "box", "Other": "cart"}

devs = (df.developer.str.split(" / ").str[0].str.replace(r"^Nintendo (R&D|EAD|CS).*", "Nintendo", regex=True)
          .replace({"Sega CS": "Sega", "Sega Technical Institute": "Sega",
                    "Kojima Productions": "Konami"}))
dc = devs.value_counts()
g = np.sort(dc.values); n = len(g)
gini = (2 * np.arange(1, n + 1) - n - 1).dot(g) / (n * g.sum())

out = {
    "counts": {
        "systems": int(df.sys_id.nunique()), "games": len(df),
        "developers": int(dc.size), "makers": int(df.maker.nunique()),
        "years": [int(df.year.min()), int(df.year.max())],
        "exclusive_pct": round(100 * df.exclusive.isin(
            ["exclusive", "regional", "arcade-only"]).mean(), 1),
        "sales_known_pct": round(100 * df.has_sales.mean()),
        "median_lag": int(df.lag.median()),
        "adj_r2": round(float(adj_r2), 3), "r_simple": round(float(r_simple), 3),
        "gini": round(float(gini), 3),
        "coef_units": round(float(beta[1]), 2), "coef_lib": round(float(beta[2]), 2),
    },
    "paradox": [
        {"k": "pooled", "label": "All 205 picks together",
         "rho": round(pooled.statistic, 3), "p": float(pooled.pvalue), "n": len(df),
         "note": "Looks like proof that later games are better."},
        {"k": "within", "label": "Within one platform",
         "rho": round(within.statistic, 3), "p": float(within.pvalue), "n": len(df),
         "note": "Centre both columns on each system's own mean and it vanishes."},
        {"k": "between", "label": "Between platforms",
         "rho": round(between.statistic, 3), "p": float(between.pvalue), "n": len(bt),
         "note": "The real effect: long-lived platforms have stronger canons."},
    ],
    "lag_by_cat": [{"cat": k, "median": float(v), "n": int(c)} for k, v, c in
                   zip(*[df.groupby("category").lag.median().index,
                         df.groupby("category").lag.median().values,
                         df.groupby("category").size().values])],
    "lag_hist": [{"lag": int(k), "n": int(v)} for k, v in
                 df.lag.value_counts().sort_index().items()],
    "scatter": [{"name": r["name"], "cat": r["cat"], "units": float(r.units),
                 "canon": round(float(r.canon), 1), "lib": int(r.lib)}
                for _, r in reg.iterrows()],
    "residuals": ([{"name": r["name"], "resid": round(float(r.resid), 1),
                    "units": float(r.units), "canon": round(float(r.canon), 1)}
                   for _, r in reg.nlargest(5, "resid").iterrows()] +
                  [{"name": r["name"], "resid": round(float(r.resid), 1),
                    "units": float(r.units), "canon": round(float(r.canon), 1)}
                   for _, r in reg.nsmallest(5, "resid").sort_values("resid").iterrows()]),
    "genres": [{"family": k, "n": int(v), "sprite": SPRITE.get(k, "cart")}
               for k, v in df.family.value_counts().items()],
    "devs": [{"name": k, "n": int(v)} for k, v in dc.head(8).items()],
    "top": [{"game": r.game, "system": r["system"], "year": int(r.year),
             "genre": r.genre, "score": int(r.canon_score)}
            for _, r in df.nlargest(12, "canon_score").iterrows()],
    "missing": [{"k": k, "pct": round(100 * v, 1)} for k, v in
                df.groupby("exclusive").has_sales.mean().sort_values().items()],
}

p = os.path.join(HERE, "docs", "data.json")
os.makedirs(os.path.dirname(p), exist_ok=True)
json.dump(out, open(p, "w"), indent=1)
print(f"wrote {p}")
print(json.dumps(out["counts"], indent=1))
print("paradox:", [(d["k"], d["rho"]) for d in out["paradox"]])
