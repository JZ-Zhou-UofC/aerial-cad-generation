// Airport Data Visualization Configuration

export const aerowayStyles = {
  // Movement surfaces
  runway: {
    render: "line",
    strokeColor: "#d32f2f", // deep red
    strokeWeight: 6,
    strokeOpacity: 1.0,
  },

  taxiway: {
    render: "line",
    strokeColor: "#f9a825", // aviation yellow
    strokeWeight: 4,
    strokeOpacity: 1.0,
  },

  stopway: {
    render: "line",
    strokeColor: "#ff7043", // orange-ish
    strokeWeight: 3,
    strokeOpacity: 0.8,
  },

  apron: {
    render: "polygon",
    fillColor: "#1976d2", // blue surface
    fillOpacity: 0.35,
    strokeColor: "#0d47a1",
    strokeWeight: 2,
  },

  // Infrastructure
  terminal: {
    render: "polygon",
    fillColor: "#7b1fa2", // purple building
    fillOpacity: 0.5,
    strokeColor: "#4a148c",
    strokeWeight: 2,
  },

  hangar: {
    render: "polygon",
    fillColor: "#8e24aa", // darker purple
    fillOpacity: 0.5,
    strokeColor: "#4a148c",
    strokeWeight: 2,
  },

  parking_position: {
    render: "polygon",
    fillColor: "#fbc02d", // yellow
    fillOpacity: 0.4,
    strokeColor: "#f9a825",
    strokeWeight: 1.5,
  },

  // Groundcover
  grass: {
    render: "polygon",
    fillColor: "#81c784", // soft green
    fillOpacity: 0.4,
    strokeColor: "#4caf50",
    strokeWeight: 1,
  },

  // Airport boundary
  aerodrome: {
    render: "polygon",
    fillColor: "#ffffff", // transparent/white
    fillOpacity: 0.0,
    strokeColor: "#000000", // black outline
    strokeWeight: 2,
  },
};
