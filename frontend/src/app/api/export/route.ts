export async function POST(req: Request) {
  try {
    const body = await req.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      return Response.json(
        { error: "Backend URL not configured. Set BACKEND_API_URL env variable." },
        { status: 500 }
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

    // ❗ If backend failed → still try to read JSON/text
    if (!res.ok) {
      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      return new Response(JSON.stringify(data), {
        status: res.status,
      });
    }

    // ✅ Read file as arrayBuffer
    const fileBuffer = await res.arrayBuffer();

    // ✅ Get headers from backend
    const contentType =
      res.headers.get("content-type") || "application/octet-stream";

    const contentDisposition =
      res.headers.get("content-disposition") ||
      'attachment; filename="export.dxf"';

    // ✅ Return file directly
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });

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

    return new Response(JSON.stringify({ error: message }), {
      status: 502,
    });
  }
}