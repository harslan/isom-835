#!/usr/bin/env python3
"""Strings that must never appear in student-facing content (stale facts and private references)."""
import glob, sys
FORBIDDEN = {'SAGE Framework': 'the framework is SAIL', 'Assistant Chair': 'stale title', '119,390': 'the public hotel file has 83,573 rows', '119k': 'the public hotel file has 83,573 rows',
             'isom-835-private': 'private folder', 'solution.csv': 'answer key', 'hotel_bookings_full': 'private file', 'lorem ipsum': 'placeholder'}
files = glob.glob('src/**/*.*', recursive=True) + glob.glob('public/**/*.html', recursive=True) + glob.glob('public/session-*/*.ipynb') + ['README.md']
bad = []
for f in files:
    s = open(f, encoding='utf-8', errors='ignore').read()
    for w, why in FORBIDDEN.items():
        if w in s: bad.append((f, w, why))
print(f'text traps: {len(files)} files, {len(FORBIDDEN)} patterns, {len(bad)} hits')
for b in bad: print('  FOUND', b)
sys.exit(1 if bad else 0)
