// src/components/ChatMessage.jsx

import { User, Sparkles } from "lucide-react";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";

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
      </div>
    </div>
  );
}