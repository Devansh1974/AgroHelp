import { createContext, useState, useContext } from "react";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  // Autoplay is ON by default
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true); 

  const toggleAutoplay = () => {
    setIsAutoplayEnabled((prev) => !prev);
  };

  return (
    <AudioContext.Provider value={{ isAutoplayEnabled, toggleAutoplay }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);

