import { useState, useCallback, useMemo, useEffect } from "react";

export interface Slide {
  id: string;
  html?: string;
  mood: string;
  syncWithMaster: boolean;
}

export const MOODS = [
  "Minimalist",
  "Neon Cyber",
  "Academic/Clean",
  "Brutalist",
] as const;

function extractCss(html: string): string {
  const matches: string[] = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    matches.push(m[1].trim());
  }
  return matches.join("\n");
}

export function useSlides() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: "slide-1", mood: "Minimalist", syncWithMaster: false },
  ]);

  const [masterStyle, setMasterStyle] = useState<string | null>(null);

  // Auto-extract masterStyle when first slide's html changes
  useEffect(() => {
    const firstSlide = slides[0];
    if (firstSlide?.html) {
      const css = extractCss(firstSlide.html);
      setMasterStyle(css || null);
    } else {
      setMasterStyle(null);
    }
  }, [slides]);

  const addSlide = useCallback(() => {
    setSlides((prev) => [
      ...prev,
      { id: `slide-${Date.now()}`, mood: "Minimalist", syncWithMaster: true },
    ]);
  }, []);

  const updateSlideMood = useCallback((slideId: string, mood: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, mood } : s))
    );
  }, []);

  const updateSlideHtml = useCallback((slideId: string, html: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, html } : s))
    );
  }, []);

  const toggleSyncWithMaster = useCallback((slideId: string) => {
    setSlides((prev) =>
      prev.map((s) =>
        s.id === slideId ? { ...s, syncWithMaster: !s.syncWithMaster } : s
      )
    );
  }, []);

  const applyMasterStyleToAll = useCallback(() => {
    setSlides((prev) =>
      prev.map((s, i) => (i === 0 ? s : { ...s, syncWithMaster: true }))
    );
  }, []);

  return {
    slides,
    masterStyle,
    addSlide,
    updateSlideMood,
    updateSlideHtml,
    toggleSyncWithMaster,
    applyMasterStyleToAll,
    MOODS,
  };
}
