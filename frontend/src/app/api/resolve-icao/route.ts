export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { input } = body;

    if (!input) {
      return Response.json(
        { success: false, error: "Missing input", icao: null },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { success: false, error: "Server misconfiguration", icao: null },
        { status: 500 },
      );
    }

    const payload = {
      model: "gpt-4o-mini",
      input: `
You are an aviation assistant.

Convert the given airport name, IATA code, or ICAO code into a valid ICAO code.

Rules:
- Return ONLY the ICAO code (4 uppercase letters)
- Do NOT include any explanation
- If unknown, return null

Examples:
Input: YVR
Output: CYVR

Input: Vancouver International Airport
Output: CYVR

Input: YYZ
Output: CYYZ

Input: Unknown Airport
Output: null

Now convert:
${input}
`,
      max_output_tokens: 20,
    };

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
      console.error("OpenAI error:", err);

      return Response.json(
        { success: false, error: "AI service failed", icao: null },
        { status: 502 },
      );
    }

    const data = await res.json();

    const text =
      data.output?.[0]?.content?.find((c: any) => c.type === "output_text")
        ?.text ??
      data.output_text ??
      null;

    console.log("Extracted text:", text);
    // console.log("Raw response:", JSON.stringify(data, null, 2));

    if (!text) {
      return Response.json({
        success: true,
        icao: null,
        error: "No ICAO found in the response",
      });
    }

    const cleaned = text.trim().toUpperCase();

    if (!/^[A-Z]{4}$/.test(cleaned)) {
      return Response.json({
        success: true,
        icao: null,
        error: "Invalid ICAO format returned",
      });
    }

    return Response.json({
      success: true,
      icao: cleaned,
      error: null,
    });
  } catch (err) {
    console.error("Route error:", err);

    return Response.json(
      { success: false, error: "Internal server error", icao: null },
      { status: 500 },
    );
  }
}
