#!/usr/bin/env python3
"""Every href/src in the built site (dist/) must resolve to a file. Template placeholders in brackets are skipped."""
import re, os, glob, sys
root = 'dist'; pages = glob.glob(root + '/**/*.html', recursive=True)
if not pages: print('dist/ is empty — run `npm run build` first'); sys.exit(1)
bad = []; n = 0
for p in pages:
    html = open(p, encoding='utf-8', errors='ignore').read()
    for m in re.finditer(r'(?:href|src|content)="([^"#?]+)', html):
        u = m.group(1)
        if u.startswith(('http', 'mailto:', 'data:', 'javascript:', '//', '[')) or '${' in u or not u.startswith(('/', './', '../')) and '.' not in u.split('/')[-1] and not u.startswith('/'): continue
        if not u.startswith(('/', './', '../')): continue
        n += 1; target = os.path.normpath(root + u if u.startswith('/') else os.path.join(os.path.dirname(p), u))
        if not (os.path.exists(target) or os.path.exists(os.path.join(target, 'index.html')) or os.path.exists(target + '.html')): bad.append((p[len(root):], u))
for f in ['og-image.png', 'favicon.svg']:
    if not os.path.exists(f'{root}/{f}'): bad.append(('<head>', '/' + f))
print(f'internal links: {n} checked, {len(bad)} broken')
for b in sorted(set(bad)): print('  BROKEN', b)
sys.exit(1 if bad else 0)
