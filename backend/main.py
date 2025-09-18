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
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# The ONLY change is adding Kannada ('kn') to this dictionary.
LANGUAGE_MAP = {
    "en": {"name": "English", "tts_code": "en"},
    "hi": {"name": "Hindi", "tts_code": "hi"},
    "te": {"name": "Telugu", "tts_code": "te"},
    "kn": {"name": "Kannada", "tts_code": "kn"},
}

def get_tts_audio_from_text(text: str, lang_code: str):
    if not text or not text.strip(): return None
    encoded_text = quote(text)
    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded_text}&tl={lang_code}&client=tw-ob"
    response = requests.get(tts_url)
    response.raise_for_status()
    return response.content

def robust_chunk_splitter(text: str, chunk_size: int = 180):
    sentences = re.split(r'(?<=[.!?।])\s+', text)
    chunks = []
    for s in sentences:
        if len(s) <= chunk_size: chunks.append(s)
        else:
            sub_s = s.split(','); curr_chunk = ""
            for i, p in enumerate(sub_s):
                p_with_comma = p + ("," if i < len(sub_s) - 1 else "")
                if len(curr_chunk) + len(p_with_comma) <= chunk_size: curr_chunk += p_with_comma
                else: chunks.append(curr_chunk.strip()); curr_chunk = p_with_comma
            if curr_chunk.strip(): chunks.append(curr_chunk.strip())
    return [c.strip() for c in chunks if c.strip()]

def get_weather_forecast(lat: str, lon: str):
    if not OPENWEATHER_API_KEY: return "Weather data is unavailable."
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        response = requests.get(url); response.raise_for_status(); data = response.json()
        description = data['weather'][0]['description']; temp = data['main']['temp']
        return f"Current weather is {description} with a temperature of {temp}°C."
    except Exception as e:
        print(f"Weather API error: {e}"); return "Could not retrieve weather data."

@app.get("/get-location-name")
async def get_location_name(lat: str, lon: str):
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    headers = {'User-Agent': 'AgroHelpApp/1.0'}
    try:
        response = requests.get(url, headers=headers); response.raise_for_status(); data = response.json()
        city = data.get('address', {}).get('city') or data.get('address', {}).get('town') or data.get('address', {}).get('village') or ""
        state = data.get('address', {}).get('state') or ""
        location_name = f"{city}, {state}".strip(", "); return {"locationName": location_name}
    except Exception as e:
        print(f"Reverse geocoding failed: {e}"); return {"locationName": ""}

@app.get("/test-weather")
async def test_weather(lat: str, lon: str):
    weather_summary = get_weather_forecast(lat, lon); return {"weather_summary": weather_summary}

def clean_text_for_speech(text: str):
    text = text.replace("**", ""); text = text.replace("*", ""); text = text.replace("##", ""); text = text.replace("#", "")
    return text

@app.post("/predict")
async def predict(
    text: str = Form(""), 
    file: Optional[UploadFile] = File(None),
    language: str = Form("en"),
    lat: Optional[str] = Form(None),
    lon: Optional[str] = Form(None)
):
    try:
        language_info = LANGUAGE_MAP.get(language, LANGUAGE_MAP["en"])
        language_name = language_info["name"]
        weather_context = get_weather_forecast(lat, lon) if lat and lon else ""
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        
        if file and file.filename and file.size > 0:
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
            prompt = f"""You are an expert agricultural assistant for Indian farmers.
            CONTEXT: The user is located where the {weather_context}.
            USER'S QUESTION: "{text if text else 'Please analyze this image.'}"
            Analyze the provided image and the user's question. Your tasks: 
            1. Identify the plant and the disease. 
            2. Provide a simple explanation. 
            3. List one organic and one chemical treatment. 
            IMPORTANT: Your advice MUST consider the weather context. For example, warn against spraying pesticides if rain is expected.
            Use short, simple sentences and Markdown formatting. Respond ONLY in the {language_name} language."""
            response = model.generate_content([prompt, image])
        else:
            if not text: return {"analysis": "Please ask a question or upload an image.", "audioContent": None}
            prompt = f"""You are an expert agricultural assistant for Indian farmers.
            CONTEXT: The user is located where the {weather_context}.
            USER'S QUESTION: "{text}"
            Provide a helpful, concise answer. Your advice MUST consider the weather context. 
            Use short, simple sentences and Markdown formatting. Respond ONLY in the {language_name} language."""
            response = model.generate_content(prompt)
        
        analysis_text = response.text
        clean_text = clean_text_for_speech(analysis_text)
        chunks = robust_chunk_splitter(clean_text)
        combined_audio = AudioSegment.empty()
        for chunk in chunks:
            audio_content = get_tts_audio_from_text(text=chunk, lang_code=language_info["tts_code"])
            if audio_content:
                sentence_audio = AudioSegment.from_file(io.BytesIO(audio_content), format="mp3")
                combined_audio += sentence_audio

        final_audio_file = io.BytesIO()
        audio_base64 = None
        if len(combined_audio) > 0:
            combined_audio.export(final_audio_file, format="mp3")
            final_audio_file.seek(0)
            audio_base64 = base64.b64encode(final_audio_file.read()).decode("utf-8")

        return {"analysis": analysis_text, "audioContent": audio_base64}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": f"An unexpected error occurred: {e}"}

@app.get("/")
def read_root():
    return {"message": "Welcome!"}

