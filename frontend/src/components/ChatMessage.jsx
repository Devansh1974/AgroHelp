// NEW: Import the speaker icon, and hooks for state and language context
import { User, Sparkles, Volume2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";
  // NEW: Get the current language from our context to speak in the correct voice
  const { language } = useLanguage();
  // NEW: State to track if the message is currently being spoken
  const [isSpeaking, setIsSpeaking] = useState(false);

  // NEW: This function handles the Text-to-Speech logic
  const handleSpeak = () => {
    // Cancel any speech that is currently happening
    window.speechSynthesis.cancel();

    // If the button is clicked while speaking, just stop it.
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Create a new speech request
    const utterance = new SpeechSynthesisUtterance(message.text);

    // Map our app's language codes to the codes the browser's speech API expects
    const langMap = {
      en: "en-US",
      hi: "hi-IN",
      te: "te-IN",
    };
    utterance.lang = langMap[language] || "en-US"; // Default to English if mapping not found

    // These events update our component's state
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Tell the browser to speak the text
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex gap-4 p-4 ${isUser ? "" : "bg-gray-100"}`}>
      {/* Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-gray-300" : "bg-green-500 text-white"
        }`}
      >
        {isUser ? <User size={18} /> : <Sparkles size={18} />}
      </div>

      {/* Message Content */}
      <div className="flex-1">
        {message.image && (
          <img
            src={message.image}
            alt="user upload"
            className="max-w-xs rounded-lg mb-2 border"
          />
        )}
        <p className="text-gray-800" style={{ whiteSpace: "pre-wrap" }}>
          {message.text}
        </p>

        {/* NEW: The "Listen" button, which only appears for AI messages */}
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
