# Maintaining the ISOM 835 site

Everything students see is generated from this repository and deployed to https://isom-835.vercel.app by `vercel --prod`.
Instructor-only material (competition answer key, solutions, teaching notes, notebook build tools) lives in the sibling
folder `isom-835-private/`, which is **never** committed here. `scripts/qa/check_notebooks.py` fails the build if a
public notebook references it.

## Quality gates

```
npm run check            # build + every gate below (about a minute)
npm run check:external   # …plus every external URL (a few minutes; bot-blocking hosts are reported, not failed)
```

| Gate | What it guarantees |
|---|---|
| `check_internal_links.py` | every href/src in the built site resolves; favicon and og-image exist |
| `check_html.py` | every page has `lang`, one `h1`, a title, a meta description, `alt` on images, no empty links |
| `check_dates.py` | every "Mon Sep 14"-style mention falls on that weekday in the course year; session dates match `src/data/schedule.ts` |
| `check_notebooks.py` | every notebook is valid nbformat 4, every code cell parses, no stored outputs, environment-check cell present, "Your turn" in Sessions 1–12, no private references |
| `check_text.py` | no stale facts or private references in student-facing files (SAGE, Assistant Chair, 119k rows, private paths) |
| `check_questions.mjs` | 36 practice questions, unique ids, one correct answer, an explanation for every wrong option, every session mapped to a domain |
| `check_playground.py` | every Python, Guided exercise: the reference solution passes its check and the starter does not |

The same gates run in GitHub Actions on every push and pull request (`.github/workflows/quality.yml`), and every Monday
morning with the external-link report added.

## Changing content

- **A session page**: edit `src/content/sessions/session-NN.json` (schema in `src/content/config.ts`). Dates come from
  `src/data/schedule.ts` — never type a date into a session file. Run `npm run check`.
- **A notebook**: edit the `.ipynb` under `public/session-NN/`, keep the environment-check cell first, keep optional
  installs marked `# OPTIONAL` on the first line of the cell, and make sure no later cell depends on an optional cell.
  Execute it end to end before committing (the private `tools/nbrun.py` does this against local data;
  `NB_RUN_OPTIONAL=1` includes optional cells). Strip outputs.
- **Data**: `public/data/hotel_bookings.csv` is the competition's *training* split only. The full file with the
  Kaggle test labels is private and must stay that way.
- **The playground** (`public/python/playground/index.html`): the `LESSONS` array is JSON inside a script tag. Never
  splice it in with `String.replace` (`$1`, `$'` are replacement patterns); after any edit run the playground gate and
  confirm `<script` and `</script>` counts match and nothing follows `</html>`.
- **Practice questions**: `src/data/questions.ts`; the session → domain map is in `src/layouts/SessionLayout.astro`.

## Release checklist

**Before the semester**
1. `npm run check:external` — fix or replace dead links.
2. Re-execute all 13 notebooks and the competition starter on a fresh Colab runtime; the environment-check cell
   should print the versions Colab ships.
3. Create the Kaggle competition from `isom-835-private/competition/README.md`; confirm the invite link on Canvas.
4. `vercel --prod` and click through Start Here, one session, the playground, one explorer, Syllabus, Project.

**Every Monday before class**
1. CI is green (the weekly run posts the external-link report).
2. The session page's "This week" panel shows tonight's session; the Colab badge opens the right notebook.
3. Solutions for the previous session are posted on Canvas (from `isom-835-private/solutions/`).

## Deploying

```
git push origin master      # CI runs the gates
vercel --prod --yes         # deploys the built site; verify https://isom-835.vercel.app
```
