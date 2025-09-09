import { useState, useRef, useEffect } from "react";
// NEW: Import the X icon for the remove image button
import { Image, Mic, Send, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ChatInput({ onSend }) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  // NEW: Create a ref to access the textarea element directly
  const textareaRef = useRef(null);

  // NEW: This hook automatically adjusts the textarea's height as you type
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height to recalculate
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
    }
  }, [text]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleMicClick = () => {
    // ... (This function's logic is unchanged)
    if (!("webkitSpeechRecognition" in window)) {
      alert(t("alertNoMicSupport"));
      return;
    }
    if (!recognitionRef.current) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.lang = "en-IN";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => setText(event.results[0][0].transcript);
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

  const handleSend = () => {
    // ... (This function's logic is unchanged)
    if (!text.trim() && !image) {
      alert(t("alertNoInput"));
      return;
    }
    const message = { text, image };
    onSend(message);
    setText("");
    setImage(null);
  };

  return (
    // NEW: Redesigned container to create the floating "pill" effect
    <div className="max-w-4xl mx-auto">
      <div className="relative flex flex-col gap-2 bg-white p-3 border rounded-3xl shadow-lg">
        {/* NEW: Image preview now has a remove button */}
        {image && (
          <div className="relative w-20 h-20 ml-14 mb-2">
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="w-full h-full rounded-lg object-cover border"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main input row */}
        <div className="flex items-end gap-2">
          {/* Image Upload Button */}
          <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 flex-shrink-0">
            <Image size={20} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>

          {/* NEW: Textarea now uses the ref and has new styling for auto-resizing */}
          <textarea
            ref={textareaRef}
            rows="1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("chatPlaceholder")}
            className="flex-1 resize-none border-none focus:ring-0 bg-transparent p-2 max-h-48 overflow-y-auto"
          />

          {/* Mic Button */}
          <button
            onClick={handleMicClick}
            className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${
              listening ? "bg-red-200" : "bg-gray-100"
            } hover:bg-green-200`}
          >
            <Mic size={20} />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 flex-shrink-0"
            disabled={!text.trim() && !image}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

