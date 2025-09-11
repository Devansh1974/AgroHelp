import React from "react";

export default function Footer() {
  return (
    <footer className="py-8 bg-green-100/60 text-center text-gray-600 text-sm">
      © {new Date().getFullYear()} AgroHelp. All rights reserved.
    </footer>
  );
}
