# custom_classes.py
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.base import clone
from lightgbm import LGBMClassifier
import numpy as np
from sklearn.ensemble import ExtraTreesClassifier

class BinaryClassifier(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.model = LGBMClassifier() 

    def fit(self, X, y):
        self.model.fit(X, y)
        return self

    def predict(self, X):
        return self.model.predict(X)

class MulticlassClassifier(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.model = ExtraTreesClassifier()  

    def fit(self, X, y):
        self.model.fit(X, y)
        return self

    def predict(self, X):
        return self.model.predict(X)

class ProbabilityExtractor(BaseEstimator, TransformerMixin):
    def __init__(self, model):
        self.model = model

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        probabilities = self.model.predict_proba(X)
        return probabilities[:, 1].reshape(-1, 1)  

class AugmentWithBinaryProb(BaseEstimator, TransformerMixin):
    def __init__(self, estimator=None):
        self.estimator = estimator if estimator is not None else LGBMClassifier()

    def fit(self, X, y=None, y_binary=None):
        if y_binary is None:
            raise ValueError("y_binary must be provided via fit(..., y_binary=...)")
        self.estimator_ = clone(self.estimator).fit(X, y_binary)
        return self

    def transform(self, X):
        p1 = self.estimator_.predict_proba(X)[:, 1].reshape(-1, 1)
        return np.hstack([X, p1])
