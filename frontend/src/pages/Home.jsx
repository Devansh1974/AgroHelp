// src/pages/Home.jsx

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";
import { Menu, Leaf } from "lucide-react";
import LanguageSelector from "../components/LanguageSelector";
import { useAudio } from "../context/AudioContext";
import AudioToggle from "../components/AudioToggle";
import LocationDisplay from "../components/LocationDisplay";

function ChatHeader({ onMenuClick }) {
  const { t } = useTranslation();
  return (
    // The header is now explicitly told not to shrink, which is important for the layout
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white/70 backdrop-blur-md flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-full hover:bg-gray-200 flex-shrink-0">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Leaf className="text-green-600" size={28} />
          <span className="font-bold text-xl text-green-700 truncate">{t("appTitle")}</span>
        </div>
      </div>
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

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { language } = useLanguage();
  const { t, i18n } = useTranslation();
  const { isAutoplayEnabled, playPause } = useAudio();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleSend = async (message) => {
    // This function's logic is correct and does not need to change.
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
      
      {/* NEW: This main content column now has a defined height (`h-full`) 
          which is the key to fixing mobile scroll. */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* The header remains unchanged */}
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* NEW: The main chat area is the only part that will grow and scroll */}
        <main className="flex-1 overflow-y-auto p-2 md:p-4">
          {messages.length > 0 && (
            <div>
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="h-full flex items-center justify-center">
              <h1 className="text-2xl text-gray-400 text-center">{t("appSubtitle")}</h1>
            </div>
          )}

          {isLoading && (
            <div className="p-4 text-center text-gray-500">{t("aiIsThinking")}</div>
          )}

          {error && !isLoading && (
            <div className="p-4 text-center text-red-500 font-bold">{error}</div>
          )}
          
          {/* This invisible element is the anchor for our auto-scroll */}
          <div ref={messagesEndRef} />
        </main>
        
        {/* NEW: The input area is also explicitly told not to shrink */}
        <div className="p-4 bg-transparent flex-shrink-0">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

