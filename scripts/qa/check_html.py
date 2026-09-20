#!/usr/bin/env python3
"""Accessibility and metadata basics over the built site: lang attribute, one h1, title, description, img alt, no empty links."""
import re, glob, sys
from html.parser import HTMLParser
class P(HTMLParser):
    def __init__(self): super().__init__(); self.h1 = 0; self.imgs_no_alt = 0; self.empty_links = 0; self.title = ''; self.in_title = False; self.lang = None; self.desc = False; self._a = None
    def handle_starttag(self, t, attrs):
        a = dict(attrs)
        if t == 'html': self.lang = a.get('lang')
        if t == 'h1': self.h1 += 1
        if t == 'title': self.in_title = True
        if t == 'meta' and a.get('name') == 'description' and a.get('content'): self.desc = True
        if t == 'img' and a.get('alt') is None: self.imgs_no_alt += 1
        if t == 'a': self._a = [a, '']
        if self._a and t in ('img', 'svg') and (a.get('alt') or a.get('aria-label') or a.get('title')): self._a[1] += 'x'
    def handle_data(self, d):
        if self.in_title: self.title += d
        if self._a: self._a[1] += d.strip()
    def handle_endtag(self, t):
        if t == 'title': self.in_title = False
        if t == 'a' and self._a:
            a, txt = self._a
            if not txt and not a.get('aria-label') and not a.get('title'): self.empty_links += 1
            self._a = None
pages = glob.glob('dist/**/*.html', recursive=True); bad = []
for f in pages:
    if '/project/template.html' in f or '/explore/' in f or '/python/playground/' in f: continue     # standalone tools, checked separately
    p = P(); p.feed(open(f, encoding='utf-8', errors='ignore').read())
    if not p.lang: bad.append((f, 'no lang attribute'))
    if p.h1 != 1 and not f.endswith('/slides.html'): bad.append((f, f'{p.h1} h1 elements'))   # a slide deck has one h1 per title slide
    if not p.title.strip(): bad.append((f, 'no <title>'))
    if not p.desc: bad.append((f, 'no meta description'))
    if p.imgs_no_alt: bad.append((f, f'{p.imgs_no_alt} img without alt'))
    if p.empty_links: bad.append((f, f'{p.empty_links} links with no accessible text'))
print(f'html: {len(pages)} pages checked, {len(bad)} problems')
for b in bad: print('  PROBLEM', b[0][4:], '—', b[1])
sys.exit(1 if bad else 0)
