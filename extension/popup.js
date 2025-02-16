document.addEventListener('DOMContentLoaded', () => {
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
        const content = resultDiv.textContent;
        const blob = new Blob([content], { type: 'text/plain' });
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
            
            resultDiv.textContent = request.result;
            resultContainer.style.display = 'block';
            downloadBtn.style.display = 'inline-block';
        }
    });
});