console.log("content.js loaded");

function extractMessageId() {
    let messageElement = document.querySelector('[data-legacy-message-id]');
    if (!messageElement) {
        console.log("No message ID found.");
        return null;
    }
    let messageId = messageElement.getAttribute("data-legacy-message-id");
    console.log("Extracted Message ID:", messageId);
    return messageId;
}

function fetchEmailContent(messageId) {
    if (!messageId) return;
    chrome.runtime.sendMessage({ action: "fetchEmail", messageId }, (response) => {
        if (response) {
            console.log("API Response:", response);
            // Forward entire result to popup
            chrome.runtime.sendMessage({ 
                action: "updateResult", 
                result: response 
            });
        } else {
            console.error("Failed to fetch email content.");
        }
    });
}

// Listen for analyze request from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyze") {
        const messageId = extractMessageId();
        fetchEmailContent(messageId);
    }
});