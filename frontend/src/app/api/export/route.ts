export async function POST(req: Request) {
  try {
    const body = await req.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      return Response.json(
        {
          error: "Backend URL not configured. Set BACKEND_API_URL env variable.",
        },
        { status: 500 },
      );
    }

    const res = await fetch(`${backendUrl}/export/cad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

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

    let message = "Internal error";

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        message = "Request timed out (backend took too long to respond)";
      } else if (err.message.includes("fetch")) {
        message = "Cannot reach backend service (server may be down)";
      } else {
        message = err.message;
      }
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 502 }, // better than 500 for upstream failure
    );
  }
}
