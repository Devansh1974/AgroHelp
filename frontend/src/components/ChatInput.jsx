import { useState, useRef, useEffect } from "react";
import { Image, Mic, Send, X, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

export default function ChatInput({ onSend }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  // This cleanup effect ensures recognition is stopped if the component unmounts
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert(t("alertNoMicSupport"));
      return;
    }

    if (listening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      return;
    }
    
    const langMap = { 
      en: "en-IN", 
      hi: "hi-IN", 
      te: "te-IN",
      kn: "kn-IN" 
    };
    
    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = langMap[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setText(spokenText);
      const message = { text: spokenText, image: null };
      onSend(message);
      setText("");
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error", err);
    };
    
    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    setListening(true);
  };

  const handleSend = () => {
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
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-4 bg-white border rounded-2xl shadow-lg hover:bg-green-50 transition-colors"
        >
          <Camera size={28} className="text-green-600 mb-1" />
          <span className="font-semibold text-gray-700">{t("uploadPhoto")}</span>
        </button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          onClick={handleMicClick}
          className={`flex flex-col items-center justify-center p-4 bg-white border rounded-2xl shadow-lg hover:bg-green-50 transition-colors ${
            listening ? "ring-2 ring-red-500" : ""
          }`}
        >
          <Mic size={28} className={`mb-1 ${listening ? "text-red-500" : "text-green-600"}`} />
          <span className={`font-semibold ${listening ? "text-red-500 animate-pulse" : "text-gray-700"}`}>
            {listening ? t("listening") : t("askWithVoice")}
          </span>
        </button>
      </div>
      <div className="relative flex flex-col gap-2">
        {image && (
          <div className="relative w-16 h-16 ml-2 mb-2">
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
        <div className="flex items-end gap-1 bg-white p-2 border rounded-xl shadow-lg">
          <textarea
            ref={textareaRef}
            rows="1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("chatPlaceholder")}
            className="flex-1 resize-none border-none focus:ring-0 bg-transparent py-1 px-2 max-h-24 overflow-y-auto placeholder:text-gray-400"
          />
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

