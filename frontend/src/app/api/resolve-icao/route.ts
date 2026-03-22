export async function POST(req: Request) {
  console.log("=== /api/resolve-icao START ===");

  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { input } = body;

    if (!input) {
      console.warn("Missing input");
      return Response.json({ error: "Missing input" }, { status: 400 });
    }

    console.log("Processing input:", input);

    const payload = {
      model: "gpt-4o-mini",
      input: `Return ONLY the ICAO code (4 letters) for: ${input}. If unknown return null.`,
      max_output_tokens: 100,
    };

    console.log("OpenAI payload:", payload);

    console.log("API key exists:", !!process.env.OPENAI_API_KEY);

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("OpenAI HTTP status:", res.status);

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI error response:", err);
      return Response.json({ error: err }, { status: 500 });
    }

    const data = await res.json();

    console.log("OpenAI raw response:", data);

    const text =
      data.output?.[0]?.content?.find((c: any) => c.type === "output_text")?.text
      ?? data.output_text
      ?? null;

    console.log("Extracted text:", text);

    if (!text) {
      console.warn("No text returned from model");
      return Response.json({ icao: null });
    }

    const cleaned = text.trim().toUpperCase();

    console.log("Cleaned ICAO:", cleaned);

    if (!/^[A-Z]{4}$/.test(cleaned)) {
      console.warn("Invalid ICAO format:", cleaned);
      return Response.json({ icao: null });
    }

    console.log("Returning ICAO:", cleaned);
    console.log("=== /api/resolve-icao END ===");

    return Response.json({ icao: cleaned });

  } catch (err) {
    console.error("API route error:", err);
    console.log("=== /api/resolve-icao FAILED ===");
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}