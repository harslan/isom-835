#!/usr/bin/env python3
"""Every 'Mon Sep 14'-style mention across the site and notebooks must fall on that weekday in the course year; session JSON dates must match schedule.ts."""
import re, glob, json, datetime, sys
YEAR = 2026
MON = {m: i + 1 for i, m in enumerate(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}
DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
pat = re.compile(r'(?<![–\-])\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:day|sday|nesday|rsday|urday)?,?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})\b')
files = glob.glob('src/**/*.*', recursive=True) + glob.glob('public/**/*.ipynb', recursive=True) + glob.glob('public/**/*.html', recursive=True) + glob.glob('docs/*.md') + ['README.md']
bad = []; n = 0
for f in files:
    try: s = open(f, encoding='utf-8', errors='ignore').read()
    except Exception: continue
    for m in pat.finditer(s):
        n += 1; d, mo, day = m.groups()
        try: dt = datetime.date(YEAR, MON[mo], int(day))
        except ValueError: bad.append((f, m.group(0), 'invalid date')); continue
        if DOW[dt.weekday()] != d: bad.append((f, m.group(0), 'is a ' + DOW[dt.weekday()]))
sch = open('src/data/schedule.ts').read(); iso = dict(re.findall(r"(\d+):\s*\{ date: '[^']+',\s*iso: '([^']+)'", sch))
for k, v in iso.items():
    if datetime.date.fromisoformat(v).weekday() != 0: bad.append(('schedule.ts', f'session {k} {v}', 'not a Monday'))
for f in sorted(glob.glob('src/content/sessions/session-*.json')):
    j = json.load(open(f)); num = int(re.search(r'(\d+)', f.split('/')[-1]).group(1))
    for key in ('date', 'iso', 'dateIso'):
        if key in j and j[key] != iso.get(str(num)): bad.append((f, f'{key}={j[key]}', f'schedule says {iso.get(str(num))}'))
print(f'dates: {n} weekday mentions checked, {len(iso)} sessions in schedule, {len(bad)} problems')
for b in bad: print('  WRONG', b)
sys.exit(1 if bad else 0)
