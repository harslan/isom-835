# ISOM 835: Predictive Analytics & Machine Learning

Course website for ISOM 835 at Suffolk University's Sawyer Business School, Fall 2026.
Prof. Hasan Arslan · Mondays 5:00–7:30 PM.

Built with Astro + Tailwind, deployed on Vercel at [isom-835.vercel.app](https://isom-835.vercel.app).
Sibling sites: [isom-839](https://isom-839.vercel.app) (prescriptive analytics) and [isom-260](https://isom-260.vercel.app) (AI for Business).

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

## Structure

- `docs/COURSE_DESIGN.md` — the arc of the course: 13 sessions, datasets, assessments, JSON conventions. Read this first.
- `docs/MAINTENANCE.md` — quality gates (`npm run check`), how to change a session, notebook or the playground safely, and the release checklist.
- `src/content/sessions/session-XX.json` — one file per session (objectives, agenda, resources, activities, homework)
- `src/data/schedule.ts` — dates, modules, meeting day (single source of truth for the calendar)
- `src/data/course.ts` / `src/data/syllabus.ts` — course metadata, grading, policies
- `src/data/questions.ts` — the practice question bank (misconception-tagged MCQs)
- `public/session-XX/` — slides and Colab notebooks for each session
- `public/data/` — datasets hosted for no-login loading from Colab (`telco_churn.csv`, `hotel_bookings.csv`)
- `public/explore/` — interactive explorers (overfitting, threshold & profit, gradient boosting, k-means)
- `public/refreshers/` — Prof. Arslan's ISOM 730 notebooks, hosted so they open in Colab from the Start Here page
- `src/pages/start.astro`, `cheatsheet.astro`, `datasets.astro` — the student guide, the one-page reference, and the dataset loaders
- `legacy/isom730/` — the professor's earlier ISOM 730 ML notebooks (refresher layer; not deployed)
- `scripts/export-canvas-qti.ts` — exports the question bank to a Canvas-importable QTI zip

## Notebooks

Every session notebook opens directly in Colab from GitHub:
`https://colab.research.google.com/github/harslan/isom-835/blob/master/public/session-XX/<notebook>.ipynb`
