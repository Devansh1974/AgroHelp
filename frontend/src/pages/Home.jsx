// NEW: Import useEffect to handle side-effects like language changes
import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LanguageSelector from "../components/LanguageSelector";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";

// NEW: Import the hooks for language management
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // NEW: Get language state and translation functions
  const { language } = useLanguage(); // Gets current language code (e.g., "en", "hi")
  const { t, i18n } = useTranslation(); // Gets the translation function `t` and the i18next instance

  // NEW: This hook connects your language selector to the i18next library.
  // When you change the language in the dropdown, this code runs and updates the UI language.
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleSend = async (message) => {
    // Immediately display the user's message for a snappy UI
    const userMessage = {
      sender: "user",
      text: message.text,
      image: message.image ? URL.createObjectURL(message.image) : null,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError("");

    // Prepare the data to send to the backend
    const formData = new FormData();
    if (message.image) {
      formData.append("file", message.image);
    } else {
      const emptyFile = new Blob([""], { type: "image/png" });
      formData.append("file", emptyFile, "empty.png");
    }
    formData.append("text", message.text);

    // NEW: We now send the selected language to the backend
    formData.append("language", language);

    try {
      // Call your Python backend API
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData
      );

      const aiResponseText =
        response.data.analysis ||
        response.data.error ||
        "Sorry, I couldn't get a response.";

      // Display the AI's response
      const aiMessage = {
        sender: "ai",
        text: aiResponseText,
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (err) {
      const errorMessage =
        "Connection Error: Could not reach the backend. Is it running?";
      setError(errorMessage);
      setMessages((prev) => [...prev, { sender: "ai", text: errorMessage }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col relative">
          <div className="absolute top-0 right-0 p-4 z-10">
            <LanguageSelector />
          </div>

          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex items-center justify-center">
                <Header />
              </div>
            )}

            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}

            {isLoading && (
              <div className="p-4 text-center text-gray-500">
                {/* NEW: Translate the loading text */}
                {t("aiIsThinking")}
              </div>
            )}

            {error && !isLoading && (
              <div className="p-4 text-center text-red-500 font-bold">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="border-t">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
