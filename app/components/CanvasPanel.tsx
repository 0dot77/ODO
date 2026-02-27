"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";

export interface CanvasPanelHandle {
  exportAsBase64: () => Promise<string>;
}

const CanvasPanel = forwardRef<CanvasPanelHandle, { slideId: string }>(
  ({ slideId }, ref) => {
    const editorRef = useRef<Editor | null>(null);

    useImperativeHandle(ref, () => ({
      exportAsBase64: async () => {
        const editor = editorRef.current;
        if (!editor) throw new Error("Editor not ready");

        const shapeIds = editor.getCurrentPageShapeIds();
        if (shapeIds.size === 0) throw new Error("No shapes on canvas");

        const result = await editor.toImageDataUrl([...shapeIds], {
          format: "png",
          background: true,
          padding: 16,
        });

        return result.url;
      },
    }));

    return (
      <div className="w-full h-full">
        <Tldraw
          persistenceKey={slideId}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>
    );
  }
);

CanvasPanel.displayName = "CanvasPanel";

export default CanvasPanel;
