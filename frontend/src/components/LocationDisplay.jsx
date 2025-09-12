import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

export default function LocationDisplay() {
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    const fetchLocationName = async () => {
      const savedCoords = localStorage.getItem("agro_coords");
      if (savedCoords) {
        try {
          const coords = JSON.parse(savedCoords);
          const { latitude, longitude } = coords;

          // NEW: Instead of calling OpenStreetMap directly, we call our own backend's
          // secure proxy endpoint. This permanently fixes the CORS error.
          const response = await fetch(
            `http://127.0.0.1:8000/get-location-name?lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) {
            throw new Error('Backend responded with an error');
          }

          const data = await response.json();
          const name = data.locationName;

          if (name) {
            setLocationName(name);
          }
        } catch (e) {
          console.error("Failed to fetch location name:", e);
          // Set a fallback message in case the backend call fails
          setLocationName("Location enabled"); 
        }
      }
    }

    fetchLocationName();
  }, []); // The empty array ensures this effect runs only once

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

