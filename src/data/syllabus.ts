// Syllabus data — the single place to edit grading, assessments, outcomes, and policies.

export const description =
  'ISOM 835 merges predictive analytics with machine learning, using Python for practical, real-world applications. ' +
  'Students learn the full business-analytics lifecycle — framing a prediction problem, preparing data, engineering leak-proof features, ' +
  'building and tuning regression, classification, ensemble, unsupervised, and forecasting models, evaluating them honestly, and turning ' +
  'predictions into decisions with a quantified business impact. The course reflects the 2025–26 state of practice: gradient boosting and ' +
  'tabular foundation models, conformal prediction, explainability, fairness slicing, forecasting foundation models, LLM-derived features, ' +
  'and responsible deployment under the EU AI Act and US state law.';

export const outcomes = [
  { verb: 'Frame', text: 'a business question as a prediction problem — unit, target, horizon, decision — and name the baseline it must beat.' },
  { verb: 'Prepare', text: 'real data in pandas: joins, aggregation, datetime features, missing-value patterns, and a leak-proof scikit-learn Pipeline.' },
  { verb: 'Build', text: 'regression, classification, tree-ensemble, gradient-boosting, clustering, anomaly-detection, and forecasting models in Python, and know when a tabular or time-series foundation model is the better first choice.' },
  { verb: 'Evaluate', text: 'models honestly with a validation scheme that matches production and metrics that match the decision (RMSE/MAE, ROC vs. PR-AUC, calibration, coverage).' },
  { verb: 'Decide', text: 'from scores: cost matrices, tuned thresholds, top-k targeting, and a dollar figure for the value of a model.' },
  { verb: 'Explain and defend', text: 'a model with SHAP, partial dependence, conformal uncertainty, sliced error rates, and a model card — to an executive, a customer, or a regulator.' },
  { verb: 'Ship', text: 'a pipeline with a threshold, an experiment log, a demo, and a drift monitor — and work with AI coding assistants by verifying, not trusting.' },
];

export const grading = [
  { component: 'Participation & In-Class Labs', weight: 15 },
  { component: 'Homework Assignments (5 × Python notebooks)', weight: 25 },
  { component: 'Midterm Model Competition (Team, Kaggle-style)', weight: 20 },
  { component: 'Final Project: Your Prediction Story (Notebook + Memo + Talk)', weight: 40 },
];

export const assessments = [
  {
    name: 'Participation & in-class labs', weight: 15,
    what: 'Every session has a live notebook. Credit for being present, running the lab, and completing the "Your turn" exercises by the following Sunday. Two lowest weeks dropped.',
    rubric: ['Present and engaged (attendance, questions, explorer use)', '"Your turn" cells attempted in ≥ 10 of 12 lab sessions'],
  },
  {
    name: 'Homework (5 notebooks, individual)', weight: 25,
    what: 'Five Colab notebooks on real data, each due at the start of class on Canvas. Graded on the same four things every time.',
    rubric: [
      'Framing & baseline (20%) — unit, target, horizon, decision stated; the naive baseline computed and beaten',
      'Pipeline & leakage (30%) — split before any fitted transformer; leaks identified and removed; code runs top to bottom',
      'Evaluation (30%) — the right metric for the decision on a held-out set that matches production; results interpreted in plain words',
      'Communication (20%) — one clear paragraph per question answering what the numbers mean for the business',
    ],
    items: [
      { label: 'HW0 — Setup + first model', due: 'Mon Sep 21', session: 1 },
      { label: 'HW1 — EDA + baseline on Telco', due: 'Mon Sep 28', session: 2 },
      { label: 'HW2 — Ames regression pipeline (ridge/lasso)', due: 'Mon Oct 19', session: 4 },
      { label: 'HW3 — Credit default: classification + threshold/cost', due: 'Mon Nov 2', session: 5 },
      { label: 'HW4 — Hotel bookings: boosting + SHAP + calibration + conformal', due: 'Mon Nov 23', session: 9 },
      { label: 'HW5 — Segmentation (Track A) or forecasting (Track B)', due: 'Mon Dec 7', session: 10 },
    ],
  },
  {
    name: 'Midterm Model Competition (teams of 2–3)', weight: 20,
    what: 'A Kaggle community competition on a hidden test split of hotel bookings — predict cancellations. Launches Oct 26; leaderboard closes Sun Nov 8, 11:59 PM; reveal and 3-minute "what worked" talks on Nov 9.',
    rubric: [
      'Private-leaderboard band (50%) — top third / middle / bottom third on ROC-AUC, with a floor for any leak-free submission that beats the logistic baseline',
      'One-page modeling memo (50%) — what you tried, what worked, what leaked, and one thing you would do with two more weeks',
    ],
  },
  {
    name: 'Final Project — Your Prediction Story (teams of 2–3, solo allowed)', weight: 40,
    what: 'A real prediction question, a leak-proof model, an honest evaluation, a decision with a number, and a trust story. Proposal Mon Nov 9; notebook + 2-page memo Sun Dec 13, 11:59 PM; 8-minute presentation Mon Dec 14. No written final exam.',
    rubric: [
      'Framing & data (15%)', 'Modeling & validation (25%)', 'Decision & value (25%)', 'Trust story (15%)', 'Memo & presentation (20%)',
    ],
  },
];

