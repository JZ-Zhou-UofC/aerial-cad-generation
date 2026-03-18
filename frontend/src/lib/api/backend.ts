export async function exportCAD(data: unknown) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/export-airport`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new Error("Export failed");
  }

  return res.json();
}