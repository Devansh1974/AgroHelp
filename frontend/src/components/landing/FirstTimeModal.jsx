import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "react-i18next";

export default function FirstTimeModal() {
  const { language, setLanguage } = useLanguage();
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
          const res = await fetch(`http://127.0.0.1:8000/get-location-name?lat=${latitude}&lon=${longitude}`);
          
          if (!res.ok) {
            throw new Error('Backend responded with an error');
          }

          const data = await res.json();
          const name = data.locationName;

          if (name) {
            setLocationName(name);
          }
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

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">{t("languagePrompt")}</h3>
        <select value={language} onChange={handleLanguageChange} className="w-full border rounded p-2 mb-4">
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="te">తెలుగు</option>
          <option value="kn">ಕನ್ನಡ</option>
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

