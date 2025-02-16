document.addEventListener('DOMContentLoaded', () => {
    let analysisData = null;
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.querySelector('.result-container');
    const loading = document.querySelector('.loading');

    analyzeBtn.addEventListener('click', () => {
        analyzeBtn.disabled = true;
        loading.style.display = 'block';
        resultContainer.style.display = 'none';
        downloadBtn.style.display = 'none';

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "analyze" });
        });
    });

    // Handle download functionality
    downloadBtn.addEventListener('click', () => {
        if (!analysisData) return;
    
        const textContent = `Email Analysis Report\n\n
        SUMMARY:\n${analysisData.summary}\n\n
        KEY POINTS:\n${analysisData.key_points.map(point => `• ${point}`).join('\n')}\n\n
        ACTION ITEMS:\n${analysisData.action_items.map(item => `• ${item}`).join('\n')}`;
    
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
       
        chrome.downloads.download({
            url: url,
            filename: 'email-analysis-report.txt',
            conflictAction: 'uniquify'
        });
    });


    // Listen for result updates
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "updateResult") {
            loading.style.display = 'none';
            analyzeBtn.disabled = false;
            
            // Clear previous results
            resultDiv.innerHTML = '';
            
            // Store the data for download
            analysisData = request.result.message;

            // Create summary section
            const summarySection = document.createElement('div');
            summarySection.className = 'result-section';
            summarySection.innerHTML = `
                <h3 class="section-title">📝 Summary</h3>
                <p class="section-content">${analysisData.summary}</p>
            `;
            resultDiv.appendChild(summarySection);

            // Create key points section
            const keyPointsSection = document.createElement('div');
            keyPointsSection.className = 'result-section';
            keyPointsSection.innerHTML = `
                <h3 class="section-title">🔑 Key Points</h3>
                <ul class="section-list">
                    ${analysisData.key_points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            `;
            resultDiv.appendChild(keyPointsSection);

            // Create action items section
            const actionItemsSection = document.createElement('div');
            actionItemsSection.className = 'result-section';
            actionItemsSection.innerHTML = `
                <h3 class="section-title">✅ Action Items</h3>
                <ul class="section-list">
                    ${analysisData.action_items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            `;
            resultDiv.appendChild(actionItemsSection);

            resultContainer.style.display = 'block';
            downloadBtn.style.display = 'inline-block';
        }
    });

    document.getElementById("closePopup").addEventListener("click", () => {
        window.close(); // Close the popup
    });
    
});

