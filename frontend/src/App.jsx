// NEW: Import the necessary components from react-router-dom
import { Routes, Route } from "react-router-dom";

// We will rename 'Home' to 'ChatPage' and create a new 'LandingPage'
import ChatPage from "./pages/Home"; // For now, it still points to Home.jsx
import LandingPage from "./pages/Landing"; // We will create this file next

import { LanguageProvider } from "./context/LanguageContext";
import { AudioProvider } from "./context/AudioContext";

export default function App() {
  return (
    // The providers remain at the top level, so all pages have access to them.
    <AudioProvider>
      <LanguageProvider>
        {/* The Routes component will manage which page is currently visible */}
        <Routes>
          {/* When the URL is '/', show the LandingPage component */}
          <Route path="/" element={<LandingPage />} />

          {/* When the URL is '/chat', show the ChatPage (your existing Home component) */}
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </LanguageProvider>
    </AudioProvider>
  );
}

