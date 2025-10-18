// script.js (updated to connect to API, handle navigation from index, and display results)
document.addEventListener('DOMContentLoaded', () => {
  // Navigation from index.html (if loaded)
  const manualBtn = document.getElementById("manualBtn");
  if (manualBtn) {
    manualBtn.addEventListener("click", () => {
      window.location.href = "./manual.html";
    });
  }

  const csvBtn = document.getElementById("csvBtn");
  if (csvBtn) {
    csvBtn.addEventListener("click", () => {
      window.location.href = "./upload.html";
    });
  }

  // Toggle active tags
  document.querySelectorAll(".tag").forEach((tag) => {
    tag.addEventListener("click", () => {
      const parent = tag.parentElement;
      parent.querySelectorAll(".tag").forEach((t) => t.classList.remove("active"));
      tag.classList.add("active");
    });
  });

  // Define FEATURE_ORDER
  const FEATURE_ORDER = [
    "relationships", "funding_per_milestone", "mean_funding_by_country",
    "founded_year", "founded_month", "milestone_duration",
    "category_code_consulting", "category_code_ecommerce", "category_code_enterprise", "category_code_software",
    "country_code_GBR", "country_code_IND", "country_code_USA", "state_code_FL"
  ];

  // Handle manual form submit
  const predictionForm = document.getElementById("predictionForm");
  if (predictionForm) {
    predictionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {};

      // Collect numerical features
      FEATURE_ORDER.slice(0, 6).forEach(f => {
        const input = document.getElementById(f);
        data[f] = parseFloat(input.value) || 0;
      });

      // Collect one-hot from tags
      const categoryActive = document.querySelector('.tags[data-group="category"] .tag.active')?.textContent || 'None';
      data['category_code_consulting'] = categoryActive === 'consulting' ? 1 : 0;
      data['category_code_ecommerce'] = categoryActive === 'ecommerce' ? 1 : 0;
      data['category_code_enterprise'] = categoryActive === 'enterprise' ? 1 : 0;
      data['category_code_software'] = categoryActive === 'software' ? 1 : 0;

      const countryActive = document.querySelector('.tags[data-group="country"] .tag.active')?.textContent || 'None';
      data['country_code_GBR'] = countryActive === 'GBR' ? 1 : 0;
      data['country_code_IND'] = countryActive === 'IND' ? 1 : 0;
      data['country_code_USA'] = countryActive === 'USA' ? 1 : 0;

      const stateActive = document.querySelector('.tags[data-group="state"] .tag.active')?.textContent || 'None';
      data['state_code_FL'] = stateActive === 'FL' ? 1 : 0;

      // Call API (replace with your deployed URL, e.g., 'https://your-app.onrender.com/predict')
      const apiUrl = 'http://localhost:5000/predict';  // Change to deployed URL after deployment
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('API error');
        const result = await response.json();
        document.getElementById('predictionResult').innerText = `Prediction: ${result.prediction} (Confidence: ${result.probability ? result.probability.toFixed(2) : 'N/A'})`;
      } catch (error) {
        document.getElementById('predictionResult').innerText = 'Error: ' + error.message;
      }
    });
  }

  // Handle CSV upload
  const uploadForm = document.getElementById("uploadForm");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById("csvFile");
      const file = fileInput.files[0];
      if (!file) {
        document.getElementById('uploadResult').innerText = "Please upload a file";
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      // Call API (replace with your deployed URL, e.g., 'https://your-app.onrender.com/predict_csv')
      const apiUrl = 'http://localhost:5000/predict_csv';  // Change to deployed URL after deployment
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) throw new Error('API error');
        const results = await response.json();
        // Display results (simple text for now; you can enhance to table)
        document.getElementById('uploadResult').innerText = 'Predictions: ' + JSON.stringify(results, null, 2);
        // To download: create a blob and link
        const blob = new Blob([JSON.stringify(results, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'predictions.json';
        a.textContent = 'Download Results';
        document.getElementById('uploadResult').appendChild(a);
      } catch (error) {
        document.getElementById('uploadResult').innerText = 'Error: ' + error.message;
      }
    });
  }
});