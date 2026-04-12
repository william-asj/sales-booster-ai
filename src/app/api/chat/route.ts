import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { AiMessage, AiMessagePart } from "@/context/ChatContext";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getBusinessContext() {
  const leads = db.getLeads().map(l => `- ${l.name} (Age: ${l.age}, Score: ${l.score}, Event: ${l.event}, Recommended: ${l.product})`).join("\n");
  const events = db.getEvents().slice(0, 5).map(e => `- ${e.customerName}: ${e.eventType} (${e.timestamp})`).join("\n");
  const products = db.getProducts().map(p => `- ${p.name}: ${p.description}`).join("\n");

  return `
CURRENT CUSTOMERS/LEADS:
${leads}

RECENT LIFE EVENTS:
${events}

AVAILABLE PRODUCTS:
${products}
`;
}

const systemInstruction = `You are SalesBooster AI, an intelligent assistant for Indonesian insurance 
agents at Simas Jiwa. Help agents with lead analysis, product recommendations, 
and drafting personalized pitches. 

${getBusinessContext()}

When an agent asks about a specific customer by name, use the data above to provide 
tailored advice. If they ask for a "pitch", write a persuasive short message 
they can send to that customer. Be concise, practical, and professional. 
Mirror the language (Bahasa Indonesia or English) used in the conversation.`;

export async function POST(req: Request) {
  try {
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

    // Use gemini-3.1-flash as per user instruction
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

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { text: "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
