import { createContext, useState, useContext, useRef, useEffect } from "react";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);

  // NEW: State for the central player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackSrc, setCurrentTrackSrc] = useState(null);
  const audioRef = useRef(null); // This will hold the single <audio> element

  // This effect is a safety measure to stop audio if the app is closed
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // NEW: The main function to control all audio playback
  const playPause = (src) => {
    // Case 1: The button for the currently playing track is clicked again -> PAUSE
    if (isPlaying && currentTrackSrc === src) {
      audioRef.current.pause();
      setIsPlaying(false);
    } 
    // Case 2: The button for the currently paused track is clicked -> RESUME
    else if (!isPlaying && currentTrackSrc === src) {
      audioRef.current.play();
      setIsPlaying(true);
    }
    // Case 3: A new track's play button is clicked -> PLAY NEW
    else {
      // Stop any old audio that might be playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Create and configure the new audio object
      const newAudio = new Audio(src);
      audioRef.current = newAudio;
      setCurrentTrackSrc(src);

      // Set up event listeners to automatically update our state
      newAudio.onplay = () => setIsPlaying(true);
      newAudio.onpause = () => setIsPlaying(false);
      newAudio.onended = () => { // When the track finishes naturally
          setIsPlaying(false);
          setCurrentTrackSrc(null); // Clear the track so it can be replayed
      };
      newAudio.onerror = () => {
          console.error("Audio playback error.");
          setIsPlaying(false);
          setCurrentTrackSrc(null);
      };

      // Play the new audio
      newAudio.play();
    }
  };

  const toggleAutoplay = () => {
    setIsAutoplayEnabled((prev) => !prev);
    // If the user turns off autoplay while a track is playing, stop it.
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const value = {
    isAutoplayEnabled,
    toggleAutoplay,
    isPlaying,
    currentTrackSrc,
    playPause,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);

