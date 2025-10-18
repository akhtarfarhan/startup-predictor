# app.py (Flask API, updated with CSV endpoint and prediction labels)
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import pandas as pd

# Custom class if needed
class AugmentWithBinaryProb:
    def transform(self, X):
        return X
    def fit(self, X, y=None):
        return self

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

# Load model
MODEL_PATH = os.path.join("models", "final_model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# Feature order
FEATURE_ORDER = [
    "relationships",
    "funding_per_milestone",
    "mean_funding_by_country",
    "founded_year",
    "founded_month",
    "milestone_duration",
    "category_code_consulting",
    "category_code_ecommerce",
    "category_code_enterprise",
    "category_code_software",
    "country_code_GBR",
    "country_code_IND",
    "country_code_USA",
    "state_code_FL"
]

# Prediction labels (adjust based on your model's output classes)
PREDICTION_LABELS = {
    0: "operating",
    1: "acquired",
    2: "closed",
    3: "ipo"
}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    print("Received payload:", data)  # Debug

    # Build feature array in correct order
    try:
        features = [float(data.get(f, 0)) for f in FEATURE_ORDER]
    except ValueError:
        return jsonify({"error": "All features must be numeric"}), 400

    try:
        pred = model.predict([features])[0]
        confidence = (
            model.predict_proba([features])[0].max()
            if hasattr(model, "predict_proba")
            else None
        )
        label = PREDICTION_LABELS.get(pred, str(pred))  # Map to string label
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "prediction": label,
        "probability": float(confidence) if confidence is not None else None
    })

@app.route("/predict_csv", methods=["POST"])
def predict_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    try:
        df = pd.read_csv(file)
        # Ensure all features present, fill missing with 0, reorder
        for col in FEATURE_ORDER:
            if col not in df.columns:
                df[col] = 0
        df = df[FEATURE_ORDER]
        predictions = model.predict(df)
        confidences = model.predict_proba(df).max(axis=1) if hasattr(model, "predict_proba") else [None] * len(df)
        df['prediction'] = [PREDICTION_LABELS.get(p, str(p)) for p in predictions]
        df['confidence'] = confidences
        return df.to_json(orient='records')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)