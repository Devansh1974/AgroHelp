import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "react-i18next";

export default function FirstTimeModal() {
  const { language, setLanguage } = useLanguage();
  // NEW: We need the i18n instance to change the language in real-time
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("agro_lang");
    if (!savedLang) {
      setOpen(true);
    }
  }, []);

  const askLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        localStorage.setItem("agro_coords", JSON.stringify({ latitude, longitude }));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || "";
          const state = data.address.state || "";
          setLocationName(`${city}, ${state}`.replace(/^,|,$/g, '')); 
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Location permission error:", err);
        setLoading(false);
      }
    );
  };

  const applyAndClose = () => {
    setOpen(false);
    localStorage.setItem("agro_lang", language);
  };

  // NEW: This function now handles both updating the state and changing the UI language
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang); // Update the context (and localStorage)
    i18n.changeLanguage(newLang); // Instantly change the language for the entire app
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">{t("languagePrompt")}</h3>
        {/* NEW: The select now uses the new handler */}
        <select value={language} onChange={handleLanguageChange} className="w-full border rounded p-2 mb-4">
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="te">తెలుగు</option>
        </select>
        <div className="mb-4">
          <p className="text-sm mb-2">{t("locationPrompt")}</p>
          <button onClick={askLocation} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
            {loading ? "Fetching..." : "Allow Location"}
          </button>
          {locationName && <p className="mt-2 text-xs text-gray-600">📍 {locationName}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={applyAndClose} className="px-4 py-2 bg-green-600 text-white rounded">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

