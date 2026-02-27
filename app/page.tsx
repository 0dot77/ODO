"use client";

import { useState } from "react";
import SlideRow from "./components/SlideRow";
import PresentationView from "./components/PresentationView";
import { useSlides } from "./hooks/useSlides";

export default function Home() {
  const {
    slides,
    masterStyle,
    addSlide,
    updateSlideMood,
    updateSlideHtml,
    toggleSyncWithMaster,
    applyMasterStyleToAll,
    MOODS,
  } = useSlides();

  const [isPlaying, setIsPlaying] = useState(false);

  const validSlides = slides.filter((s) => s.html).map((s) => s.html!);
  const hasGenerated = validSlides.length > 0;

  const exportPresentation = () => {
    if (validSlides.length === 0) return;

    const sections = validSlides
      .map((h) => `<section>${h}</section>`)
      .join("\n");

    const doc = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{margin:0;overflow-x:hidden}
section{height:100vh;width:100vw;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;scroll-snap-align:start}
.presentation-container{scroll-snap-type:y mandatory;overflow-y:scroll;height:100vh}
</style></head><body><div class="presentation-container">
${sections}
</div></body></html>`;

    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "odo-presentation.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-100">
      {isPlaying && (
        <PresentationView
          slides={validSlides}
          onExit={() => setIsPlaying(false)}
        />
      )}

      {/* Header */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-5 shrink-0">
        <span className="text-xl font-bold tracking-tight">ODO</span>
        <div className="flex items-center gap-2">
          <button
            onClick={applyMasterStyleToAll}
            disabled={!masterStyle}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            🎨 Apply Master Style to All
          </button>
          <button
            onClick={() => setIsPlaying(true)}
            disabled={!hasGenerated}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ▶ Present
          </button>
          <button
            onClick={exportPresentation}
            disabled={!hasGenerated}
            className="flex items-center gap-1.5 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            💾 Export
          </button>
        </div>
      </header>

      {/* Slide List */}
      <main className="flex-1 overflow-y-auto px-6 py-10 flex flex-col gap-16">
        {slides.map((slide, index) => (
          <SlideRow
            key={slide.id}
            id={slide.id}
            html={slide.html}
            mood={slide.mood}
            moods={MOODS}
            isFirstSlide={index === 0}
            masterStyle={masterStyle}
            syncWithMaster={slide.syncWithMaster}
            onToggleSync={toggleSyncWithMaster}
            onMoodChange={updateSlideMood}
            onHtmlGenerated={updateSlideHtml}
          />
        ))}

        <button
          onClick={addSlide}
          className="mx-auto mb-8 flex items-center gap-2 border-2 border-dashed border-gray-300 text-gray-500 font-medium px-6 py-3 rounded-xl hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          <span className="text-lg">+</span>
          Add New Slide
        </button>
      </main>
    </div>
  );
}