// What is due at the start of each session (authoritative; the session pages' homework labels are prose).
export const dueBySession: Record<number, string> = {
  2: 'HW0 — setup + first model',
  3: 'HW1 — EDA + baseline (Telco)',
  5: 'HW2 — Ames regression pipeline',
  7: 'HW3 — credit default + threshold · competition team registered',
  8: 'Competition leaderboard closed (Sun Nov 8) · memo tonight · project proposal',
  10: 'HW4 — boosting + SHAP + conformal (hotel)',
  12: 'HW5 — segmentation or forecasting',
  13: 'Project notebook + memo (Sun Dec 13) · presentations tonight',
};

export const gradeScale = [
  ['A', '93–100'], ['A−', '90–92'], ['B+', '87–89'], ['B', '83–86'], ['B−', '80–82'], ['C+', '77–79'], ['C', '73–76'], ['F', 'below 73'],
];

export const materials = [
  { title: 'Géron — Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow (3rd ed.)', note: 'Primary companion. Notebooks free on GitHub; the book is optional.', url: 'https://github.com/ageron/handson-ml3' },
  { title: 'James, Witten, Hastie, Tibshirani & Taylor — An Introduction to Statistical Learning with Python (ISLP)', note: 'Theory reference. Free PDF and labs.', url: 'https://www.statlearning.com' },
  { title: 'Müller & Guido — Introduction to Machine Learning with Python (O\'Reilly, 2016)', note: 'Optional, by a scikit-learn core developer; the clearest gentle introduction. Chapters 2 and 5 are hosted as refresher notebooks on the Start Here page (official companion code, free).', url: 'https://github.com/amueller/introduction_to_ml_with_python' },
  { title: 'VanderPlas — Python Data Science Handbook', note: 'Python and pandas refresher; the book behind ISOM 730. Free online.', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/' },
  { title: 'Inria scikit-learn MOOC', note: 'Taught by scikit-learn\'s developers. Free, with videos and notebooks.', url: 'https://inria.github.io/scikit-learn-mooc/' },
  { title: 'Hyndman & Athanasopoulos — Forecasting: Principles and Practice (3rd ed.)', note: 'For Session 11 and forecasting projects. Free online.', url: 'https://otexts.com/fpp3/' },
];

export const tools = [
  'Google Colab (free) — every notebook runs in the browser; nothing to install',
  'A Kaggle account with your suffolk.edu email — for the midterm competition and project datasets',
  'Python 3.12 · pandas · scikit-learn ≥ 1.6 · LightGBM · XGBoost · SHAP · Optuna · MAPIE · statsforecast (all preinstalled or one pip line in Colab; pinned in the repo\'s requirements.txt for local work)',
  'AI coding assistants (Colab\'s built-in assistant, Claude, ChatGPT) — allowed and taught; see the AI policy',
];

export const policies = [
  {
    title: 'Attendance',
    description: 'This is an evening seminar that meets once a week — every session matters, and every session has a live lab. More than two unexcused absences will result in a grade reduction. Please notify the instructor in advance if you need to miss a class; the notebook, slides, and explorer for every session are on this site so you can catch up.',
  },
  {
    title: 'AI Tool Usage',
    description: 'AI coding assistants (Claude, ChatGPT, Colab AI, Cursor, Copilot) are encouraged — working data scientists use them every day. Two rules: disclose what you used in a short note at the top of the notebook, and be able to explain and defend every line of a model you submit. A model you cannot explain is a model you cannot trust, and in the presentation the AI will not be standing next to you. Session 12 teaches the verification habit we expect.',
  },
  {
    title: 'Academic Integrity',
    description: 'All submitted work must be your own or properly attributed. Collaboration is encouraged on labs and the team competition; individual homework must reflect individual effort. Copying a Kaggle kernel and changing variable names is not modeling. Suffolk University\'s academic integrity policy applies in full.',
  },
  {
    title: 'Late Submissions',
    description: 'Assignments are due by the start of class on Canvas. Late submissions receive a 10% penalty per day, up to 3 days. After 3 days, assignments receive zero credit. The competition leaderboard closes when it closes. One free 48-hour extension per student on any single homework — just email before the deadline.',
  },
  {
    title: 'Accessibility & Support',
    description: 'If you have a documented disability or need accommodations, please contact Suffolk\'s Office of Disability Services and let the instructor know early in the semester so arrangements can be made. Students facing personal or financial difficulty are encouraged to reach out — the earlier, the more options.',
  },
  {
    title: 'Communication & Office Hours',
    description: 'Email harslan@suffolk.edu with "ISOM 835" in the subject; expect a reply within one business day. Office hours by appointment before class on Mondays and on Zoom; project weeks get extra slots posted on Canvas. Course announcements go out on Canvas.',
  },
];
