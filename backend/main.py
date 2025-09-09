# main.py

import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
import io
import base64
import requests
from urllib.parse import quote
from typing import Optional

from pydub import AudioSegment
import re

load_dotenv()

app = FastAPI(title="Farmer AI Assistant API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

LANGUAGE_MAP = {
    "en": {"name": "English", "tts_code": "en"},
    "hi": {"name": "Hindi", "tts_code": "hi"},
    "te": {"name": "Telugu", "tts_code": "te"},
}

def get_tts_audio_from_text(text: str, lang_code: str):
    if not text or not text.strip():
        return None
    encoded_text = quote(text)
    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded_text}&tl={lang_code}&client=tw-ob"
    response = requests.get(tts_url)
    response.raise_for_status()
    return response.content

# NEW: A more advanced function to split text into smaller chunks for the TTS service.
def robust_chunk_splitter(text: str, chunk_size: int = 180):
    """Splits text into chunks small enough for TTS, respecting sentence and clause boundaries."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    chunks = []
    for sentence in sentences:
        if len(sentence) <= chunk_size:
            chunks.append(sentence)
        else:
            # If a sentence is too long, split it further by commas.
            sub_sentences = sentence.split(',')
            current_chunk = ""
            for i, part in enumerate(sub_sentences):
                part_with_comma = part + ("," if i < len(sub_sentences) - 1 else "")
                if len(current_chunk) + len(part_with_comma) <= chunk_size:
                    current_chunk += part_with_comma
                else:
                    chunks.append(current_chunk.strip())
                    current_chunk = part_with_comma
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
                
    return [c.strip() for c in chunks if c.strip()]

@app.post("/predict")
async def predict(
    text: str = Form(""), 
    file: Optional[UploadFile] = File(None),
    language: str = Form("en")
):
    try:
        language_info = LANGUAGE_MAP.get(language, LANGUAGE_MAP["en"])
        language_name = language_info["name"]
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        
        if file and file.filename and file.size > 0:
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
            prompt = f"""You are an expert agricultural assistant for Indian farmers. Analyze the provided image and the user's question. User's question: "{text if text else 'Please analyze this image.'}". Your tasks: 1. Identify the plant and disease. 2. Provide a simple explanation. 3. List one organic and one chemical treatment. Use short, simple sentences. IMPORTANT: Respond ONLY in the {language_name} language."""
            response = model.generate_content([prompt, image])
        else:
            if not text:
                return {"analysis": "Please ask a question or upload an image.", "audioContent": None}
            prompt = f"""You are an expert agricultural assistant for Indian farmers. The user's question is: "{text}". Provide a helpful, concise answer. Use short, simple sentences. IMPORTANT: Respond ONLY in the {language_name} language."""
            response = model.generate_content(prompt)
        
        analysis_text = response.text

        # NEW: Use our new robust chunk splitter
        chunks = robust_chunk_splitter(analysis_text)
        
        combined_audio = AudioSegment.empty()
        for chunk in chunks:
            audio_content = get_tts_audio_from_text(
                text=chunk, 
                lang_code=language_info["tts_code"]
            )
            if audio_content:
                sentence_audio = AudioSegment.from_file(io.BytesIO(audio_content), format="mp3")
                combined_audio += sentence_audio

        final_audio_file = io.BytesIO()
        if len(combined_audio) > 0:
            combined_audio.export(final_audio_file, format="mp3")
            final_audio_file.seek(0)
            audio_base64 = base64.b64encode(final_audio_file.read()).decode("utf-8")
        else:
            audio_base64 = None

        return {"analysis": analysis_text, "audioContent": audio_base64}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": f"An unexpected error occurred: {e}"}

@app.get("/")
def read_root():
    return {"message": "Welcome! The Gemini Vision API with free TTS is ready."}

