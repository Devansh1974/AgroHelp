import { useState, useRef } from "react";
import { Image, Mic, Send } from "lucide-react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  // Voice input using Web Speech API
  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.lang = "en-IN"; // later dynamically change with language
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        setText(event.results[0][0].transcript);
      };
      recognitionRef.current.onerror = (err) => {
        console.error("Speech recognition error", err);
        setListening(false);
      };
      recognitionRef.current.onend = () => setListening(false);
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // Send message
  const handleSend = () => {
    if (!text.trim() && !image) {
      alert("Please enter text or upload an image.");
      return;
    }

    const message = {
      text,
      image,
    };

    onSend(message);
    setText("");
    setImage(null);
  };

  return (
    <div className="flex items-center gap-2 border-t bg-white p-3">
      {/* Image Upload */}
      <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200">
        <Image size={20} />
        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </label>

      {/* Preview selected image */}
      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="preview"
          className="w-10 h-10 rounded-lg object-cover border"
        />
      )}

      {/* Text Input */}
      <textarea
        rows="1"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 resize-none border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {/* Mic Button */}
      <button
        onClick={handleMicClick}
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          listening ? "bg-red-200" : "bg-gray-100"
        } hover:bg-green-200`}
      >
        <Mic size={20} />
      </button>

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
        disabled={!text.trim() && !image}
      >
        <Send size={20} />
      </button>
    </div>
  );
}
