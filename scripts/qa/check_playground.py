"""Regression test for the Python, Guided playground: every exercise's solution must pass its check and its starter must not."""
import json, io, contextlib, sys
s = open('public/python/playground/index.html').read()
i = s.find('const LESSONS = '); j = s.find('[', i); k = s.find('];', j); L = json.loads(s[j:k+1])
def run(code, check):
    # mirrors the page's runner: _src is the submitted code, _out is what it printed, then the check runs in the same namespace
    g = {'_src': code}; buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf): exec(code, g)
        g['_out'] = buf.getvalue(); exec(check, g)
        return True, buf.getvalue()
    except Exception as e: return False, f'{type(e).__name__}: {e}'
n = bad = 0
import sys as _s
for les in L:
    for ex in les['ex']:
        n += 1
        ok_sol, msg = run(ex['solution'], ex['check'])
        ok_start, _ = run(ex['starter'], ex['check'])
        if not ok_sol: bad += 1; print(f'SOLUTION FAILS  {les["id"]}/{ex["id"]}: {msg[:160]}')
        if ok_start: bad += 1; print(f'STARTER PASSES  {les["id"]}/{ex["id"]} (check is too weak)')
    for exm in les['examples']:
        g = {}; buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf): exec(exm['code'], g)
        except Exception as e: bad += 1; print(f'EXAMPLE FAILS   {les["id"]}: {exm["t"]} → {type(e).__name__}: {e}')
print(f'lessons {len(L)}, exercises {n}, examples {sum(len(l["examples"]) for l in L)}, problems {bad}')
sys.exit(1 if bad else 0)
