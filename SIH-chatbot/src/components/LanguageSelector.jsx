import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="absolute top-4 right-4">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 bg-white"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="ta">தமிழ்</option>
        <option value="te">తెలుగు</option>
        <option value="ml">മലയാളം</option>
        <option value="kn">ಕನ್ನಡ</option>
      </select>
    </div>
  );
}
