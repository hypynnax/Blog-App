"use client";
import { useState, useEffect } from "react";

export default function TypewriterText({ texts }: { texts: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[index];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText.length < currentText.length) {
      timer = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length + 1));
      }, 120);
    } else if (!isDeleting && displayText.length === currentText.length) {
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && displayText.length > 0) {
      timer = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length - 1));
      }, 80);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, texts, index]);

  return (
    <div className="flex items-center justify-center text-gray-800">
      <h1 className="text-4xl font-bold">
        {displayText}
        <span className="text-4xl font-bold blink-border"></span>
      </h1>
    </div>
  );
}
