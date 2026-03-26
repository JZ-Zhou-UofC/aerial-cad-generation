export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch("http://localhost:8000/export/cad", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Backend status:", res.status);

    // Read response safely
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      return new Response(JSON.stringify(data), {
        status: res.status,
      });
    }

    return Response.json(data);
  } catch (err) {
    console.error("API route error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
}