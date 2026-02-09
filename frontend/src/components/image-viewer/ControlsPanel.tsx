"use client";

import { Pin } from "./useImageViewer";

interface Props {
  onUpload: (file: File) => void;
  pins: Pin[];
  onClearPins: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export default function ControlsPanel({
  onUpload,
  pins,
  onClearPins,
  zoomIn,
  zoomOut,
}: Props) {
  return (
    <div style={{ padding: 16, borderRight: "1px solid #ddd" }}>
      {/* Upload */}
      <label
        style={{
          display: "block",
          padding: 10,
          background: "#2563eb",
          color: "white",
          borderRadius: 6,
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        Upload Image
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && onUpload(e.target.files[0])}
        />
      </label>

      {/* Pin palette */}
      <div style={{ marginTop: 20 }}>
        <strong>Pin Palette</strong>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {(["A", "B"] as const).map((t) => (
            <div
              key={t}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("pinType", t)}
              style={{
                padding: 8,
                background: t === "A" ? "#2563eb" : "#f97316",
                color: "white",
                borderRadius: 4,
                cursor: "grab",
              }}
            >
              Pin {t}
            </div>
          ))}
        </div>
      </div>

      {/* Clear pins */}
      <button
        onClick={onClearPins}
        style={{
          marginTop: 16,
          width: "100%",
          padding: 8,
          background: "#ef4444",
          color: "white",
          borderRadius: 4,
        }}
      >
        Clear All Pins
      </button>

      {/* Pin list */}
      <div style={{ marginTop: 16 }}>
        <strong>Pins</strong>
        {pins.length === 0 && <div>No pins</div>}
        {pins.map((p, i) => (
          <div key={p.id}>
            #{i + 1} [{p.type}] ({p.x}, {p.y})
          </div>
        ))}
      </div>

      {/* Zoom */}
      <div style={{ marginTop: 16 }}>
        <strong>Zoom</strong>
        <button onClick={zoomIn}>＋</button>
        <button onClick={zoomOut}>－</button>
      </div>
    </div>
  );
}
