// src/pages/Home.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";
import { Menu, Leaf } from "lucide-react";
// We no longer import LanguageSelector here, as it lives in the Sidebar
import { useAudio } from "../context/AudioContext";
import AudioToggle from "../components/AudioToggle";
import LocationDisplay from "../components/LocationDisplay";

// This is the final, simplified header.
function ChatHeader({ onMenuClick }) {
  const { t } = useTranslation();
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white/70 backdrop-blur-md">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-full hover:bg-gray-200 flex-shrink-0">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Leaf className="text-green-600" size={28} />
          <span className="font-bold text-xl text-green-700 truncate">{t("appTitle")}</span>
        </div>
      </div>
      
      {/* The right side now ONLY has the location and mute/unmute toggle */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full py-1 px-2 shadow-sm flex-shrink-0">
        <div className="flex items-center max-w-[100px] sm:max-w-[150px] truncate">
          <LocationDisplay />
        </div>
        <div className="h-5 w-px bg-gray-300 mx-1 hidden sm:block"></div>
        <div className="flex items-center">
          <AudioToggle />
        </div>
      </div>
    </header>
  );
}

// The rest of your Home component does not need to change.
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { language } = useLanguage();
  const { t, i18n } = useTranslation();
  const { isAutoplayEnabled, playPause } = useAudio();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleSend = async (message) => {
    const userMessage = { sender: "user", text: message.text, image: message.image ? URL.createObjectURL(message.image) : null };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError("");
    const formData = new FormData();
    if (message.image) { formData.append("file", message.image); } 
    else { const emptyFile = new Blob([""], { type: "image/png" }); formData.append("file", emptyFile, "empty.png"); }
    formData.append("text", message.text);
    formData.append("language", language);
    const savedCoords = localStorage.getItem("agro_coords");
    if (savedCoords) {
      try { const coords = JSON.parse(savedCoords); formData.append("lat", coords.latitude); formData.append("lon", coords.longitude); } 
      catch (e) { console.error("Could not parse coordinates from localStorage:", e); }
    }
    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", formData);
      const aiResponseText = response.data.analysis || response.data.error || "Sorry, I couldn't get a response.";
      const audioContent = response.data.audioContent;
      const aiMessage = { sender: "ai", text: aiResponseText, audio: audioContent ? "data:audio/mp3;base64," + audioContent : null };
      setMessages((prev) => [...prev, aiMessage]);
      if (isAutoplayEnabled && aiMessage.audio) { playPause(aiMessage.audio); }
    } catch (err) {
      const errorMessage = "Connection Error: Could not reach the backend. Is it running?";
      setError(errorMessage);
      setMessages((prev) => [...prev, { sender: "ai", text: errorMessage, audio: null }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 flex flex-col overflow-y-auto p-2 md:p-4">
          <div className="flex-grow flex flex-col justify-start">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
          </div>
          {messages.length === 0 && !isLoading && (
            <div className="flex-grow flex items-center justify-center">
              <h1 className="text-2xl text-gray-400 text-center">{t("appSubtitle")}</h1>
            </div>
          )}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">{t("aiIsThinking")}</div>
          )}
          {error && !isLoading && (
            <div className="p-4 text-center text-red-500 font-bold">{error}</div>
          )}
        </main>
        <div className="p-4 bg-transparent">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

