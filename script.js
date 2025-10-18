document.addEventListener('DOMContentLoaded', function () {
    // Navigation for index.html buttons
    const manualBtn = document.getElementById('manualBtn');
    const csvBtn = document.getElementById('csvBtn');
    if (manualBtn) {
        manualBtn.addEventListener('click', function () {
            window.location.href = 'manual.html';
        });
    }
    if (csvBtn) {
        csvBtn.addEventListener('click', function () {
            window.location.href = 'upload.html';
        });
    }

    // Form submission for manual data entry (manual.html)
    const predictionForm = document.getElementById('predictionForm');
    if (predictionForm) {
        // Handle category, country, state buttons
        const categoryButtons = document.querySelectorAll('[data-group="category"] .tag');
        const countryButtons = document.querySelectorAll('[data-group="country"] .tag');
        const stateButtons = document.querySelectorAll('[data-group="state"] .tag');

        // Toggle active class for buttons
        [categoryButtons, countryButtons, stateButtons].forEach(group => {
            group.forEach(button => {
                button.addEventListener('click', function () {
                    group.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        });

        predictionForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Get selected category, country, state from active buttons
            const selectedCategory = document.querySelector('[data-group="category"] .tag.active').textContent;
            const selectedCountry = document.querySelector('[data-group="country"] .tag.active').textContent;
            const selectedState = document.querySelector('[data-group="state"] .tag.active').textContent;

            const formData = {
                relationships: parseFloat(document.getElementById('relationships').value) || 0,
                funding_per_milestone: parseFloat(document.getElementById('funding_per_milestone').value) || 0,
                mean_funding_by_country: parseFloat(document.getElementById('mean_funding_by_country').value) || 0,
                founded_year: parseFloat(document.getElementById('founded_year').value) || 0,
                founded_month: parseFloat(document.getElementById('founded_month').value) || 0,
                milestone_duration: parseFloat(document.getElementById('milestone_duration').value) || 0,
                category_code_consulting: selectedCategory === 'consulting' ? 1 : 0,
                category_code_ecommerce: selectedCategory === 'ecommerce' ? 1 : 0,
                category_code_enterprise: selectedCategory === 'enterprise' ? 1 : 0,
                category_code_software: selectedCategory === 'software' ? 1 : 0,
                country_code_GBR: selectedCountry === 'GBR' ? 1 : 0,
                country_code_IND: selectedCountry === 'IND' ? 1 : 0,
                country_code_USA: selectedCountry === 'USA' ? 1 : 0,
                state_code_FL: selectedState === 'FL' ? 1 : 0
            };

            console.log('Sending payload:', formData); // Debug log

            try {
                const response = await fetch('https://startup-predictor-9g08.onrender.com/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const result = await response.json();
                document.getElementById('predictionResult').innerText = 
                    `Prediction: ${result.prediction}, Probability: ${result.probability ? result.probability.toFixed(2) : 'N/A'}`;
            } catch (error) {
                document.getElementById('predictionResult').innerText = `Error: ${error.message}`;
                console.error('Prediction error:', error);
            }
        });
    }

    // CSV upload form (upload.html)
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const fileInput = document.getElementById('csvFile');
            if (!fileInput.files[0]) {
                document.getElementById('uploadResult').innerText = 'Error: No file selected';
                return;
            }
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            console.log('Uploading CSV file'); // Debug log

            try {
                const response = await fetch('https://startup-predictor-9g08.onrender.com/predict_csv', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const result = await response.json();
                document.getElementById('uploadResult').innerText = JSON.stringify(result, null, 2);
            } catch (error) {
                document.getElementById('uploadResult').innerText = `Error: ${error.message}`;
                console.error('CSV prediction error:', error);
            }
        });
    }

    // Reset form (manual.html)
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', function () {
            predictionForm.reset();
            document.getElementById('predictionResult').innerText = '';
            // Reset active buttons
            document.querySelectorAll('.tag').forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-group="category"] .tag:last-child').classList.add('active');
            document.querySelector('[data-group="country"] .tag:last-child').classList.add('active');
            document.querySelector('[data-group="state"] .tag:last-child').classList.add('active');
        });
    }
});