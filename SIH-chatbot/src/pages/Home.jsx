import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LanguageSelector from "../components/LanguageSelector";
import ChatInput from "../components/ChatInput";

export default function Home() {
  const handleSend = (message) => {
    console.log("User sent:", message);
    // 👇 Yaha tum backend API call karoge (image + text bhejna)
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header + Messages */}
        <div className="flex-1 flex flex-col">
          {/* Language Selector */}
          <div className="flex justify-end p-4">
            <LanguageSelector />
          </div>

          {/* Greeting / Messages */}
          <div className="flex-1 flex items-center justify-center">
            <Header />
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
