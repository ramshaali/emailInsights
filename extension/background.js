// Function to get OAuth token
async function getAccessToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error("❌ Authentication Error:", chrome.runtime.lastError);
                reject(null);
            } else {
                console.log("🔑 Access Token:", token);
                resolve(token);
            }
        });
    });
}

// Function to extract message body
function extractMessageBody(data) {
    if (!data.payload) return "No email content found.";

    let body = "";

    function decodeBase64(encoded) {
        try {
            return atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
        } catch (e) {
            console.error("❌ Error decoding Base64:", e);
            return "Error decoding email content.";
        }
    }

    function findTextPart(parts) {
        for (let part of parts) {
            if (part.mimeType === "text/plain") {
                return part.body?.data ? decodeBase64(part.body.data) : null;
            }
        }
        // If no plain text, fallback to HTML
        for (let part of parts) {
            if (part.mimeType === "text/html") {
                return part.body?.data ? decodeBase64(part.body.data) : null;
            }
        }
        return null;
    }

    if (data.payload.body && data.payload.body.data) {
        body = decodeBase64(data.payload.body.data);
    } else if (data.payload.parts) {
        body = findTextPart(data.payload.parts);
    }

    return body || "No message body found.";
}

// Function to properly read CSV and DOCX files
async function readBlobData(blob, filename) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        if (filename.endsWith(".csv")) {
            reader.onload = function (event) {
                console.log("📄 CSV Content:", event.target.result);
                resolve(event.target.result);
            };
            reader.readAsText(blob);
        } else if (filename.endsWith(".docx")) {

            resolve("No data");
           
        } else {
            console.warn("❓ Unsupported file type:", filename);
            resolve(null);
        }
    });
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Function to extract attachments from email
async function extractAttachments(emailData, token) {
    const attachments = [];

    if (!emailData.payload.parts) return attachments;

    for (const part of emailData.payload.parts) {
        if (part.filename && part.body.attachmentId) {
            const attachmentId = part.body.attachmentId;
            const attachmentBlob = await fetchAttachment(emailData.id, attachmentId, token);
            
            if (!attachmentBlob) continue;

            const extractedText = await readBlobData(attachmentBlob, part.filename);
            const base64Data = await blobToBase64(attachmentBlob);

            attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                data: base64Data,
                extractedText: extractedText, // Store extracted content
            });
        }
    }

    return attachments;
}


// Function to fetch attachment from Gmail API
async function fetchAttachment(messageId, attachmentId, token) {
    const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    const data = await response.json();
    if (!data.data) return null;

    // Convert Base64 to Uint8Array (proper binary data handling)
    const byteCharacters = atob(data.data.replace(/-/g, "+").replace(/_/g, "/"));
    const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    // Determine MIME type based on filename extension
    let mimeType = "application/octet-stream";
    if (attachmentId.endsWith(".csv")) {
        mimeType = "text/csv";
    } else if (attachmentId.endsWith(".docx")) {
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    return new Blob([byteArray], { type: mimeType });
}

// Function to fetch email and attachments
async function fetchEmailById(messageId, sendResponse) {
    try {
        const token = await getAccessToken();
        if (!token) {
            sendResponse({ email: null, error: "No Access Token" });
            return;
        }

        const response = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const data = await response.json();
        console.log("📩 Raw Email Data:", data);

        if (!data.payload) {
            console.error("❌ Error: No payload in response");
            sendResponse({ email: "No email content found." });
            return;
        }

        // Extract message body
        let emailBody = extractMessageBody(data);
        if (!emailBody || emailBody === "No message body found.") {
            emailBody = data.snippet || "No content available."; // Use snippet as fallback
        }
        console.log("📜 Extracted Email Body:", emailBody);

        // Extract attachments
        const attachments = await extractAttachments(data, token);
         // Prepare request payload
         const requestBody = {
            email: emailBody,
            attachments,
        };

        console.log("📤 Sending email data to external URL...");

        // Send email data to external URL
        const externalResponse = await fetch(
            "https://f274-2407-d000-21-d89e-c922-6cb6-9d1c-946b.ngrok-free.app/summarise",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            }
        );

        const responseData = await externalResponse.json();
        console.log("✅ Response from external API:", responseData);

        // Finally, send response back to extension
        sendResponse(responseData);
    } catch (error) {
        console.error("❌ Error fetching email:", error);
        sendResponse({ email: null, attachments: [] });
    }
}


// Listen for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchEmail") {
        fetchEmailById(request.messageId, sendResponse);
        return true; // Keep the message channel open
    }
});
