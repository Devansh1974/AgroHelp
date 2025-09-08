# main.py (Securely loading API key from .env file)

import os # Import the os library
from dotenv import load_dotenv # Import the load_dotenv function
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
import io

load_dotenv() # This line loads the variables from your .env file

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
#    --> The key is now loaded securely from the .env file <--
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# 4. Create the main prediction endpoint
@app.post("/predict")
async def predict(text: str = Form(""), file: UploadFile = File(...)):
    """
    Receives an image and a text query, sends them to the Gemini API,
    and returns a complete, helpful advisory.
    """
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        model = genai.GenerativeModel('gemini-1.5-flash-latest')

        prompt = f"""You are an expert agricultural assistant for Indian farmers.
        Carefully analyze the provided image of a plant leaf in the context of the user's question.

        User's question: "{text if text else 'Please analyze this image.'}"

        Your tasks:
        1. First, identify the plant and the disease you see. If it's healthy, say so.
        2. Based on the user's question and the image, provide a helpful and simple explanation.
        3. Provide a numbered list with two treatment options: one organic and one chemical.
        4. Keep the entire response concise and easy for a farmer to read.
        Respond ONLY in English.
        """

        response = model.generate_content([prompt, image])

        return {"analysis": response.text}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": f"An unexpected error occurred: {e}"}

@app.get("/")
def read_root():
    return {"message": "Welcome! The Gemini Vision API is ready. Go to /docs to test."}