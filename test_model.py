import pickle
import pandas as pd
from custom_classes import AugmentWithBinaryProb

with open('models/final_model.pkl', 'rb') as f:
    model = pickle.load(f)
print('Model loaded successfully')