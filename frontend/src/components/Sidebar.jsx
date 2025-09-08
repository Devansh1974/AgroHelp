import { Menu, PlusCircle, Search, MessageSquare } from "lucide-react";
import { useState } from "react";
// NEW: Import the hook to get the translation function
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  // NEW: Get the translation function `t` from the i18next library
  const { t } = useTranslation();

  return (
    <div
      className={`${
        open ? "w-64" : "w-16"
      } bg-green-200 border-r transition-all duration-300 flex flex-col`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="p-4 hover:bg-green-300"
      >
        <Menu />
      </button>

      <div className="flex-1 space-y-2 p-2">
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-300 w-full text-left">
          <PlusCircle size={20} /> 
          {/* NEW: Use the t() function to display translated text */}
          {open && t("newChat")}
        </button>
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-300 w-full text-left">
          <Search size={20} /> 
          {/* NEW: Use the t() function to display translated text */}
          {open && t("searchChats")}
        </button>

        <div className="mt-4">
          {/* NEW: Use the t() function to display translated text */}
          {open && <p className="font-semibold mb-2 px-2">{t("history")}</p>}
          <div className="space-y-1">
            {[1, 2, 3].map((chat) => (
              <button
                key={chat}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-300 w-full text-left"
              >
                <MessageSquare size={18} /> {open && `Chat ${chat}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
