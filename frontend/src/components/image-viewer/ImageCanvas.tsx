"use client";

import { CANVAS_WIDTH, CANVAS_HEIGHT, PinType } from "./useImageViewer";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onWheelZoom: (dy: number) => void;
  onDropPin: (x: number, y: number, type: PinType) => void;
  onPanStart: (x: number, y: number) => void;
  onPanMove: (x: number, y: number) => void;
  onPanEnd: () => void;
}

export default function ImageCanvas({
  canvasRef,
  onWheelZoom,
  onDropPin,
  onPanStart,
  onPanMove,
  onPanEnd,
}: Props) {
  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onWheel={(e) => {
        e.preventDefault();
        onWheelZoom(e.deltaY);
      }}
      onMouseDown={(e) => onPanStart(e.clientX, e.clientY)}
      onMouseMove={(e) => onPanMove(e.clientX, e.clientY)}
      onMouseUp={onPanEnd}
      onMouseLeave={onPanEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("pinType") as PinType;
        if (type) onDropPin(e.clientX, e.clientY, type);
      }}
      style={{
        border: "1px solid #999",
        cursor: "grab",
      }}
    />
  );
}
