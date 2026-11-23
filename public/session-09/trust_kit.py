"""
The Trust Kit · ISOM 835 · Suffolk University · Prof. Hasan Arslan
=================================================================

Five questions a good boss asks before trusting a model, one line of code each:

    p = start(data, target='is_canceled')     # set up: split, prepare, train a first model
    p.five_exams()                            # 1. Is that score real?          (cross-validation)
    p.past_vs_future('year', 2017)            #    ...on the real job?          (a time-based exam)
    p.tune()                                  # 2. Can we make it better?       (random search + cross-validation)
    p.receipt(438)  /  p.top_clues()          # 3. Why did it say that?         (SHAP)
    p.calibration() /  p.not_sure(0.90)       # 4. How sure is it?              (calibration, conformal prediction)
    p.by_group('market_segment')              # 5. Does it work for everyone?   (error by slice)
    p.model_card()                            #    the one-page summary         (model card)

Works for a yes/no target (classification, graded by AUC) and for a number (regression, graded by MAE).
Every function prints one plain-English sentence and draws one picture. To see how any of them works:
    p.show_code('five_exams')
"""
import inspect, subprocess, sys, warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OrdinalEncoder
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold, KFold, RandomizedSearchCV
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.metrics import roc_auc_score, mean_absolute_error

warnings.filterwarnings('ignore')
BLUE, RED, GREEN, AMBER, GRAY = '#5b6bd8', '#d64545', '#1aa38a', '#e0a020', '#9aa3b2'


def start(data, target, drop=(), yes_means=None, test_size=0.2, seed=835):
    """Set up a project: split off a locked test set, prepare the columns, train a first model."""
    return Project(data, target, drop, yes_means, test_size, seed)


def _prep(frame):
    # The prep station for trees: fill blanks, turn text into code numbers. No scaling needed for trees.
    numbers = frame.select_dtypes(include='number').columns.tolist()
    text = [c for c in frame.columns if c not in numbers]
    return ColumnTransformer([
        ('numbers', SimpleImputer(strategy='constant', fill_value=-1), numbers),
        ('text', Pipeline([('fill', SimpleImputer(strategy='constant', fill_value='missing')),
                           ('codes', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1))]), text),
    ], verbose_feature_names_out=False).set_output(transform='pandas')


def _box(title):
    print(f'\n━━ {title} ' + '━' * max(3, 70 - len(title)))


