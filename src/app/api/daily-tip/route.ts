import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are SalesBooster AI, an assistant for insurance agents at Simas Jiwa. 
Generate exactly ONE short, actionable sales tip for today. 
The tip must be specific to life insurance sales in Indonesia.
It should be 1-2 sentences max, under 25 words.
Do not use markdown. Do not use bullet points. Plain text only.
Examples of good tips:
- 'Reinstate leads respond better in the morning. Schedule your calls before 11 AM.'
- 'Mention legacy planning when pitching to leads aged 40+. It increases close rates.'
Output only the tip text, nothing else.`,
    });

    const result = await model.generateContent("Generate today's sales tip.");
    const tip = result.response.text().trim();

    return NextResponse.json({ tip });
  } catch (error) {
    console.error("Daily Tip API Error:", error);
    return NextResponse.json({ tip: "Focus on closing pending renewals today to hit your monthly target." });
  }
}
