document.addEventListener('DOMContentLoaded', function () {
    // Determine base URL based on environment
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? '' : 'https://startup-predictor-9g08.onrender.com';

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
        const categoryButtons = document.querySelectorAll('[data-group="category"] .tag');
        const countryButtons = document.querySelectorAll('[data-group="country"] .tag');
        const stateButtons = document.querySelectorAll('[data-group="state"] .tag');

        [categoryButtons, countryButtons, stateButtons].forEach(group => {
            group.forEach(button => {
                button.addEventListener('click', function () {
                    group.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    const groupName = this.parentElement.getAttribute('data-group');
                    document.getElementById(groupName).value = this.textContent;
                });
            });
        });

        predictionForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            console.log('Manual form submit event triggered');

            const formData = {
                relationships: parseFloat(document.getElementById('relationships').value) || 0,
                funding_per_milestone: parseFloat(document.getElementById('funding_per_milestone').value) || 0,
                mean_funding_by_country: parseFloat(document.getElementById('mean_funding_by_country').value) || 0,
                founded_year: parseFloat(document.getElementById('founded_year').value) || 0,
                founded_month: parseFloat(document.getElementById('founded_month').value) || 0,
                milestone_duration: parseFloat(document.getElementById('milestone_duration').value) || 0,
                category_code_consulting: document.getElementById('category').value === 'consulting' ? 1 : 0,
                category_code_ecommerce: document.getElementById('category').value === 'ecommerce' ? 1 : 0,
                category_code_enterprise: document.getElementById('category').value === 'enterprise' ? 1 : 0,
                category_code_software: document.getElementById('category').value === 'software' ? 1 : 0,
                country_code_GBR: document.getElementById('country').value === 'GBR' ? 1 : 0,
                country_code_IND: document.getElementById('country').value === 'IND' ? 1 : 0,
                country_code_USA: document.getElementById('country').value === 'USA' ? 1 : 0,
                state_code_FL: document.getElementById('state').value === 'FL' ? 1 : 0
            };

            console.log('Sending manual prediction payload:', formData);

            try {
                document.getElementById('predictionResult').innerText = 'Loading...';
                const response = await fetch(`${baseUrl}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
                }
                const result = await response.json();
                document.getElementById('predictionResult').innerText = 
                    `Prediction: ${result.prediction}, Probability: ${result.probability ? result.probability.toFixed(2) : 'N/A'}`;
            } catch (error) {
                document.getElementById('predictionResult').innerText = `Error: ${error.message}`;
                console.error('Manual prediction error:', error);
            }
        });
    }

    // CSV upload form (upload.html)
    const csvForm = document.getElementById('csvForm');
    if (csvForm) {
        csvForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            console.log('CSV form submit event triggered');

            const fileInput = document.getElementById('csvFile');
            if (!fileInput.files[0]) {
                document.getElementById('csvResult').innerText = 'Error: No file selected';
                console.error('No file selected');
                return;
            }
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            console.log('Uploading CSV file:', fileInput.files[0].name);

            try {
                document.getElementById('csvResult').innerText = 'Loading...';
                const response = await fetch(`${baseUrl}/predict_csv`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
                }
                const result = await response.json();
                console.log('CSV prediction result:', result);

                // Display results in a table
                const table = document.createElement('table');
                table.style.borderCollapse = 'collapse';
                table.style.width = '100%';
                table.style.marginTop = '20px';

                // Create header row
                const headers = Object.keys(result[0] || {});
                const headerRow = table.insertRow();
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    th.style.border = '1px solid #ddd';
                    th.style.padding = '8px';
                    th.style.backgroundColor = '#6366f1';
                    th.style.color = 'white';
                    headerRow.appendChild(th);
                });

                // Create data rows
                result.forEach(rowData => {
                    const row = table.insertRow();
                    headers.forEach(header => {
                        const td = row.insertCell();
                        td.textContent = rowData[header] !== null ? rowData[header] : '';
                        td.style.border = '1px solid #ddd';
                        td.style.padding = '8px';
                    });
                });

                const csvResultDiv = document.getElementById('csvResult');
                csvResultDiv.innerHTML = '';
                csvResultDiv.appendChild(table);
            } catch (error) {
                document.getElementById('csvResult').innerText = `Error: ${error.message}`;
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
            document.querySelectorAll('.tag').forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-group="category"] .tag:last-child').classList.add('active');
            document.querySelector('[data-group="country"] .tag:last-child').classList.add('active');
            document.querySelector('[data-group="state"] .tag:last-child').classList.add('active');
            document.getElementById('category').value = 'None';
            document.getElementById('country').value = 'None';
            document.getElementById('state').value = 'None';
        });
    }
});