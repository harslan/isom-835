// Every deadline of the semester, once. Canvas was built from this same list.
// Times are stored in UTC so the .ics feed and the table agree in every calendar app; the display
// strings are America/New_York. Monday 11:59 PM is the standing time; the two 5:00 PM dates are the
// start of class (dry run) and the start of the exam slot (final).

const CANVAS = 'https://canvas.suffolk.edu/courses/18389';

export interface Deadline {
  id: string;
  iso: string;        // UTC instant
  date: string;       // display, America/New_York — must be a correct weekday (check_dates.py)
  time: string;       // display
  title: string;
  points: string;
  what: string;       // what is submitted
  canvas: string;     // the Canvas page
  site: string;       // the page on this site that assigns it
}

export const deadlines: Deadline[] = [
  { id: 'hw1', iso: '2026-10-06T03:59:59Z', date: 'Mon Oct 5', time: '11:59 PM', title: 'HW1 — EDA + baseline on Telco · Lab 0 Python Foundations Check', points: '100 · completion', what: 'notebooks (.ipynb)', canvas: `${CANVAS}/assignments/259280`, site: '/sessions/session-02#homework' },
  { id: 'hw2', iso: '2026-10-22T03:59:59Z', date: 'Wed Oct 21', time: '11:59 PM', title: 'HW2 — Credit default: classification, ROC/PR, odds ratios', points: '100', what: 'notebook (.ipynb)', canvas: `${CANVAS}/assignments/261934`, site: '/sessions/session-04#homework' },
  { id: 'm1', iso: '2026-11-03T04:59:59Z', date: 'Mon Nov 2', time: '11:59 PM', title: 'Project Milestone 1 — your problem and your dataset', points: '5 · pass/fail', what: 'one paragraph (discussion post)', canvas: `${CANVAS}/discussion_topics/202473`, site: '/project#milestones' },
  { id: 'mid-pred', iso: '2026-11-09T21:30:00Z', date: 'Mon Nov 9', time: '4:30 PM', title: 'Midterm competition closes — predictions file', points: '50', what: 'predictions (.csv), on Kaggle and on Canvas', canvas: `${CANVAS}/assignments/261936`, site: '/sessions/session-05#homework' },
  { id: 'mid-memo', iso: '2026-11-10T04:59:59Z', date: 'Mon Nov 9', time: '11:59 PM', title: 'Midterm competition memo', points: '50', what: 'one page (.pdf)', canvas: `${CANVAS}/assignments/261937`, site: '/sessions/session-08#homework' },
  { id: 'hw3', iso: '2026-11-17T04:59:59Z', date: 'Mon Nov 16', time: '11:59 PM', title: 'HW3 — Threshold & cost on the credit model + Ames regression', points: '100', what: 'notebook (.ipynb)', canvas: `${CANVAS}/assignments/261935`, site: '/sessions/session-06#homework' },
  { id: 'm2', iso: '2026-11-24T04:59:59Z', date: 'Mon Nov 23', time: '11:59 PM', title: 'Project Milestone 2 — baseline model with a metric', points: '5 · pass/fail', what: 'notebook (.ipynb)', canvas: `${CANVAS}/assignments/261939`, site: '/project#milestones' },
  { id: 'm3', iso: '2026-12-01T04:59:59Z', date: 'Mon Nov 30', time: '11:59 PM', title: 'Project Milestone 3 — tuned model with an error analysis', points: '5 · pass/fail', what: 'notebook (.ipynb)', canvas: `${CANVAS}/assignments/261940`, site: '/project#milestones' },
  { id: 'm4', iso: '2026-12-07T22:00:00Z', date: 'Mon Dec 7', time: '5:00 PM', title: 'Project Milestone 4 — dry-run slides, then paired dry runs in class', points: '5 · pass/fail', what: 'slides (.pdf)', canvas: `${CANVAS}/assignments/261941`, site: '/project#milestones' },
  { id: 'final', iso: '2026-12-14T22:00:00Z', date: 'Mon Dec 14', time: '5:00 PM', title: 'Final project — notebook, 2-page memo, repo link · presentations that evening', points: '80 + 20', what: 'notebook (.ipynb), memo (.pdf), repository URL', canvas: `${CANVAS}/assignments/261942`, site: '/project' },
];

export const ICS_PATH = '/isom-835.ics';
