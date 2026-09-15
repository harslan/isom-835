// ISOM 835 — Practice Question Bank
// Exam-style predictive analytics questions written for this course, spanning
// the prediction lifecycle, leak-proof features, regression, classification and
// decision-making from scores, trees and boosting, and trust & structure.
// Every wrong answer is tagged with the misconception a smart student might hold.

export type DomainId =
  | 'ml-foundations'
  | 'data-features'
  | 'regression'
  | 'classification-decisions'
  | 'trees-ensembles'
  | 'evaluation-unsupervised';

export interface Domain {
  id: DomainId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
}

export const domains: Domain[] = [
  {
    id: 'ml-foundations',
    number: '01',
    title: 'The Prediction Lifecycle',
    shortTitle: 'Foundations',
    description: 'Framing a prediction problem, beating the baseline, splitting honestly, and why accuracy lies.',
    icon: 'rocket',
  },
  {
    id: 'data-features',
    number: '02',
    title: 'Data & Leak-Proof Features',
    shortTitle: 'Features',
    description: 'Leakage, pipelines, encoding, scaling, and missing data — the work that decides whether a model ships.',
    icon: 'layers',
  },
  {
    id: 'regression',
    number: '03',
    title: 'Regression & Regularization',
    shortTitle: 'Regression',
    description: 'Reading coefficients, log targets, ridge and lasso, choosing between RMSE, MAE, and MAPE, and what residuals say.',
    icon: 'chart-line',
  },
  {
    id: 'classification-decisions',
    number: '04',
    title: 'Classification & Decisions',
    shortTitle: 'Decisions',
    description: 'Odds, confusion matrices, precision and recall, ROC versus PR, thresholds, cost matrices, calibration, and lift.',
    icon: 'crosshair',
  },
  {
    id: 'trees-ensembles',
    number: '05',
    title: 'Trees, Forests & Boosting',
    shortTitle: 'Ensembles',
    description: 'Splits and depth, bagging versus boosting, early stopping, feature importance, and where gradient boosting still wins.',
    icon: 'trees',
  },
  {
    id: 'evaluation-unsupervised',
    number: '06',
    title: 'Trust & Structure',
    shortTitle: 'Trust',
    description: 'Cross-validation strategies, SHAP, conformal intervals, fairness slices, k-means, and forecasting validation.',
    icon: 'shield',
  },
];

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface DistractorExplanation {
  misconception: string;
  explanation: string;
}

export interface Question {
  id: string;
  number: number;
  domain: DomainId;
  scenario: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  correctExplanation: string;
  distractors: Partial<Record<'A' | 'B' | 'C' | 'D', DistractorExplanation>>;
  tags: string[];
}

