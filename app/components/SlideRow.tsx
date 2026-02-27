"use client";

import { useRef, useState } from "react";
import CanvasPanel, { CanvasPanelHandle } from "./CanvasPanel";
import PreviewPanel from "./PreviewPanel";

interface SlideRowProps {
  id: string;
  html?: string;
  mood: string;
  moods: readonly string[];
  onMoodChange: (slideId: string, mood: string) => void;
  onHtmlGenerated: (slideId: string, html: string) => void;
}

export default function SlideRow({
  id,
  html,
  mood,
  moods,
  onMoodChange,
  onHtmlGenerated,
}: SlideRowProps) {
  const canvasRef = useRef<CanvasPanelHandle>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!canvasRef.current || isGenerating) return;

    setIsGenerating(true);
    try {
      const base64 = await canvasRef.current.exportAsBase64();

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mood }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "API request failed");
      }

      onHtmlGenerated(id, data.html);
    } catch (err) {
      console.error(`[${id}] Generate failed:`, err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full flex items-start gap-4">
      {/* Canvas */}
      <div className="flex-1 aspect-video rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CanvasPanel ref={canvasRef} slideId={id} />
      </div>

      {/* Controls */}
      <div className="shrink-0 flex flex-col items-center gap-3 pt-4">
        {/* Mood Pills */}
        <div className="flex flex-col gap-1.5">
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => onMoodChange(id, m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                mood === m
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-8 border-t border-gray-200" />

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>{isGenerating ? "..." : "✨"}</span>
          <span className="whitespace-nowrap text-xs">
            {isGenerating ? "Generating..." : "Generate"}
          </span>
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 aspect-video rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <PreviewPanel html={html} />
      </div>
    </div>
  );
}
