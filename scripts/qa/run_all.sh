#!/usr/bin/env bash
# Quality gates for the ISOM 835 site. Usage: npm run check   (add EXTERNAL=1 to also check external links)
set -u; cd "$(dirname "$0")/../.."; fail=0
run() { echo "▶ $1"; shift; "$@" || fail=1; echo; }
run "build" npm run build --silent
run "internal links + head assets" python3 scripts/qa/check_internal_links.py
run "html accessibility/meta" python3 scripts/qa/check_html.py
run "dates and schedule" python3 scripts/qa/check_dates.py
run "notebook structure" python3 scripts/qa/check_notebooks.py
run "forbidden text" python3 scripts/qa/check_text.py
run "practice question bank" node --experimental-strip-types --no-warnings scripts/qa/check_questions.mjs
run "playground exercises" python3 scripts/qa/check_playground.py
if [ "${EXTERNAL:-0}" = "1" ]; then run "external links" python3 scripts/qa/check_external_links.py; fi
if [ $fail -eq 0 ]; then echo "✅ all quality gates passed"; else echo "❌ some gates failed"; fi
exit $fail
