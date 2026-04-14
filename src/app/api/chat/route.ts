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
 * Post-processes Gemini's response to inject missing newlines
 * that are required for the markdown renderer to work correctly.
 */
function formatAIResponse(text: string): string {
  return text
    // Ensure emoji section headers always have a blank line before them
    .replace(/([^\n])\n?([\u{1F300}-\u{1F9FF}])/gu, "$1\n\n$2")
    // Ensure bullet points always start on their own line
    .replace(/([^\n])\n?(\s*[-•]\s)/g, "$1\n$2")
    // Ensure numbered list items always start on their own line
    .replace(/([^\n])\n?(\s*\d+\.\s)/g, "$1\n$2")
    // Collapse 3+ consecutive newlines to max 2
    .replace(/\n{3,}/g, "\n\n")
    // Ensure a blank line exists before every emoji header
    .replace(/\n([\u{1F300}-\u{1F9FF}])/gu, "\n\n$1")
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
- Always use proper markdown line breaks between every section
- Start each new topic or section on its OWN line with a blank line before it
- Use emoji headers (e.g. 🏆 Title, 💬 Title) to label every major section
- Use "- " bullet points for lists of features or benefits — one item per line
- Use numbered lists (1. 2. 3.) for sequential steps — one item per line
- NEVER run bullet points or numbered items together on the same line
- NEVER concatenate two sentences from different sections without a blank line between them
- Keep each paragraph to 2-3 sentences maximum before adding a blank line
- Bold key terms using **double asterisks**
- Italic supporting phrases using *single asterisks*

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
