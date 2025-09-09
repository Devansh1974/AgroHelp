// src/components/ChatMessage.jsx

import { User, Sparkles, Volume2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";
  const { language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    const langMap = {
      en: "en-US",
      hi: "hi-IN",
      te: "te-IN",
    };
    utterance.lang = langMap[language] || "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    // NEW: Main container now aligns the entire message to the start (left) or end (right)
    <div className={`flex items-start gap-3 my-4 ${isUser ? "justify-end" : "justify-start"}`}>
      
      {/* Icon */}
      {/* NEW: Use 'order-2' for user to place the icon after the message bubble */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-gray-300 order-2" : "bg-green-500 text-white"
        }`}
      >
        {isUser ? <User size={18} /> : <Sparkles size={18} />}
      </div>

      {/* NEW: This is the main content bubble */}
      <div
        className={`flex flex-col p-3 rounded-2xl max-w-lg ${
          isUser 
            ? "bg-green-100 order-1" // User messages have a green background
            : "bg-white border"      // AI messages have a white background with a border
        }`}
      >
        {message.image && (
          <img
            src={message.image}
            alt="user upload"
            className="w-full max-w-xs rounded-lg mb-2 border"
          />
        )}
        <p className="text-gray-800" style={{ whiteSpace: "pre-wrap" }}>
          {message.text}
        </p>

        {/* The "Listen" button, which only appears for AI messages */}
        {!isUser && message.text && (
          <div className="mt-3">
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-2 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-200 ${
                isSpeaking ? "bg-green-200 text-green-800" : ""
              }`}
            >
              <Volume2 size={16} />
              <span>{isSpeaking ? "Listening..." : "Listen"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
