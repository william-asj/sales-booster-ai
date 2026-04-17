import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const systemInstruction = `You are SalesBooster AI's Event Extractor. Your job is to analyze unstructured insurance notes, chat transcripts, or emails and extract structured "Life Events".

Allowed eventType values (Classify precisely):
- Retention & Risk: "Surrender Intent", "Lapse Warning", "Fund Withdrawal", "Freelook"
- Claim Events: "Health Claim", "Death Claim", "Critical Illness Claim"
- Growth & Modification: "Top-Up Request", "Top-Up Reinstate", "Endorsement", "Fund Switching"
- Default: "Inforce", "Policy Being Processed", "Birthday", "Reinstate"

Rules for extractions:
1. customerName: Extract the full name of the customer mentioned.
2. description: Write a concise (1-2 sentences), professional summary of what the customer wants or what happened.
3. priority: "High" for any Claims, Surrender, Lapse, or urgent issues. "Medium" for Top-Up, Endorsement, or Fund Switching. "Low" for general inquiries or birthdays.
4. color: "rose" for High priority/Risks, "amber" for warnings/processing, "emerald" for growth/inforce, "indigo" for modifications, "blue" for general.
5. timestamp: Always use "Just Now" for new extractions.

Output ONLY a JSON array of objects matching this schema:
[
  {
    "customerName": "string",
    "eventType": "string",
    "description": "string",
    "timestamp": "Just Now",
    "priority": "High" | "Medium" | "Low",
    "color": "rose" | "amber" | "emerald" | "indigo" | "blue"
  }
]`;

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Analyze the following text and extract events:\n\n${text}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    const events = JSON.parse(responseText);

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("NLP Analysis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
