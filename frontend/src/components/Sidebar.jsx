import { Menu, PlusCircle, Search, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

export default function Sidebar({ isOpen, setIsOpen }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { t } = useTranslation();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`
          flex flex-col bg-green-200 border-r transition-all duration-300
          fixed top-0 left-0 h-full z-40 lg:relative lg:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isExpanded ? "w-64" : "w-16"}
        `}
      >
        {/* NEW: Changed to justify-between to move the desktop button to the left */}
        <div className="p-4 flex items-center justify-between">
          {/* This button toggles the width on DESKTOP and is now on the LEFT */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-green-300 rounded-full hidden lg:block"
          >
            <Menu />
          </button>
           {/* This button closes the sidebar on MOBILE and remains on the RIGHT */}
           <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-green-300 rounded-full lg:hidden"
          >
            <X />
          </button>
        </div>

        {/* This container will grow to fill the available space */}
        <div className="flex-1 space-y-2 p-2 overflow-y-auto">
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-300 w-full text-left">
            <PlusCircle size={20} />
            {isExpanded && t("newChat")}
          </button>
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-300 w-full text-left">
            <Search size={20} />
            {isExpanded && t("searchChats")}
          </button>

          <div className="mt-4">
            {isExpanded && <p className="font-semibold mb-2 px-2">{t("history")}</p>}
            <div className="space-y-1">
              {[1, 2, 3].map((chat) => (
                <button
                  key={chat}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-300 w-full text-left"
                >
                  <MessageSquare size={18} /> {isExpanded && `Chat ${chat}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-green-300">
          {isExpanded && (
            <div className="w-full">
              <LanguageSelector />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

