import React from "react";
// NEW: Re-import the 'motion' component from framer-motion
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  CloudSun,
  LineChart,
  ShoppingCart,
} from "lucide-react";

export default function Features() {
  const { t } = useTranslation();
  
  const features = [
    { icon: Sprout, title: t("cropHealthTitle"), desc: t("cropHealthDesc") },
    { icon: CloudSun, title: t("weatherTitle"), desc: t("weatherDesc") },
    { icon: LineChart, title: t("marketTitle"), desc: t("marketDesc") },
    { icon: ShoppingCart, title: t("marketplaceTitle"), desc: t("marketplaceDesc") },
  ];

  return (
    <section id="features" className="pt-20 pb-16 px-6 bg-white">
      <h2 className="text-5xl font-bold text-center text-gray-800">
        {t("whyChoose")} <span className="text-green-600">{t("appTitle")}?</span>
      </h2>
      <div className="mt-12 pt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {features.map(({ icon: Icon, title, desc }, i) => (
          // NEW: We've changed the <div> back to a <motion.div> and added the animation props.
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl shadow-md hover:shadow-lg transition bg-gradient-to-br from-green-50 to-lime-50"
          >
            <Icon className="w-10 h-10 text-green-700 mb-4" />
            <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
            <p className="mt-2 text-gray-600 text-sm">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

