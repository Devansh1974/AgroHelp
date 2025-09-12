import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

export default function LocationDisplay() {
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    // This function runs when the component first mounts
    const fetchLocationName = async () => {
      const savedCoords = localStorage.getItem("agro_coords");
      if (savedCoords) {
        try {
          const coords = JSON.parse(savedCoords);
          const { latitude, longitude } = coords;

          // Use the free Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          // Extract a clean location name (e.g., "Bengaluru, Karnataka")
          const city = data.address.city || data.address.town || data.address.village || "";
          const state = data.address.state || "";
          const name = `${city}, ${state}`.replace(/^,|,$/g, ""); // Removes leading/trailing commas

          if (name) {
            setLocationName(name);
          }
        } catch (e) {
          console.error("Failed to fetch location name:", e);
          setLocationName("Location saved");
        }
      }
    };

    fetchLocationName();
  }, []); // The empty array means this effect runs only once

  if (!locationName) {
    return null; // Don't render anything if there's no location
  }

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <MapPin size={14} />
      <span>{locationName}</span>
    </div>
  );
}
