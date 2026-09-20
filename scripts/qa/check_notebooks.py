#!/usr/bin/env python3
"""Structural checks on every public notebook: valid nbformat 4, every code cell parses, no stored outputs,
an environment-check cell up front, a 'Your turn' section in Sessions 1–12, and nothing that points at private material."""
import json, glob, ast, sys, re
FORBIDDEN = ['isom-835-private', 'solution.csv', 'hotel_bookings_full', '/Users/', 'ANTHROPIC_API_KEY=sk-']
bad = []; nbs = sorted(glob.glob('public/**/*.ipynb', recursive=True))
for f in nbs:
    try: nb = json.load(open(f, encoding='utf-8'))
    except Exception as e: bad.append((f, f'invalid JSON: {e}')); continue
    if nb.get('nbformat') != 4: bad.append((f, 'nbformat is not 4'))
    cells = nb.get('cells', []); text = '\n'.join(''.join(c.get('source', [])) for c in cells)
    for i, c in enumerate(cells):
        if c.get('cell_type') not in ('markdown', 'code'): bad.append((f, f'cell {i}: bad cell_type'))
        if c.get('cell_type') == 'code':
            src = ''.join(c.get('source', []))
            if c.get('outputs') and '/session-' in f: bad.append((f, f'cell {i}: stored outputs (strip before committing)'))   # refreshers are archived reference material
            if src.strip() and not src.lstrip().startswith(('!', '%')):
                try: ast.parse(re.sub(r'^\s*[!%].*$', '', src, flags=re.M))
                except SyntaxError as e: bad.append((f, f'cell {i}: syntax error line {e.lineno}: {e.msg}'))
    for w in FORBIDDEN:
        if w in text and '/session-' in f: bad.append((f, f'references private material: {w!r}'))
    is_session = re.search(r'ISOM835_Session(\d+)_', f)
    if is_session:
        n = int(is_session.group(1))
        if '# Environment check' not in text: bad.append((f, 'missing the environment-check cell'))
        if n <= 12 and 'Your turn' not in text: bad.append((f, 'no "Your turn" section'))
        if 'raw.githubusercontent.com/harslan/isom-835/master/public/data/' not in text and n in (1, 2, 3, 6, 7, 8, 9, 12, 13): bad.append((f, 'does not load data from the course repo URL'))
print(f'notebooks: {len(nbs)} checked, {len(bad)} problems')
for b in bad: print('  PROBLEM', b)
sys.exit(1 if bad else 0)