export const questions: Question[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 1: The Prediction Lifecycle
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'Q01',
    number: 1,
    domain: 'ml-foundations',
    scenario: 'A subscription-box company has four analytics initiatives on its roadmap. The CFO asks which one is the *predictive* analytics project.',
    question: 'Which initiative is predictive analytics?',
    options: [
      { id: 'A', text: 'A dashboard showing last quarter\'s churn rate by region' },
      { id: 'B', text: 'A model that scores each active subscriber\'s probability of cancelling next month' },
      { id: 'C', text: 'An optimizer that allocates the $200K retention budget across regions' },
      { id: 'D', text: 'A summary of an A/B test comparing two welcome emails' },
    ],
    correctAnswer: 'B',
    correctExplanation: 'Predictive analytics produces an estimate about a future, unobserved outcome for a specific unit — here, each subscriber\'s chance of cancelling next month. The dashboard and A/B summary describe what already happened; the optimizer prescribes what to do. Prediction sits in the middle and feeds the prescription.',
    distractors: {
      A: { misconception: 'Descriptive = predictive', explanation: 'A churn-rate dashboard reports the past. Nothing in it estimates what an individual subscriber will do next.' },
      C: { misconception: 'Prescriptive = predictive', explanation: 'Allocating a budget is a decision, not a forecast. It may *consume* predictions, but the optimizer is prescriptive analytics (ISOM 839 territory).' },
      D: { misconception: 'Experiments are predictions', explanation: 'An A/B test measures a causal effect that already occurred. It informs future decisions but does not score future outcomes per unit.' },
    },
    tags: ['analytics map', 'definitions'],
  },
  {
    id: 'Q02',
    number: 2,
    domain: 'ml-foundations',
    scenario: 'A regional bank says: "We want to use machine learning to reduce credit-card defaults." A data scientist insists on a written framing before any code.',
    question: 'Which framing is complete enough to start building a model?',
    options: [
      { id: 'A', text: 'Unit: each open card account. Target: default within the next 90 days. Horizon: scored monthly. Decision: whether to lower the credit line or offer a payment plan.' },
      { id: 'B', text: 'Use gradient boosting on all available account data to predict defaults with at least 95% accuracy.' },
      { id: 'C', text: 'Predict defaults for the portfolio so the risk team has better visibility.' },
      { id: 'D', text: 'Build the model first on whatever data is available; the framing will emerge from the feature importances.' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'A usable framing names the prediction unit, the target with a horizon, when the score is produced, and the decision that changes because of it. Every later choice — features allowed, metric, threshold — follows from those four lines. Option A is the only one that answers all four.',
    distractors: {
      B: { misconception: 'Algorithm-first framing', explanation: 'Naming the algorithm and an accuracy target says nothing about what is predicted, for whom, or by when. 95% accuracy on a 3%-default portfolio is worse than predicting "no one defaults".' },
      C: { misconception: 'Visibility is a decision', explanation: '"Better visibility" is not a decision. Without a decision, there is no way to choose the horizon, the costs of errors, or the threshold.' },
      D: { misconception: 'The data will frame it', explanation: 'Building first is how leakage and the wrong horizon creep in. Feature importances cannot tell you which decision the business needs.' },
    },
    tags: ['framing', 'lifecycle'],
  },
  {
    id: 'Q03',
    number: 3,
    domain: 'ml-foundations',
    scenario: 'A retailer\'s churn dataset has 8,000 customers, of whom 1,200 churned. A vendor demo reports a model with **86% accuracy** on a held-out sample and calls it "highly accurate".',
    question: 'What accuracy does the do-nothing baseline (predict "no churn" for everyone) achieve, and what does that say about the vendor\'s model?',
    options: [
      { id: 'A', text: '15% — the model is far better than chance' },
      { id: 'B', text: '85% — the model barely beats predicting that nobody churns' },
      { id: 'C', text: '50% — a coin flip, so 86% is excellent' },
      { id: 'D', text: '86% is the baseline, so the model adds nothing' },
    ],
    correctAnswer: 'B',
    correctExplanation: 'Non-churners are 6,800 of 8,000 customers, so always predicting "no churn" scores 6,800 / 8,000 = 85%. The vendor\'s 86% is one percentage point above doing nothing. Accuracy without a baseline is a number without meaning; on imbalanced data it is usually flattering.',
    distractors: {
      A: { misconception: 'Baseline = minority rate', explanation: '15% is the churn rate. The majority-class baseline predicts the *majority* class, which is right 85% of the time.' },
      C: { misconception: 'Chance means 50%', explanation: 'A coin flip is the baseline only when classes are balanced. With 85/15 classes the naive baseline is 85%, not 50%.' },
      D: { misconception: 'Baseline confused with model', explanation: 'The baseline is 85%, not 86%. The model does add something — about one point — which is the honest way to describe it.' },
    },
    tags: ['baseline', 'accuracy', 'imbalance'],
  },
  {
    id: 'Q04',
    number: 4,
    domain: 'ml-foundations',
    scenario: 'A colleague tunes a churn model by trying 40 hyperparameter settings, checking accuracy on the 20% test set after each one, and reporting the best test accuracy she found: 84.1%.',
    question: 'What is wrong with the reported 84.1%?',
    options: [
      { id: 'A', text: 'Nothing — the test set was held out from training, so the number is honest' },
      { id: 'B', text: 'The test set has been used to choose the model, so 84.1% is optimistically biased; a fresh test set or a validation split is needed' },
      { id: 'C', text: 'Forty settings is too few; with more trials the test accuracy would be reliable' },
      { id: 'D', text: 'The split should have been 50/50 so the test set is large enough to trust' },
    ],
    correctAnswer: 'B',
    correctExplanation: 'Every time you pick the setting with the best test score, you are fitting a choice to the test set. After 40 looks, the winner is partly the one that got lucky on those particular customers, so its score overstates future performance. Tune on a validation split (or cross-validation) and touch the test set once, at the end.',
    distractors: {
      A: { misconception: 'Held out from fit = held out from selection', explanation: 'Selection is training in slow motion. The test set stayed out of .fit() but it drove the decision, and that is enough to bias the estimate.' },
      C: { misconception: 'More trials fix the bias', explanation: 'More trials make it worse: the more candidates you compare on the same test set, the luckier the winner is likely to be.' },
      D: { misconception: 'Bigger test set removes selection bias', explanation: 'Size reduces noise, not the bias from repeatedly choosing against the same data. A 50/50 split also throws away half the training data.' },
    },
    tags: ['train/test', 'validation', 'selection bias'],
  },
  {
    id: 'Q05',
    number: 5,
    domain: 'ml-foundations',
    scenario: 'A demand model for a bakery chain reports **training RMSE 2.1 loaves** and **test RMSE 9.8 loaves**. The model is a 12th-degree polynomial on daily temperature.',
    question: 'What is the diagnosis, and what is the sensible first move?',
    options: [
      { id: 'A', text: 'High bias (underfitting) — increase the polynomial degree' },
      { id: 'B', text: 'High variance (overfitting) — simplify the model, regularize, or get more data' },
      { id: 'C', text: 'Data leakage — the test set must contain training rows' },
      { id: 'D', text: 'Nothing is wrong — training error is always much lower than test error' },
    ],
    correctAnswer: 'B',
    correctExplanation: 'A large gap between low training error and high test error is the signature of variance: the model has memorized the training days, including their noise, and that memory does not transfer. Lower the degree, add regularization, or feed it more data; the training error will rise a little and the test error will fall a lot.',
    distractors: {
      A: { misconception: 'Gap means underfitting', explanation: 'Underfitting shows up as *both* errors being high and close together. A 2.1-versus-9.8 gap with a 12th-degree polynomial is the opposite problem.' },
      C: { misconception: 'Leakage as the default explanation', explanation: 'Leakage makes the *test* score too good, not too bad. Here the test score is the disappointing one.' },
      D: { misconception: 'Gaps are normal', explanation: 'A small gap is normal. A test error nearly five times the training error means the model will disappoint in production.' },
    },
    tags: ['bias-variance', 'overfitting'],
  },
  {
    id: 'Q06',
    number: 6,
    domain: 'ml-foundations',
    scenario: 'Fraud is 0.4% of transactions in a payments dataset. A student runs `train_test_split(X, y, test_size=0.2, random_state=42)` and gets a test set with almost no fraud cases, so precision and recall swing wildly between runs.',
    question: 'Which single change most directly fixes the problem?',
    options: [
      { id: 'A', text: 'Remove random_state so each run draws a different sample' },
      { id: 'B', text: 'Add stratify=y so both splits keep the 0.4% fraud rate' },
      { id: 'C', text: 'Use test_size=0.5 to make the test set bigger' },
      { id: 'D', text: 'Drop the non-fraud rows until the classes are balanced, then split' },
    ],
    correctAnswer: 'B',
    correctExplanation: 'Stratified splitting preserves the class proportions in train and test, so the rare class is represented as evenly as the data allows and metrics stop swinging with the luck of the draw. It is one keyword, and it is the single most important line in a classification notebook.',
    distractors: {
      A: { misconception: 'Randomness fixes imbalance', explanation: 'Removing the seed only makes results irreproducible. The rare class can still be nearly absent in any given draw.' },
      C: { misconception: 'Bigger test set fixes rarity', explanation: 'Doubling the test set doubles the expected fraud cases but also halves training data, and the split can still be lopsided without stratification.' },
      D: { misconception: 'Balance the dataset before splitting', explanation: 'Discarding 99% of legitimate transactions destroys the base rate your test metrics must reflect. If you rebalance at all, do it on the training set only.' },
    },
    tags: ['stratify', 'imbalance', 'train/test'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 2: Data & Leak-Proof Features
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'Q07',
    number: 7,
    domain: 'data-features',
    scenario: 'A hospital wants to predict, at the moment of discharge, whether a patient will be readmitted within 30 days. The candidate features are:\n\n- Age and primary diagnosis\n- Length of stay\n- Number of prior admissions in the past year\n- Number of follow-up clinic visits in the 30 days after discharge',
    question: 'Which feature must be removed before training, and why?',
    options: [
      { id: 'A', text: 'Age — using it could be discriminatory' },
      { id: 'B', text: 'Length of stay — it is correlated with the diagnosis' },
      { id: 'C', text: 'Follow-up visits after discharge — it is not known at prediction time and partly encodes the outcome' },
      { id: 'D', text: 'Prior admissions — past behavior should not influence the prediction' },
    ],
    correctAnswer: 'C',
    correctExplanation: 'The prediction is made at discharge, so anything that happens afterwards is unavailable when the model runs — and post-discharge visits are often *caused* by the readmission itself. That is target leakage: the model looks brilliant in validation and useless in production. The rule: every feature must be knowable at the moment of prediction.',
    distractors: {
      A: { misconception: 'Sensitive means leaky', explanation: 'Age raises a fairness question worth auditing, but it is known at discharge and does not leak the outcome. Fairness and leakage are different problems.' },
      B: { misconception: 'Correlated features are leaks', explanation: 'Features are allowed to correlate with each other. Length of stay is known at discharge and is legitimately predictive.' },
      D: { misconception: 'History is unfair to use', explanation: 'Prior admissions is exactly the kind of known-in-advance signal a readmission model should use. It is history, not the future.' },
    },
    tags: ['leakage', 'prediction time'],
  },
  {
    id: 'Q08',
    number: 8,
    domain: 'data-features',
    scenario: 'A student\'s notebook does the following, in order:\n\n1. `scaler.fit_transform(X)` on the full dataset\n2. `train_test_split(...)`\n3. Fit a logistic regression on the training rows\n4. Report test AUC',
    question: 'What is the flaw, and how does scikit-learn help you avoid it?',
    options: [
      { id: 'A', text: 'No flaw — scaling is not a learned step, so fitting it on everything is harmless' },
      { id: 'B', text: 'The scaler learned the test rows\' mean and spread; wrap preprocessing in a Pipeline so it is fit only on the training fold' },
      { id: 'C', text: 'The split should come after the model fit so the test set is representative' },
      { id: 'D', text: 'Logistic regression does not need scaling, so simply delete step 1' },
    ],
    correctAnswer: 'B',
    correctExplanation: 'StandardScaler learns a mean and a standard deviation — statistics that here include the test set. That is preprocessing leakage: mild with a scaler, severe with imputers, target encoders, or feature selectors. A Pipeline fits every step on the training data only and applies it to test data, and it does the same inside cross-validation automatically.',
    distractors: {
      A: { misconception: 'Preprocessing is not learning', explanation: 'Anything with a .fit() learns from data. The scaler\'s mean and standard deviation are parameters estimated from rows the model should never see.' },
      C: { misconception: 'Split after fit', explanation: 'Splitting after fitting means the model has trained on the test rows — the most serious leak possible.' },
      D: { misconception: 'Scaling is optional for logistic regression', explanation: 'With L2 regularization (scikit-learn\'s default), unscaled features are penalized unevenly. Scaling belongs in the pipeline, not in the trash.' },
    },
    tags: ['pipeline', 'leakage', 'scaling'],
  },
  {
    id: 'Q09',
    number: 9,
    domain: 'data-features',
    scenario: 'An insurer\'s claims dataset has a `zip_code` column with 2,400 distinct values. The model is a regularized logistic regression on 60,000 rows.',
    question: 'What is the most appropriate way to encode zip_code?',
    options: [
      { id: 'A', text: 'One-hot encode it into 2,400 binary columns' },
      { id: 'B', text: 'Ordinal-encode it (ZIP 01001 → 0, 01002 → 1, …) so it stays a single column' },
      { id: 'C', text: 'Target-encode it (replace each ZIP with its cross-fitted mean claim rate), as scikit-learn\'s TargetEncoder does' },
      { id: 'D', text: 'Drop it — high-cardinality columns never help linear models' },
    ],
    correctAnswer: 'C',
    correctExplanation: 'Target encoding compresses a 2,400-level category into one informative number — the ZIP\'s smoothed claim rate — estimated with internal cross-fitting so a row never sees its own target. It is the standard tool for high-cardinality categories in linear and boosted models, and scikit-learn\'s TargetEncoder handles the cross-fitting for you.',
    distractors: {
      A: { misconception: 'One-hot is always safe', explanation: '2,400 sparse columns, most with a handful of rows, give the model thousands of noisy coefficients to overfit. One-hot suits tens of categories, not thousands.' },
      B: { misconception: 'Ordinal codes are neutral', explanation: 'Ordinal encoding tells a linear model that ZIP 02115 is "more" than 02114. That invented order is noise for a linear model (trees tolerate it better).' },
      D: { misconception: 'Discard what is hard to encode', explanation: 'Geography is often the strongest claims signal an insurer has. The column is valuable; only the naive encodings are the problem.' },
    },
    tags: ['encoding', 'high cardinality', 'target encoding'],
  },
  {
    id: 'Q10',
    number: 10,
    domain: 'data-features',
    scenario: 'A hospital builds a model to predict which admitted patients will be readmitted within 30 days. Candidate features include age, diagnosis, length of stay, number of prior admissions, *discharge destination* (home / rehab / hospice), and *number of follow-up visits in the 30 days after discharge*.',
    question: 'Which feature is target leakage?',
    options: [
      { id: 'A', text: 'Number of prior admissions' },
      { id: 'B', text: 'Number of follow-up visits in the 30 days after discharge' },
      { id: 'C', text: 'Length of stay' },
      { id: 'D', text: 'Discharge destination' },
    ],
    correctAnswer: 'B',
    correctExplanation: 'Follow-up visits are recorded *during the outcome window* — a readmitted patient necessarily shows up in the hospital again. The feature is available in the historical table but not at prediction time (discharge), so it makes the model look brilliant offline and useless in production. The leakage test is always: would I know this value at the moment I need the prediction?',
    distractors: {
      A: { misconception: 'Strong signal = leakage', explanation: 'Prior admissions are known at discharge and legitimately predictive. Leakage is about timing, not strength.' },
      C: { misconception: 'Derived from the stay = leakage', explanation: 'Length of stay is final at discharge, before the 30-day window begins. It is a valid feature.' },
      D: { misconception: 'Post-decision field = leakage', explanation: 'Discharge destination is decided at discharge — the prediction moment — so it is known in time. Hospice does correlate with outcomes, but that is signal, not leakage.' },
    },
    tags: ['leakage', 'timing', 'healthcare'],
  },
  {
    id: 'Q11',
    number: 11,
    domain: 'data-features',
    scenario: 'Two students build the same k-nearest-neighbors churn model. Student A calls `StandardScaler().fit_transform(X)` on the full dataset and then splits into train and test. Student B splits first and puts the scaler inside a `Pipeline` with the model.',
    question: 'What is wrong with Student A\'s approach?',
    options: [
      { id: 'A', text: 'Nothing — scaling is deterministic, so order does not matter' },
      { id: 'B', text: 'The scaler learned the test set\'s means and variances, so test performance is subtly optimistic' },
      { id: 'C', text: 'kNN does not need scaling, so both students wasted a step' },
      { id: 'D', text: 'The scaler should be fit on the test set, since that is the data being scored' },
    ],
    correctAnswer: 'B',
    correctExplanation: 'Fitting any preprocessing step on all rows leaks information about the test distribution into the training pipeline. The effect for scaling is small, but the same habit with imputers, target encoders, or feature selectors can leak a lot. A Pipeline fit on the training fold guarantees every step sees only training data — which is exactly what happens in production.',
    distractors: {
      A: { misconception: 'Preprocessing is not modeling', explanation: 'A scaler *learns* parameters (mean, std) from data. Anything learned must be learned on training data only.' },
      C: { misconception: 'Distance models ignore scale', explanation: 'kNN is one of the models most sensitive to scale: a feature measured in dollars will dominate one measured in years.' },
      D: { misconception: 'Score-time fitting', explanation: 'In production you score one customer at a time — there is no test set to fit on. Parameters must come from training.' },
    },
    tags: ['pipelines', 'scaling', 'leakage'],
  },
  {
    id: 'Q12',
    number: 12,
    domain: 'data-features',
    scenario: 'In a lending dataset, `employment_length` is missing for 6% of applicants. An analyst notices that applicants with missing values default at 31%, versus 12% overall.',
    question: 'What is the best way to handle this column in a pipeline?',
    options: [
      { id: 'A', text: 'Drop the rows with missing values — 6% is small' },
      { id: 'B', text: 'Impute the median and add a binary "was_missing" indicator feature' },
      { id: 'C', text: 'Impute the median only; indicators add noise' },
      { id: 'D', text: 'Drop the column — a feature with missing values cannot be trusted' },
    ],
    correctAnswer: 'B',
    correctExplanation: 'The missingness is itself informative (31% vs 12% default) — it is Missing Not At Random. Imputing keeps the row usable for every model; the indicator preserves the signal that the value was blank. scikit-learn\'s `SimpleImputer(add_indicator=True)` does both in one step, inside the pipeline so it is fit on training data only.',
    distractors: {
      A: { misconception: 'Missing = disposable', explanation: 'Dropping those rows deletes the applicants most likely to default — the exact cases a lender needs to learn from — and the model will never see a blank at scoring time even though production data will have them.' },
      C: { misconception: 'Indicators are noise', explanation: 'A 19-point gap in default rate is one of the strongest signals in the dataset. Discarding it is throwing away information.' },
      D: { misconception: 'Missing = untrustworthy', explanation: 'Almost every real business column has gaps. The job is to handle them, not to abandon the feature.' },
    },
    tags: ['missing data', 'MNAR', 'imputation'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 3: Regression & Regularization
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'Q13',
    number: 13,
    domain: 'regression',
    scenario: 'A house-price model fit on the Ames data gives: price = 45,000 + 112 × living_area_sqft + 9,800 × garage_cars − 650 × house_age. All features are in their natural units.',
    question: 'How should the coefficient on garage_cars be read?',
    options: [
      { id: 'A', text: 'Each additional garage space adds about $9,800 to the predicted price, holding the other features fixed' },
      { id: 'B', text: 'Garage capacity is the most important feature because 9,800 is the largest coefficient' },
      { id: 'C', text: 'Adding a garage space causes the house to be worth $9,800 more' },
      { id: 'D', text: 'Garage spaces explain 9.8% of the variation in price' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'A linear coefficient is a slope in the feature\'s own units: one more garage space, all else equal, moves the prediction by $9,800. It is a statement about the model\'s predictions, not a causal claim, and its size cannot be compared to a coefficient in different units (a square foot is a much smaller unit than a garage bay).',
    distractors: {
      B: { misconception: 'Biggest coefficient = most important', explanation: '112 per square foot times a typical 1,500 sq ft is $168,000 of predicted price — living area moves the prediction far more. Compare coefficients only after standardizing the features.' },
      C: { misconception: 'Regression = causation', explanation: 'The model describes how prices vary with garages in this data. Houses with big garages also tend to be newer and larger; the coefficient is an association, not the effect of building a garage.' },
      D: { misconception: 'Coefficient = variance explained', explanation: 'Variance explained is R², a property of the whole model. A coefficient is a slope, not a share.' },
    },
    tags: ['coefficients', 'interpretation', 'units'],
  },
  {
    id: 'Q14',
    number: 14,
    domain: 'regression',
    scenario: 'A demand model has these errors on 5 held-out weeks (actual − predicted): +10, −10, +20, −20, +100 units.',
    question: 'What are the MAE and the RMSE, and what does the difference tell you?',
    options: [
      { id: 'A', text: 'MAE = 32, RMSE ≈ 46.9 — RMSE is larger because it punishes the one big miss' },
      { id: 'B', text: 'MAE = 20, RMSE = 20 — the two metrics always agree' },
      { id: 'C', text: 'MAE = 32, RMSE = 32 — the errors cancel out' },
      { id: 'D', text: 'MAE = 100, RMSE = 10 — RMSE uses the square root so it is always smaller' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'MAE = (10 + 10 + 20 + 20 + 100) / 5 = 32. RMSE = √((100 + 100 + 400 + 400 + 10,000) / 5) = √2,200 ≈ 46.9 → about 47. Because squaring magnifies large errors, RMSE ≥ MAE always, and the gap grows with outliers. If a single stockout week is very costly, RMSE is the metric that reflects it; if every unit of error costs the same, report MAE.',
    distractors: {
      B: { misconception: 'MAE and RMSE agree', explanation: 'They agree only when every error has the same size. Here one error is ten times the others, so RMSE is pulled up.' },
      C: { misconception: 'Signs cancel', explanation: 'Both metrics use absolute or squared errors precisely so that positive and negative misses cannot cancel.' },
      D: { misconception: 'Square root shrinks', explanation: 'The square root undoes the squaring only on average; the large error still dominates the sum inside the root.' },
    },
    tags: ['MAE', 'RMSE', 'metrics'],
  },
  {
    id: 'Q15',
    number: 15,
    domain: 'regression',
    scenario: 'A pricing analyst fits a model to predict monthly revenue per store. The target ranges from $8,000 to $2.1 million and is heavily right-skewed. Residuals fan out: small stores are predicted within a few thousand dollars, large stores miss by hundreds of thousands.',
    question: 'What is the most appropriate fix?',
    options: [
      { id: 'A', text: 'Model log(revenue) instead of revenue, then exponentiate predictions' },
      { id: 'B', text: 'Remove the large stores as outliers' },
      { id: 'C', text: 'Switch from RMSE to R² so the big misses matter less' },
      { id: 'D', text: 'Add more polynomial terms until the residuals are flat' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Fanning residuals on a skewed, strictly positive target are the classic signature for a log transform. On the log scale the model predicts *percentage* error, so a 5% miss is a 5% miss for both an $8K and a $2M store. Predictions are transformed back with exp(); report errors on the original scale so the business can read them.',
    distractors: {
      B: { misconception: 'Big = outlier', explanation: 'The large stores are the revenue. Deleting them makes the model useless for the decisions that matter most.' },
      C: { misconception: 'Change the metric, not the model', explanation: 'A different scoreboard does not make the predictions better. R² still rewards fitting the large stores.' },
      D: { misconception: 'Flexibility fixes variance', explanation: 'Polynomials change the shape of the mean, not the spread of the errors. They will overfit long before they fix heteroscedasticity.' },
    },
    tags: ['log transform', 'residuals', 'skew'],
  },
  {
    id: 'Q16',
    number: 16,
    domain: 'regression',
    scenario: 'An analyst fits ridge and lasso regressions to 200 marketing features. With lasso at the CV-chosen alpha, 176 coefficients are exactly zero. With ridge at its CV-chosen alpha, none are zero but most are small.',
    question: 'Why does lasso produce exact zeros while ridge does not?',
    options: [
      { id: 'A', text: 'Lasso\'s L1 penalty has a corner at zero, so small coefficients are pushed all the way to zero; ridge\'s L2 penalty shrinks smoothly and never reaches it' },
      { id: 'B', text: 'Lasso drops features whose p-values exceed 0.05' },
      { id: 'C', text: 'Ridge uses a larger alpha, which keeps coefficients from reaching zero' },
      { id: 'D', text: 'Lasso only works with standardized features, and standardization creates zeros' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'The L1 penalty |β| has constant slope, so the optimizer keeps paying the same price for a small coefficient and finds it cheaper to set it to zero. The L2 penalty β² has zero slope at zero, so shrinking a tiny coefficient further saves almost nothing. This is why lasso doubles as automatic feature selection — 24 surviving features are a story a marketing director can read.',
    distractors: {
      B: { misconception: 'Regularization = significance testing', explanation: 'Lasso never computes p-values. Zeros come from the geometry of the penalty, not from hypothesis tests.' },
      C: { misconception: 'It\'s the alpha, not the penalty', explanation: 'Alphas are not comparable across penalties. Any ridge alpha short of infinity leaves every coefficient nonzero.' },
      D: { misconception: 'Scaling creates zeros', explanation: 'Standardization is needed so the penalty treats features fairly, but it changes scale, not sparsity.' },
    },
    tags: ['lasso', 'ridge', 'regularization'],
  },
  {
    id: 'Q17',
    number: 17,
    domain: 'regression',
    scenario: 'A model predicts delivery time in minutes. Two candidate models on the same test set: Model X has RMSE 8.1 and R² 0.62; Model Y has RMSE 6.4 and R² 0.76. A naive model that always predicts the mean has RMSE 13.0.',
    question: 'Which statement is correct?',
    options: [
      { id: 'A', text: 'Model Y is better on both metrics, and both beat the mean baseline' },
      { id: 'B', text: 'Model X is better because a lower R² means less overfitting' },
      { id: 'C', text: 'The metrics conflict, so we cannot choose without accuracy' },
      { id: 'D', text: 'R² of 0.76 means 76% of deliveries are predicted correctly' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Lower RMSE and higher R² point the same way — they must, since R² = 1 − (model SSE / baseline SSE) on the same data. Model Y\'s errors are about half the baseline\'s (6.4 vs 13.0), and R² says it explains 76% of the variance the mean cannot. Both models beat the naive baseline, which is the first bar every regression must clear.',
    distractors: {
      B: { misconception: 'Lower R² = more honest', explanation: 'These are test-set numbers; a lower test R² is simply a worse fit. Overfitting shows up as a *gap* between train and test, not as a low test score.' },
      C: { misconception: 'Accuracy applies to regression', explanation: 'Accuracy is a classification metric. For a continuous target, RMSE, MAE, MAPE, and R² are the tools.' },
      D: { misconception: 'R² = percent correct', explanation: 'R² is the share of variance explained, not a hit rate. There is no "correct" for a continuous prediction.' },
    },
    tags: ['R²', 'RMSE', 'baseline'],
  },
  {
    id: 'Q18',
    number: 18,
    domain: 'regression',
    scenario: 'A retailer reports forecast error as MAPE. Last week, one new product sold 2 units against a forecast of 12; a best-seller sold 1,000 against a forecast of 1,100.',
    question: 'What is each product\'s absolute percentage error, and what does this expose about MAPE?',
    options: [
      { id: 'A', text: '500% and 10% — MAPE is dominated by low-volume items, so it misrepresents where the money is' },
      { id: 'B', text: '10% and 500% — MAPE punishes the best-seller' },
      { id: 'C', text: '83% and 9% — MAPE is fair because it is scale-free' },
      { id: 'D', text: '10 units and 100 units — MAPE is just MAE in disguise' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'APE = |actual − forecast| / actual: |2 − 12| / 2 = 500% for the new product, |1,000 − 1,100| / 1,000 = 10% for the best-seller. Averaging those gives 255% — driven almost entirely by an item that missed by 10 units. MAPE explodes near zero and weights every product equally regardless of revenue. Weighted MAPE (errors summed over volume) or MAE in units are the usual fixes.',
    distractors: {
      B: { misconception: 'Reversed the ratio', explanation: 'Dividing by the forecast instead of the actual is a different metric. Standard MAPE divides by the actual value.' },
      C: { misconception: 'Divided by forecast', explanation: '10 / 12 = 83% uses the forecast as the base. Standard MAPE uses actuals — and the point is that 500% is absurd for a 10-unit miss.' },
      D: { misconception: 'Absolute errors', explanation: 'Those are absolute errors in units (MAE). MAPE converts them to percentages, which is exactly where the distortion enters.' },
    },
    tags: ['MAPE', 'forecast error', 'metrics'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 4: Classification & Decisions
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'Q19',
    number: 19,
    domain: 'classification-decisions',
    scenario: 'A churn model is evaluated on 1,000 held-out customers, of whom 200 actually churned. At the default 0.5 threshold it flags 150 customers; 120 of them really churn.',
    question: 'What are the model\'s precision and recall?',
    options: [
      { id: 'A', text: 'Precision 80%, recall 60%' },
      { id: 'B', text: 'Precision 60%, recall 80%' },
      { id: 'C', text: 'Precision 80%, recall 12%' },
      { id: 'D', text: 'Precision 92%, recall 80%' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Precision = true positives / flagged = 120 / 150 = 80%: when the model says "churner," it is right 4 times in 5. Recall = true positives / actual churners = 120 / 200 = 60%: the model catches 3 of every 5 churners and misses 80. Accuracy is (120 + 770) / 1,000 = 89% — which hides that 40% of the churners walked out unflagged.',
    distractors: {
      B: { misconception: 'Swapped denominators', explanation: 'Recall divides by actual positives (200), precision by predicted positives (150). 120/200 is recall, not precision.' },
      C: { misconception: 'Recall over all customers', explanation: '120 / 1,000 = 12% divides by everyone. Recall only asks about the 200 who actually churned.' },
      D: { misconception: 'Accuracy as precision', explanation: '92% is close to the accuracy figure, not precision. Accuracy counts the 770 loyal customers correctly left alone.' },
    },
    tags: ['precision', 'recall', 'confusion matrix'],
  },
  {
    id: 'Q20',
    number: 20,
    domain: 'classification-decisions',
    scenario: 'A fraud team is choosing an evaluation metric. Fraud is 0.2% of transactions. Two models have identical ROC-AUC of 0.97, but Model P has a PR-AUC of 0.61 and Model Q a PR-AUC of 0.34.',
    question: 'Which metric should decide, and which model wins?',
    options: [
      { id: 'A', text: 'PR-AUC, because with a 0.2% base rate the ROC curve barely notices false positives; Model P wins' },
      { id: 'B', text: 'ROC-AUC, because it is threshold-independent; the models tie' },
      { id: 'C', text: 'Accuracy — both models will be about 99.8%, so it does not matter' },
      { id: 'D', text: 'PR-AUC, but Model Q wins because a lower score means fewer false alarms' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'ROC plots recall against false-positive *rate*, and with 99.8% legitimate transactions the denominator is enormous — thousands of false alarms barely move the curve. Precision–recall asks the question the fraud team cares about: of the transactions we block, how many were fraud? Model P delivers far more precision at every recall level, so it wins decisively despite the identical ROC-AUC.',
    distractors: {
      B: { misconception: 'ROC is always enough', explanation: 'Both metrics are threshold-free. ROC-AUC is simply insensitive to the class the business cares about when the positive class is rare.' },
      C: { misconception: 'Accuracy for rare events', explanation: 'A model that never flags anything scores 99.8% accuracy. It tells you nothing about fraud detection.' },
      D: { misconception: 'Lower PR-AUC = fewer false alarms', explanation: 'PR-AUC is higher when precision is higher — i.e., *fewer* false alarms per catch. Model Q raises more false alarms, not fewer.' },
    },
    tags: ['ROC', 'PR-AUC', 'imbalance', 'fraud'],
  },
  {
    id: 'Q21',
    number: 21,
    domain: 'classification-decisions',
    scenario: 'A retention offer costs $50 and, if given to a true churner, saves a customer worth $600 (net of the offer). Given to a loyal customer it is wasted. The model\'s probability for a customer is p.',
    question: 'At what probability threshold does contacting a customer break even?',
    options: [
      { id: 'A', text: 'p ≈ 0.077 — contact anyone above about 8%' },
      { id: 'B', text: 'p = 0.5 — the default threshold is already break-even' },
      { id: 'C', text: 'p ≈ 0.92 — only contact near-certain churners' },
      { id: 'D', text: 'p = 0.083 × 0.5 ≈ 0.04' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Expected value of contacting = p × 600 − (1 − p) × 50. Setting it to zero: 600p = 50 − 50p → 650p = 50 → p ≈ 0.077. Because a saved customer is worth 12 times the offer, it pays to contact anyone with even an 8% chance of leaving. The 0.5 default would leave most of the profit on the table — this is the whole point of tuning the threshold to the cost matrix.',
    distractors: {
      B: { misconception: '0.5 is natural', explanation: '0.5 is only break-even when both mistakes cost the same. Here a missed churner costs 12× a wasted offer.' },
      C: { misconception: 'Costly action = high bar', explanation: 'That reasoning fits when the offer is expensive relative to the save. Here the save dwarfs the offer, so the bar drops, not rises.' },
      D: { misconception: 'Multiplying thresholds', explanation: 'There is no reason to multiply the break-even by 0.5. The equation p × 600 = (1 − p) × 50 has a single solution.' },
    },
    tags: ['threshold', 'expected value', 'cost matrix'],
  },
  {
    id: 'Q22',
    number: 22,
    domain: 'classification-decisions',
    scenario: 'A logistic regression for loan default reports a coefficient of +0.69 on `has_prior_delinquency` (binary).',
    question: 'What does this coefficient mean?',
    options: [
      { id: 'A', text: 'A prior delinquency multiplies the odds of default by about 2 (e^0.69 ≈ 2.0), holding other features fixed' },
      { id: 'B', text: 'A prior delinquency raises the probability of default by 69 percentage points' },
      { id: 'C', text: 'A prior delinquency raises the probability of default by 0.69 percentage points' },
      { id: 'D', text: '69% of delinquent applicants default' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Logistic coefficients live on the log-odds scale: exponentiating gives the odds ratio, and e^0.69 ≈ 2.0. So a prior delinquency roughly doubles the odds of default. The change in *probability* depends on where the applicant started — from 10% it moves to about 18%, from 50% to about 67% — which is why "odds ratio" is the honest summary.',
    distractors: {
      B: { misconception: 'Coefficient = probability points', explanation: 'A coefficient of 0.69 is not a probability. Probabilities are bounded by 1; log-odds are not.' },
      C: { misconception: 'Linear regression reading', explanation: 'That is how a linear-probability coefficient would read. Logistic regression is linear in log-odds, not in probability.' },
      D: { misconception: 'Coefficient = base rate', explanation: 'The coefficient compares groups; it says nothing about the level of default among delinquent applicants on its own.' },
    },
    tags: ['logistic regression', 'odds ratio', 'interpretation'],
  },
  {
    id: 'Q23',
    number: 23,
    domain: 'classification-decisions',
    scenario: 'A gradient-boosting churn model has ROC-AUC 0.88. Its calibration curve shows that among customers scored 0.80–0.90, only 55% actually churn.',
    question: 'What is the problem, and why does it matter for the retention budget?',
    options: [
      { id: 'A', text: 'The model is over-confident; ranking is fine but the probabilities overstate risk, so cost-based thresholds and expected-value math will be wrong' },
      { id: 'B', text: 'The AUC is wrong — a 0.88 AUC guarantees calibrated probabilities' },
      { id: 'C', text: 'Nothing — 55% is above the base rate, so the scores are useful' },
      { id: 'D', text: 'The model is under-confident and should be made more aggressive' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'AUC measures ranking (do churners score above loyal customers?), calibration measures whether a score of 0.85 means 85%. Boosted trees and random forests often rank well but push scores toward the extremes. If you plan a budget assuming 85% of that bucket will churn and only 55% do, every expected-value calculation is off. Fix with `CalibratedClassifierCV` (isotonic or Platt) on a held-out fold.',
    distractors: {
      B: { misconception: 'AUC implies calibration', explanation: 'Multiplying every score by 0.5 leaves the ranking — and the AUC — identical while destroying calibration. They are independent properties.' },
      C: { misconception: 'Above base rate is enough', explanation: 'Useful for ranking, yes. But the *number* 0.85 is what enters the threshold formula and the budget — and it is wrong by 30 points.' },
      D: { misconception: 'Direction reversed', explanation: 'Scores are higher than reality; that is over-confidence. Under-confidence would be scores of 0.3 for customers who churn 55% of the time.' },
    },
    tags: ['calibration', 'AUC', 'probabilities'],
  },
  {
    id: 'Q24',
    number: 24,
    domain: 'classification-decisions',
    scenario: 'A marketing team can afford to contact 10% of 50,000 customers. A gain chart shows that the top decile ranked by the model contains 38% of all eventual buyers, versus 10% for random selection.',
    question: 'What is the lift in the top decile, and what does it mean?',
    options: [
      { id: 'A', text: 'Lift = 3.8 — contacting the model\'s top 10% yields 3.8× as many buyers as contacting a random 10%' },
      { id: 'B', text: 'Lift = 28% — the model adds 28 buyers per 100 contacts' },
      { id: 'C', text: 'Lift = 0.38 — 38% of contacted customers will buy' },
      { id: 'D', text: 'Lift = 10 — the model is ten times better than random' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Lift is the ratio of the model\'s capture rate to random: 38% / 10% = 3.8. With a fixed contact budget, that ratio translates directly into revenue — the campaign reaches nearly four times the buyers it would by mailing at random. Gain and lift charts are the language of budget-constrained targeting, where the question is not "who is above 0.5?" but "who are the best 5,000?"',
    distractors: {
      B: { misconception: 'Difference, not ratio', explanation: '38 − 10 = 28 points is the *gain* over random, a valid number but not the lift, which is a ratio.' },
      C: { misconception: 'Capture rate = conversion rate', explanation: '38% is the share of all buyers who are in the top decile, not the share of the decile who buy. Those are different denominators.' },
      D: { misconception: 'Decile size as lift', explanation: 'The 10% is the size of the contacted group, not a performance measure.' },
    },
    tags: ['lift', 'gain chart', 'targeting'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 5: Trees, Forests & Boosting
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'Q25',
    number: 25,
    domain: 'trees-ensembles',
    scenario: 'A decision tree with no depth limit is trained on 5,000 hotel bookings. Training accuracy is 99.6%; test accuracy is 74%. A tree limited to depth 5 scores 81% on train and 80% on test.',
    question: 'What is happening, and which tree should ship?',
    options: [
      { id: 'A', text: 'The unlimited tree memorized the training bookings (high variance); the depth-5 tree generalizes better and should ship' },
      { id: 'B', text: 'The unlimited tree is better because 99.6% is the highest number on the table' },
      { id: 'C', text: 'The depth-5 tree is underfitting because its training accuracy is only 81%' },
      { id: 'D', text: 'Both trees are equally good; the difference is random noise' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'An unconstrained tree keeps splitting until every leaf is pure, carving out one leaf per quirky booking — a 25-point train–test gap is the signature of overfitting. The shallow tree gives up some training fit but its test score is what next month\'s bookings will see. Depth, `min_samples_leaf`, and pruning are the tree\'s regularization knobs; random forests and boosting are the systematic answer.',
    distractors: {
      B: { misconception: 'Training accuracy is the score', explanation: 'Training accuracy measures memory, not prediction. Only the held-out number counts.' },
      C: { misconception: 'Low train accuracy = underfit', explanation: 'Underfitting shows as low train *and* low test accuracy. Here train and test are nearly equal — that is the healthy pattern.' },
      D: { misconception: 'Gap is noise', explanation: 'A 6-point test difference on 1,000+ held-out bookings is far outside noise, and the 25-point train–test gap is systematic.' },
    },
    tags: ['decision trees', 'overfitting', 'depth'],
  },
  {
    id: 'Q26',
    number: 26,
    domain: 'trees-ensembles',
    scenario: 'A random forest of 500 trees is built from the same data. Each tree is trained on a bootstrap sample and, at every split, considers only a random subset of the features.',
    question: 'Why does the random feature subset at each split improve the forest?',
    options: [
      { id: 'A', text: 'It decorrelates the trees so that averaging them cancels more of their individual errors' },
      { id: 'B', text: 'It makes each tree more accurate by removing irrelevant features' },
      { id: 'C', text: 'It speeds up training, which is the only reason it is used' },
      { id: 'D', text: 'It prevents the forest from using the strongest feature, which would otherwise cause leakage' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Averaging reduces variance only to the extent the things being averaged disagree. If every tree could use the strongest feature at the root, the 500 trees would look alike and their errors would be shared. Forcing each split to choose among a random subset makes the trees different — individually a little worse, collectively much better. Bagging supplies the diversity in rows; feature sampling supplies it in columns.',
    distractors: {
      B: { misconception: 'Subsetting = feature selection', explanation: 'Individual trees typically get slightly *worse* — they are sometimes denied their best split. The gain is in the ensemble, not the member.' },
      C: { misconception: 'Only a speed trick', explanation: 'It is faster, but the statistical purpose is decorrelation. Breiman introduced it to improve accuracy, not runtime.' },
      D: { misconception: 'Strong features are leakage', explanation: 'A strong feature is a good feature. The forest still uses it — just not in every tree at every split.' },
    },
    tags: ['random forest', 'bagging', 'decorrelation'],
  },
  {
    id: 'Q27',
    number: 27,
    domain: 'trees-ensembles',
    scenario: 'A gradient-boosting model is trained with learning_rate = 0.05 and a validation set. The validation loss falls for the first 420 trees, flattens, and starts rising after tree 600. Training loss keeps falling throughout.',
    question: 'What should the analyst do?',
    options: [
      { id: 'A', text: 'Use early stopping around 420–600 trees — beyond that the model is fitting noise in the training set' },
      { id: 'B', text: 'Keep adding trees until training loss reaches zero' },
      { id: 'C', text: 'Raise the learning rate to 1.0 so fewer trees are needed and overfitting stops' },
      { id: 'D', text: 'Remove the validation set; it is stealing data the model could learn from' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Boosting fits each new tree to the residuals of the ensemble so far. After the real signal is captured, the residuals are mostly noise, and further trees learn that noise — training loss keeps improving while validation loss turns up. Early stopping (built into `HistGradientBoostingClassifier`, LightGBM, and XGBoost) picks the iteration where validation loss bottomed out. Learning rate and tree count trade off: lower rate, more trees, smoother fit.',
    distractors: {
      B: { misconception: 'Zero training loss is the goal', explanation: 'Zero training loss is memorization. The validation curve is already telling you the model stopped generalizing.' },
      C: { misconception: 'Bigger steps fix overfitting', explanation: 'A learning rate of 1.0 makes each tree overshoot; the model would overfit *faster* and less smoothly, not less.' },
      D: { misconception: 'Validation is wasted data', explanation: 'The validation set is what let you see the problem. Without it you would ship a 1,000-tree model that is worse than a 500-tree one.' },
    },
    tags: ['gradient boosting', 'early stopping', 'learning rate'],
  },
  {
    id: 'Q28',
    number: 28,
    domain: 'trees-ensembles',
    scenario: 'In a random forest for insurance claims, impurity-based feature importance ranks `customer_id_hash` (a high-cardinality numeric column) as the #1 feature. Permutation importance on the test set ranks it near zero.',
    question: 'Which importance should be trusted, and why?',
    options: [
      { id: 'A', text: 'Permutation importance — impurity importance is inflated for high-cardinality features that offer many split points, even when they carry no signal' },
      { id: 'B', text: 'Impurity importance — it is computed by the model itself, so it is more accurate' },
      { id: 'C', text: 'Both — the customer ID must encode useful information about claims' },
      { id: 'D', text: 'Neither — feature importance is meaningless for tree ensembles' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Impurity (Gini) importance sums the impurity reduction at every split that uses a feature, and a column with thousands of unique values can always find *some* split that looks good on training data. Permutation importance shuffles the column on held-out data and measures how much the score drops — an ID that carries no real signal drops the score by nothing. Trust the held-out test.',
    distractors: {
      B: { misconception: 'Internal = accurate', explanation: 'Impurity importance is computed on training data and is biased toward features with many possible splits. Being built in does not make it right.' },
      C: { misconception: 'The model found signal', explanation: 'A hashed ID cannot generalize to new customers by construction. The forest used it to memorize training rows — classic overfitting, and a leakage warning sign.' },
      D: { misconception: 'Importance is meaningless', explanation: 'Permutation importance and SHAP are sound and widely used. The lesson is to choose the right method, not to abandon the question.' },
    },
    tags: ['feature importance', 'permutation', 'high cardinality'],
  },
  {
    id: 'Q29',
    number: 29,
    domain: 'trees-ensembles',
    scenario: 'A team has a 40,000-row, 30-feature table of loan applications. They compare a tuned LightGBM model, a default XGBoost model, a 3-layer neural network, and a tabular foundation model (TabPFN-2.5 / TabICL) used zero-shot.',
    question: 'Based on the 2022–2026 benchmark evidence, which outcome is most likely?',
    options: [
      { id: 'A', text: 'The tabular foundation model and tuned LightGBM finish close to each other at the top; the neural network trails; default XGBoost sits between' },
      { id: 'B', text: 'The neural network wins by a wide margin because deep learning beats everything' },
      { id: 'C', text: 'Default XGBoost wins because gradient boosting never needs tuning' },
      { id: 'D', text: 'The foundation model fails because such models only work on images and text' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Grinsztajn et al. (2022) showed tree ensembles beat neural networks on typical tabular data, and that finding has held. What changed in 2025–26 is in-context tabular foundation models: TabPFN-2.5 reports winning against default XGBoost on most small-to-medium datasets, and TabICLv2 (open source) matches tuned GBDTs on most of TabArena. At 40k rows, a tuned GBDT and a foundation model are the two contenders; tuning still matters for the GBDT, and licensing and latency still favor it in production.',
    distractors: {
      B: { misconception: 'Deep learning always wins', explanation: 'On tabular business data, plain MLPs usually trail tree ensembles unless heavily engineered. The evidence is consistent across benchmarks.' },
      C: { misconception: 'GBDT needs no tuning', explanation: 'Defaults are a strong baseline, but learning rate, depth, and regularization typically buy several points. Tuned beats default reliably.' },
      D: { misconception: 'Foundation models are for unstructured data', explanation: 'Tabular foundation models are pretrained on millions of synthetic tables specifically for this setting — and they are the main 2025–26 development in the field.' },
    },
    tags: ['GBDT', 'TabPFN', 'benchmarks', 'frontier'],
  },
  {
    id: 'Q30',
    number: 30,
    domain: 'trees-ensembles',
    scenario: 'Bagging and boosting both combine many decision trees, but they build them differently.',
    question: 'Which statement correctly contrasts the two?',
    options: [
      { id: 'A', text: 'Bagging trains deep trees independently in parallel and averages them to cut variance; boosting trains shallow trees sequentially, each correcting the last, to cut bias' },
      { id: 'B', text: 'Bagging trains trees sequentially; boosting trains them in parallel' },
      { id: 'C', text: 'Both train trees independently; boosting just uses more of them' },
      { id: 'D', text: 'Bagging reduces bias; boosting reduces variance' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'A random forest (bagging) grows many deep, low-bias, high-variance trees on bootstrap samples and averages them, which mostly removes variance. Gradient boosting starts with a weak, high-bias model and adds small trees that fit the current residuals, steadily reducing bias — which is why boosting can overfit if you let it run and needs early stopping, while forests are hard to overfit by adding trees.',
    distractors: {
      B: { misconception: 'Reversed', explanation: 'Boosting is the sequential one — each tree depends on the errors of the ensemble so far. Bagged trees never see each other.' },
      C: { misconception: 'Same recipe, more trees', explanation: 'Boosted trees are not independent; the whole point is that tree t is fit to the residuals of trees 1…t−1.' },
      D: { misconception: 'Swapped goals', explanation: 'Averaging independent high-variance models reduces variance (bagging). Sequentially fitting residuals reduces bias (boosting).' },
    },
    tags: ['bagging', 'boosting', 'bias-variance'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOMAIN 6: Trust & Structure
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'Q31',
    number: 31,
    domain: 'evaluation-unsupervised',
    scenario: 'A model predicts whether a support ticket will be escalated. The dataset has 80,000 tickets from 6,000 customers; many customers have dozens of tickets, and tickets from the same customer look alike. A 5-fold `KFold` cross-validation reports AUC 0.91.',
    question: 'Why might 0.91 be optimistic, and which splitter fixes it?',
    options: [
      { id: 'A', text: 'Tickets from the same customer land in both train and validation folds, so the model partly memorizes customers; use GroupKFold by customer' },
      { id: 'B', text: 'Five folds is too few; use 10-fold KFold' },
      { id: 'C', text: 'The classes are imbalanced; use StratifiedKFold' },
      { id: 'D', text: 'Nothing is wrong — KFold is always the right default' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'The unit the model will face in production is a *new customer*, but plain KFold lets the model see the same customer\'s other tickets during training — a form of leakage across rows. GroupKFold keeps every customer entirely inside one fold, so the validation score reflects generalization to customers the model has never seen. Stratification is a separate concern and can be combined (`StratifiedGroupKFold`).',
    distractors: {
      B: { misconception: 'More folds = more honest', explanation: 'More folds reduce variance of the estimate, not its bias. The leak across customers is the same at 5 or 10 folds.' },
      C: { misconception: 'Imbalance is the only CV pitfall', explanation: 'Stratifying balances the label across folds; it does nothing about the same customer appearing on both sides of the split.' },
      D: { misconception: 'KFold is universal', explanation: 'KFold assumes rows are exchangeable. Repeated customers, time order, and hierarchies all violate that assumption.' },
    },
    tags: ['cross-validation', 'GroupKFold', 'leakage'],
  },
  {
    id: 'Q32',
    number: 32,
    domain: 'evaluation-unsupervised',
    scenario: 'A SHAP waterfall plot for one loan applicant shows: base value 0.12 (the average default probability), then contributions +0.21 from `debt_to_income`, +0.06 from `prior_delinquency`, −0.09 from `years_employed`, and −0.02 from `age`, ending at a prediction of 0.28.',
    question: 'How should a loan officer read this plot?',
    options: [
      { id: 'A', text: 'This applicant\'s high debt-to-income ratio is the main reason the model rates them at 28% instead of the 12% average; their employment history pulls the risk back down' },
      { id: 'B', text: 'Debt-to-income is the most important feature for all applicants' },
      { id: 'C', text: 'Reducing this applicant\'s debt-to-income ratio would cause their default probability to fall by 0.21' },
      { id: 'D', text: 'The model is 28% accurate for this applicant' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'A waterfall plot is a *local* explanation: it decomposes one prediction into feature contributions that sum from the average (0.12) to this applicant\'s score (0.28 = 0.12 + 0.21 + 0.06 − 0.09 − 0.02). It answers "why this score for this person?" — exactly what an adverse-action notice or a customer conversation needs. It is not a ranking across the portfolio and not a causal what-if.',
    distractors: {
      B: { misconception: 'Local = global', explanation: 'That is a claim about the whole population, which needs the beeswarm or mean |SHAP| plot. For a different applicant a different feature could dominate.' },
      C: { misconception: 'SHAP = intervention effect', explanation: 'SHAP attributes the model\'s output; it does not predict what happens if the input changes. Correlated features make the two differ.' },
      D: { misconception: 'Score = accuracy', explanation: '0.28 is the predicted probability of default, not a measure of how correct the model is.' },
    },
    tags: ['SHAP', 'explanation', 'local vs global'],
  },
  {
    id: 'Q33',
    number: 33,
    domain: 'evaluation-unsupervised',
    scenario: 'A demand model produces a point forecast of 1,200 units for next week. Using split conformal prediction with a 90% target coverage on a calibration set, the interval is [980, 1,420].',
    question: 'What does the 90% guarantee mean?',
    options: [
      { id: 'A', text: 'Over many such weeks, about 90% of actual demands will fall inside the intervals produced this way — with no assumption about the model or the error distribution' },
      { id: 'B', text: 'There is a 90% chance the model is correct' },
      { id: 'C', text: 'The interval is 90% as wide as it would be with a normal-distribution assumption' },
      { id: 'D', text: 'The model\'s R² is 0.90' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Conformal prediction takes the model\'s residuals on a held-out calibration set, finds the 90th-percentile absolute error, and adds it around each new prediction. The resulting intervals cover the truth 90% of the time in the long run, whatever the model (GBDT, neural net, anything) and whatever the error shape — as long as new data is exchangeable with the calibration data. That is a promise a planner can put a safety stock behind.',
    distractors: {
      B: { misconception: 'Coverage = model correctness', explanation: 'The guarantee is about the *interval* containing the outcome, not about the point forecast being right.' },
      C: { misconception: 'Conformal shrinks intervals', explanation: 'Conformal does not aim for narrow intervals; it aims for honest ones. Width is whatever the calibration residuals dictate.' },
      D: { misconception: 'Coverage = R²', explanation: 'R² describes fit; coverage describes how often intervals contain the truth. They are unrelated numbers.' },
    },
    tags: ['conformal prediction', 'uncertainty', 'MAPIE'],
  },
  {
    id: 'Q34',
    number: 34,
    domain: 'evaluation-unsupervised',
    scenario: 'A retailer clusters customers with k-means on Recency (days, 1–700), Frequency (orders, 1–40), and Monetary (dollars, 5–12,000) using the raw columns.',
    question: 'What will go wrong, and what is the fix?',
    options: [
      { id: 'A', text: 'Monetary will dominate the distances because of its scale, so clusters will just be spend bands; standardize (or log-scale) the features first' },
      { id: 'B', text: 'k-means cannot use three features; reduce to two with PCA' },
      { id: 'C', text: 'Nothing — k-means is scale-invariant' },
      { id: 'D', text: 'Frequency will dominate because it is the most business-relevant feature' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'k-means minimizes Euclidean distance, and a $10,000 difference in spend is numerically ten thousand times a 1-day difference in recency. Unscaled, the algorithm effectively clusters on one column. Standardizing (or taking logs of the skewed dollar and count columns, then standardizing) puts the three RFM dimensions on equal footing so the segments reflect all three behaviors.',
    distractors: {
      B: { misconception: 'k-means is 2-D only', explanation: 'k-means works in any number of dimensions. PCA is for visualization or noise reduction, not a requirement.' },
      C: { misconception: 'Scale-invariant', explanation: 'Distance-based methods — k-means, kNN, SVM — are among the *most* scale-sensitive algorithms. Trees are the ones that ignore scale.' },
      D: { misconception: 'Relevance drives dominance', explanation: 'k-means has no notion of business relevance. Numeric range alone decides which feature drives the distances.' },
    },
    tags: ['k-means', 'scaling', 'RFM'],
  },
  {
    id: 'Q35',
    number: 35,
    domain: 'evaluation-unsupervised',
    scenario: 'A bank tests its approval model across demographic groups. Overall accuracy is 91% for every group, but the false-negative rate (creditworthy applicants wrongly declined) is 8% for one group and 19% for another.',
    question: 'What should the team conclude?',
    options: [
      { id: 'A', text: 'Equal accuracy hides unequal error types — the model declines qualified applicants in one group far more often, which is a fairness and regulatory problem to investigate before deployment' },
      { id: 'B', text: 'The model is fair because accuracy is equal across groups' },
      { id: 'C', text: 'The difference is fine as long as the protected attribute was not used as a feature' },
      { id: 'D', text: 'Lower the threshold for everyone until both rates equal 8%' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'Accuracy averages over both kinds of mistakes. Two groups can share 91% accuracy while one absorbs most of the costly errors — here, qualified people being turned away. Metrics sliced by group (false-negative rate, false-positive rate, calibration) are the minimum diagnostic; credit scoring is a high-risk use under the EU AI Act, and adverse-decision explanations are required under laws like Colorado\'s. Investigate the cause (proxy features, training-data gaps) before shipping.',
    distractors: {
      B: { misconception: 'Equal accuracy = fair', explanation: 'Accuracy parity says nothing about which errors each group receives. The 19% vs 8% gap is the finding.' },
      C: { misconception: 'Fairness through unawareness', explanation: 'Zip code, employer, and shopping patterns can proxy for a protected attribute. Removing the column does not remove the disparity — measurement does.' },
      D: { misconception: 'One threshold fixes all', explanation: 'A single global threshold shift changes both groups together and raises false positives. The fix requires understanding the cause; a blanket change is not analysis.' },
    },
    tags: ['fairness', 'error rates', 'regulation'],
  },
  {
    id: 'Q36',
    number: 36,
    domain: 'evaluation-unsupervised',
    scenario: 'A team forecasts daily store sales with a gradient-boosting model using lag and calendar features. They evaluate with a random 80/20 train–test split and report MAPE of 4%. In production the first month\'s MAPE is 14%.',
    question: 'What is the most likely cause of the gap?',
    options: [
      { id: 'A', text: 'The random split let the model train on days *after* the test days, so lag features leaked the future; use a time-based split (TimeSeriesSplit) with the test period strictly after training' },
      { id: 'B', text: 'MAPE is the wrong metric; RMSE would have matched production' },
      { id: 'C', text: 'The model needs more trees' },
      { id: 'D', text: 'Production data is always worse; a 10-point gap is normal' },
    ],
    correctAnswer: 'A',
    correctExplanation: 'With a random split, a test day in March is surrounded by training days from the same week, and its lag features are built from actual sales the model also trained on. The model is interpolating, not forecasting. A time-ordered split — train through February, test on March — mimics production, where the future is unknown. Expect the honest number to be closer to 14% than to 4%, and tune against that.',
    distractors: {
      B: { misconception: 'Metric mismatch', explanation: 'Changing the scoreboard would not close a gap caused by the model seeing the future during evaluation.' },
      C: { misconception: 'More capacity', explanation: 'The problem is not model strength — the offline score was too *good*, not too bad. More trees would overfit the leaked information further.' },
      D: { misconception: 'Gaps are normal', explanation: 'Some degradation is normal; a 3.5× gap is a validation bug. The evaluation must replicate the production setting.' },
    },
    tags: ['time series', 'TimeSeriesSplit', 'leakage'],
  },
];

export function getQuestion(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function getDomainQuestions(domainId: DomainId): Question[] {
  return questions.filter((q) => q.domain === domainId);
}

export function getDomain(id: DomainId): Domain | undefined {
  return domains.find((d) => d.id === id);
}
