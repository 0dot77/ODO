"use client";

import { useState, useEffect, useCallback } from "react";

interface PresentationViewProps {
  slides: string[];
  onExit: () => void;
}

export default function PresentationView({
  slides,
  onExit,
}: PresentationViewProps) {
  const [index, setIndex] = useState(0);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        onExit();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onExit]);

  return (
    <div className="fixed inset-0 z-50 bg-black w-screen h-screen">
      <iframe
        srcDoc={slides[index]}
        className="w-full h-full border-none"
        title={`Slide ${index + 1}`}
      />

      {/* Bottom-right overlay controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 text-white/80 text-sm">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="px-3 py-1 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          ← Prev
        </button>

        <span className="px-2 text-white/60 text-xs tabular-nums">
          {index + 1} / {slides.length}
        </span>

        <button
          onClick={goNext}
          disabled={index === slides.length - 1}
          className="px-3 py-1 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          Next →
        </button>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <button
          onClick={onExit}
          className="px-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          ✕ Exit
        </button>
      </div>
    </div>
  );
}
