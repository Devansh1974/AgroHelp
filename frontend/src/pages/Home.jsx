// src/pages/Home.jsx

import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LanguageSelector from "../components/LanguageSelector";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage"; // We will use this new component

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    // The backend expects a file, so we must send one.
    // We send the image if available, otherwise an empty placeholder.
    if (message.image) {
      formData.append("file", message.image);
    } else {
      // Create a dummy empty file if no image is selected
      const emptyFile = new Blob([""], { type: "image/png" });
      formData.append("file", emptyFile, "empty.png");
    }
    formData.append("text", message.text);


    try {
      // Call your Python backend API
      const response = await axios.post("http://127.0.0.1:8000/predict", formData);

      const aiResponseText = response.data.analysis || response.data.error || "Sorry, I couldn't get a response.";

      // Display the AI's response
      const aiMessage = {
        sender: "ai",
        text: aiResponseText,
      };
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col relative"> {/* Added relative positioning */}
          
          {/* Language selector stays at the top right */}
          <div className="absolute top-0 right-0 p-4 z-10">
             <LanguageSelector />
          </div>

          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex items-center justify-center">
                <Header />
              </div>
            )}
            
            {/* Render the chat messages */}
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            
            {/* Show a loading indicator */}
            {isLoading && (
              <div className="p-4 text-center text-gray-500">
                AI is thinking...
              </div>
            )}
            
            {/* Show an error message if one exists */}
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