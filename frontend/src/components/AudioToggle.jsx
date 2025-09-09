import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../context/AudioContext";

export default function AudioToggle() {
  const { isAutoplayEnabled, toggleAutoplay } = useAudio();

  return (
    <button
      onClick={toggleAutoplay}
      className="p-2 rounded-full hover:bg-gray-200"
      title={isAutoplayEnabled ? "Mute Autoplay" : "Enable Autoplay"}
    >
      {isAutoplayEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
    </button>
  );
}