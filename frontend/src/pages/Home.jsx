// src/pages/Home.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
// NEW: Import the LanguageSelector to use it in the header
import LanguageSelector from "../components/LanguageSelector";

// NEW: The ChatHeader component is now updated to include the LanguageSelector
function ChatHeader({ onMenuClick }) {
  const { t } = useTranslation();
  return (
    // Use justify-between to push items to opposite ends
    <header className="flex items-center justify-between p-4 border-b bg-white/50 backdrop-blur-sm">
      {/* Left side of the header */}
      <div className="flex items-center">
        <button onClick={onMenuClick} className="lg:hidden mr-4 p-2 rounded-full hover:bg-gray-200">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{t("appTitle")}</h1>
      </div>
      
      {/* Right side of the header */}
      <div>
        <LanguageSelector />
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

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleSend = async (message) => {
    // ... (This function's logic does not need to change, so it's omitted for brevity)
    const userMessage = {
      sender: "user",
      text: message.text,
      image: message.image ? URL.createObjectURL(message.image) : null,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    if (message.image) {
      formData.append("file", message.image);
    } else {
      const emptyFile = new Blob([""], { type: "image/png" });
      formData.append("file", emptyFile, "empty.png");
    }
    formData.append("text", message.text);
    formData.append("language", language);

    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", formData);
      const aiResponseText = response.data.analysis || response.data.error || "Sorry, I couldn't get a response.";
      const aiMessage = { sender: "ai", text: aiResponseText };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (err) {
      const errorMessage = "Connection Error: Could not reach the backend. Is it running?";
      setError(errorMessage);
      setMessages((prev) => [...prev, { sender: "ai", text: errorMessage }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex items-center justify-center">
              <h1 className="text-2xl text-gray-400">{t("appSubtitle")}</h1>
            </div>
          )}

          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}

          {isLoading && (
            <div className="p-4 text-center text-gray-500">{t("aiIsThinking")}</div>
          )}

          {error && !isLoading && (
            <div className="p-4 text-center text-red-500 font-bold">{error}</div>
          )}
        </main>

        <div className="p-4 bg-gray-50">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

