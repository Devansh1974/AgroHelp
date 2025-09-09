// src/pages/Home.jsx

// NEW: We need `useState` to manage the sidebar's mobile state
import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react"; // NEW: Import the Menu icon for the hamburger button

// NEW: We'll create a dedicated ChatHeader component for a cleaner structure
function ChatHeader({ onMenuClick }) {
  const { t } = useTranslation();
  return (
    <header className="flex items-center p-4 border-b bg-white/50 backdrop-blur-sm">
      {/* NEW: This is the hamburger menu button. 'lg:hidden' makes it appear ONLY on mobile */}
      <button onClick={onMenuClick} className="lg:hidden mr-4 p-2 rounded-full hover:bg-gray-200">
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-semibold text-gray-800">{t("appTitle")}</h1>
    </header>
  );
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // NEW: State to control the sidebar visibility on mobile
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const { language } = useLanguage();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleSend = async (message) => {
    // ... (This function's logic does not need to change, so it's omitted for brevity)
    // Immediately display the user's message for a snappy UI
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
    // NEW: We add 'relative' and 'overflow-hidden' to the main container
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* The Sidebar component will be updated next */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      {/* NEW: This is the main content area that now fills the screen */}
      <div className="flex flex-col flex-1">
        {/* NEW: The ChatHeader is now a permanent part of the layout */}
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* NEW: The chat area now scrolls independently */}
        <main className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex items-center justify-center">
              {/* This can be a welcome message or your old Header component */}
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

        {/* NEW: The ChatInput is now "stuck" to the bottom */}
        <div className="p-4 bg-gray-50">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

