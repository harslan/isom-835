# ISOM 835 Research Brief: Predictive Analytics & ML, State of Play (September 2026)

All items below were verified via web search or page fetch in this session. Items marked *[uncertain]* came from secondary sources that could not be confirmed against a primary page.

## 1. Recent developments (2025–2026) the course should reflect

### scikit-learn
- Current stable is **1.9** (released June 12, 2026); **1.8** shipped Dec 10, 2025 (supports Python 3.11–3.14, free-threaded CPython).
- Teachable additions:
  - `TunedThresholdClassifierCV` / `FixedThresholdClassifier` with metadata routing for cost-sensitive decision thresholds (since 1.5; ideal for churn/fraud cost matrices).
  - New `metric_at_thresholds()` in 1.9 to compute any binary metric across all decision thresholds.
  - Experimental callbacks (`ProgressBar`, `ScoringMonitor`) in 1.9.
  - Richer HTML estimator displays showing fitted attributes and ColumnTransformer feature flow.
  - Native missing-value support in more tree models; better sample-weight numerics in HistGradientBoosting and random forests.
  - Array API / GPU support (StandardScaler, RidgeCV, LogisticRegression/PoissonRegressor with LBFGS, CalibratedClassifierCV, GaussianMixture).
  - narwhals dependency for dataframe-agnostic (pandas/Polars) support; sparse-array transition.
- Sources:
  - https://blog.scikit-learn.org/updates/release-1-9/
  - https://scikit-learn.org/stable/auto_examples/release_highlights/plot_release_highlights_1_9_0.html
  - https://scikit-learn.org/stable/auto_examples/release_highlights/plot_release_highlights_1_8_0.html
  - https://scikit-learn.org/stable/auto_examples/release_highlights/plot_release_highlights_1_5_0.html
  - https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TunedThresholdClassifierCV.html

### pandas 3.0 (released Jan 21, 2026)
- Copy-on-Write is now the only mode (chained assignment silently breaks old notebook idioms).
- Dedicated string dtype by default (PyArrow-backed if installed; 4–10x faster string ops).
- `pd.col()` expressions. Old tutorials will throw warnings/errors; plan for it.
- Sources:
  - https://pandas.pydata.org/community/blog/pandas-3.0.html
  - https://pandas.pydata.org/docs/dev/whatsnew/v3.0.0.html

### Polars
- 1.0 shipped July 1, 2024; now in the 1.4x series (1.42 June 2026).
- *[uncertain: secondary sources cite the 2026 Stack Overflow survey at ~42% pandas vs ~11% Polars among professional Python devs, with Polars share doubling yearly.]*
- Recommended stance: teach pandas as primary; one session showing the Polars lazy API and `set_output(transform="polars")`.
- Sources:
  - https://pola.rs/posts/announcing-polars-1/
  - https://pypi.org/project/polars/
  - https://github.com/scikit-learn/scikit-learn/issues/31049

### Gradient-boosted trees
- XGBoost is at 3.x (3.1 added a categorical re-coder saved in the model and adaptive GPU external-memory cache; docs show 3.4). LightGBM 4.6 and CatBoost 1.2.x remain standard.
- Still the practical default for large data, latency-sensitive serving, and unrestricted commercial use.
- Source: https://xgboost.readthedocs.io/en/stable/changes/index.html

