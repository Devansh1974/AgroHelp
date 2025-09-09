// src/components/ChatMessage.jsx

// NEW: We no longer need useLanguage here, as the audio is pre-rendered by the backend.
import { User, Sparkles, Volume2 } from "lucide-react";
import { useState } from "react";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";
  // NEW: Changed state name for clarity
  const [isPlaying, setIsPlaying] = useState(false);

  // NEW: This function is now a simple "Replay" button.
  // It plays the audio file that we have already received from the backend.
  const handleReplay = () => {
    // Check if there's audio data in the message object
    if (message.audio) {
      const audio = new Audio(message.audio);
      
      // Update our button's state based on audio events for visual feedback
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false); // Handle potential errors
      
      audio.play();
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
        <p className="text-gray-800" style={{ whiteSpace: "pre-wrap" }}>
          {message.text}
        </p>

        {/* NEW: The "Listen/Replay" button now only appears if the message object has audio */}
        {!isUser && message.audio && (
          <div className="mt-3">
            <button
              onClick={handleReplay}
              className={`flex items-center gap-2 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-200 ${
                isPlaying ? "bg-green-200 text-green-800" : ""
              }`}
            >
              <Volume2 size={16} />
              <span>{isPlaying ? "Playing..." : "Listen"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

