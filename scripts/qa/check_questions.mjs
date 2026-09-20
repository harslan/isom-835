import { questions, domains } from '../../src/data/questions.ts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const problems = []; const ids = new Set();
for (const q of questions) {
  if (ids.has(q.id)) problems.push(`${q.id}: duplicate id`); ids.add(q.id);
  if (!domains.find(d => d.id === q.domain)) problems.push(`${q.id}: unknown domain ${q.domain}`);
  const optIds = q.options.map(o => o.id);
  if (new Set(optIds).size !== optIds.length) problems.push(`${q.id}: duplicate option ids`);
  if (!optIds.includes(q.correctAnswer)) problems.push(`${q.id}: correctAnswer ${q.correctAnswer} not among options`);
  for (const o of q.options) if (o.id !== q.correctAnswer && !(q.distractors && q.distractors[o.id])) problems.push(`${q.id}: no explanation for wrong option ${o.id}`);
  if (q.distractors && q.distractors[q.correctAnswer]) problems.push(`${q.id}: distractor explanation given for the correct option`);
  if (!q.correctExplanation || q.correctExplanation.length < 40) problems.push(`${q.id}: correctExplanation missing/short`);
  if (q.options.length < 3) problems.push(`${q.id}: fewer than 3 options`);
  const texts = q.options.map(o => o.text.trim().toLowerCase()); if (new Set(texts).size !== texts.length) problems.push(`${q.id}: duplicate option text`);
}
const layout = readFileSync(join(ROOT, 'src/layouts/SessionLayout.astro'), 'utf8');
const m = layout.match(/practiceBySession[^=]*=\s*(\{[\s\S]*?\n\};)/); let mapped = 0;
if (m) { const sess = [...m[1].matchAll(/(\d+):\s*\[([^\]]*)\]/g)]; mapped = sess.length; const seen = new Set(sess.map(x => +x[1]));
  for (let n = 1; n <= 13; n++) if (!seen.has(n)) problems.push(`SessionLayout: session ${n} has no practice domains`);
  for (const [, n, list] of sess) for (const d of [...list.matchAll(/'([^']+)'/g)].map(x => x[1])) if (!domains.find(x => x.id === d)) problems.push(`SessionLayout: session ${n} references unknown domain ${d}`); }
else problems.push('practiceBySession map not found in SessionLayout.astro');
const perDomain = {}; for (const q of questions) perDomain[q.domain] = (perDomain[q.domain] || 0) + 1;
console.log(`questions: ${questions.length}, domains: ${domains.length}, per domain: ${JSON.stringify(perDomain)}, session refs: ${mapped}`);
console.log(problems.length ? problems.join('\n') : 'no problems'); process.exit(problems.length ? 1 : 0);
