export const grading = [
  { component: 'Participation & In-Class Labs', weight: 15 },
  { component: 'Homework Assignments (5 × Python notebooks)', weight: 25 },
  { component: 'Midterm Model Competition (Team, Kaggle-style)', weight: 20 },
  { component: 'Final Project: Your Prediction Story (Notebook + Memo + Talk)', weight: 40 },
];

export const policies = [
  {
    title: 'Attendance',
    description: 'This is an evening seminar that meets once a week — every session matters, and every session has a live lab. More than two unexcused absences will result in a grade reduction. Please notify the instructor in advance if you need to miss a class.',
  },
  {
    title: 'AI Tool Usage',
    description: 'AI coding assistants (Claude, ChatGPT, Colab AI, Cursor, Copilot) are encouraged — working data scientists use them every day. Two rules: disclose what you used, and be able to explain and defend every line of a model you submit. A model you cannot explain is a model you cannot trust, and in the presentation the AI will not be standing next to you.',
  },
  {
    title: 'Academic Integrity',
    description: 'All submitted work must be your own or properly attributed. Collaboration is encouraged on labs and the team competition, but individual homework must reflect individual effort. Copying a Kaggle kernel and changing variable names is not modeling.',
  },
  {
    title: 'Late Submissions',
    description: 'Assignments are due by the start of class on Canvas. Late submissions receive a 10% penalty per day, up to 3 days. After 3 days, assignments receive zero credit. The competition leaderboard closes when it closes.',
  },
  {
    title: 'Tools & Setup',
    description: 'Everything runs in Google Colab — no installation required. Every session ships a notebook you can open in one click. If you prefer a local setup, a requirements.txt in the course repository pins the exact versions we use (Python 3.12, pandas, scikit-learn, LightGBM, XGBoost, SHAP, Optuna, MAPIE).',
  },
  {
    title: 'Textbooks (all free or optional)',
    description: 'No required purchase. Primary companion: Géron, Hands-On Machine Learning, 3rd ed. (notebooks free on GitHub). Theory reference: James et al., An Introduction to Statistical Learning with Python (free PDF). Python and pandas refresher: VanderPlas, Python Data Science Handbook (free online) — the same book behind ISOM 730.',
  },
];
