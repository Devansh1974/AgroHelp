import { Menu, PlusCircle, Search, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// NEW: The component now accepts `isOpen` and `setIsOpen` props from Home.jsx
// These props will control the sidebar's visibility on mobile screens.
export default function Sidebar({ isOpen, setIsOpen }) {
  // NEW: This state now ONLY controls if the sidebar is wide or narrow on DESKTOP.
  const [isExpanded, setIsExpanded] = useState(true);
  const { t } = useTranslation();

  return (
    <>
      {/* NEW: Mobile Overlay
        This is a semi-transparent background that covers the main content when the 
        sidebar is open on mobile. Clicking it will close the sidebar. 
        It's hidden on large screens (`lg:hidden`).
      */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* NEW: Updated Sidebar Container with Responsive Classes
        - On mobile (default): It's 'fixed' and slides in/out based on the `isOpen` prop.
        - On desktop (`lg:`): It becomes 'relative', is always visible, and its width 
          is controlled by the internal `isExpanded` state.
      */}
      <div
        className={`
          flex flex-col bg-green-200 border-r transition-all duration-300
          fixed top-0 left-0 h-full z-40 lg:relative lg:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isExpanded ? "w-64" : "w-16"}
        `}
      >
        {/* NEW: The header now has separate buttons for mobile and desktop */}
        <div className="p-4 flex items-center justify-end">
          {/* This button toggles the width on DESKTOP and is hidden on mobile */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-green-300 rounded-full hidden lg:block"
          >
            <Menu />
          </button>
           {/* This button closes the sidebar on MOBILE and is hidden on desktop */}
           <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-green-300 rounded-full lg:hidden"
          >
            <X />
          </button>
        </div>

        {/* Navigation items now use the `isExpanded` state for visibility */}
        <div className="flex-1 space-y-2 p-2">
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
      </div>
    </>
  );
}

