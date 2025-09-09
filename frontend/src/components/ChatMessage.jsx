// src/components/ChatMessage.jsx

// NEW: We now import the central audio controller and translation hooks
import { User, Sparkles, Volume2, Play, Pause } from "lucide-react";
import { useAudio } from "../context/AudioContext";
import { useTranslation } from "react-i18next";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";
  // NEW: Get the central audio player's state and controls from the context
  const { isPlaying, currentTrackSrc, playPause } = useAudio();
  const { t } = useTranslation();

  // NEW: This variable checks if THIS specific message is the one currently playing
  // in the central audio player. This is the key to synchronizing the button.
  const isThisMessagePlaying = isPlaying && currentTrackSrc === message.audio;

  // The button's only job is to tell the central player to play/pause THIS message's audio
  const handlePlayPauseClick = () => {
    if (message.audio) {
      playPause(message.audio);
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

        {/* The button now uses the central player's state for its appearance and actions */}
        {!isUser && message.audio && (
          <div className="mt-3">
            <button
              onClick={handlePlayPauseClick}
              className={`flex items-center gap-2 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-200 ${
                isThisMessagePlaying ? "bg-green-200 text-green-800" : ""
              }`}
            >
              {/* The icon and text are now perfectly in sync with the central player */}
              {isThisMessagePlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isThisMessagePlaying ? t("pause") : t("play")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

