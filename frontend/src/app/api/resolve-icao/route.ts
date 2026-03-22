export async function POST(req: Request) {


  try {
    const body = await req.json();


    const { input } = body;

    if (!input) {
      return Response.json({ error: "Missing input" }, { status: 400 });
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

      return Response.json({ error: err }, { status: 500 });
    }

    const data = await res.json();

    const text =
      data.output?.[0]?.content?.find((c: any) => c.type === "output_text")?.text
      ?? data.output_text
      ?? null;

    console.log("Extracted text:", text);
    // console.log("Raw response:", JSON.stringify(data, null, 2));



    if (!text) {

      return Response.json({ icao: null });
    }

    const cleaned = text.trim().toUpperCase();



    if (!/^[A-Z]{4}$/.test(cleaned)) {

      return Response.json({ icao: null });
    }



    return Response.json({ icao: cleaned });

  } catch (err) {

    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}