### Tabular foundation models (the biggest conceptual shift)
- **TabPFN-2.5** (Nov 2025): up to 50k rows / 2k features (20x data cells vs v2); 100% win rate vs default XGBoost on ≤10k-row classification, 87% up to 100k rows (85% regression); matches AutoGluon 1.4 "extreme" 4-hour ensembles; includes distillation to MLP/tree ensembles for low-latency deployment. https://arxiv.org/abs/2511.08667
- **TabPFN-3** (2026, arXiv 2605.13986): up to 1M rows, ≤2k features; weights under `tabpfn-3-license-v1.0` (research/internal evaluation only; commercial or production use requires a paid Prior Labs license). https://huggingface.co/Prior-Labs/tabpfn_3/blob/main/README.md , https://docs.priorlabs.ai/models , https://github.com/PriorLabs/TabPFN
- **TabICLv2** (ICML 2026, Inria): fully open source, pip-installable, scikit-learn-compatible, scales to ~500k rows, ~10x faster than TabPFN v2 on wide data, beats tuned XGBoost/CatBoost/LightGBM on ~80% of TabArena datasets. Best free classroom choice. https://github.com/soda-inria/tabicl , https://arxiv.org/abs/2602.11139 , https://tabicl.readthedocs.io/en/latest/
- **AutoGluon 1.4** added TabPFNv2, TabICL, Mitra (Amazon's own TFM, pretrained on mixed synthetic priors), RealMLP, TabM; current docs show 1.5/1.6. https://auto.gluon.ai/stable/whats_new/v1.4.0.html , https://auto.gluon.ai/stable/tutorials/tabular/tabular-foundational-models.html , https://www.amazon.science/blog/mitra-mixed-synthetic-priors-for-enhancing-tabular-foundation-models
- **TabArena** is the living benchmark (leaderboard at https://huggingface.co/spaces/TabArena/leaderboard ; paper https://arxiv.org/abs/2506.16791 ). As of Feb 2026, Real-TabPFN-2.5 led single models with AutoGluon-extreme slightly ahead; independent commentary flags licensing and possible benchmark-affiliation bias, and recommends TabICLv2 for open use. https://mindfulmodeler.substack.com/p/the-state-of-tabular-foundation-models
- Teaching framing: "GBDT vs TFM" is now the central tabular-ML debate. TFMs win on small/medium data with zero tuning; GBDTs win on scale, latency, and licensing.

### LLMs on tabular data
- **LLMTabBench** (2026): LLMs competitive zero-shot on low-data binary classification, but performance declines past a complexity threshold and few-shot examples can conflict with prior knowledge and hurt. https://arxiv.org/abs/2605.24417
- Earlier work: TabLLM beats GBDTs only at ≤8 shots, and better-tuned LightGBM baselines (forcing splits on few samples) improved by ~290% and closed the gap. https://arxiv.org/abs/2411.04324
- LLM embeddings as extra features for XGBoost/CatBoost help most on small, imbalanced, or text-rich datasets; embedding-derived features often rank high in importance. https://arxiv.org/abs/2411.01645 , https://arxiv.org/abs/2502.11596 , https://machinelearningmastery.com/feature-engineering-with-llm-embeddings-enhancing-scikit-learn-models/

### Conformal prediction
- **MAPIE 1.0** (May 22, 2025) reworked the API (`SplitConformalRegressor`, `CrossConformalRegressor`, `SplitConformalClassifier`, etc.); latest is 1.5.0 (Aug 2026, Python ≥3.10). scikit-learn-contrib, so it slots into a pipeline session easily.
- Sources: https://github.com/scikit-learn-contrib/MAPIE , https://pypi.org/project/MAPIE/ , https://mapie.readthedocs.io/

### Interpretability
- SHAP remains the standard. 0.49 was the last release supporting Python 3.9/3.10; 0.50+ requires 3.11+ and is migrating from Numba to C++/nanobind. Pair with sklearn `PartialDependenceDisplay` and permutation importance.
- Source: https://shap.readthedocs.io/en/latest/release_notes.html

### MLOps
- **MLflow 3** (June 2025) unified classical experiment tracking with GenAI tracing/evaluation; 3.16 is current. For this course, experiment tracking plus model registry is enough.
- Sources: https://mlflow.org/releases/3/ , https://mlflow.org/releases/

### AI coding assistants in data science
- Google **Colab Data Science Agent** (Gemini) generates full notebooks from an uploaded dataset plus a prompt; free for users 18+. https://developers.googleblog.com/en/data-science-agent-in-colab-with-gemini/ , https://labs.google.com/code/dsa
- **Jupyter AI 3.x** integrates external agents (Claude, Codex, Gemini, Goose, Kiro, OpenCode) via the ACP standard; multi-chat, multi-agent architecture. https://github.com/jupyterlab/jupyter-ai/releases , https://jupyter-ai.readthedocs.io/
- **Claude Code** reads/writes notebooks and cell outputs directly; Anthropic analyzed ~400k Claude Code sessions (Oct 2025–Apr 2026). A 2026 survey of quantitative social scientists found only ~20% use coding agents routinely, so explicit instruction has value. https://www.anthropic.com/research/claude-code-expertise , https://www.anthropic.com/research/coding-agents-social-sciences , https://www.dataquest.io/blog/getting-started-with-claude-code-for-data-scientists/
- Cursor vs Claude Code framing: editor-centric vs delegation-centric. https://nimbalyst.com/blog/claude-code-vs-cursor/

### Time series
- **Chronos-2** (Amazon, Oct 2025): zero-shot univariate, multivariate, and covariate-aware forecasting; led GIFT-Eval, fev-bench, and Chronos Benchmark II at release. https://arxiv.org/abs/2510.15821 , https://www.amazon.science/blog/introducing-chronos-2-from-univariate-to-universal-forecasting , https://github.com/amazon-science/chronos-forecasting
- **TimesFM 2.5** (Sept 2025, 200M params, 16k context, Apache-2.0 weights) and **TimesFM 3.0** (Aug 2026, native covariates, weights non-commercial). https://github.com/google-research/timesfm
- Foundation models are regime-dependent: strong on periodic/trend data, weaker on high-entropy series. https://arxiv.org/pdf/2605.24381
- **Nixtla** statsforecast/mlforecast remain the best free classroom stack (AutoARIMA/ETS/Theta baselines; lag/rolling/date features feeding LightGBM); TimeGPT-2 is commercial. https://github.com/Nixtla/statsforecast , https://github.com/Nixtla/mlforecast , https://www.nixtla.io/blog

### Causal ML / uplift
- **EconML** (Microsoft, double ML / heterogeneous effects) and **CausalML** (Uber, uplift/meta-learners) remain the reference libraries; KDD ran its 3rd "Causal Inference and ML in Practice" workshop in 2025.
- Sources: https://github.com/py-why/EconML , https://github.com/uber/causalml , https://causalml.readthedocs.io/en/latest/about.html , https://causal-machine-learning.github.io/kdd2021-tutorial/

### Regulation (facts for a responsible-AI session)
- **EU AI Act**: Article 4 AI-literacy duty for providers and deployers applies since Feb 2, 2025 (enforceable from Aug 3, 2026). The Digital Omnibus (in force July 27, 2026) deferred Annex III high-risk obligations (credit scoring, hiring, insurance) to Dec 2, 2027 and Annex I to Aug 2, 2028; Article 50 transparency duties still apply from Aug 2, 2026.
  - https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/
  - https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-omnibus-vii-deadline-delay-20260/
  - https://www.lw.com/en/insights/upcoming-eu-ai-act-obligations-mandatory-training-and-prohibited-practices
  - https://www.crowell.com/en/insights/client-alerts/part-2-ai-literacy-employer-ai-literacy-obligations-under-the-eu-ai-act
- **Colorado**: SB 26-189 (signed May 14, 2026) repealed the 2024 "duty of care" framework and replaced it with disclosure, adverse-outcome explanation (30 days), and human-review rules for automated decision-making in consequential decisions (including employment), effective Jan 1, 2027. Earlier delay: SB 25B-004 (Aug 2025) moved the original Feb 2026 date to June 30, 2026.
  - https://leg.colorado.gov/bills/sb26-189
  - https://www.hklaw.com/en/insights/publications/2026/05/colorado-governor-signs-sb-189
  - https://www.hunton.com/privacy-and-cybersecurity-law-blog/colorado-ai-act-amended-and-effective-date-delayed

## 2. Best free teaching resources

- **scikit-learn MOOC (Inria)**, taught by core developers, CC-BY, notebooks + videos + Binder: https://inria.github.io/scikit-learn-mooc/ , https://github.com/INRIA/scikit-learn-mooc , https://www.fun-mooc.fr/en/courses/machine-learning-python-scikit-learn/
- **ISLP labs** (official, v2.2.3): https://github.com/intro-stat-learning/ISLP_labs , https://intro-stat-learning.github.io/ISLP/labs.html ; book PDF at https://www.statlearning.com
- **Hands-On ML 3e notebooks**: https://github.com/ageron/handson-ml3 ; Géron's new PyTorch/Hugging Face edition notebooks: https://github.com/ageron/handson-mlp
- **Python for Data Analysis 3e**, open access (pandas 2.0 era; expect pandas 3 warnings): https://wesmckinney.com/book/
- **Google ML Crash Course** (Nov 2024 rebuild; 12 modules incl. LLMs, AutoML, fairness, production ML; 130+ exercises): https://developers.google.com/machine-learning/crash-course , https://blog.google/innovation-and-ai/technology/developers-tools/machine-learning-crash-course/
- **Kaggle Learn** micro-courses (Intro ML, Intermediate ML, Feature Engineering, Time Series, ML Explainability, AI Ethics): https://www.kaggle.com/learn , https://www.kaggle.com/learn/intro-to-machine-learning , https://www.kaggle.com/learn/intermediate-machine-learning
- **fast.ai Practical Deep Learning for Coders** (2022 edition still current): https://course.fast.ai
- **Burkov**: Hundred-Page ML Book https://themlbook.com ; Hundred-Page Language Models Book (2025, read-first/buy-later) https://www.thelmbook.com
- **DeepLearning.AI**: ML Specialization (Python/scikit-learn notebooks, 2025 refresh with ethics module) https://www.coursera.org/specializations/machine-learning-introduction ; AI Python for Beginners https://www.deeplearning.ai/courses/ai-python-for-beginners
- **Videos**: StatQuest index https://statquest.org/video_index.html ; StatQuest Python ML playlist https://www.youtube.com/playlist?list=PLyiBQllIUtbPJyRWonEGBxNYqUkUKuVGM ; 3Blue1Brown neural nets https://www.youtube.com/playlist?list=PLLMP7TazTxHrgVk7w1EKpLBIDoC50QrPS
- **MIT 15.071 Analytics Edge** (R, but the case-per-topic structure is the model): https://ocw.mit.edu/courses/15-071-the-analytics-edge-spring-2017/ ; edX https://www.edx.org/learn/analytics/massachusetts-institute-of-technology-the-analytics-edge ; community Python ports e.g. https://github.com/marius313/15.071x-The-Analytics-Edge-in-Python
- **Business-flavored datasets (Kaggle)**:
  - Telco customer churn (7,043 rows, 21 cols): https://www.kaggle.com/datasets/blastchar/telco-customer-churn
  - Home Credit default risk: https://www.kaggle.com/competitions/home-credit-default-risk
  - Lending Club 2007–2018 accepted/rejected loans: https://www.kaggle.com/datasets/wordsforthewise/lending-club
  - Credit-card fraud (284,807 txns, 0.172% fraud): https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
  - Ames house prices (79 features): https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques
  - Olist Brazilian e-commerce (100k orders 2016–2018, reviews, freight): https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
  - Instacart market basket (3M orders, 200k users): https://www.kaggle.com/c/instacart-market-basket-analysis
  - Favorita store sales forecasting (Ecuador): https://www.kaggle.com/competitions/store-sales-time-series-forecasting
  - M5 Walmart forecasting (42,840 hierarchical series): https://www.kaggle.com/competitions/m5-forecasting-accuracy
  - Criteo uplift dataset (25M rows) via CausalML / scikit-uplift loaders.

## 3. Business case stories with measurable outcomes (2024–2026)

- **Credit risk**: Upstart claims 43% more approvals at the same default rate, or 53% fewer defaults at the same approval rate, vs FICO-only; Zest AI reports ~25% more approvals at constant risk across 180+ lenders; VyStar CU reports >60% instant approvals with AI vs ~30% before. *[vendor-reported]* https://www.zest.ai/learn/blog/top-five-ways-lenders-are-embracing-machine-learning/ , https://bhavanat.substack.com/p/a-case-study-in-finance-zest-ais
- **Fraud**: Stripe Radar reports ~32% average fraud reduction and up to 40% vs manual review alone, trained on 70T data points; Mastercard Decision Intelligence reports 20% higher detection and 30% fewer false declines, scoring ~150B transactions/yr in <50 ms. Strong hook for cost-sensitive thresholds and class imbalance. https://stripe.com/radar , https://stripe.com/guides/primer-on-machine-learning-for-fraud-protection , https://www.idaireland.com/latest-news/insights/how-ai-in-fraud-detection-is-revolutionising-banking-and-payments
- **INFORMS Franz Edelman Award**:
  - 2025 winner USA Cycling (data-driven strategy, 8th at Worlds to Olympic gold, 4:04.32). Finalists: Amazon regionalization (–$0.45 cost/item in the US), Lufthansa disruption recovery with Google Research (€12M saved, 14k t CO2), SF Express (>$1B saved, >1B parcels), Flipkart, WM dynamic routing (50% fewer safety incidents). https://www.informs.org/News-Room/INFORMS-Releases/Awards-Releases/2025-INFORMS-Franz-Edelman-Award-Finalists-Announced
  - 2026 winner Microsoft (cloud supply chain / hyperscale fulfillment optimization). Finalists: Chewy replenishment, ECCO global retail inventory (rolling-horizon stochastic programming), Google carbon-aware compute shifting, Nvidia supply-chain OR+AI, India Dept. of Food and Public Distribution (810M+ people). https://www.informs.org/Recognizing-Excellence/INFORMS-Prizes/Franz-Edelman-Award/Franz-Edelman-Laureates2/Franz-Edelman-Laureates-Class-of-2026 , https://www.informs.org/News-Room/INFORMS-Releases/Awards-Releases/INFORMS-Names-Six-Finalists-for-the-2026-Franz-Edelman-Award-the-World-s-Leading-Honor-in-Analytics-Operations-Research-and-Management-Science
- **Demand forecasting**: DoorDash uses GBMs with a "cascade" holiday-multiplier approach (2025 post) and an earlier ensemble time-series model; Instacart reports >40% forecast improvement since inception via rigorous back-testing; Walmart's M5 data is the canonical benchmark. https://careersatdoordash.com/blog/how-doordash-improves-holiday-predictions-via-cascade-ml-approach/ , https://careersatdoordash.com/blog/how-doordash-built-an-ensemble-learning-model-for-time-series-forecasting/ , https://tech.instacart.com/leveraging-elastic-demand-for-forecasting-6278b45f805f , https://www.sciencedirect.com/science/article/pii/S0169207021001874
- **Healthcare readmission**: Zuckerberg San Francisco General replaced Epic's Risk of Unplanned Readmission model with an in-house gradient-boosted tree using social-determinants data (Aug 2024) and reports lower readmissions, narrowed equity gaps, improved survival, and positive financial impact (2019–2024 interrupted time series). https://www.ajmc.com/view/reducing-readmissions-in-the-safety-net-through-ai-and-automation , https://www.hcinnovationgroup.com/analytics-ai/artifical-intelligence-machine-learning/article/55310191/replicating-readmission-reduction-success-in-the-safety-net ; Health Catalyst: 52% relative reduction in heart-failure 30-day readmissions https://www.healthcatalyst.com/learn/success-stories/reducing-readmissions-machine-learning-key-strategy
- **Marketing uplift**: Wayfair's display-remarketing uplift model targets "persuadables" (canonical explainer with the 50-vs-40 conversion example). https://www.aboutwayfair.com/uplift-modeling-in-display-remarketing ; Uber CausalML used for driver incentives and rider promotions. https://github.com/uber/causalml
- **Dynamic pricing**: aggregator sources cite 4.5% gross-profit uplift for an electronics retailer with a demand-based engine and 10%+ margin gains generally. *[vendor/aggregator-reported]* https://competera.ai/resources/articles/dynamic-pricing-algorithm
- **Predictive maintenance**: industry sources cite 30–50% downtime and 20–40% maintenance-cost reductions; examples include a Fortune 500 manufacturer (–45% unplanned downtime, $2.8M/yr), GE Aviation (+25% maintenance efficiency), Chevron (–25% unscheduled maintenance cost). *[mostly vendor/aggregator-reported; use as illustrative, not audited]* https://www.iiot-world.com/predictive-analytics/predictive-maintenance/predictive-maintenance-cost-savings/ , https://www.provalet.io/guides-posts/predictive-maintenance-case-studies
- **Churn**: no strong first-party 2025 corporate case surfaced. Best citable evidence is peer-reviewed: XGBoost recall 0.85 / AUC 0.86 in a Portuguese software firm with support-ticket resolution time as a top driver; a 2025 "e-Profits" profit-sensitive evaluation metric paper; a 2025 SaaS churn study. https://link.springer.com/article/10.1057/s41270-023-00269-9 , https://arxiv.org/abs/2507.08860 , https://www.emerald.com/inmr/article/22/2/130/1251238/Churn-prediction-for-SaaS-company-with-machine
- **Framing stat**: McKinsey State of AI 2025 (1,993 respondents, 105 countries): 88% of firms use AI, only ~39% attribute any EBIT impact, and ~6% are "high performers" attributing ≥5% EBIT to AI; high performers are ~3x more likely to have redesigned workflows. https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai

## 4. Comparable syllabi and how they structure the term

- **MIT 15.071 Analytics Edge** (9 units, each = one method + one business case): intro (nutrition data) → linear regression (Moneyball) → logistic regression (Framingham) → trees (D2Hawkeye healthcare costs, housing) → text analytics (Twitter, Watson) → clustering (Netflix) → visualization (WHO, predictive policing) → linear optimization (airline revenue management, radiation therapy) → integer optimization (sports scheduling, eHarmony, OR scheduling). Best template for "one method, one story per week." https://ocw.mit.edu/courses/15-071-the-analytics-edge-spring-2017/pages/unit-index/ , https://www.ocw.mit.edu/courses/15-071-the-analytics-edge-spring-2017/pages/syllabus
- **NYU Stern TECH-GB 2336 Data Science for Business (Technical)**, Provost, Spring 2025: Provost & Fawcett text, Python notebooks in Colab submitted via Brightspace, weekly 6pm evening sessions (closest format match to ISOM 835). https://web-apps-shib.stern.nyu.edu/syllabi/static/syllabusfiles/TECH-UB.57_002_S2025.pdf , https://web-docs.stern.nyu.edu/ioms/SYLLABI/PROVOST_SP23-TECHGB.pdf
- **Wharton** launched an AI for Business MBA major and undergraduate concentration (Fall 2025) with required STAT 4230/7230 Applied ML in Business plus LGST 6420 accountable-AI ethics course; detailed syllabus not public. https://news.wharton.upenn.edu/press-releases/2025/04/the-wharton-school-introduces-new-undergraduate-concentration-and-mba-major-in-artificial-intelligence-for-business/ , https://statistics.wharton.upenn.edu/programs/mba/course-descriptions/
- **CMU Tepper 46-887 Machine Learning for Business Applications** (mini-semester; PT-MSBA curriculum map July 2025). https://www.cmu.edu/sites/default/files/cmu-tepper-site-files/documents/pt-msba-curriculum-map-7.1.25.pdf , https://www.cmu.edu/tepper/programs/master-business-analytics/curriculum
- **UT McCombs MSBA ML course** uses scikit-learn + PyTorch. https://www.mccombs.utexas.edu/graduate/specialized-masters/ms-business-analytics/ms-business-analytics-on-campus/academics/curriculum/
- **Kellogg** launched new AI/ML MBA courses Fall 2025. https://www.kellogg.northwestern.edu/news/blog/2025/05/30/mba-courses-artificial-intelligence-machine-learning/
- **Indiana Kelley BUKD-S575 Business Applications of AI and ML** (scikit-learn). https://kelley.iu.edu/faculty-research/courses/course.html?ID=BUKD-S575-649
- **Georgia Tech MGT 6203 Data Analytics for Business** (OMSA, R-based, biweekly deadlines; 2025 review). https://blog.marketingdatascience.ai/georgia-techs-data-analytics-for-business-course-my-review-of-mgt-6203-updated-for-2025-96fb2697e54a
- **Stanford Continuing Studies TECH-68 ML for Business with Python** (churn, causal impact of marketing; scikit-learn, TensorFlow, spaCy, Altair). Page now returns HTTP 410; listing at https://continuingstudies.stanford.edu/courses/professional-and-personal-development/machine-learning-for-business-with-python/20251_TECH-68 *[content from search snippet only]*

### Implied 13-week shape (synthesis of the above plus 2026 tooling)
1. Framing, the analytics value gap (McKinsey), Python/pandas 3 setup, AI coding assistants as lab partners
2. Regression and evaluation (Ames house prices)
3. Classification, decision thresholds, and cost matrices (Telco churn; `TunedThresholdClassifierCV`)
4. Validation, leakage, pipelines, and ColumnTransformer
5. Trees, random forests, and gradient boosting (Home Credit / Lending Club)
6. Feature engineering, categorical handling, and LLM embeddings as features (Olist reviews)
7. Interpretability: SHAP, partial dependence, permutation importance
8. Uncertainty: calibration and conformal prediction (MAPIE)
9. Tabular foundation models and AutoML (TabICLv2, TabPFN, AutoGluon) vs GBDTs, with licensing discussion
10. Time-series forecasting: statsforecast baselines, mlforecast with LightGBM, Chronos-2 zero-shot (Favorita / M5)
11. Causal ML and uplift for marketing (CausalML / EconML; Criteo uplift)
12. Responsible AI: fairness metrics, EU AI Act and Colorado SB 26-189, model documentation, MLflow tracking
13. Project showcase
