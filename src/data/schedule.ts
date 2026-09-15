// The semester spine: every session's date and module.
//
// ISOM 835 meets Mondays 5:00–7:30 PM (150 minutes).
// Suffolk Fall 2026: classes begin Wed Sep 9; October Break Mon Oct 12 (no class);
// Veterans Day Wed Nov 11 and Thanksgiving Wed–Sat Nov 25–28 do not touch Mondays;
// last day of classes Fri Dec 11; exam week Mon Dec 14 – Fri Dec 18.
// 12 class Mondays (Sep 14 → Dec 7) + the exam-week Monday Dec 14 for final presentations = 13 sessions.

export const WEEKDAY = 'Mon';
export const WEEKDAY_LONG = 'Monday';
export const MEETING_TIME = '5:00 PM – 7:30 PM';

export interface SessionMeta {
  date: string;      // display date
  iso: string;       // ISO date for "next class" logic
  module: string;    // module name
}

export interface Module {
  name: string;
  sessions: number[];
  blurb: string;
}

export const modules: Module[] = [
  { name: 'Foundations', sessions: [1], blurb: 'The prediction lifecycle — and your first model, end to end.' },
  { name: 'Data & Features', sessions: [2, 3], blurb: 'Wrangling, exploration, and leak-proof feature pipelines.' },
  { name: 'Regression', sessions: [4], blurb: 'Predicting numbers: linear models, regularization, and what a residual is telling you.' },
  { name: 'Classification & Decisions', sessions: [5, 6], blurb: 'Predicting yes/no — then turning probabilities into profitable decisions.' },
  { name: 'Trees & Ensembles', sessions: [7, 8], blurb: 'Random forests, gradient boosting, and the tabular frontier.' },
  { name: 'Evaluation & Optimization', sessions: [9], blurb: 'Tuning, explaining, and trusting a model.' },
  { name: 'Unsupervised Learning', sessions: [10], blurb: 'Segments, structure, and anomalies — learning without labels.' },
  { name: 'Time & Text', sessions: [11, 12], blurb: 'Forecasting, neural networks, embeddings, and LLMs as features.' },
  { name: 'Finale', sessions: [13], blurb: 'Ship it — and present your prediction story.' },
];

export const sessionMeta: Record<number, SessionMeta> = {
  1:  { date: 'Sep 14', iso: '2026-09-14', module: 'Foundations' },
  2:  { date: 'Sep 21', iso: '2026-09-21', module: 'Data & Features' },
  3:  { date: 'Sep 28', iso: '2026-09-28', module: 'Data & Features' },
  4:  { date: 'Oct 5',  iso: '2026-10-05', module: 'Regression' },
  5:  { date: 'Oct 19', iso: '2026-10-19', module: 'Classification & Decisions' },
  6:  { date: 'Oct 26', iso: '2026-10-26', module: 'Classification & Decisions' },
  7:  { date: 'Nov 2',  iso: '2026-11-02', module: 'Trees & Ensembles' },
  8:  { date: 'Nov 9',  iso: '2026-11-09', module: 'Trees & Ensembles' },
  9:  { date: 'Nov 16', iso: '2026-11-16', module: 'Evaluation & Optimization' },
  10: { date: 'Nov 23', iso: '2026-11-23', module: 'Unsupervised Learning' },
  11: { date: 'Nov 30', iso: '2026-11-30', module: 'Time & Text' },
  12: { date: 'Dec 7',  iso: '2026-12-07', module: 'Time & Text' },
  13: { date: 'Dec 14', iso: '2026-12-14', module: 'Finale' },
};
