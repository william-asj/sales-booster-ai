import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { AiMessage, AiMessagePart } from "@/context/ChatContext";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getBusinessContext() {
  const leads = db.getLeads().map(l => `- ${l.name} (Age: ${l.age}, Score: ${l.score}, Event: ${l.event}, Recommended: ${l.product}, Est. Commission: ${l.estCommission})`).join("\n");
  const events = db.getEvents().slice(0, 5).map(e => `- ${e.customerName}: ${e.eventType} (${e.timestamp})`).join("\n");
  const products = db.getProducts().map(p => `- ${p.name} (Commission: ${Math.round(p.commission * 100)}%): ${p.description}`).join("\n");

  return `
CURRENT CUSTOMERS/LEADS:
${leads}

RECENT LIFE EVENTS:
${events}

AVAILABLE PRODUCTS:
${products}
`;
}

/**
 * Post-processes Gemini's response to only collapse excessive newlines.
 * Formatting is now handled by react-markdown on the frontend.
 */
function formatAIResponse(text: string): string {
  return text
    // Collapse 3+ consecutive newlines to max 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: Request) {
  try {
    const systemInstruction = `You are SalesBooster AI, an intelligent assistant for Indonesian insurance 
agents at Simas Jiwa. Help agents with lead analysis, product recommendations, 
and drafting personalized pitches.

${getBusinessContext()}

PRIORITIZATION RULE:
When recommending leads or products, ALWAYS prioritize by the highest AI match score. If the match score is similar between options, prioritize the one with the bigger commission. NEVER disclose commission amounts or percentages to the customer.

LANGUAGE RULE:
- If the agent writes in Bahasa Indonesia → respond fully in Bahasa Indonesia
- If the agent writes in English → respond fully in English
- NEVER mix languages within a single sentence or paragraph
- You may use bilingual section headers (e.g. "✅ Poin Utama / Key Benefits") but keep the body text in one language only

OPENING GREETING RULE:
When the agent says "hi", "hey", "hello", or any casual greeting:
- Respond in 2-3 SHORT sentences only
- Introduce yourself as SalesBooster AI
- Mention 1-2 specific high-priority leads by name and score
- End with ONE clear call-to-action question
- Do NOT write a wall of text for a greeting

RESPONSE FORMATTING RULES — FOLLOW STRICTLY:
- Always format your response using clean markdown. Use **bold** for emphasis. 
- Use bullet lists or numbered lists for multiple items. 
- Never split a name, product title, or score across multiple lines. Keep each list item on a single line.
- Use markdown headers for labeling sections:
  - "## 🏆 Section Title" for major sections
  - "### ✅ Sub-section Title" for sub-sections
- NEVER run bullet points or numbered items together on the same line.
- Keep each paragraph to 2-3 sentences maximum before adding a blank line.

When an agent asks about a specific customer by name, use the data above to provide 
tailored advice. If they ask for a "pitch", write a persuasive short message 
they can send to that customer. Be concise, practical, and professional.`;

    const { messages }: { messages: AiMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ text: "Invalid messages provided." }, { status: 400 });
    }

    // Determine which model to use based on task complexity
    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage.parts
      .map((p: AiMessagePart) => p.text)
      .filter(Boolean)
      .join(" ");

    const complexKeywords = [
      "recommend", "rekomendasi", "analyze", "analisis", 
      "pitch", "compare", "bandingkan", "strategy", "strategi",
      "formula", "rumus", "calculate", "hitung"
    ];
    
    const isComplexTask = 
      complexKeywords.some(k => userText.toLowerCase().includes(k)) || 
      userText.length > 600 || 
      messages.length > 10;

    // Use gemini-3-flash-preview for all tasks in this example, but you could switch to a more powerful model for complex tasks if needed
    const modelName = isComplexTask ? "gemini-3-flash-preview" : "gemini-3-flash-preview"; 

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    });

    // Format history for Gemini SDK: roles must be "user" or "model"
    const history = messages.slice(0, -1)
      .filter((m) => m.role !== "system") // System instructions are handled separately
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: m.parts.map((p) => {
          if (p.text) return { text: p.text };
          if (p.inlineData) return { inlineData: p.inlineData };
          return { text: "" };
        }),
      }));

    const chat = model.startChat({
      history: history,
    });

    // Send the latest message which might contain text AND attachments
    const latestParts = lastMessage.parts.map((p) => {
      if (p.text) return { text: p.text };
      if (p.inlineData) return { inlineData: p.inlineData };
      return { text: "" };
    });

    const result = await chat.sendMessage(latestParts);
    const responseText = result.response.text();

    return NextResponse.json({ text: formatAIResponse(responseText) });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { text: `Maaf, terjadi kesalahan saat menghubungi AI: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
