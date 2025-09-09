import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
import io
from typing import Optional # NEW: Import Optional for optional parameters

load_dotenv()

# 1. Initialize the FastAPI application
app = FastAPI(title="Farmer AI Assistant API (using Gemini)")

# 2. Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Configure the Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# A dictionary to map language codes to full names for the AI
LANGUAGE_MAP = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
}

# 4. Create the main prediction endpoint
@app.post("/predict")
# NEW: The file is now optional (File(None))
async def predict(
    text: str = Form(""),
    file: Optional[UploadFile] = File(None),
    language: str = Form("en"),
):
    """
    Receives text, an OPTIONAL image, and language, then returns a helpful advisory.
    """
    try:
        language_name = LANGUAGE_MAP.get(language, "English")
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        prompt = ""
        image = None
        
        # NEW: Check if a file with content was actually sent
        if file and file.size > 0:
            # This is the logic for when an IMAGE IS INCLUDED
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))

            prompt = f"""You are an expert agricultural assistant for Indian farmers.
            Carefully analyze the provided image of a plant leaf in the context of the user's question.

            User's question: "{text if text else 'Please analyze this image.'}"

            Your tasks:
            1. First, identify the plant and the disease you see. If it's healthy, say so.
            2. Based on the user's question and the image, provide a helpful and simple explanation.
            3. Provide a numbered list with two treatment options: one organic and one chemical.
            4. Keep the entire response concise and easy for a farmer to read.

            IMPORTANT: Respond ONLY in the {language_name} language.
            """
            # The content for a multimodal prompt is a list
            content = [prompt, image]
            response = model.generate_content(content)
        else:
            # This is the logic for TEXT-ONLY CHAT
            if not text:
                return {"analysis": "Please ask a question or upload an image."}

            prompt = f"""You are an expert agricultural assistant for Indian farmers. The user has a question.

            User's question: "{text}"

            Your task is to provide a helpful, concise, and easy-to-understand answer.

            IMPORTANT: Respond ONLY in the {language_name} language.
            """
            # The content for a text-only prompt is just the string
            content = prompt
            response = model.generate_content(content)

        return {"analysis": response.text}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": f"An unexpected error occurred: {e}"}


@app.get("/")
def read_root():
    return {"message": "Welcome! The Gemini Vision API is ready. Go to /docs to test."}