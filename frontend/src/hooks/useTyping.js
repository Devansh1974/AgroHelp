import { useEffect, useState } from "react";

/**
 * A custom React hook that simulates a typing effect for a given text.
 * @param {string} text - The full text to be typed out.
 * @param {number} speed - The speed of the typing effect in milliseconds.
 * @returns {string} The currently displayed portion of the text.
 */
export function useTyping(text = "", speed = 50) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(""); // Reset the text when a new message arrives
    
    // Ensure there is text to type
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        // Add one character at a time
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
        // Stop the interval when the full text is displayed
        if (i >= text.length) {
          clearInterval(intervalId);
        }
      }, speed);

      // This is a cleanup function that stops the interval if the component is removed
      return () => clearInterval(intervalId);
    }
  }, [text, speed]); // This effect will re-run if the text or speed changes

  return displayedText;
}

