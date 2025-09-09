import Home from "./pages/Home";
import { LanguageProvider } from "./context/LanguageContext";
import { AudioProvider } from "./context/AudioContext"; 

export default function App() {
  return (
    <AudioProvider> 
      <LanguageProvider>
        <Home />
      </LanguageProvider>
    </AudioProvider>
  );
}