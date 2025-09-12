// src/components/ChatMessage.jsx

import { User, Sparkles, Volume2, Play, Pause, Copy } from "lucide-react";
import { useAudio } from "../context/AudioContext";
import { useTranslation } from "react-i18next";
import { useTyping } from "../hooks/useTyping";
import ReactMarkdown from "react-markdown";
// NEW: We now need the useEffect hook
import { useState, useEffect } from "react";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";
  const { isPlaying, currentTrackSrc, playPause } = useAudio();
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const typedText = useTyping(isUser ? "" : message.text, 30);
  
  // NEW: We now use a dedicated state variable for typing completion
  // This is more reliable than calculating it on every render.
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // NEW: This effect hook reliably detects when the typing is finished.
  useEffect(() => {
    // When the length of the displayed text matches the full message,
    // we set the completion state to true.
    if (typedText.length === message.text.length && message.text.length > 0) {
      setIsTypingComplete(true);
    } else {
      setIsTypingComplete(false);
    }
  }, [typedText, message.text]); // This runs every time the typedText changes

  const isThisMessagePlaying = isPlaying && currentTrackSrc === message.audio;

  const handlePlayPauseClick = () => {
    if (message.audio) {
      playPause(message.audio);
    }
  };

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-gray-300 order-2" : "bg-green-500 text-white"
        }`}
      >
        {isUser ? <User size={18} /> : <Sparkles size={18} />}
      </div>

      <div
        className={`flex flex-col p-3 rounded-2xl max-w-lg ${
          isUser ? "bg-green-100 order-1" : "bg-white border"
        }`}
      >
        {message.image && (
          <img
            src={message.image}
            alt="user upload"
            className="w-full max-w-xs rounded-lg mb-2 border"
          />
        )}
        
        <div className="prose prose-sm max-w-none text-gray-800">
          <ReactMarkdown>
            {isUser ? message.text : typedText}
          </ReactMarkdown>
        </div>

        {!isUser && message.text && (
          <div className="mt-3 flex items-center gap-2">
            {message.audio && (
              <button
                onClick={handlePlayPauseClick}
                className={`flex items-center gap-2 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-200 ${
                  isThisMessagePlaying ? "bg-green-200 text-green-800" : ""
                }`}
              >
                {isThisMessagePlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isThisMessagePlaying ? t("pause") : t("play")}</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              // NEW: The button is now disabled based on our new, reliable state variable
              disabled={!isTypingComplete}
              className="flex items-center gap-2 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy size={16} />
              <span>{isCopied ? t("copied") : t("copy")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

