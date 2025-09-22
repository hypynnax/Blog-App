"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FlipText({ texts }: { texts: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="flex flex-col items-center justify-center text-white rounded-xl">
      <div className="relative w-20 h-10 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute w-full h-full flex items-center justify-center bg-blue-400 rounded-xl shadow-xl text-xl"
          >
            {texts[index]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
