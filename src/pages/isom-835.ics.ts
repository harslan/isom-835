// The whole semester as a calendar file: every class Monday and every deadline.
// Built statically from src/data/schedule.ts and src/data/deadlines.ts, so it can never disagree with the site.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { sessionMeta } from '../data/schedule';
import { deadlines } from '../data/deadlines';

const SITE = 'https://isom-835.vercel.app';
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const fold = (line: string) => { const out: string[] = []; let s = line; while (s.length > 72) { out.push(s.slice(0, 72)); s = ' ' + s.slice(72); } out.push(s); return out.join('\r\n'); };
const event = (uid: string, start: string, end: string, summary: string, description: string, url: string) => [
  'BEGIN:VEVENT', `UID:${uid}@isom-835.vercel.app`, `DTSTAMP:${stamp('2026-10-14T22:00:00Z')}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
  fold(`SUMMARY:${esc(summary)}`), fold(`DESCRIPTION:${esc(description)}`), `URL:${url}`, 'END:VEVENT',
].join('\r\n');

export const GET: APIRoute = async () => {
  const sessions = (await getCollection('sessions')).sort((a, b) => a.data.number - b.data.number);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ISOM 835 Fall 2026//isom-835.vercel.app//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:ISOM 835 — Predictive Analytics & ML (Fall 2026)', 'X-WR-TIMEZONE:America/New_York'];
  for (const s of sessions) {
    const m = sessionMeta[s.data.number]; if (!m) continue;
    // 5:00–7:30 PM Eastern: EDT (UTC−4) through Oct 31, EST (UTC−5) from Nov 1
    const offset = m.iso < '2026-11-01' ? '21:00:00Z' : '22:00:00Z';
    const endOffset = m.iso < '2026-11-01' ? '23:30:00Z' : '00:30:00Z';
    const start = `${m.iso}T${offset}`;
    const endDate = m.iso < '2026-11-01' ? m.iso : new Date(Date.parse(m.iso) + 86400000).toISOString().slice(0, 10);
    const end = `${endDate}T${endOffset}`;
    lines.push(event(`session-${s.data.number}`, start, end, `ISOM 835 · Session ${s.data.number}: ${s.data.title}`, `${s.data.subtitle}\n${SITE}/sessions/${s.data.slug}/`, `${SITE}/sessions/${s.data.slug}/`));
  }
  for (const d of deadlines) {
    lines.push(event(`due-${d.id}`, d.iso, d.iso, `DUE · ${d.title}`, `Submit: ${d.what}. Points: ${d.points}.\nCanvas: ${d.canvas}\nAssigned at ${SITE}${d.site}`, d.canvas));
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
