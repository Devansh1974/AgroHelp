import { Menu, PlusCircle, Search, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

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
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-300">
          <PlusCircle size={20} /> {open && "New Chat"}
        </button>
        <button className="flex items-center  gap-2 p-2 rounded-lg hover:bg-green-300">
          <Search size={20} /> {open && "Search Chats"}
        </button>

        <div className="mt-4">
          {open && <p className="font-semibold mb-2">History</p>}
          <div className="space-y-1">
            {[1, 2, 3].map((chat) => (
              <button
                key={chat}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-300 w-full"
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
