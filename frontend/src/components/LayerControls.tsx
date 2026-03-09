"use client";

type Props = {
  airportLayer: any;
};

export default function LayerControls({ airportLayer }: Props) {

  const toggle = (layer: string, visible: boolean) => {
    airportLayer.setVisible(layer, visible);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 10,
        background: "white",
        padding: 10,
      }}
    >
      <label>
        <input
          type="checkbox"
          defaultChecked
          onChange={(e) =>
            toggle("runway", e.target.checked)
          }
        />
        Runways
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          defaultChecked
          onChange={(e) =>
            toggle("taxiway", e.target.checked)
          }
        />
        Taxiways
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          defaultChecked
          onChange={(e) =>
            toggle("apron", e.target.checked)
          }
        />
        Aprons
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          defaultChecked
          onChange={(e) =>
            toggle("terminal", e.target.checked)
          }
        />
        Terminals
      </label>
    </div>
  );
}