class Project:
    def __init__(self, data, target, drop, yes_means, test_size, seed):
        data = data.dropna(subset=[target]).reset_index(drop=True)
        self.target, self.seed = target, seed
        y = data[target]
        self.kind = 'classification' if y.nunique() == 2 else 'regression'
        if self.kind == 'classification':
            values = sorted(y.unique(), key=str)
            yes = 1 if 1 in values else values[-1]
            y = (y == yes).astype(int)
            self.yes = yes_means or f'{target} = {yes}'
        self.y = y
        self.X_raw = data.drop(columns=[target, *drop])
        strat = y if self.kind == 'classification' else None
        self.X_tr_raw, self.X_te_raw, self.y_tr, self.y_te = train_test_split(self.X_raw, y, test_size=test_size, stratify=strat, random_state=seed)
        self.prep = _prep(self.X_raw)
        self.X_tr = self.prep.fit_transform(self.X_tr_raw)        # learn the dictionary on the training rows only
        self.X_te = self.prep.transform(self.X_te_raw)
        self.metric = 'AUC' if self.kind == 'classification' else 'MAE'
        self.results, self.dials, self._shap = {}, {}, None
        self.model = self._new().fit(self.X_tr, self.y_tr)
        self.results['first test score'] = self._score(self.model, self.X_te, self.y_te)
        _box('Your project')
        what = f'a yes/no question (classification): will it be "{self.yes}"?' if self.kind == 'classification' else f'a number (regression): {target}'
        print(f'The model predicts {what}')
        print(f'{len(self.X_tr):,} rows to learn from · {len(self.X_te):,} rows locked away as the test · {self.X_raw.shape[1]} clues (columns)')
        if self.kind == 'classification':
            print(f'{self.y_tr.mean():.0%} of the training rows are "{self.yes}"')
        print(f'Grading: {self._metric_words()}')
        print(f'First model (gradient boosting, default dials): test {self.metric} = {self._fmt(self.results["first test score"])}')

    # ── small helpers ────────────────────────────────────────────────────────────────
    def _new(self, **dials):
        recipe = dict(max_iter=2000, early_stopping=True, validation_fraction=0.15, n_iter_no_change=40, random_state=self.seed)
        Model = HistGradientBoostingClassifier if self.kind == 'classification' else HistGradientBoostingRegressor
        return Model(**{**recipe, **self.dials, **dials})

    def _score(self, model, X, y):
        if self.kind == 'classification':
            return roc_auc_score(y, model.predict_proba(X)[:, 1])
        return mean_absolute_error(y, model.predict(X))

    def _fmt(self, v):
        return f'{v:.3f}' if self.kind == 'classification' else f'{v:,.0f}'

    def _metric_words(self):
        if self.kind == 'classification':
            return 'AUC: pick one "yes" row and one "no" row; how often does the "yes" get the higher score? 0.5 = coin flip, 1.0 = perfect. Higher is better.'
        return f'MAE: the average miss, in the units of {self.target}. Lower is better.'

    def _folds(self, k):
        return StratifiedKFold(k, shuffle=True, random_state=self.seed) if self.kind == 'classification' else KFold(k, shuffle=True, random_state=self.seed)

    def _scoring(self):
        return 'roc_auc' if self.kind == 'classification' else 'neg_mean_absolute_error'

    def show_code(self, name):
        """Print the code of any step, e.g. p.show_code('five_exams')."""
        print(inspect.getsource(getattr(Project, name)))

    # ── Question 1 · Is that score real? ─────────────────────────────────────────────
    def five_exams(self, k=5):
        """Cross-validation: cut the training rows into k parts; each part takes one turn as the exam."""
        scores = cross_val_score(self._new(), self.X_tr, self.y_tr, cv=self._folds(k), scoring=self._scoring())
        if self.kind == 'regression':
            scores = -scores
        avg, spread = scores.mean(), scores.std()
        self.results['cross-validation'] = (avg, spread)
        _box(f'Question 1 · Is that score real? ({k} exams instead of 1)')
        print(f'{k} exams: ' + '  '.join(self._fmt(s) for s in scores))
        print(f'Honest score: {self._fmt(avg)}, give or take {self._fmt(spread)}')
        first = self.results['first test score']
        better = first > avg if self.kind == 'classification' else first < avg
        print(f'The single test score from the start ({self._fmt(first)}) was {"a little lucky" if better else "not lucky: if anything, a hard exam"}. Report the average and the spread.')
        fig, ax = plt.subplots(figsize=(8, 2.2))
        ax.scatter(scores, [0] * k, s=170, color=BLUE, alpha=0.8, zorder=3, label='one exam each')
        ax.axvline(avg, color=GREEN, lw=3, label=f'average {self._fmt(avg)}')
        ax.axvline(first, color=RED, ls='--', lw=2, label=f'the single test score {self._fmt(first)}')
        ax.set_yticks([]); ax.set_xlabel(self.metric); ax.legend(loc='upper center', bbox_to_anchor=(0.5, -0.45), ncol=3, frameon=False)
        ax.set_title(f'Same model, {k} different exams'); plt.show()

    def past_vs_future(self, column, cutoff):
        """Train on rows before the cutoff, test on rows from the cutoff on: the exam that looks like the real job."""
        col = self.X_raw[column]
        past = (col < cutoff).values
        future = ~past
        shuffled = np.zeros(len(col), dtype=bool)
        shuffled[np.random.RandomState(self.seed).permutation(len(col))[:past.sum()]] = True

        def exam(train, test):
            station = _prep(self.X_raw)
            model = self._new().fit(station.fit_transform(self.X_raw[train]), self.y[train])
            return self._score(model, station.transform(self.X_raw[test]), self.y[test])

        s_mix, s_future = exam(shuffled, ~shuffled), exam(past, future)
        self.results['past → future'] = (s_mix, s_future, f'{column} before {cutoff} → from {cutoff} on')
        _box('Question 1b · Does the exam look like the real job?')
        print(f'Shuffled exam (past and future mixed):  {self.metric} {self._fmt(s_mix)}')
        print(f'Learn the past, predict the future:     {self.metric} {self._fmt(s_future)}   ← expect this when the model is in use')
        fig, ax = plt.subplots(figsize=(7, 2.2))
        ax.barh(['learn past → predict future', 'shuffled'], [s_future, s_mix], color=[RED, BLUE])
        for yv, v in enumerate([s_future, s_mix]):
            ax.text(v, yv, f'  {self._fmt(v)}', va='center', fontweight='bold')
        lo = 0.5 if self.kind == 'classification' else 0
        ax.set_xlim(lo, max(s_mix, s_future) * (1.08 if self.kind == 'regression' else 1.02)); ax.set_xlabel(self.metric)
        ax.set_title('Same model, two kinds of exam'); plt.show()

    # ── Question 2 · Can we make it better? ──────────────────────────────────────────
    def tune(self, recipes=12, dials=None):
        """Random search: try a few random dial settings, taste each with 3 exams (cross-validation), keep the best."""
        menu = dials or {'learning_rate': [0.03, 0.05, 0.1, 0.2], 'max_leaf_nodes': [7, 15, 31, 63], 'min_samples_leaf': [5, 20, 50, 100]}
        search = RandomizedSearchCV(self._new(), menu, n_iter=recipes, cv=self._folds(3), scoring=self._scoring(), random_state=self.seed, n_jobs=-1)
        search.fit(self.X_tr, self.y_tr)
        table = pd.DataFrame(search.cv_results_['params'])
        table['taste score (3 exams)'] = search.cv_results_['mean_test_score'] * (1 if self.kind == 'classification' else -1)
        table = table.sort_values('taste score (3 exams)', ascending=self.kind == 'regression').reset_index(drop=True)
        table.index += 1
        before = self.results['first test score']
        self.dials = search.best_params_
        self.model = self._new().fit(self.X_tr, self.y_tr)           # the winning recipe, trained on all the training rows
        self._shap = None
        after = self._score(self.model, self.X_te, self.y_te)        # the locked test set: opened once, at the very end
        self.results['tuning'] = (before, after, dict(self.dials))
        _box(f'Question 2 · Can we make it better? ({recipes} recipes × 3 exams)')
        print('The best recipes, tasted with cross-validation (the test set stayed locked):')
        print(table.head(5).round(4).to_string())
        print(f'\nWinning dials: {self.dials}')
        print(f'Test {self.metric}, opened once: {self._fmt(before)} (default dials) → {self._fmt(after)} (tuned)')
        print('Tuning is the last few percent, not the first.')

    # ── Question 3 · Why did it say that? ────────────────────────────────────────────
    def _receipts(self, need=0):
        if self._shap is not None and need < len(self._shap[1]):
            return self._shap
        try:
            import shap
        except ModuleNotFoundError:
            print('Installing shap (one time, about 20 seconds)…')
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'shap'], check=True)
            import shap
        n = max(500, need + 1)
        rows = self.X_te.iloc[:n]
        background = self.X_tr.sample(100, random_state=self.seed)
        out = 'probability' if self.kind == 'classification' else 'raw'
        sv = shap.TreeExplainer(self.model, data=background, model_output=out)(rows)
        self._shap = (sv, rows)
        return self._shap

    def _unit(self, v):
        return f'{100 * v:+.0f} points' if self.kind == 'classification' else f'{v:+,.0f}'

    def _say(self, v):
        return f'{v:.0%}' if self.kind == 'classification' else f'{v:,.0f}'

    def receipt(self, i, lines=6):
        """A SHAP receipt for test row i: start at the average, add each clue's push, arrive at the prediction."""
        sv, rows = self._receipts(i)
        words = self.X_te_raw.iloc[i][rows.columns].fillna('missing').map(lambda w: int(w) if isinstance(w, float) and w.is_integer() else w)
        base = sv.base_values[i] if np.ndim(sv.base_values) else sv.base_values
        push = pd.Series(sv.values[i], index=rows.columns)
        top = push.reindex(push.abs().sort_values(ascending=False).index).head(lines)
        rest = push.sum() - top.sum()
        total = base + push.sum()
        truth = self.y_te.iloc[i]
        truth_words = (f'"{self.yes}"' if truth == 1 else f'not "{self.yes}"') if self.kind == 'classification' else f'{truth:,.0f}'
        _box(f'Question 3 · The receipt for test row {i}')
        print(f'{"START: the average row":<44}{self._say(base):>12}')
        for clue, v in top.items():
            print(f'{(clue + " = " + str(words[clue]))[:43]:<44}{self._unit(v):>12}')
        print(f'{"all other clues together":<44}{self._unit(rest):>12}')
        print(f'{"TOTAL: the prediction":<44}{self._say(total):>12}')
        print(f'What really happened: {truth_words}')
        biggest = top.index[0]
        print(f'\nIn one sentence: "The model says {self._say(total)} mainly because {biggest} = {words[biggest]} ({self._unit(top.iloc[0])})."')
        fig, ax = plt.subplots(figsize=(8, 0.45 * (len(top) + 2) + 0.6))
        labels = ['START: average'] + [f'{c} = {str(words[c])[:22]}' for c in top.index] + ['other clues']
        vals = [None] + list(top.values) + [rest]
        level = base
        scale = 100 if self.kind == 'classification' else 1
        for r, (lab, v) in enumerate(zip(labels, vals)):
            if v is None:
                ax.barh(r, base * scale, color=GRAY); continue
            ax.barh(r, v * scale, left=level * scale, color=RED if v > 0 else BLUE)
            ax.text(max(level, level + v) * scale, r, '  ' + self._unit(v).replace(' points', ''), va='center', fontsize=9); level += v
        ax.barh(len(labels), total * scale, color='#333'); ax.text(total * scale, len(labels), '  ' + self._say(total), va='center', fontweight='bold')
        ax.set_xlim(0, max(level, base, total) * scale * 1.15 + 1e-9)
        ax.set_yticks(range(len(labels) + 1)); ax.set_yticklabels(labels + ['TOTAL']); ax.invert_yaxis()
        ax.set_xlabel('chance, in points' if self.kind == 'classification' else self.target)
        ax.set_title('The receipt: red pushes up, blue pushes down'); plt.show()

    def three_receipts(self):
        """Milestone 3: receipts for three cases a manager would recognize: the most confident yes, the most confident no, a coin flip."""
        sv, rows = self._receipts()
        pred = sv.base_values + sv.values.sum(axis=1) if np.ndim(sv.base_values) else sv.base_values + sv.values.sum(axis=1)
        middle = np.median(pred) if self.kind == 'regression' else 0.5
        picks = {'highest prediction': int(np.argmax(pred)), 'lowest prediction': int(np.argmin(pred)), 'right in the middle': int(np.argmin(np.abs(pred - middle)))}
        for name, i in picks.items():
            print(f'\n▶ {name}: test row {i}')
            self.receipt(i, lines=4)

    def top_clues(self, n=10):
        """All the receipts together: how much does each clue move the prediction, on average?"""
        sv, rows = self._receipts()
        strength = pd.Series(np.abs(sv.values).mean(axis=0), index=rows.columns).sort_values(ascending=False).head(n)
        self.results['top clues'] = list(strength.index[:5])
        _box(f'Question 3b · Which clues matter most? (average push over {len(rows)} receipts)')
        for clue, v in strength.items():
            print(f'{clue:<34}{self._unit(v).lstrip("+"):>14}')
        fig, ax = plt.subplots(figsize=(7, 0.35 * n + 0.8))
        ax.barh(strength.index[::-1], strength.values[::-1] * (100 if self.kind == 'classification' else 1), color=BLUE)
        ax.set_xlabel('average push (points)' if self.kind == 'classification' else f'average push ({self.target})')
        ax.set_title('Which clues move the prediction most'); plt.show()
        print('Careful: this explains the MODEL, not the world. A big push is not proof that changing the clue changes the outcome.')

    # ── Question 4 · How sure is it? ─────────────────────────────────────────────────
    def calibration(self, bins=10):
        """When the model says 70%, does it happen about 70% of the time?"""
        _box('Question 4 · When it says 70%, is it 70%? (calibration)')
        if self.kind == 'regression':
            print('Calibration plots are for yes/no models. For a number, use p.not_sure() to get an honest range.')
            return
        chance = self.model.predict_proba(self.X_te)[:, 1]
        groups = pd.qcut(chance, bins, duplicates='drop')
        table = pd.DataFrame({'said': chance, 'happened': self.y_te.values}).groupby(groups, observed=True).mean()
        gap = (table['said'] - table['happened']).abs().mean()
        self.results['calibration gap'] = gap
        print(f'Each dot: about {len(chance) // bins} test rows. On average the model is off by about {max(1, round(100 * gap))} point{"s" if round(100 * gap) > 1 else ""}.')
        print('On the diagonal = honest chances. Above it = the model is too shy. Below it = too confident.')
        fig, ax = plt.subplots(figsize=(4.6, 4.2))
        ax.plot([0, 1], [0, 1], ls='--', color=GRAY, label='perfectly honest')
        ax.plot(table['said'], table['happened'], 'o-', color=BLUE, ms=8, label='our model')
        ax.set_xlabel('the model said (chance)'); ax.set_ylabel('it really happened (share)'); ax.legend(frameon=False)
        ax.set_title('Calibration'); plt.show()

    def not_sure(self, promise=0.90):
        """Conformal prediction: answers that keep a promise. Yes/no: "yes", "no" or "not sure". Numbers: a range."""
        X_fit, X_track, y_fit, y_track = train_test_split(self.X_tr, self.y_tr, test_size=0.25, random_state=self.seed,
                                                          stratify=self.y_tr if self.kind == 'classification' else None)
        careful = self._new().fit(X_fit, y_fit)                     # a track-record pile the model never trains on
        if self.kind == 'regression':
            misses = np.abs(y_track.values - careful.predict(X_track))
            band = np.quantile(misses, promise)
            pred = careful.predict(self.X_te)
            kept = (np.abs(self.y_te.values - pred) <= band).mean()
            self.results['not sure'] = (promise, kept, f'every prediction ± {band:,.0f}')
            _box(f'Question 4b · An honest range, with a {promise:.0%} promise')
            print(f'Every prediction comes with a range: ± {band:,.0f}')
            print(f'Promise {promise:.0%} → kept on {kept:.1%} of the test rows')
            i = 0
            print(f'Example: test row {i}: "between {pred[i] - band:,.0f} and {pred[i] + band:,.0f}" (truth: {self.y_te.iloc[i]:,.0f})')
            return
        chances = careful.predict_proba(X_track)
        surprise = 1 - chances[np.arange(len(y_track)), y_track.values]
        bar = np.quantile(surprise, promise)
        new = careful.predict_proba(self.X_te)
        keep_no, keep_yes = (1 - new[:, 0]) <= bar, (1 - new[:, 1]) <= bar
        answer = np.select([keep_no & keep_yes, keep_yes, keep_no], ['not sure', f'yes: {self.yes}', 'no'], default='no answer')
        inside = np.where(self.y_te.values == 1, keep_yes, keep_no).mean()
        share = pd.Series(answer).value_counts(normalize=True)
        self.results['not sure'] = (promise, inside, f'"not sure" on {share.get("not sure", 0):.0%} of rows')
        _box(f'Question 4b · Let it say "not sure", with a {promise:.0%} promise')
        print(f'Promise {promise:.0%} → kept on {inside:.1%} of the test rows')
        for k, v in share.items():
            print(f'  {k:<28}{v:6.1%}')
        print(f'The "not sure" pile is the short list for a person to check. A stricter promise makes the pile bigger.')
        fig, ax = plt.subplots(figsize=(8, 1.3)); left = 0
        for k, c in [('no', BLUE), ('not sure', AMBER), (f'yes: {self.yes}', RED), ('no answer', GRAY)]:
            v = share.get(k, 0)
            if v:
                ax.barh(0, v, left=left, color=c); ax.text(left + v / 2, 0, f'{k}\n{v:.0%}', ha='center', va='center', color='white', fontweight='bold', fontsize=9)
                left += v
        ax.set_xlim(0, 1); ax.axis('off'); ax.set_title(f'Three possible answers, {promise:.0%} promise'); plt.show()

    # ── Question 5 · Does it work for everyone? ──────────────────────────────────────
    def by_group(self, column, min_size=100, threshold=0.5):
        """Split the test rows into groups and check the model's mistakes in each one."""
        g = self.X_te_raw[column]
        if pd.api.types.is_numeric_dtype(g) and g.nunique() > 8:
            cut = pd.qcut(g, 4, duplicates='drop')                         # many numbers → four equal-size groups
            g = cut.map(lambda iv: f'{max(iv.left, g.min()):,.0f} to {iv.right:,.0f}').astype(str)
        g = pd.Series(np.asarray(g).astype(str), index=self.X_te_raw.index)
        keep = [k for k, n in g.value_counts().items() if n >= min_size]
        rows = []
        if self.kind == 'classification':
            said = (self.model.predict_proba(self.X_te)[:, 1] >= threshold).astype(int)
            real = self.y_te.values

            def errors(mask):
                r, s = real[mask], said[mask]
                return {'rows': int(mask.sum()), f'share "{self.yes}"': r.mean(),
                        'missed (said no, it was yes)': ((r == 1) & (s == 0)).sum() / max(1, (r == 1).sum()),
                        'false alarms (said yes, it was no)': ((r == 0) & (s == 1)).sum() / max(1, (r == 0).sum())}
        else:
            pred = self.model.predict(self.X_te); real = self.y_te.values

            def errors(mask):
                return {'rows': int(mask.sum()), 'average miss (MAE)': np.abs(real[mask] - pred[mask]).mean(),
                        'average error (+ = predicts too high)': (pred[mask] - real[mask]).mean()}
        rows.append(('EVERYONE', errors(np.ones(len(g), dtype=bool))))
        for k in keep:
            rows.append((k, errors((g == k).values)))
        table = pd.DataFrame(dict(rows)).T
        table['rows'] = table['rows'].astype(int)
        worst_col = table.columns[2] if self.kind == 'classification' else table.columns[1]
        worst = table.drop('EVERYONE')[worst_col].idxmax() if len(table) > 1 else '—'
        self.results.setdefault('groups', []).append((column, worst, worst_col))
        _box(f'Question 5 · Does it work for everyone? (by {column})')
        print(table.round(3 if self.kind == 'classification' else 0).to_string())
        print(f'\nWorst group on "{worst_col}": {worst}. An average can hide a group the model serves badly.')
        cols = table.columns[2:4] if self.kind == 'classification' else table.columns[1:2]
        table[cols].drop('EVERYONE').plot.barh(figsize=(8, 0.45 * len(keep) + 1.2), color=[RED, AMBER][:len(cols)])
        plt.axvline(table.loc['EVERYONE', cols[0]], color='#333', ls='--', lw=1)
        if self.kind == 'classification':
            plt.gca().xaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f'{v:.0%}'))
        plt.title(f'Mistakes by {column} (dashed line: everyone)'); plt.gca().invert_yaxis(); plt.show()

    # ── The label on the box ─────────────────────────────────────────────────────────
    def model_card(self, name='My model'):
        """A one-page model card, filled in from everything you ran. Fill in the ____ lines yourself."""
        r = self.results
        L = [f'### MODEL CARD · {name}', '',
             f'**What it predicts.** {"Whether a row is " + chr(34) + self.yes + chr(34) if self.kind == "classification" else self.target}.', '',
             '**What it is for.** ____', '', '**What it is NOT for.** ____', '',
             f'**The data.** {len(self.X_raw):,} rows, {self.X_raw.shape[1]} clues. {len(self.X_te):,} rows locked away as the test.', '',
             f'**The model.** Gradient boosting with early stopping. Dials: {self.dials or "default"}.', '',
             '**1 · How good is it?**']
        if 'cross-validation' in r:
            a, s = r['cross-validation']; L.append(f'- Cross-validation: {self.metric} {self._fmt(a)}, give or take {self._fmt(s)}.')
        if 'tuning' in r:
            b, a, _ = r['tuning']; L.append(f'- Test {self.metric}, opened once: {self._fmt(a)} (default dials: {self._fmt(b)}).')
        else:
            L.append(f'- Test {self.metric}: {self._fmt(r["first test score"])}.')
        if 'past → future' in r:
            m, f, how = r['past → future']; L.append(f'- ⚠️ On the exam that looks like the real job ({how}): **{self._fmt(f)}**. Expect this in use.')
        L.append('')
        if 'top clues' in r:
            L += [f'**2 · Why does it say what it says?** Mostly: {", ".join(r["top clues"])}. It explains the model, not the world.', '']
        if 'not sure' in r or 'calibration gap' in r:
            L.append('**3 · How sure is it?**')
            if 'calibration gap' in r:
                gap = max(1, round(100 * r['calibration gap'])); L.append(f'- Calibration: its chances are off by about {gap} point{"s" if gap > 1 else ""} on average.')
            if 'not sure' in r:
                p, k, txt = r['not sure']; L.append(f'- With a {p:.0%} promise ({txt}), the promise held on {k:.1%} of test rows.')
            L.append('')
        if r.get('groups'):
            L.append('**4 · Does it work for everyone?**')
            for col, worst, what in r['groups']:
                L.append(f'- By {col}: worst on "{what}" for **{worst}**.')
            L.append('')
        L += ['', '**Watch after launch.** ____', '', '**Owner:** ____ · **Next review:** ____']
        try:
            from IPython.display import Markdown, display
            display(Markdown('\n'.join(L)))
        except Exception:
            print('\n'.join(L))
