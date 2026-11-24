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

The SHAP Lab: three creative uses of the receipts
    p.reason_groups()                         # cluster the risky rows by WHY they are risky
    p.bridge('hotel', 'Resort Hotel', 'City Hotel')   # explain a gap between two groups, clue by clue
    p.precedents(438)                         # cases like this one: past rows with the most similar receipts

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


class KitStop(Exception):
    """A friendly stop: the message says exactly what to change."""


try:                                                   # in Jupyter/Colab, show a KitStop as a short message, not a red traceback
    from IPython import get_ipython
    if get_ipython() is not None:
        get_ipython().set_custom_exc((KitStop,), lambda shell, etype, value, tb, tb_offset=None: print(f'\n🛑 {value}\n'))
except Exception:
    pass


def _suggest(name, options):
    import difflib
    close = difflib.get_close_matches(str(name), [str(o) for o in options], n=3, cutoff=0.5)
    hint = f' Did you mean: {", ".join(repr(c) for c in close)}?' if close else ''
    return f'There is no column called {name!r}.{hint}\n   The columns are: {", ".join(map(str, options))}'


def start(data, target, drop=(), yes=None, yes_means=None, test_size=0.2, seed=835):
    """Set up a project: check the data, split off a locked test set, prepare the columns, train a first model.

    yes        : for a yes/no target, which value counts as "yes" (the kit guesses: 1, True, "Yes", or else the rarer value)
    yes_means  : the words to use for "yes" in sentences, e.g. 'canceled' or 'churned'
    """
    return Project(data, target, drop, yes, yes_means, test_size, seed)


