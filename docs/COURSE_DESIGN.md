# ISOM 835 — Course Design Document (Fall 2026)

**Predictive Analytics & Machine Learning** · Suffolk University, Sawyer Business School
Prof. Hasan Arslan · Mondays 5:00–7:30 PM (150 min) · 13 sessions: 12 class Mondays Sep 14 → Dec 7 (no class Oct 12, October Break) + exam-week Monday Dec 14 for final presentations

This document is the single source of truth for the *arc* of the course. Every session JSON in
`src/content/sessions/` must follow it. Session 13 (Dec 14) opens with a 45-minute "Ship It" segment, then final presentations fill the rest.

Sibling courses: [isom-839](https://isom-839.vercel.app)
(prescriptive) and [isom-260](https://isom-260.vercel.app) (AI for Business).

---

## 1. The promise

> Every business question about the future is a prediction problem. This course teaches you to build
> the models that answer it — in Python, on real data — and, just as importantly, the judgment to know
> when to trust them and how to turn a probability into a decision.

**Positioning against the siblings.** ISOM 730 / 631 taught Python and pandas (the Drive archive:
Python fundamentals, pandas, matplotlib/seaborn, then a first taste of scikit-learn — Naive Bayes,
linear regression, SVM, random forest, PCA, all adapted from VanderPlas' *Python Data Science Handbook*).
ISOM 835 *starts* where that ended: we assume Python + pandas, and go deep on the predictive lifecycle,
modern tabular ML (gradient boosting is the workhorse), rigorous evaluation, decision-making from
scores, and the 2025–26 frontier (tabular foundation models, conformal prediction, LLM features,
AI-assisted workflow). ISOM 839 then takes predictions and turns them into optimal decisions.

**The through-line, every session:** *a business question → a dataset → a model you build yourself →
an evaluation you can defend → a decision.*

**Signature ideas (repeat them until they stick):**
1. Accuracy lies. Always ask: compared with what baseline, on which held-out data, at what cost of error?
2. Leakage is the #1 way smart people build useless models. Split first, fit the pipeline on train only.
3. Gradient boosting is the default for tabular business data in 2026 — but a logistic regression you can explain often ships first.
4. A model produces a score; a *business* produces a decision. Thresholds, costs, and calibration are where the money is.
5. Trust is earned by validation, explanation, and uncertainty — not by a high AUC.

---

## 2. Visual & editorial identity

- Theme name: **"Find the signal."** Deep ink-navy base, *signal teal* (`#2ee6c5`) = the prediction,
  *periwinkle* (`#7c8cff`) = the model, *coral* (`#ff6b8b`) = the residual/error, *lime* = validated.
- Fonts: Manrope (sans) + IBM Plex Mono (mono).
- Voice: warm, concrete, business-first. Numbers over adjectives. Every abstract idea gets a
  business example within one sentence. Second person ("you'll"), present tense, no hype.
- Session titles are *promises*, not topics ("From Scores to Decisions", not "Classification II").

---

## 3. The arc — 13 Mondays

| # | Date | Module | Title | Dataset (primary) | Hero library / idea |
|---|------|--------|-------|-------------------|---------------------|
| 1 | Sep 14 | Foundations | From Data to Decisions: Your First Predictive Model | IBM Telco Churn (`/data/telco_churn.csv`) | pandas + scikit-learn; the lifecycle; baseline vs. model; why accuracy lies |
| 2 | Sep 21 | Data & Features | Data Wrangling & EDA for Prediction | Olist Brazilian e-commerce (Kaggle) + Telco | pandas joins/groupby/datetime; EDA that asks questions; missing data; leakage spotting |
| 3 | Sep 28 | Data & Features | Feature Engineering & Leak-Proof Pipelines | Bank Marketing (UCI) + Telco | ColumnTransformer, Pipeline, encoders, scaling, target encoding, skrub's TableVectorizer |
| 4 | Oct 5 | Regression | Regression: Predicting Numbers | Ames Housing (`fetch_openml('house_prices')`) | OLS → ridge/lasso/elastic-net; RMSE/MAE/MAPE; residual diagnostics; log targets; pricing |
| 5 | Oct 19 | Classification & Decisions | Classification: Predicting Yes/No | Taiwan Credit-Card Default (UCI / OpenML 42477) | logistic regression, odds ratios, kNN, Naive Bayes; confusion matrix, precision/recall, ROC-AUC, PR-AUC; imbalance |
| 6 | Oct 26 | Classification & Decisions | From Scores to Decisions: Thresholds, Costs & Calibration | Credit Default + Telco (with a cost matrix) | expected-value framework, profit curves, `TunedThresholdClassifierCV`, calibration curves, lift/gain, uplift preview. **Midterm competition launches.** |
| 7 | Nov 2 | Trees & Ensembles | Decision Trees & Random Forests | Bank Marketing + Hotel Bookings | CART, overfitting, bagging, RF, OOB, permutation importance |
| 8 | Nov 9 | Trees & Ensembles | Gradient Boosting & the Tabular Frontier | Hotel Bookings (`/data/hotel_bookings.csv`) | HistGradientBoosting, LightGBM, XGBoost, CatBoost; early stopping; TabPFN-2.5 as a 2025 alternative. **Competition leaderboard reveal.** |
| 9 | Nov 16 | Evaluation & Optimization | Trust, but Verify: Tuning, Explaining & Uncertainty | Hotel Bookings + Credit Default | CV strategies (stratified/group/time), Optuna, SHAP, partial dependence, MAPIE conformal intervals, model cards, fairness slices |
| 10 | Nov 23 | Unsupervised Learning | Segments, Structure & Anomalies | Online Retail II (UCI) + Credit-Card Fraud (Kaggle) | RFM + k-means, hierarchical, DBSCAN, GMM; PCA & UMAP; Isolation Forest |
| 11 | Nov 30 | Time & Text | Forecasting: Time Series with ML & Foundation Models | UCI Bike Sharing (hourly) + M5 sample | time-series CV, lag/rolling features + LightGBM, StatsForecast baselines, Chronos/TimesFM zero-shot |
| 12 | Dec 7 | Time & Text | Neural Networks, Embeddings & LLMs as Features | Amazon reviews (HF `amazon_polarity`) + Telco | MLP; TF-IDF vs. sentence embeddings vs. zero-shot LLM; when deep learning beats GBDT on tabular (rarely); the AI-assisted analyst |
| 13 | Dec 14 (exam-week slot) | Finale | Ship It — Deployment, Monitoring & Your Prediction Story | Your project | joblib pipelines, MLflow, a Gradio demo, drift monitoring (Evidently), EU AI Act in one slide; **final presentations** |

**Homework (5, individual):** HW1 due S3 Sep 28 (EDA + baseline on Telco); HW2 due S5 Oct 19 (Ames regression pipeline);
HW3 due S7 Nov 2 (credit default: classification + threshold/profit); HW4 due S10 Nov 23 (hotel bookings: GBM + SHAP);
HW5 due S12 Dec 7 (forecast bike demand *or* segment retail customers — student's choice). Plus Homework #0 (setup, due S2 Sep 21).

**Midterm Model Competition (team of 2–3, Kaggle community competition):** launched S6 Oct 26 ·
hidden test set of hotel bookings · leaderboard closes Sun Nov 8, 11:59 PM · reveal + 3-minute
"what worked" talks in S8 Nov 9. Graded 50% leaderboard rank band, 50% a one-page modeling memo.

**Final Project — "Your Prediction Story" (team of 2–3, solo allowed):** proposal due Mon Nov 9 ·
notebook + 2-page decision memo due Sun Dec 13, 11:59 PM · presentations Mon Dec 14 (Session 13,
exam-week slot). No written final exam.

---

## 3b. Student-facing pages beyond sessions

- `/start` — first 30 minutes: setup (Colab, Kaggle, repo, AI assistant), the weekly rhythm, the six places on the site, five habits, refresher notebooks, first three Mondays.
- `/cheatsheet` — the course on one page: framing, leakage test, pipeline template, metric menu, confusion matrix, threshold formula, CV chooser, model chooser, trust questions, memo structure.
- `/datasets` — every dataset with a no-login loader and its gotcha, plus eight project-ready public datasets.
- `/explorers` — overfitting (S1/S4), threshold & profit (S6), gradient boosting (S8), k-means (S10). Conformal explorer still to build.
- Session pages embed the exact StatQuest videos (verified IDs) for S1, S4, S5, S7, S8, S9, S10.

- `/syllabus` — full syllabus: description, seven outcomes, weekly table (reading + due), grading + letter scale, assessments with rubrics, materials, tools, policies.
- `public/advanced/` — optional advanced-track notebooks (uplift modeling, linked from S6 and the project page). Add more here (AutoML, causal) rather than lengthening sessions.

## 4. Session JSON conventions (follow `session-01.json` exactly)

- `duration`: `"150 Minutes"`. `icon`: a lucide name available in `Icon.astro`.
- `objectives`: exactly 4. Titles are verbs ("Build…", "Read…", "Decide…").
- `agenda`: 7 items, 5:00 → 7:30 PM, with a 10-minute `isBreak` at 6:05–6:15 (template: 5:00–5:20, 5:20–5:40, 5:40–6:05, break, 6:15–6:45, 6:45–7:15, 7:15–7:30). Every item has 1–2 `bulletPoints`.
- `resources`: 6–9. Always include, in this order: (1) the session Colab notebook — hosted in this repo
  at `public/session-XX/…ipynb` and linked as
  `https://colab.research.google.com/github/harslan/isom-835/blob/master/public/session-XX/<file>.ipynb`;
  (2) an explorer if one exists; (3) 1–2 readings (ISLP chapter, Géron chapter, scikit-learn user guide /
  Inria MOOC page); (4) one real business story with a number in it; (5) one video (StatQuest/3Blue1Brown);
  (6) the relevant ISOM 730 refresher notebook when there is one (Colab links in §6).
  Use `badgeType` ∈ interactive|video|tool|reference|code and the badge labels: Hands-On, Play, Reading,
  Story, Video, Setup, Go Deeper, Refresher.
- `activities`: 1–2, each with 3–4 `steps`, a `codeBlock` (real, runnable scikit-learn ≥ 1.6 code,
  ≤ 25 lines, loads data from a URL that needs no login when possible), and a `discussionNote` (HTML allowed).
- `takeaways`: 3, each with `<strong>` on the key phrase.
- `homework`: 1 item (label "Homework #N" or "Project milestone"), 3–6 sentences, with a due date.
- `nextSession`: title, description, 3 tags, slug.
- Datasets that need no login: Telco (`https://raw.githubusercontent.com/harslan/isom-835/master/public/data/telco_churn.csv`),
  Hotel Bookings (`…/public/data/hotel_bookings.csv`), Ames (`fetch_openml('house_prices', as_frame=True)`),
  Credit Default (`fetch_openml(data_id=42477)`), Bank Marketing (`fetch_openml('bank-marketing', version=1)` or UCI zip),
  Bike Sharing (UCI zip), Online Retail II (UCI xlsx), Adult (`fetch_openml('adult')`).

---

## 5. Reference stack (pin these in `requirements.txt`)

Python 3.12 · pandas ≥ 2.2 (pandas 3.0 shipped Jan 2026: Copy-on-Write only, string dtype default — teach the
new idioms) · numpy ≥ 2 · scikit-learn ≥ 1.6 for Colab compatibility (current stable is 1.9, June 2026:
`TunedThresholdClassifierCV`, `metric_at_thresholds()`, metadata routing, `HistGradientBoosting` with
categorical support, Polars output) · lightgbm · xgboost 3.x · catboost · optuna · shap · mapie ≥ 1.0 (new API) ·
skrub · tabicl (open tabular foundation model) · statsforecast + mlforecast · imbalanced-learn · umap-learn ·
sentence-transformers · mlflow 3 · gradio · evidently.

## 5b. The 2025–26 landscape this course reflects (full brief: `docs/RESEARCH_BRIEF_2026-09.md`)

- **Tabular foundation models vs GBDTs** is the central tabular-ML debate: TabPFN-2.5 (Nov 2025), TabPFN-3 (2026,
  non-commercial weights), TabICLv2 (ICML 2026, open source, sklearn-compatible), TabArena leaderboard. TFMs win
  small/medium data with zero tuning; GBDTs win on scale, latency, licensing. → Session 8.
- **Conformal prediction is mainstream**: MAPIE 1.x API (`SplitConformalRegressor`, `SplitConformalClassifier`). → Session 9.
- **Forecasting foundation models**: Chronos-2 (Oct 2025), TimesFM 2.5/3.0; regime-dependent — strong on periodic/trend
  series. Nixtla statsforecast/mlforecast remain the free baseline stack. → Session 11.
- **LLMs on tabular data**: competitive zero-shot only on small, simple problems (LLMTabBench 2026); LLM embeddings as
  extra features help on small/imbalanced/text-rich data. → Session 12.
- **AI-assisted analysts**: Colab Data Science Agent, Jupyter AI 3.x, Claude Code — teach verification, not avoidance. → Sessions 1, 12.
- **Regulation**: EU AI Act Article 4 AI-literacy duty (since Feb 2025, enforceable Aug 2026); Digital Omnibus deferred
  Annex III high-risk obligations (credit scoring, hiring) to Dec 2, 2027; Colorado SB 26-189 effective Jan 1, 2027. → Session 13.
- **Stories with numbers**: Stripe Radar (~32% fraud reduction), Mastercard Decision Intelligence, ZSFG readmission GBT,
  Wayfair uplift "persuadables", Upstart/Zest credit (vendor-reported), McKinsey State of AI 2025 (88% adopt, 39% EBIT impact).

---

## 6. Professor's prior notebooks (ISOM 730 archive — link as "Refresher")

- Data visualization (matplotlib/seaborn): https://colab.research.google.com/drive/1fw1j5NDYhhmU95d8s7xiiEjHj8C9ObUA
- Introducing scikit-learn (estimator API, digits): https://colab.research.google.com/drive/1qVNaTGH7vi7nRQgy5fGSK87ZEju4CIEy
- Model validation & selection (holdout, CV, bias–variance, grid search): https://colab.research.google.com/drive/1NAq1lyq-6gfsgGYSDpTxgr8q4Jkd3X-E
- Naive Bayes: https://colab.research.google.com/drive/1Ff6uFZ-HhZm1e78D7ueh_AlID7aZ-E4A
- Linear regression, basis functions, ridge/lasso: https://colab.research.google.com/drive/1D_mocQY0w41t0bsB0UYzpykDH_g5jn7W
- Support vector machines (kernel trick, faces): https://colab.research.google.com/drive/1AGkgtwLxJeF2amIGESmGZXfjZ94MmMNm
- Decision trees & random forests: https://colab.research.google.com/drive/13HdM6eZktrZlrbOTFJb6TOSktezPq2sd
- PCA (eigenfaces, noise filtering): https://colab.research.google.com/drive/1n70pf6LtHuWFiTvR4Oh9q9WR3Jhz1tSt
- Credit-card default challenge (SVM): https://colab.research.google.com/drive/1kXsC0vbY94Guv-xFptoJAys5u9WxHe3c
- Boston house-price mini project: https://colab.research.google.com/drive/1D8QOybBDWWrWORt5BxWYXavqqkOIWl8x

Local copies of the ISOM 730 archive live in `legacy/isom730/` (not deployed).

---

## 7. Free companion texts

- Géron, *Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow*, 3rd ed. — notebooks: https://github.com/ageron/handson-ml3
- James, Witten, Hastie, Tibshirani, Taylor, *An Introduction to Statistical Learning with Python* (ISLP) — free PDF + labs: https://www.statlearning.com
- VanderPlas, *Python Data Science Handbook* — free: https://jakevdp.github.io/PythonDataScienceHandbook/
- Inria scikit-learn MOOC — https://inria.github.io/scikit-learn-mooc/
- Google ML Crash Course (2024–25 refresh) — https://developers.google.com/machine-learning/crash-course
- Kaggle Learn (Intro/Intermediate ML, Feature Engineering, Time Series) — https://www.kaggle.com/learn
