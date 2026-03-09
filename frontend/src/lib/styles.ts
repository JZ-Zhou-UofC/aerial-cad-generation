// config.js
// Airport Data Visualization Configuration

export const aerowayStyles = {
  runway: {
    render: "line",
    strokeColor: "#d32f2f",   // deep red
    strokeWeight: 6,          // thicker runway
    strokeOpacity: 1.0,
  },

  taxiway: {
    render: "line",
    strokeColor: "#f9a825",   // aviation yellow
    strokeWeight: 4,          // thicker taxiway
    strokeOpacity: 1.0,
  },

  apron: {
    render: "polygon",
    fillColor: "#1976d2",     // blue surface
    fillOpacity: 0.35,
    strokeColor: "#0d47a1",
    strokeWeight: 2,
  },

  terminal: {
    render: "polygon",
    fillColor: "#7b1fa2",     // purple building
    fillOpacity: 0.5,
    strokeColor: "#4a148c",
    strokeWeight: 2,
  },
};