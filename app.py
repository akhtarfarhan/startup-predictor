import requests
import pickle
import os
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from custom_classes import AugmentWithBinaryProb

app = Flask(__name__, static_folder='.', template_folder='.')
CORS(app, resources={r"/*": {"origins": "https://startup-predictor-9g08.onrender.com"}})

# Health check endpoint for Render
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

# Serve static files (CSS, JS, HTML pages like manual.html, upload.html)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# Serve root URL with index.html
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Load model
MODEL_URL = ""  # Replace with Google Drive/Dropbox link if not using Git LFS
MODEL_PATH = os.path.join("models", "final_model.pkl")
if MODEL_URL and not os.path.exists(MODEL_PATH):
    os.makedirs("models", exist_ok=True)
    response = requests.get(MODEL_URL)
    with open(MODEL_PATH, "wb") as f:
        f.write(response.content)

try:
    class CustomUnpickler(pickle.Unpickler):
        def find_class(self, module, name):
            if module == '__main__':
                module = 'custom_classes'
            return super().find_class(module, name)

    with open(MODEL_PATH, "rb") as f:
        model = CustomUnpickler(f).load()
except FileNotFoundError:
    print("Error: final_model.pkl could not be downloaded or found")
    exit(1)
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)

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

PREDICTION_LABELS = {
    0: "operating",
    1: "acquired",
    2: "closed",
    3: "ipo"
}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    print("Received payload:", data)
    try:
        features = [float(data.get(f, 0)) for f in FEATURE_ORDER]
    except ValueError:
        return jsonify({"error": "All features must be numeric"}), 400
    try:
        features_df = pd.DataFrame([features], columns=FEATURE_ORDER)
        pred = model.predict(features_df)[0]
        confidence = (
            model.predict_proba(features_df)[0].max()
            if hasattr(model, "predict_proba")
            else None
        )
        label = PREDICTION_LABELS.get(pred, str(pred))
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
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)