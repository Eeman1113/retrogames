import sys, nbformat, os
from nbclient import NotebookClient
p = sys.argv[1] if len(sys.argv)>1 else "analysis.ipynb"
nb = nbformat.read(p, as_version=4)
c = NotebookClient(nb, timeout=900, kernel_name="python3",
                   resources={"metadata": {"path": os.path.dirname(os.path.abspath(p))}},
                   allow_errors=True)
c.execute()
nbformat.write(nb, p)
errs = 0
for i, cell in enumerate(nb.cells):
    for o in cell.get("outputs", []):
        if o.output_type == "error":
            errs += 1
            print(f"\n### CELL {i} ERROR: {o.ename}: {o.evalue}")
            print("\n".join(o.traceback[-6:]))
print(f"\n=== executed {len(nb.cells)} cells, {errs} errors ===")
sys.exit(1 if errs else 0)
