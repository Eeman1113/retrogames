#!/usr/bin/env python3
"""build_site.py — emits docs/data.json for the GitHub Pages site.

Recomputes every statistic the page shows from data/*.csv using the same
definitions as analysis.ipynb, so the site can never drift from the notebook.
Requires the venv (pandas + scipy + numpy).
"""
import json, os
import numpy as np, pandas as pd
from scipy import stats

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(HERE, "data")

systems = pd.read_csv(f"{D}/systems.csv")
games = pd.read_csv(f"{D}/games.csv")
tools = pd.read_csv(f"{D}/tools.csv")
systems["lib"] = systems["library_size"].str.lstrip("~").astype(int)
df = games.merge(systems, left_on="sys_id", right_on="id", validate="many_to_one")
df["lag"] = df["year"] - df["launch"]
df["has_sales"] = df["sales_m"].notna()
df["is_excl"] = df["exclusive"].isin(["exclusive", "regional", "arcade-only"])
df["decade"] = (df["year"] // 10) * 10

# ─────────────────────────────────────────────── genre families + sprites ──
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
SPRITE = {"Platform": "hero", "Shooter": "ship", "Fighting": "fist", "RPG": "slime",
          "Adventure": "key", "Puzzle": "ghost", "Strategy": "crown",
          "Metroidvania": "suit", "Stealth": "box", "Other": "cart"}
df["family"] = df.genre.map(FAMILY).fillna("Other")

# ─────────────────────────────────────────────── the Simpson decomposition ─
pooled = stats.spearmanr(df.lag, df.canon_score)
w = df.assign(l=df.lag - df.groupby("sys_id").lag.transform("mean"),
              c=df.canon_score - df.groupby("sys_id").canon_score.transform("mean"))
within = stats.spearmanr(w.l, w.c)
bt = df.groupby("sys_id").agg(l=("lag", "mean"), c=("canon_score", "mean"))
between = stats.spearmanr(bt.l, bt.c)

# ─────────────────────────────────────────────────────── platform level ────
plat = (df.groupby("sys_id")
          .agg(name=("system", "first"), cat=("category", "first"),
               maker=("maker", "first"), launch=("launch", "first"),
               gen=("gen", "first"), media=("media", "first"),
               bits=("cpu_bits", "first"), units=("units_m", "first"),
               canon=("canon_score", "mean"), best=("canon_score", "max"),
               excl=("is_excl", "mean"), lag=("lag", "mean"),
               first=("year", "min"), last=("year", "max"))
          .reset_index().merge(systems[["id", "lib", "note"]], left_on="sys_id", right_on="id"))
reg = plat.dropna(subset=["units"]).query("units > 0.01").copy()
X = np.c_[np.ones(len(reg)), np.log10(reg.units), np.log10(reg.lib)]
beta, *_ = np.linalg.lstsq(X, reg.canon.values, rcond=None)
reg["resid"] = reg.canon.values - X @ beta
ss_res = float((reg.resid ** 2).sum())
ss_tot = float(((reg.canon - reg.canon.mean()) ** 2).sum())
adj_r2 = 1 - (ss_res / (len(reg) - 3)) / (ss_tot / (len(reg) - 1))
r_simple = stats.pearsonr(np.log10(reg.units), reg.canon)[0]
resid_map = dict(zip(reg.sys_id, reg.resid.round(1)))

# ───────────────────────────────────────────────────────────── PCA + k-means
F = ["log_units", "log_lib", "canon", "excl", "lag", "launch"]
feat = reg.assign(log_units=np.log10(reg.units), log_lib=np.log10(reg.lib)).copy()
Xz = (feat[F].values - feat[F].values.mean(0)) / feat[F].values.std(0)
U, S, Vt = np.linalg.svd(Xz - Xz.mean(0), full_matrices=False)
evr = (S ** 2 / (S ** 2).sum())
PCs = U * S
# k-means++ with restarts. A single random start converged somewhere the
# notebook's sklearn run (n_init=25) did not, and the site then disagreed with
# the analysis it is reporting. Keep the best-inertia solution of many.
def _kmeans(X, k, restarts=50, iters=150, seed=0):
    rng = np.random.default_rng(seed)
    best = (np.inf, None, None)
    for _ in range(restarts):
        c = X[rng.integers(len(X))][None, :]                      # k-means++ seeding
        for _ in range(k - 1):
            d2 = ((X[:, None, :] - c[None]) ** 2).sum(-1).min(1)
            p = d2 / d2.sum() if d2.sum() > 0 else None
            c = np.vstack([c, X[rng.choice(len(X), p=p)]])
        lab = None
        for _ in range(iters):
            new = np.argmin(((X[:, None, :] - c[None]) ** 2).sum(-1), axis=1)
            if lab is not None and (new == lab).all():
                break
            lab = new
            c = np.array([X[lab == j].mean(0) if (lab == j).any() else c[j] for j in range(k)])
        inertia = float(((X - c[lab]) ** 2).sum())
        if inertia < best[0]:
            best = (inertia, lab.copy(), c.copy())
    return best

inertia, lab, cent = _kmeans(Xz, 3, seed=0)
print(f"k-means k=3 inertia {inertia:.1f} · sizes {np.bincount(lab).tolist()}")
czm = pd.DataFrame(cent, columns=F)
names = {}
for k in range(3):
    if czm.log_units[k] == czm.log_units.max(): names[k] = "Mass-market platforms"
    elif czm.excl[k] == czm.excl.min():         names[k] = "Open / cross-published era"
    else:                                        names[k] = "Small-install-base niches"

# ───────────────────────────────────────────────────────────── developers ──
devs = (df.developer.str.split(" / ").str[0]
          .str.replace(r"^Nintendo (R&D|EAD|CS).*", "Nintendo", regex=True)
          .replace({"Sega CS": "Sega", "Sega Technical Institute": "Sega",
                    "Kojima Productions": "Konami"}))
df["dev"] = devs
dc = devs.value_counts()
g = np.sort(dc.values); n = len(g)
gini = (2 * np.arange(1, n + 1) - n - 1).dot(g) / (n * g.sum())
hhi = ((dc / dc.sum()) ** 2).sum() * 1e4
lorenz = [{"x": round((i + 1) / n, 4), "y": round(float(v), 4)}
          for i, v in enumerate(np.cumsum(g) / g.sum())]

# ──────────────────────────────────────────────────────────────── records ──
oldest, newest = df.nsmallest(1, "year").iloc[0], df.nlargest(1, "year").iloc[0]
bigsale = df.nlargest(1, "sales_m").iloc[0]
latest = df.nlargest(1, "lag").iloc[0]
smallest = plat.nsmallest(1, "lib").iloc[0]
rarest = plat.dropna(subset=["units"]).query("units > 0").nsmallest(1, "units").iloc[0]
records = [
    {"k": "Oldest pick", "v": oldest.game, "d": f"{oldest.system}, {oldest.year}", "s": "cart"},
    {"k": "Newest pick", "v": newest.game, "d": f"{newest.system}, {newest.year}", "s": "ship"},
    {"k": "Best seller", "v": bigsale.game, "d": f"{bigsale.sales_m:.2f}M copies on the {bigsale.system}", "s": "coin"},
    {"k": "Latest bloomer", "v": latest.game, "d": f"{latest.lag} years after the {latest.system} launched", "s": "clock"},
    {"k": "Smallest library", "v": smallest["name"], "d": f"{smallest.lib} titles ever released", "s": "skull"},
    {"k": "Rarest hardware", "v": rarest["name"], "d": f"{rarest.units:.2f}M units shipped", "s": "heart"},
]

# ───────────────────────────────────────────────────────────────── output ──
def pivot(idx, col, order=None):
    p = df.pivot_table(index=idx, columns=col, values="game", aggfunc="count").fillna(0)
    if order: p = p.reindex(order)
    return p

fam_order = df.family.value_counts().index.tolist()
heat = pivot("family", "decade", fam_order)

EX = ["exclusive", "regional", "arcade-only", "multi"]
mk = (df.assign(k=pd.Categorical(df.exclusive, EX))
        .pivot_table(index="maker", columns="k", values="game", aggfunc="count", observed=False)
        .fillna(0))
mk = mk.loc[mk.sum(axis=1) >= 5]
mk = mk.div(mk.sum(axis=1), axis=0).mul(100).round(1)
mk = mk.loc[mk["exclusive"].sort_values(ascending=False).index]

out = {
  "counts": {
    "systems": int(df.sys_id.nunique()), "games": len(df), "developers": int(dc.size),
    "makers": int(df.maker.nunique()), "genres": int(df.genre.nunique()),
    "years": [int(df.year.min()), int(df.year.max())],
    "span": int(df.year.max() - df.year.min()),
    "exclusive_pct": round(100 * df.is_excl.mean(), 1),
    "sales_known_pct": round(100 * df.has_sales.mean()),
    "median_lag": int(df.lag.median()), "mean_lag": round(float(df.lag.mean()), 2),
    "adj_r2": round(float(adj_r2), 3), "r_simple": round(float(r_simple), 3),
    "gini": round(float(gini), 3), "hhi": int(hhi),
    "coef_units": round(float(beta[1]), 2), "coef_lib": round(float(beta[2]), 2),
    "total_units": round(float(systems.units_m.dropna().sum()), 1),
    "total_library": int(systems.lib.sum()),
    "top5_dev_share": round(100 * float((dc.head(5).sum() / dc.sum())), 1),
    "solo_dev_pct": round(100 * float((dc == 1).mean())),
    "pca_evr2": round(float(evr[:2].sum()), 3),
  },
  "paradox": [
    {"k": "pooled", "label": "All 205 picks together", "rho": round(pooled.statistic, 3),
     "p": float(pooled.pvalue), "n": len(df),
     "note": "Looks like proof that later games are better."},
    {"k": "within", "label": "Within one platform", "rho": round(within.statistic, 3),
     "p": float(within.pvalue), "n": len(df),
     "note": "Centre both columns on each system's own mean and it vanishes."},
    {"k": "between", "label": "Between platforms", "rho": round(between.statistic, 3),
     "p": float(between.pvalue), "n": len(bt),
     "note": "The real effect: long-lived platforms have stronger canons."},
  ],
  "systems": [
    {"id": r.sys_id, "name": r["name"], "maker": r.maker, "cat": r["cat"],
     "launch": int(r.launch), "gen": int(r.gen), "media": r.media, "bits": int(r.bits),
     "units": None if pd.isna(r.units) else float(r.units), "lib": int(r.lib),
     "canon": round(float(r.canon), 1), "best": int(r.best),
     "excl": round(float(r.excl), 2), "lag": round(float(r.lag), 1),
     "first": int(r["first"]), "last": int(r.last), "note": r.note,
     "resid": resid_map.get(r.sys_id),
     "picks": [{"rank": int(p["rank"]), "game": p.game, "year": int(p.year),
                "genre": p.genre, "family": p.family, "dev": p.developer,
                "excl": p.exclusive, "score": int(p.canon_score),
                "sales": None if pd.isna(p.sales_m) else float(p.sales_m),
                "note": p.note_x, "sprite": SPRITE.get(p.family, "cart")}
               for _, p in df[df.sys_id == r.sys_id].sort_values("rank").iterrows()]}
    for _, r in plat.iterrows()],
  "timeline": [{"name": r["name"], "cat": r["cat"], "launch": int(r.launch),
                "first": int(r["first"]), "last": int(r.last),
                "canon": round(float(r.canon), 1)}
               for _, r in plat.sort_values(["launch", "first"]).iterrows()],
  "lag_hist": [{"lag": int(k), "n": int(v)} for k, v in df.lag.value_counts().sort_index().items()],
  "lag_by_cat": [{"cat": k, "median": float(v), "n": int(df[df.category == k].shape[0])}
                 for k, v in df.groupby("category").lag.median().sort_values().items()],
  "year_hist": [{"year": int(y), "n": int(v)} for y, v in df.year.value_counts().sort_index().items()],
  "heat": {"rows": list(heat.index), "cols": [int(c) for c in heat.columns],
           "v": heat.values.astype(int).tolist()},
  "scatter": [{"name": r["name"], "cat": r["cat"], "units": float(r.units),
               "canon": round(float(r.canon), 1), "lib": int(r.lib),
               "resid": float(r.resid)} for _, r in reg.iterrows()],
  "residuals": [{"name": r["name"], "resid": round(float(r.resid), 1),
                 "units": float(r.units), "canon": round(float(r.canon), 1)}
                for _, r in pd.concat([reg.nlargest(6, "resid"),
                                       reg.nsmallest(6, "resid").sort_values("resid")]).iterrows()],
  "pca": {"evr": [round(float(v), 3) for v in evr],
          "features": F,
          "loadings": [[round(float(Vt[0, j]), 3), round(float(Vt[1, j]), 3)] for j in range(len(F))],
          "points": [{"name": feat.iloc[i]["name"], "x": round(float(PCs[i, 0]), 3),
                      "y": round(float(PCs[i, 1]), 3), "c": int(lab[i])} for i in range(len(feat))],
          "names": {str(k): v for k, v in names.items()},
          "sizes": {str(k): int((lab == k).sum()) for k in range(3)}},
  "genres": [{"family": k, "n": int(v), "sprite": SPRITE.get(k, "cart"),
              "top": df[df.family == k].nlargest(1, "canon_score").iloc[0].game,
              "mean": round(float(df[df.family == k].canon_score.mean()), 1)}
             for k, v in df.family.value_counts().items()],
  "devs": [{"name": k, "n": int(v),
            "top": df[df.dev == k].nlargest(1, "canon_score").iloc[0].game,
            "systems": int(df[df.dev == k].sys_id.nunique())}
           for k, v in dc.head(14).items()],
  "lorenz": lorenz,
  "excl_by_maker": {"makers": list(mk.index), "cats": EX, "v": mk.values.tolist()},
  "media_mix": [{"k": k, "n": int(v)} for k, v in
                systems.media.value_counts().items()],
  "units_bar": [{"name": r["system"], "units": float(r.units_m), "cat": r.category}
                for _, r in systems.dropna(subset=["units_m"]).query("units_m > 0")
                                   .sort_values("units_m", ascending=False).iterrows()],
  "missing": [{"k": k, "pct": round(100 * v, 1), "n": int(df[df.exclusive == k].shape[0])}
              for k, v in df.groupby("exclusive").has_sales.mean().sort_values().items()],
  "top": [{"game": r.game, "system": r["system"], "year": int(r.year), "genre": r.genre,
           "dev": r.developer, "score": int(r.canon_score)}
          for _, r in df.nlargest(20, "canon_score").iterrows()],
  "records": records,
  "tools": [{"tool": r.tool, "purpose": r.purpose, "note": r.note} for _, r in tools.iterrows()],
  "all_games": [{"g": r.game, "s": r["system"], "sid": r.sys_id, "y": int(r.year),
                 "gen": r.genre, "f": r.family, "d": r.developer, "e": r.exclusive,
                 "c": int(r.canon_score), "r": int(r["rank"]),
                 "m": r.maker, "cat": r.category}
                for _, r in df.sort_values(["sys_id", "rank"]).iterrows()],
}

p = os.path.join(HERE, "docs", "data.json")
json.dump(out, open(p, "w"), separators=(",", ":"))
print(f"wrote {p}  ({os.path.getsize(p)/1024:.0f} KB)")
print(json.dumps(out["counts"], indent=1))
print("sections:", ", ".join(out.keys()))
