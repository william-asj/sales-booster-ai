# Chat UI Fix v3 — Root Cause Fix for Wall-of-Text + Broken Opening Statement

You are a senior Next.js developer working on the **Sales Booster AI** chat app.

Looking at the screenshots, the real root causes are:

1. **The AI (Gemini) is not inserting newlines** between sections — it sends everything as one continuous paragraph blob, so the renderer has nothing to split on
2. **The system prompt** in `src/app/api/chat/route.ts` does not instruct Gemini to use structured markdown formatting
3. **The response text needs to be post-processed** to fix missing newlines before it reaches the renderer
4. **The opening statement is broken** because the `buildRecommendPrompt` output format is not being enforced strictly enough

Fix all four issues as described below.

---

## FIX 1 — Enforce Markdown Formatting in the System Prompt

**File:** `src/app/api/chat/route.ts`

Find the `systemInstruction` string and **append** the following formatting rules block at the end, before the closing backtick:

```
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
- When giving a product recommendation, ALWAYS use this exact structure with blank lines between each section:

🏆 Rekomendasi Produk / Product Recommendation
[one sentence]

💬 Kalimat Pembuka / Opening Line
[one sentence the agent says out loud]

✅ Poin Utama / Key Benefits
- [benefit 1]
- [benefit 2]
- [benefit 3]

⚠️ Celah Perlindungan / Coverage Gap
[one paragraph max]

🔄 Alternatif / Backup Option
[one sentence]
```

---

## FIX 2 — Post-Process the AI Response to Inject Missing Newlines

**File:** `src/app/api/chat/route.ts`

After getting `responseText` from Gemini, run it through a `formatAIResponse()` helper before returning it. Add this function **above** the `POST` handler:

```ts
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
```

Then in the `POST` handler, replace:

```ts
return NextResponse.json({ text: responseText });
```

With:

```ts
return NextResponse.json({ text: formatAIResponse(responseText) });
```

---

## FIX 3 — Fix the `buildRecommendPrompt` to Be Stricter

**File:** `src/lib/prompts.ts`

Find the `buildRecommendPrompt` function and replace the entire return string template with this stricter version that forces Gemini to use blank lines between every section:

```ts
export function buildRecommendPrompt(answers: RecommendAnswers, products: Product[]): string {
  const productList = products
    .map((p) => `- ${p.name} (${p.category}): ${p.description}. Premium: ${p.premium}`)
    .join("\n");

  return `
You are SalesBooster AI, a senior insurance advisor assistant for Simas Jiwa agents.
An agent is currently sitting face-to-face with a customer and needs your recommendation RIGHT NOW.

CUSTOMER PROFILE:
- Family Situation: ${answers.familySituation}
- Current Priority: ${answers.currentPriority}
- Existing Coverage: ${answers.existingCoverage}
- Health Concern: ${answers.healthConcern}
- Monthly Budget: ${answers.monthlyBudget}

AVAILABLE PRODUCTS:
${productList}

CRITICAL FORMATTING INSTRUCTIONS:
You MUST respond using EXACTLY this structure.
Put a BLANK LINE between EVERY section.
Do NOT merge sections together.
Do NOT run text from different sections on the same line.

🏆 Rekomendasi Produk / Product Recommendation
[Product name] — [one sentence explaining why it fits this specific customer's profile]

💬 Kalimat Pembuka / Opening Line
[A single natural sentence the agent says out loud to the customer in Bahasa Indonesia]

✅ Poin Utama / Key Benefits
- [Benefit 1 — tailored to the customer's answers above]
- [Benefit 2 — tailored to the customer's answers above]
- [Benefit 3 — tailored to the customer's answers above]

⚠️ Celah Perlindungan / Coverage Gap
[Maximum 2 sentences: what protection gap exists based on their existing coverage and health answers]

🔄 Alternatif / Backup Option
[Second-best product name] — [one sentence why, if the customer hesitates on the main recommendation]

Keep the tone confident, warm, and practical.
Write as if advising a colleague in a real sales meeting.
`.trim();
}
```

---

## FIX 4 — Fix the Opening Statement Issue in `systemInstruction`

**File:** `src/app/api/chat/route.ts`

**Problem:** When the user says "hey" or asks a general question, Gemini responds with a broken opening that mixes English and Indonesian mid-sentence without proper structure.

Find the `systemInstruction` constant and update the **opening behavior instructions** section. Add these lines right after the existing system context block:

```ts
const systemInstruction = `You are SalesBooster AI, an intelligent assistant for Indonesian insurance 
agents at Simas Jiwa. Help agents with lead analysis, product recommendations, 
and drafting personalized pitches.

${getBusinessContext()}

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
```

> **Important:** This replaces the entire `systemInstruction` const. Make sure `getBusinessContext()` is still called inside it as shown above.

---

## Summary of Files to Modify

| File | What to Change |
|---|---|
| `src/app/api/chat/route.ts` | Add `formatAIResponse()` helper, apply it to response, replace full `systemInstruction` |
| `src/lib/prompts.ts` | Replace `buildRecommendPrompt` return string with stricter version |

---

## Constraints

- Do **NOT** change any component files (`ChatBubble.tsx`, `Chat.tsx`, etc.)
- Do **NOT** change the Gemini model name or API call structure
- Do **NOT** remove `getBusinessContext()` from the system instruction
- The `formatAIResponse` function must handle Unicode emoji ranges correctly using the `u` flag
- All existing API route exports (`POST`) must remain intact
