#!/usr/bin/env python3
"""Report-only: every external URL in the site, notebooks and docs. Hosts that block scripted requests are listed, not failed."""
import re, glob, concurrent.futures, urllib.request, ssl, collections, sys
BOT_BLOCKED = ('kaggle.com', 'medium.com', 'sciencedirect.com', 'emerald.com', 'mckinsey.com', 'doordash.com', 'instacart.com', 'ajmc.com', 'idaireland.com', 'opentable.com')
files = glob.glob('src/**/*.*', recursive=True) + glob.glob('public/**/*.html', recursive=True) + glob.glob('public/session-*/*.ipynb') + glob.glob('docs/*.md') + ['README.md']
urls = collections.defaultdict(set)
for f in files:
    try: s = open(f, encoding='utf-8', errors='ignore').read()
    except Exception: continue
    for u in re.findall(r'https?://[^\s"\'<>)\]\\`]+', s):
        u = u.rstrip('.,;:')
        if any(x in u for x in ('localhost', 'example.com', '${', '…', 'you/repo', 'raw.githubusercontent.com/harslan/isom-835', 'fonts.g')): continue
        urls[u].add(f)
ctx = ssl.create_default_context()
def check(u):
    for method in ('HEAD', 'GET'):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, method=method, headers={'User-Agent': 'Mozilla/5.0 (ISOM835 link check)'}), timeout=20, context=ctx) as r: return u, r.status
        except urllib.error.HTTPError as e:
            if method == 'GET' or e.code in (404, 410): return u, e.code
        except Exception as e:
            if method == 'GET': return u, type(e).__name__
    return u, '?'
with concurrent.futures.ThreadPoolExecutor(16) as ex: res = list(ex.map(check, sorted(urls)))
hard = [(u, st) for u, st in res if not (isinstance(st, int) and st < 400) and not any(h in u for h in BOT_BLOCKED)]
soft = [(u, st) for u, st in res if not (isinstance(st, int) and st < 400) and any(h in u for h in BOT_BLOCKED)]
print(f'external links: {len(urls)} checked, {len(hard)} failing, {len(soft)} on bot-blocking hosts (verify in a browser)')
for u, st in hard: print(f'  FAIL {st!s:12s} {u}   <- {sorted(urls[u])[0]}')
for u, st in soft: print(f'  skip {st!s:12s} {u}')
sys.exit(1 if hard else 0)
