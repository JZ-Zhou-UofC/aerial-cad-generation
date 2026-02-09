"use client";

import { useEffect, useRef, useState } from "react";

export const CANVAS_WIDTH = 1800;
export const CANVAS_HEIGHT = 1000;

export type PinType = "A" | "B";

export interface Pin {
  id: number;
  x: number;
  y: number;
  type: PinType;
}

export function useImageViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pins, setPins] = useState<Pin[]>([]);

  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    imgRef.current = new Image();
  }, []);

  /* ---------- DRAW ---------- */
  const redraw = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // image
    ctx.drawImage(
      img,
      offset.x,
      offset.y,
      img.width * scale,
      img.height * scale
    );

    // pins
    pins.forEach((p) => {
      const sx = p.x * scale + offset.x;
      const sy = p.y * scale + offset.y;

      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fillStyle = p.type === "A" ? "#2563eb" : "#f97316";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  useEffect(redraw, [scale, offset, pins]);

  /* ---------- IMAGE ---------- */
  const loadImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = imgRef.current!;
    img.src = url;

    img.onload = () => {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setPins([]);
      redraw();
      URL.revokeObjectURL(url);
    };
  };

  /* ---------- ZOOM ---------- */
  const zoomIn = () => setScale((s) => Math.min(10, s * 1.2));
  const zoomOut = () => setScale((s) => Math.max(0.1, s * 0.8));

  const zoomWheel = (deltaY: number) => {
    setScale((s) =>
      Math.min(10, Math.max(0.1, s * (deltaY > 0 ? 0.9 : 1.1)))
    );
  };

  /* ---------- MOUSE PAN ---------- */
  const startPan = (x: number, y: number) => {
    isPanning.current = true;
    lastMouse.current = { x, y };
  };

  const movePan = (x: number, y: number) => {
    if (!isPanning.current) return;

    const dx = x - lastMouse.current.x;
    const dy = y - lastMouse.current.y;

    setOffset((o) => ({
      x: o.x + dx,
      y: o.y + dy,
    }));

    lastMouse.current = { x, y };
  };

  const endPan = () => {
    isPanning.current = false;
  };

  /* ---------- COORD ---------- */
  const screenToImage = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    const sx = clientX - rect.left;
    const sy = clientY - rect.top;

    return {
      x: Math.floor((sx - offset.x) / scale),
      y: Math.floor((sy - offset.y) / scale),
    };
  };

  /* ---------- PINS ---------- */
  const addPin = (x: number, y: number, type: PinType) => {
    setPins((p) => [...p, { id: Date.now(), x, y, type }]);
  };

  const clearPins = () => setPins([]);

  return {
    canvasRef,
    loadImage,
    zoomIn,
    zoomOut,
    zoomWheel,
    startPan,
    movePan,
    endPan,
    screenToImage,
    addPin,
    clearPins,
    pins,
  };
}
