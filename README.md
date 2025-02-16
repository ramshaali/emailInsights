# Email Insights Lite - Chrome Extension

## Overview
Email Insights Lite is an AI-powered Chrome extension that helps businesses extract key insights from lengthy emails and attachments. It provides instant summarization, identifies key points, and highlights action items, making email analysis seamless and efficient.

## Features
- AI-driven email summarization
- Intelligent attachment analysis (CSV, DOCX, PDF)
- Instant key insights extraction
- One-click analysis within Gmail
- Secure OAuth authentication
- Downloadable email analysis report
- Customizable summarization settings

## Prerequisites
Before setting up the extension, ensure you have:
- Google Chrome installed
- A Google account with Gmail access
- A working internet connection

## Installation and Setup
### Step 1: Clone or Download the Repository
```bash
$ git clone https://github.com/your-repo/email-insights-lite.git
$ cd email-insights-lite
```

### Step 2: Load the Extension in Chrome
1. Open **Google Chrome**.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle at the top-right corner).
4. Click on **Load unpacked**.
5. Select the downloaded/cloned `email-insights-lite` folder.
6. The extension should now be loaded and visible in the Chrome toolbar.

### Step 3: Set Up API Credentials
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the **Gmail API**, **Google Docs API**, and **Google Drive API**.
4. Configure OAuth consent screen:
   - Set application name (e.g., Email Insights Lite)
   - Add necessary scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/documents.readonly`
     - `https://www.googleapis.com/auth/drive.readonly`
5. Generate OAuth 2.0 credentials:
   - Create a new **OAuth Client ID**.
   - Set the application type to **Chrome Extension**.
   - Use the extension ID found at `chrome://extensions/`.
   - Copy the generated `client_id` and update `manifest.json`:
     ```json
     "oauth2": {
       "client_id": "YOUR_CLIENT_ID",
       "scopes": [
         "https://www.googleapis.com/auth/gmail.readonly",
         "https://www.googleapis.com/auth/documents.readonly",
         "https://www.googleapis.com/auth/drive.readonly"
       ]
     }
     ```

### Step 4: Run the Extension
1. Open **Gmail** in Chrome.
2. Click the **Email Insights Lite** icon in the Chrome toolbar.
3. Click the **Analyze Email** button.
4. Authenticate using your Google account when prompted.
5. View the extracted insights and download the analysis report if needed.

## File Structure
```
extension/
│── icons/              # Extension icons
│── manifest.json       # Chrome extension manifest
│── background.js       # Background script for API requests
│── content.js          # Content script for interacting with Gmail
│── config.js           # Configuration file
│── popup.html          # Extension UI
│── popup.js            # Script for UI functionality
```

## Troubleshooting
- **Extension not appearing in Chrome?**
  - Ensure Developer Mode is enabled and re-load the extension.
- **OAuth authentication issues?**
  - Double-check your `client_id` in `manifest.json`.
  - Verify that Gmail API and Google Drive API access are enabled in Google Cloud Console.
- **Email content not extracted?**
  - Check the Chrome DevTools console for any API errors.

## Support
For any issues or questions, please create an issue on the [GitHub repository](https://github.com/your-repo/email-insights-lite/issues)



# 📌 Python Backend

This is a simple Python backend with a single API endpoint. Follow the steps below to set it up and run.

## 🚀 Installation

### Step 1: Clone the Repository
```sh
git clone https://github.com/ramshaali/emailInsights.git
cd backend
```

### Step 2: Create a Virtual Environment (Optional but Recommended)
```sh
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate     # On Windows
```

### Step 3: Install Dependencies
For **Linux/macOS**:
```sh
pip install -r requirements.txt
```

For **Windows** (to fix `python-magic` issue):
```sh
pip install -r requirements.txt
pip install python-magic-bin
```

## ⚙️ Configuration

### Step 4: Set Environment Variable  
Before running the application, set your **DeepSeek API key**:  

#### On Linux/macOS:
```sh
export DEEPSEEK_API_KEY="your_api_key_here"
```

#### On Windows (PowerShell):
```powershell
$env:DEEPSEEK_API_KEY="your_api_key_here"
```

#### On Windows (Command Prompt):
```cmd
set DEEPSEEK_API_KEY=your_api_key_here
```

Alternatively, create a `.env` file in the root directory:
```
DEEPSEEK_API_KEY=your_api_key_here
```

## ▶️ Running the App

Start the application by running:
```sh
python main.py
```

## 📌 Notes
- Make sure **Python 3.8+** is installed.  
- If you face issues with dependencies, try upgrading pip:  
  ```sh
  pip install --upgrade pip
  ```
- For deployment, consider using **Gunicorn** or **Uvicorn**.


