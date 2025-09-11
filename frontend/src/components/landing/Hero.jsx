import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Leaf } from "lucide-react";

export default function Hero({ onCTA }) {
  const { t } = useTranslation();
  const rotatingTexts = t("rotatingTexts", { returnObjects: true }) || [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

  return (
    <section className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden px-6 pt-20 bg-gradient-to-b from-green-50 via-white to-green-100 bg-[length:300%_300%] animate-gradient-bg">
      
      {/* NEW: The farmer illustration is now restored */}
      <motion.img
        src="/farm-illustration.svg"
        alt="A farmer illustration in a field"
        className="absolute top-0 left-0 w-full min-h-screen object-cover opacity-30 pointer-events-none"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: [30, 0, 30], opacity: 0.5 }}
        transition={{ 
          opacity: { duration: 1.5, ease: "easeOut" },
          y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
        }}
      />

      <motion.h1
        className="text-5xl md:text-7xl font-extrabold text-gray-800 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <span className="text-gray-800">{t("heroPrefix")}</span>
        <span className="bg-gradient-to-r from-green-600 via-lime-500 to-green-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-x">
          {t("appTitle")}
        </span>
      </motion.h1>

      <p className="mt-6 text-lg md:text-xl text-gray-600 relative z-10">
        {t("appSubtitle")}
      </p>

      <div className="h-8 mt-2 relative z-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8 }}
            className="text-lg md:text-xl text-green-700 font-medium"
          >
            {rotatingTexts[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-8 relative z-10">
        <button
          onClick={onCTA}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-lime-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform animate-pulse"
        >
          {t("tryCTA")}
        </button>
      </div>

      {[
        { top: 15, left: 10, size: 50, duration: 6, color: "text-green-400" },
        { bottom: 32, right: 16, size: 70, duration: 8, color: "text-green-300" },
        { top: 40, right: 20, size: 40, duration: 10, color: "text-green-500" },
      ].map((leaf, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${leaf.color} pointer-events-none`}
          animate={{ y: [0, -20, 0], rotate: [0, 15, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: leaf.duration }}
          style={{
            top: leaf.top ? `${leaf.top}vh` : undefined,
            bottom: leaf.bottom ? `${leaf.bottom}px` : undefined,
            left: leaf.left ? `${leaf.left}px` : undefined,
            right: leaf.right ? `${leaf.right}px` : undefined,
          }}
        >
          <Leaf size={leaf.size} />
        </motion.div>
      ))}
    </section>
  );
}

