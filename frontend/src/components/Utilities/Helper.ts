import AirportLayer from "@/lib/osm/airportLayer";

const backendUrl = "http://127.0.0.1:8000";

export async function saveAirportData(airportlayer: AirportLayer) {
  const data = airportlayer.getFeatureData();

  // Check if there is data to save
  if (!data || Object.keys(data).length === 0) {
    alert("No data to export! Fetch an airport first.");
    return;
  }

  try {
    const response = await fetch(`${backendUrl}/map/save-airport-data/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Saved!");
    } else {
      alert("Save failed: " + response.statusText);
    }
  } catch (error) {
    console.error("Save error:", error);
    alert("Save error: " + (error as Error).message);
  }
}
