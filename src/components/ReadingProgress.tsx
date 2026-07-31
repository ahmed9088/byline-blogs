"use client";

import { useEffect, useState } from "react";

interface ReadingProgressProps {
  color?: string;
}

export default function ReadingProgress({ color = "var(--editorial-accent)" }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      setProgress((scrollTop / docHeight) * 100);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full transition-all duration-75 ease-linear"
        style={{ width: `${progress}%`, background: color }}
      />
    </div>
  );
}
