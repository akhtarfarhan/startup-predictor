# custom_transformers.py
from sklearn.base import BaseEstimator, TransformerMixin

class AugmentWithBinaryProb(BaseEstimator, TransformerMixin):
    def transform(self, X):
        return X
    def fit(self, X, y=None):
        return self