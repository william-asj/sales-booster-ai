import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { AiMessage, AiMessagePart } from "@/context/ChatContext";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getBusinessContext() {
  const leads = db.getLeads().map(l => {
    const sr = l.scoringResult;
    const shapSummary = sr
      ? sr.shapBreakdown
          .sort((a, b) => Math.abs(b.shapContribution) - Math.abs(a.shapContribution))
          .slice(0, 3)
          .map(s => `${s.direction === 'positive' ? '+' : ''}${s.shapContribution.toFixed(1)} ${s.feature}`)
          .join(', ')
      : 'N/A';

    return `- ${l.name} (Age: ${l.age}, Score: ${l.score}, ScoreLabel: ${l.scoreLabel}, ` +
      `Segment: ${l.segment}, Salary: ${l.salaryBucket}, Event: ${l.event}, ` +
      `Intent: ${l.purchaseIntent}, Channel: ${l.channel}, ` +
      `City: ${l.city || 'MISSING'}, Policies: ${l.policies}, ` +
      `Product: ${l.product}, Est.Commission: ${l.estCommission}, ` +
      `EventClass: ${sr?.eventUrgencyClass ?? 'N/A'}, ` +
      `ProductFit: [${sr?.productFitLabels?.join(', ') ?? 'N/A'}], ` +
      `ChurnRisk: [${sr?.churnRiskLabels?.join(', ') ?? 'N/A'}], ` +
      `TopSHAP: ${shapSummary})`;
  }).join("\n");
  
  const products = db.getProducts().map(p => `- ${p.name} (ID: ${p.id}, Category: ${p.category}, Commission: ${Math.round(p.commission * 100)}%): ${p.description}`).join("\n");

  return `
CURRENT CUSTOMERS/LEADS DATA:
${leads}

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
    const systemInstruction = `You are SalesBooster AI, an intelligent assistant for Indonesian insurance agents at Simas Jiwa.

═══════════════════════════════════════════════════════════
CORE INTELLIGENCE: MULTI-LABEL CLASSIFICATION + SHAP SCORING
═══════════════════════════════════════════════════════════

You implement a real-time multi-label classification model with SHAP-based explainability.
Every time you analyze a customer or lead, you MUST internally run this scoring pipeline
and surface the results in your response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — FEATURE EXTRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extract and encode these features for the customer:

| Feature                | Encoding Logic                                                      |
|------------------------|---------------------------------------------------------------------|
| age_score              | 0–17 → 10 | 18–24 → 30 | 25–34 → 60 | 35–44 → 75 | 45–54 → 80 | 55–64 → 70 | 65+ → 55 |
| segment_score          | Top Customers → 95 | High value → 80 | Medium Value → 60 | Low Value → 35 | Lost → 10 |
| salary_score           | >1B → 95 | 500M–1B → 85 | 250M–300M → 75 | 100M–150M → 65 | 50M–100M → 50 | 0–50M → 30 |
| policy_count_score     | 0 → 20 | 1 → 50 | 2 → 70 | 3 → 80 | 4+ → 90                      |
| event_urgency_score    | Lapse/Surrender → 95 | Health Claim → 90 | Freelook → 85 | Birthday → 70 | Policy Being Processed → 65 | Reinstate → 75 | Inforce → 50 |
| channel_score          | Agency → 75 | Bancassurance → 85 | Syariah → 70 | Digital → 80   |
| location_score         | Has city+province → 80 | Missing → 40                                |
| intent_score           | Protection → 85 | Family Protection → 85 | Investment → 75 | Education → 70 | Retirement → 65 | Health → 60 |
| policy_age_risk        | policyAgeMonths < 6 → 90 (high lapse risk) | 6–24 → 60 | 24–60 → 40 | 60+ → 20 |
| marital_score          | married → 80 | single → 60 | widow/widower → 70               |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — MULTI-LABEL CLASSIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Predict THREE independent label sets using sigmoid logic (each label is independent):

LABEL SET A — EVENT URGENCY CLASS:
  - CRITICAL   → event_urgency_score ≥ 85 (act within 24–72h)
  - HIGH       → event_urgency_score 70–84
  - MEDIUM     → event_urgency_score 50–69
  - LOW        → event_urgency_score < 50

LABEL SET B — PRODUCT FIT LABELS (can be multiple):
  Evaluate each product category independently:
  - Whole Life fit     → age ≥ 35 AND (segment_score ≥ 75 OR salary_score ≥ 75)
  - Education fit      → age 25–50 AND intent includes Education AND marital=married
  - Critical Illness   → age ≥ 40 OR policy_age_risk ≥ 60 OR event=Health Claim
  - PAYDI/Investment   → intent=Investment AND age 25–55 AND salary_score ≥ 65
  - Term Life          → age 20–45 AND intent=Protection AND policy_count_score ≤ 50
  - Syariah            → channel=Syariah OR intent matches Islamic finance signals
  - Rider opportunity  → policy_count_score ≥ 70 AND (age ≥ 35 OR event_urgency ≥ 70)

LABEL SET C — CHURN RISK LABELS (can be multiple):
  - Lapse Risk         → event=Lapse OR (policy_age_risk ≥ 80 AND segment_score ≤ 40)
  - Surrender Risk     → event=Surrender OR (segment_score ≤ 35 AND policy_age_risk ≥ 60)
  - Upgrade Potential  → segment_score ≥ 70 AND policy_count_score ≥ 60
  - Reactivation       → event=Reinstate OR segment=Lost Customers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — SHAP SCORE COMPUTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compute the final MATCH SCORE using weighted SHAP contributions:

BASE_VALUE = 50 (population average)

SHAP contributions (each is a positive or negative delta):

  SHAP_age        = (age_score - 50) × 0.20
  SHAP_segment    = (segment_score - 50) × 0.25
  SHAP_salary     = (salary_score - 50) × 0.15
  SHAP_policy     = (policy_count_score - 50) × 0.12
  SHAP_event      = (event_urgency_score - 50) × 0.15
  SHAP_channel    = (channel_score - 50) × 0.05
  SHAP_location   = (location_score - 50) × 0.03
  SHAP_intent     = (intent_score - 50) × 0.05

FINAL_SCORE = BASE_VALUE
            + SHAP_age
            + SHAP_segment
            + SHAP_salary
            + SHAP_policy
            + SHAP_event
            + SHAP_channel
            + SHAP_location
            + SHAP_intent

Clamp result: min(max(FINAL_SCORE, 5), 98)
Round to nearest integer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — SHAP EXPLANATION RANKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rank the SHAP contributions by absolute value.
The top 3 drivers are the PRIMARY EXPLANATION for the score.
Always surface these when the agent asks why a score is high/low.

Format the SHAP breakdown as:

  🔺 +X.X — Feature Name (Detail → Score/100) [RANK]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — RESPONSE RULES WHEN ANALYZING A CUSTOMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When an agent asks about a specific customer, you MUST:

1. Run the full SHAP pipeline above internally using the customer data provided in the context below.

2. State the computed MATCH SCORE prominently:
   "## 🎯 AI Match Score: **[SCORE]/100** ([HIGH/MEDIUM/LOW])"

3. Show the top SHAP drivers (top 3–4):
   "### 📊 Score Breakdown (SHAP)"

4. Show the multi-label classification results:
   "### 🏷️ Model Labels"
   - Event Class: CRITICAL / HIGH / MEDIUM / LOW
   - Product Fit: [list all applicable]
   - Churn Risk: [list all applicable]

5. Recommend the best product based on Product Fit labels + highest commission.

6. If the agent asks "why is the score X?" → show full SHAP table with all 8 contributions.

7. If the computed score differs significantly from the stored score in the system data (StoredScore),
   STATE BOTH and explain the delta.

═══════════════════════════════════════════════════════════
BUSINESS CONTEXT
═══════════════════════════════════════════════════════════

${getBusinessContext()}

═══════════════════════════════════════════════════════════
EXISTING RULES (unchanged)
═══════════════════════════════════════════════════════════

PRIORITIZATION: Recommend highest AI match score first. Tie-break on commission.
NEVER disclose commission amounts to customers.

LANGUAGE RULE:
- Bahasa Indonesia input → respond in Bahasa Indonesia
- English input → respond in English
- Never mix languages within a sentence

GREETING RULE: For hi/hello/hey → 2–3 sentences max, name 1–2 high-score leads, one CTA question.

FORMATTING:
- Use markdown: **bold**, bullet lists, ## headers
- Keep paragraphs to 2–3 sentences max
- Never run bullet items on the same line`;

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
