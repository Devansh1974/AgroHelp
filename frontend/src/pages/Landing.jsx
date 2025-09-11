import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

// NEW: We will import each section from its own dedicated file
import Header from "../components/landing/Header";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import FirstTimeModal from "../components/landing/FirstTimeModal";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  // This hook ensures the i18next instance is updated when the page loads
  useEffect(() => {
    const savedLang = localStorage.getItem("agro_lang");
    if (savedLang) {
      setLanguage(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, [setLanguage, i18n]);

  const handleTry = () => {
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <FirstTimeModal />
      <Header onCTA={handleTry} />
      <main className="flex-1">
        <Hero onCTA={handleTry} />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

