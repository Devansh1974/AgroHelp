import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="absolute top-4 right-4 z-10">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="te">తెలుగు</option>
      </select>
    </div>
  );
}
