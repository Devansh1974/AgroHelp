import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";

export default function Header() {
  const { language } = useLanguage();
  const text = translations[language];

  return (
    <h1 className="text-4xl md:text-6xl font-bold">
      {text}
    </h1>
  );
}
