// NEW: Import the i18next hook for translations
import { useTranslation } from "react-i18next";

export default function Header() {
  // NEW: Get the translation function `t`
  const { t } = useTranslation();

  return (
    <div className="text-center">
      {/* NEW: Use the t() function with the key 'appTitle' from your JSON files */}
      <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
        {t("appTitle")}
      </h1>
      <p className="text-lg text-gray-600 mt-2">
        {t("appSubtitle")}
      </p>
    </div>
  );
}
