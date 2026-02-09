"use client";

import { useEffect, useState } from "react";
import { useImageViewer } from "./useImageViewer";
import ControlsPanel from "./ControlsPanel";
import ImageCanvas from "./ImageCanvas";

export default function ImageViewer() {
  const v = useImageViewer();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: Math.floor(window.innerWidth * 0.8),
        height: Math.floor(window.innerHeight * 0.8),
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        height: "100vh",
      }}
    >
      <ControlsPanel
        onUpload={v.loadImage}
        pins={v.pins}
        onClearPins={v.clearPins}
        zoomIn={v.zoomIn}
        zoomOut={v.zoomOut}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
          }}
        >
          <ImageCanvas
            canvasRef={v.canvasRef}
            onResize={v.resizeCanvas}
            onWheelZoom={v.zoomWheel}
            onDropPin={(cx, cy, type) => {
              const { x, y } = v.screenToImage(cx, cy);
              v.addPin(x, y, type);
            }}
            onPanStart={v.startPan}
            onPanMove={v.movePan}
            onPanEnd={v.endPan}
          />
        </div>
      </div>
    </main>
  );
}
