from flask import Flask, request, jsonify
import base64
import magic
import os
import zipfile
import shutil
from PyPDF2 import PdfReader
from utils import call_deepseek_llm

app = Flask(__name__)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Create directory if not exists
UPLOAD_DIR = "images"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Create directory if not exists


@app.route('/summarise', methods=['POST'])
def summarise():
    try:
        req_data = request.get_json()
        email_text = req_data.get("email", "")
        attachments = req_data.get("attachments", [])
        attachments_text = ""
        
        for attachment in attachments:
            filename = attachment.get("filename", "unknown_file")
            base64_data = attachment.get("data")
            
            if not base64_data:
                continue
            
            decoded_data = base64.b64decode(base64_data)
            mime_detector = magic.Magic(mime=True)
            detected_mime = mime_detector.from_buffer(decoded_data)
            file_path = os.path.join(UPLOAD_DIR, filename)

            if detected_mime.startswith("text"):
                attachments_text += decoded_data.decode("utf-8") + "\n"
            elif detected_mime == "application/pdf":
                file_path += ".pdf"
                with open(file_path, "wb") as f:
                    f.write(decoded_data)
                attachments_text += extract_text_from_pdf(file_path) + "\n"
            elif detected_mime == "application/zip":
                file_path += ".zip"
                with open(file_path, "wb") as f:
                    f.write(decoded_data)
                attachments_text += extract_zip(file_path) + "\n"
        
        
        response =call_deepseek_llm(email_text, attachments_text)
        return cleanup_and_return({
            "message": response,
        })
    except Exception as e:
        print("Request failed:", e)
        return jsonify({"error": str(e)}), 500



def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    text = ""
    with open(pdf_path, "rb") as f:
        reader = PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() if page.extract_text() else ""
    return text

def extract_zip(zip_path):
    """Extracts images from word/media/ and text from word/document.xml."""
    extract_dir = zip_path.replace(".zip", "_unzipped")

    extracted_data = {"text": "", "imageFiles": []}

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
        extracted_files = zip_ref.namelist()

    # Extract text from document.xml
    document_xml_path = os.path.join(extract_dir, "word", "document.xml")
    if os.path.exists(document_xml_path):
        extracted_data["text"] = extract_text_from_xml(document_xml_path)

    # Extract images from word/media/
    media_folder = os.path.join(extract_dir, "word", "media")
    if os.path.exists(media_folder):
        for file_name in os.listdir(media_folder):
            file_path = os.path.join(media_folder, file_name)
            new_image_path = os.path.join("images", file_name)
            shutil.move(file_path, new_image_path)  # Move image to images folder
            extracted_data["imageFiles"].append(new_image_path)

    print(f"Extracted ZIP contents: {extracted_data}")

    # Delete the extracted files after processing
    shutil.rmtree(extract_dir, ignore_errors=True)

    return extracted_data["text"]


def extract_text_from_xml(xml_path):
    """Extracts and cleans text from a Word document.xml file."""
    from xml.etree import ElementTree as ET

    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # Extract text from all <w:t> tags
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text_elements = root.findall('.//w:t', namespaces)

        extracted_text = " ".join([elem.text for elem in text_elements if elem.text])
        return extracted_text.strip()
    except Exception as e:
        print(f"Error extracting text from XML: {e}")
        return ""


def cleanup_and_return(response):
    """Cleans up uploaded files and returns response."""
    # shutil.rmtree(UPLOAD_DIR)
    # os.makedirs(UPLOAD_DIR, exist_ok=True)
    return response


if __name__ == '__main__':
    app.run(debug=True, port=5000)
