// Per-question teaser lines shown on domain pages — a hook, never a spoiler.

const teasers: Record<string, string> = {
  Q01: 'Four analytics projects on the roadmap. Only one of them predicts.',
  Q02: 'Unit, target, horizon, decision — the framing step everyone skips.',
  Q03: 'A model beats "predict the majority" by two points. Is that a win?',
  Q04: 'Train error falls, test error rises. Name the disease.',
  Q05: 'Why the single most important line in the notebook is the split.',
  Q06: 'Stratify or not? A 1% fraud rate makes the answer obvious — once you see it.',
  Q07: 'The feature that makes your model brilliant offline and useless live.',
  Q08: 'One-hot, ordinal, or target encoding for 3,000 zip codes?',
  Q09: 'A column with too many categories — keep it, drop it, or encode it smarter?',
  Q10: 'Six candidate features for a readmission model. One of them is from the future.',
  Q11: 'Two students, same scaler, different order of operations. One of them leaked.',
  Q12: 'The blanks default at 31%. What do you do with a missing value that talks?',
  Q13: 'A $9,800 coefficient on garage spaces. What it says — and what it doesn\'t.',
  Q14: 'Five errors, one big miss. Compute MAE and RMSE and see them disagree.',
  Q15: 'Residuals that fan out from $8K stores to $2M stores. The classic fix.',
  Q16: '176 of 200 coefficients are exactly zero. Only one penalty can do that.',
  Q17: 'Two models, RMSE and R² on the table. Do the metrics agree?',
  Q18: 'A 10-unit miss shows up as 500% error. MAPE\'s dirty secret.',
  Q19: '150 flagged, 120 right, 200 real churners. Precision and recall by hand.',
  Q20: 'Identical ROC-AUC, wildly different PR-AUC. Which one does fraud care about?',
  Q21: 'A $50 offer, a $600 save. The break-even probability is not 0.5.',
  Q22: 'A logistic coefficient of 0.69. Say it in odds.',
  Q23: 'AUC 0.88, but the 0.85 bucket churns at 55%. What broke?',
  Q24: 'Top decile captures 38% of buyers. Compute the lift and cash it in.',
  Q25: '99.6% train, 74% test. Which tree ships?',
  Q26: 'Why a forest deliberately hides features from its own trees.',
  Q27: 'Validation loss bottoms out at tree 500. Training loss keeps falling. Now what?',
  Q28: 'The #1 feature is a customer ID hash. Which importance lied?',
  Q29: 'GBDT vs neural net vs tabular foundation model on 40k rows — the 2026 answer.',
  Q30: 'Parallel or sequential, variance or bias: bagging vs boosting in one line.',
  Q31: '6,000 customers, 80,000 tickets, plain KFold. Why 0.91 is a mirage.',
  Q32: 'Read a SHAP waterfall the way a loan officer must.',
  Q33: 'A 90% conformal interval. What exactly is being promised?',
  Q34: 'RFM clustering on raw dollars. Guess which column wins.',
  Q35: 'Equal accuracy, unequal false negatives. Is the model fair?',
  Q36: '4% MAPE offline, 14% live. The split that saw the future.',
};

export function teaserFor(questionId: string): string {
  return teasers[questionId] || '';
}