def _doctor(X, target):
    """The data doctor: fix what can be fixed safely, and say what was done."""
    X = X.copy(); notes = []; dates = {}
    n = len(X)
    for c in list(X.columns):
        col = X[c]
        if col.isna().all():
            X = X.drop(columns=c); notes.append(f'{c}: completely empty → removed'); continue
        if col.nunique(dropna=False) == 1:
            X = X.drop(columns=c); notes.append(f'{c}: the same value in every row → removed (it can\'t tell rows apart)'); continue
        if col.dtype == bool:
            X[c] = col.astype(int); continue
        if pd.api.types.is_datetime64_any_dtype(col):
            parsed = col
        elif col.dtype == object or pd.api.types.is_string_dtype(col):
            text = col.dropna().astype(str).str.strip()
            cleaned = text.str.replace(r'[$,%£€\s]', '', regex=True)
            as_num = pd.to_numeric(cleaned, errors='coerce')
            is_code = cleaned.str.fullmatch(r'\d+').all() and cleaned.str.len().nunique() == 1 and cleaned.str.len().iloc[0] >= 3
            if len(text) and as_num.notna().mean() >= 0.9 and text.str.contains(r'\d').mean() >= 0.9 and not is_code:
                blanks = int((col.astype(str).str.strip() == '').sum())
                X[c] = pd.to_numeric(col.astype(str).str.strip().str.replace(r'[$,%£€\s]', '', regex=True), errors='coerce')
                notes.append(f'{c}: numbers stored as text → turned into real numbers' + (f' ({blanks} blank cells became missing)' if blanks else ''))
                continue
            looks_like_date = text.str.contains(r'\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}').mean() >= 0.9
            parsed = pd.to_datetime(col, errors='coerce', format='mixed') if looks_like_date else None
            if parsed is not None and parsed.notna().mean() < 0.9:
                parsed = None
            if parsed is None:
                if text.nunique() >= 0.95 * len(text) and len(text) > 50:
                    X = X.drop(columns=c)
                    notes.append(f'{c}: a different text in almost every row (an ID or free text) → removed (it can\'t help predict new rows)')
                continue
        else:
            name = str(c).lower().replace(' ', '_')
            is_int = pd.api.types.is_integer_dtype(col) or (col.dropna() % 1 == 0).all()
            idish = any(k in name for k in ('id', 'number', 'index', 'key', 'row')) and not any(k in name for k in ('paid', 'valid', 'width', 'provid'))
            sequence = col.dropna().is_monotonic_increasing and col.nunique() == n
            if is_int and col.nunique() >= 0.99 * n and (idish or sequence):
                X = X.drop(columns=c); notes.append(f'{c}: a unique number for every row (an ID) → removed'); continue
            continue
        dates[c] = pd.to_datetime(parsed)
        X[f'{c} (year)'] = dates[c].dt.year; X[f'{c} (month)'] = dates[c].dt.month
        X[f'{c} (weekday)'] = dates[c].dt.dayofweek; X[f'{c} (days since first)'] = (dates[c] - dates[c].min()).dt.days
        X = X.drop(columns=c)
        notes.append(f'{c}: a date → turned into year, month, weekday and days-since-first (use it in p.past_vs_future!)')
    return X, notes, dates


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
    def __init__(self, data, target, drop, yes, yes_means, test_size, seed):
        if not isinstance(data, pd.DataFrame):
            raise KitStop('start() needs a pandas DataFrame, for example: data = pd.read_csv("my_file.csv")')
        if target not in data.columns:
            raise KitStop(_suggest(target, data.columns))
        missing_drop = [c for c in drop if c not in data.columns]
        if missing_drop:
            raise KitStop('In drop=[...]: ' + _suggest(missing_drop[0], data.columns))
        other = None; note_few = None
        lost = int(data[target].isna().sum())
        data = data.dropna(subset=[target]).reset_index(drop=True)
        self.target, self.seed = target, seed
        y = data[target]
        values = [v.item() if hasattr(v, 'item') else v for v in y.unique()]
        numeric = pd.api.types.is_numeric_dtype(y) and y.dtype != bool
        if len(values) < 2:
            raise KitStop(f'The target {target!r} has only one value ({values[0]!r}). There is nothing to predict.')
        if len(values) == 2:
            self.kind = 'classification'
            if yes is None:
                for v in (1, True, 'Yes', 'yes', 'YES', 'Y', 'y', '1'):
                    if any(v == u and type(v) == type(u) for u in values) or (isinstance(v, (int, bool)) and v in values):
                        yes = v; break
                else:
                    yes = y.value_counts().idxmin()                  # otherwise: the rarer value is the "yes"
            if yes not in values:
                raise KitStop(f'yes={yes!r} is not a value of {target!r}. Its values are: {values}')
            y = (y == yes).astype(int)
            self.yes = yes_means or (str(yes) if not isinstance(yes, (int, bool, np.integer)) else f'{target} = {yes}')
            self._yes_value, other = yes, [v for v in values if v != yes][0]
        elif numeric:
            self.kind = 'regression'
            if len(values) <= 10:
                note_few = f'{target}: only {len(values)} different values, so the kit treats it as a number to predict (graded by the average miss)'
        else:
            shown = ', '.join(map(repr, values[:6])) + (' …' if len(values) > 6 else '')
            raise KitStop(f'The target {target!r} has {len(values)} different values: {shown}\n'
                          f'   The kit predicts a yes/no question or a number. Turn yours into the yes/no question your decision needs, e.g.:\n'
                          f'   data["{target}_is_{values[0]}"] = data["{target}"] == {values[0]!r}\n'
                          f'   p = start(data, target="{target}_is_{values[0]}", drop=["{target}"])')
        self.y = y
        X_raw, self.notes, self.dates = _doctor(data.drop(columns=[target, *drop]), target)
        if lost:
            self.notes.insert(0, f'{target}: {lost} rows had no answer → left out')
        if note_few:
            self.notes.insert(0, note_few)
        if X_raw.shape[1] == 0:
            raise KitStop('After removing IDs and empty columns there are no clues left to predict from.')
        self.X_raw = X_raw
        strat = y if self.kind == 'classification' else None
        self.X_tr_raw, self.X_te_raw, self.y_tr, self.y_te = train_test_split(self.X_raw, y, test_size=test_size, stratify=strat, random_state=seed)
        self.prep = _prep(self.X_raw)
        self.X_tr = self.prep.fit_transform(self.X_tr_raw)        # learn the dictionary on the training rows only
        self.X_te = self.prep.transform(self.X_te_raw)
        self.metric = 'AUC' if self.kind == 'classification' else 'MAE'
        self.results, self.dials, self._shap = {}, {}, None
        self.model = self._new().fit(self.X_tr, self.y_tr)
        self.results['first test score'] = self._score(self.model, self.X_te, self.y_te)
        _box('Data doctor')
        if self.notes:
            for note in self.notes:
                print('  ✚ ' + note)
        else:
            print('  ✓ nothing to fix: no IDs, empty columns, text-numbers or dates')
        if self.kind == 'classification' and other is not None and not (set(values) <= {0, 1, True, False}):
            print(f'  ✓ "yes" means {target} = {self._yes_value!r} (the other value is {other!r}). To flip it: start(..., yes={other!r})')
        leaks = self._leak_check()
        for c, v in leaks:
            print(f'  ⚠️ {c} ALONE predicts the target almost perfectly ({self.metric if self.kind == "classification" else "R²"} {v:.2f}). '
                  f'Is it known BEFORE the moment you predict? If not, it is a leak (Session 7): add it to drop=[...].')
        first = self.results['first test score']
        if self.kind == 'classification' and first >= 0.99 and not leaks:
            print(f'  ⚠️ A test AUC of {first:.3f} is suspiciously perfect. Look for a column that is recorded after the outcome.')
        _box('Your project')
        what = f'a yes/no question (classification): will it be "{self.yes}"?' if self.kind == 'classification' else f'a number (regression): {target}'
        print(f'The model predicts {what}')
        print(f'{len(self.X_tr):,} rows to learn from · {len(self.X_te):,} rows locked away as the test · {self.X_raw.shape[1]} clues (columns)')
        if self.kind == 'classification':
            print(f'{self.y_tr.mean():.0%} of the training rows are "{self.yes}"')
        print(f'Grading: {self._metric_words()}')
        print(f'First model (gradient boosting, default dials): test {self.metric} = {self._fmt(self.results["first test score"])}')

    def _leak_check(self, limit=0.95):
        from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
        rows = self.X_tr.sample(min(len(self.X_tr), 20000), random_state=self.seed)
        yy = self.y_tr.loc[rows.index]
        found = []
        for c in rows.columns:
            tree = (DecisionTreeClassifier if self.kind == 'classification' else DecisionTreeRegressor)(max_depth=4, random_state=self.seed)
            try:
                v = cross_val_score(tree, rows[[c]], yy, cv=self._folds(3), scoring='roc_auc' if self.kind == 'classification' else 'r2').mean()
            except Exception:
                continue
            if v >= limit:
                found.append((c, v))
        return found

    def _col(self, column):
        if column in self.X_te_raw.columns:
            return self.X_te_raw[column]
        if column in self.dates:
            return self.dates[column].loc[self.X_te_raw.index]
        raise KitStop(_suggest(column, list(self.X_raw.columns) + list(self.dates)))

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
        if column in self.dates:
            col = self.dates[column]
            cut = pd.Timestamp(f'{cutoff}-01-01') if isinstance(cutoff, (int, np.integer)) else pd.Timestamp(cutoff)
            past = (col < cut).values
        elif column in self.X_raw.columns:
            col = self.X_raw[column]
            past = (col < cutoff).values
        else:
            raise KitStop(_suggest(column, list(self.X_raw.columns) + list(self.dates)))
        future = ~past
        if past.sum() < 30 or future.sum() < 30:
            raise KitStop(f'With cutoff {cutoff!r}, there are {past.sum()} rows before and {future.sum()} rows from the cutoff on. '
                          f'Both sides need at least 30. Pick a cutoff in the middle of {column}: it runs from {str(col.min())[:10]} to {str(col.max())[:10]}.')
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
        if self.kind == 'classification':
            return f'{100 * v:+.1f} points' if abs(100 * v) < 9.95 else f'{100 * v:+.0f} points'
        return f'{v:+,.0f}'

    def _say(self, v):
        return f'{v:.0%}' if self.kind == 'classification' else f'{v:,.0f}'

    def receipt(self, i, lines=6):
        """A SHAP receipt for test row i: start at the average, add each clue's push, arrive at the prediction."""
        if not 0 <= i < len(self.X_te):
            raise KitStop(f'The test rows are numbered 0 to {len(self.X_te) - 1}. Pick a number in that range.')
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
        g = self._col(column)
        ordered = pd.api.types.is_numeric_dtype(g) or pd.api.types.is_datetime64_any_dtype(g)
        if pd.api.types.is_datetime64_any_dtype(g):
            g = g.dt.year
        if pd.api.types.is_numeric_dtype(g) and g.nunique() > 8:
            cut = pd.qcut(g, 4, duplicates='drop')                         # many numbers → four equal-size groups
            g = cut.map(lambda iv: f'{max(iv.left, g.min()):,.0f} to {iv.right:,.0f}').astype(str)
        g = pd.Series(np.asarray(g).astype(str), index=self.X_te_raw.index)
        counts = g.value_counts()
        if (counts >= min_size).sum() < 2:                                  # small test set: accept smaller groups, and say so
            min_size = max(5, min(min_size, int(counts.iloc[1]) if len(counts) > 1 else 5))
        keep = [k for k, n in counts.items() if n >= min_size]
        if ordered:                                                          # years and number ranges: keep them in order
            import re
            keep = sorted(keep, key=lambda k: float(re.findall(r'-?[\d,.]+', k)[0].replace(',', '')) if re.findall(r'-?[\d,.]+', k) else 0)
        if len(keep) < 2:
            raise KitStop(f'{column!r} does not split the {len(g)} test rows into at least two groups of {min_size}+ rows. Try a column with fewer, bigger groups.')
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

    # ── The SHAP Lab · three creative uses of the receipts ───────────────────────────
    def _shap_of(self, rows, model=None, background=None):
        """SHAP receipts for any rows (cached explainer per model)."""
        import shap
        model = model or self.model
        key = id(model)
        if getattr(self, '_ex_key', None) != key:
            bg = background if background is not None else self.X_tr.sample(100, random_state=self.seed)
            self._ex = shap.TreeExplainer(model, data=bg, model_output='probability' if self.kind == 'classification' else 'raw')
            self._ex_key = key
        return self._ex(rows)

    def reason_groups(self, k=4, rows=2000):
        """Cluster the risky rows by WHY the model flags them: k-means on the SHAP receipts, not on the raw columns."""
        from sklearn.cluster import KMeans
        self._receipts()                                                     # makes sure shap is installed
        X = self.X_te.iloc[:rows]
        sv = self._shap_of(X)
        pred = sv.base_values + sv.values.sum(axis=1)
        risky = pred >= 0.5 if self.kind == 'classification' else pred >= np.quantile(pred, 0.7)
        what = f'predicted "{self.yes}"' if self.kind == 'classification' else 'in the top 30% of predictions'
        if self.kind == 'classification' and risky.sum() < 5 * k:           # rare events: few rows reach 50%, so take the riskiest 10%
            risky = pred >= np.quantile(pred, 0.9); what = 'in the riskiest 10% (few rows reach 50% in rare-event data)'
        V = sv.values[risky]
        if risky.sum() < 5 * k:
            raise KitStop(f'Only {risky.sum()} test rows are flagged, too few for {k} groups. Try p.reason_groups(k=2), or use more data.')
        groups = KMeans(n_clusters=k, n_init=10, random_state=self.seed).fit_predict(V)    # receipts are all in points already: no scaling needed
        push = pd.DataFrame(V, columns=X.columns).groupby(groups).mean()
        real = self.y_te.iloc[:rows].values[risky]
        table = []
        for g in push.index:
            top = push.loc[g].sort_values(ascending=False).head(3)
            m = groups == g
            table.append({'group': f'the "{top.index[0]}" group', 'rows': int(m.sum()), 'model says': self._say(pred[risky][m].mean()),
                          'really happened': self._say(real[m].mean()), 'top 3 reasons (average push)': ' · '.join(f'{c} {self._unit(v)}' for c, v in top.items())})
        table = pd.DataFrame(table).sort_values('rows', ascending=False).reset_index(drop=True); table.index += 1
        _box(f'SHAP Lab 1 · {"Why are they risky?" if self.kind == "classification" else "Why are they high?"} {risky.sum()} rows {what}, grouped by their receipts')
        print(table.to_string())
        print('\nSame prediction, different reasons, different fix. Each group needs its own action.')
        cols = push.abs().max().sort_values(ascending=False).head(8).index
        fig, ax = plt.subplots(figsize=(9, 0.55 * k + 1.4))
        M = push.loc[:, cols].reindex([push.index[i] for i in np.argsort([-(groups == g).sum() for g in push.index])]) * (100 if self.kind == 'classification' else 1)
        im = ax.imshow(M.values, cmap='RdBu_r', vmin=-np.abs(M.values).max(), vmax=np.abs(M.values).max(), aspect='auto')
        ax.set_xticks(range(len(cols))); ax.set_xticklabels(cols, rotation=30, ha='right'); ax.set_yticks(range(len(M))); ax.set_yticklabels([f'group {i + 1}' for i in range(len(M))])
        for r in range(M.shape[0]):
            for c in range(M.shape[1]):
                val = M.values[r, c]; lim = np.abs(M.values).max()
                ax.text(c, r, '0' if round(val) == 0 else f'{val:+.0f}', ha='center', va='center', fontsize=9, color='white' if abs(val) > 0.55 * lim else 'black')
        ax.set_title('Average push of each clue, group by group (red = pushes up)'); plt.colorbar(im, ax=ax, shrink=0.8); plt.show()
        return table

    def bridge(self, column, a, b, rows=2000, lines=6):
        """Why does the model expect more for group b than for group a? The gap, split into clue-by-clue pushes."""
        self._receipts()
        X = self.X_te.iloc[:rows]; col = self._col(column).iloc[:rows]
        A, B = (col == a).values, (col == b).values
        if A.sum() < 10 or B.sum() < 10:
            raise KitStop(f'{column} = {a!r} has {A.sum()} rows and {column} = {b!r} has {B.sum()} rows here; each needs at least 10. Values: {", ".join(map(repr, col.value_counts().index[:8]))}')
        sv = self._shap_of(X)
        pred = sv.base_values + sv.values.sum(axis=1)
        diff = pd.Series(sv.values[B].mean(0) - sv.values[A].mean(0), index=X.columns)
        top = diff.reindex(diff.abs().sort_values(ascending=False).index).head(lines)
        rest = diff.sum() - top.sum()
        pa, pb = pred[A].mean(), pred[B].mean()
        real = self.y_te.iloc[:rows].values
        _box(f'SHAP Lab 2 · The bridge: from {column} = {a} to {b}')
        print(f'{"the model expects, " + str(a):<44}{self._say(pa):>12}   (really: {self._say(real[A].mean())})')
        for c, v in top.items():
            print(f'{c:<44}{self._unit(v):>12}')
        print(f'{"all other clues":<44}{self._unit(rest):>12}')
        print(f'{"the model expects, " + str(b):<44}{self._say(pb):>12}   (really: {self._say(real[B].mean())})')
        print(f'\nIn one sentence: "{b} is {self._unit(pb - pa).replace("+", "")} {"higher" if pb > pa else "lower"} mainly because of {top.index[0]} ({self._unit(top.iloc[0])}) and {top.index[1]} ({self._unit(top.iloc[1])})."')
        sc = 100 if self.kind == 'classification' else 1
        labels = [str(a)] + list(top.index) + ['other clues', str(b)]
        fig, ax = plt.subplots(figsize=(9, 3.6)); level = pa
        ax.bar(0, pa * sc, color=GRAY)
        for i, v in enumerate(list(top.values) + [rest], start=1):
            ax.bar(i, v * sc, bottom=level * sc, color=RED if v > 0 else BLUE); ax.text(i, (level + max(v, 0)) * sc, f'{v * sc:+.1f}', ha='center', va='bottom', fontsize=9); level += v
        ax.bar(len(labels) - 1, pb * sc, color='#333')
        ax.set_xticks(range(len(labels))); ax.set_xticklabels(labels, rotation=25, ha='right'); ax.set_ylim(min(pa, pb) * sc * 0.8, max(pa, pb, level) * sc * 1.12)
        ax.set_ylabel('points' if self.kind == 'classification' else self.target); ax.set_title(f'The bridge from {a} to {b}'); plt.show()

    def precedents(self, i, n=5, pool=2000):
        """Cases like this one: the past rows whose receipts look most like test row i, and what really happened to them."""
        if not 0 <= i < len(self.X_te):
            raise KitStop(f'The test rows are numbered 0 to {len(self.X_te) - 1}. Pick a number in that range.')
        self._receipts()
        if getattr(self, '_pool_key', None) != id(self.model):
            P = self.X_tr.sample(min(pool, len(self.X_tr)), random_state=self.seed)
            self._pool = (P, self._shap_of(P)); self._pool_key = id(self.model)
        P, psv = self._pool
        me = self._shap_of(self.X_te.iloc[[i]])
        dist = np.sqrt(((psv.values - me.values[0]) ** 2).sum(axis=1))
        near = np.argsort(dist)[:n]
        mine = pd.Series(me.values[0], index=P.columns)
        clues = list(mine.abs().sort_values(ascending=False).index[:3])
        pred_me = float(me.base_values[0] + me.values[0].sum())
        pred_p = psv.base_values + psv.values.sum(axis=1)
        raw_p = self.X_tr_raw.loc[P.index]
        rows = [{'': 'THIS ONE (test row %d)' % i, **{c: self.X_te_raw.iloc[i][c] for c in clues}, 'model says': self._say(pred_me), 'what happened': '?'}]
        for j in near:
            truth = self.y_tr.loc[P.index[j]]
            what = ('canceled' if self.yes == 'canceled' else f'"{self.yes}"') if self.kind == 'classification' and truth == 1 else ('no' if self.kind == 'classification' else f'{truth:,.0f}')
            rows.append({'': f'past row {P.index[j]}', **{c: raw_p.iloc[j][c] for c in clues}, 'model says': self._say(pred_p[j]), 'what happened': what})
        table = pd.DataFrame(rows).set_index(''); table.index.name = None
        _box(f'SHAP Lab 3 · Cases like this one: the {n} past rows with the most similar receipts')
        print(table.fillna('missing').to_string())
        if self.kind == 'classification':
            k = int(sum(self.y_tr.loc[P.index[j]] for j in near))
            print(f'\n{k} of these {n} look-alikes were "{self.yes}". The model says {self._say(pred_me)} for this one.')
        else:
            print(f'\nThe look-alikes really went for {", ".join(f"{self.y_tr.loc[P.index[j]]:,.0f}" for j in near)}. The model says {self._say(pred_me)} for this one.')
        print('Similar receipt = similar REASONS, not just similar columns. A manager can check these cases by hand.')
        return table

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
