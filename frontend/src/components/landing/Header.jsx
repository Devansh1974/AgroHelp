import React, { useState } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Header({ onCTA }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/30 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Leaf className="text-green-600" />
          <span className="font-bold text-xl text-green-700">{t("appTitle")}</span>
        </div>
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium"></nav>
        <button
          onClick={onCTA}
          className="hidden md:block px-5 py-2 rounded-xl bg-gradient-to-r from-green-600 to-lime-500 text-white font-semibold hover:opacity-90 transition"
        >
          {t("tryCTA")}
        </button>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md shadow-lg flex flex-col gap-4 px-6 py-6">
          <button onClick={onCTA} className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-600 to-lime-500 text-white font-semibold">
            {t("tryCTA")}
          </button>
        </div>
      )}
    </header>
  );
}
