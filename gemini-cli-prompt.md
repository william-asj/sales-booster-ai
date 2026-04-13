# Gemini CLI Prompt: Enhance Chatbot UX (Streaming + Claude-like Questionnaire)

## Project Context

This is the **Sales Booster AI** project — a Next.js 16 + TypeScript + Tailwind CSS insurance CRM
for Simas Jiwa agents. The chatbot overlay lives in `src/components/chatbot/`. The AI backend uses
`src/app/api/chat/route.ts` (Gemini API). All relevant component code is already written.

---

## What I Need You To Do

Make **three interconnected enhancements** to the chatbot system. Read all files listed below before
writing any code, then implement all changes in one pass.

### Files to read first:
- `src/app/api/chat/route.ts`
- `src/components/chatbot/ChatBubble.tsx`
- `src/components/chatbot/QuestionnaireCard.tsx`
- `src/components/chatbot/ChatOverlayPanel.tsx`
- `src/components/Chat.tsx`
- `src/hooks/useChatFlow.ts`
- `src/context/ChatContext.tsx`

---

## Enhancement 1 — Streaming Word-by-Word Response (Claude-style)

### Goal
Replace the current all-at-once response rendering with a **token-by-token streaming effect** that
mimics how Claude.ai types out responses in real time.

### Backend changes (`src/app/api/chat/route.ts`)
- Switch from `chat.sendMessage()` to `chat.sendMessageStream()` using the Gemini streaming API.
- Return a `ReadableStream` using the Web Streams API (`new ReadableStream(...)`) with
  `Content-Type: text/event-stream` headers.
- Stream format: SSE chunks, each line is `data: <token_text>\n\n`. Send `data: [DONE]\n\n` when
  finished.
- Keep all existing logic (system instruction, history formatting, model selection, error handling).

### Frontend changes (`src/components/chatbot/ChatOverlayPanel.tsx` and `src/components/Chat.tsx`)
- Replace `fetch + res.json()` with a streaming fetch using `res.body.getReader()`.
- As each chunk arrives, decode it and append the token to a `streamingText` local state variable.
- Render an **in-progress assistant bubble** as tokens stream in — the bubble appears immediately and
  grows word by word. Do NOT wait for the full response before showing anything.
- When `[DONE]` is received: finalize by calling `appendMessage()` with the complete text, clear
  `streamingText`.
- The typing indicator (bouncing dots) should appear only BEFORE the first token arrives. Once
  streaming starts, replace it with the live growing bubble.
- Keep the existing `isTyping` and `error` state logic.

---

## Enhancement 2 — Claude-like Questionnaire (navigable, pop-out cards)

### Goal
Redesign the questionnaire flow so questions appear as **distinct, navigable step cards** inside the
chat — like Claude's artifacts or structured forms. Users can go **back and forth** between steps
before final submit. Only the current active step is interactive; previous ones show their locked
answer.

### Changes to `src/hooks/useChatFlow.ts`
- Add a `goBack()` function that decrements `flowState.step` and removes the last answer from
  `flowState.answers`.
- Export `goBack` alongside `startFlow`, `submitAnswer`, `resetFlow`.

### Changes to `src/components/chatbot/QuestionnaireCard.tsx`

Replace the current simple card with a **multi-step wizard card** that:

**Visual layout:**
```
┌──────────────────────────────────────┐
│  Step 2 of 5  ●●○○○  [← Back]       │
│──────────────────────────────────────│
│  Current Priority                    │
│  Saat ini, apa yang paling Anda...   │
│                                      │
│  ○  Melindungi keluarga dari risiko  │
│  ○  Menabung untuk pendidikan anak   │
│  ○  Mengembangkan aset dan investasi │
│  ○  Mempersiapkan masa pensiun       │
│                                      │
│              [Next →] or [Submit ✓]  │
└──────────────────────────────────────┘
```

**Behavior:**
- Show step indicator: `Step X of 5` with filled/unfilled dot progress bar.
- Show a `← Back` button (disabled on step 1).
- The card renders ALL steps but only shows one at a time via an internal `currentStep` state.
- Previous answers are shown ABOVE the card as locked summary rows (not editable via card — user
  must click Back to change them).
- `Next →` button advances to the next step and saves the answer in local card state.
- On the final step (step 5), the button label changes to `Submit ✓`.
- On submit: call `onSubmit(allAnswers)` passing a structured object with all 5 answers — NOT one
  at a time.
- Animation: slide or fade transition between steps (CSS transition, no library).
- Card max-width: `380px`. Background: `#13151f`. Border: `1px solid #1e2235`. Border-radius: `16px`.

**Props interface (update to):**
```ts
interface Props {
  steps: Array<{
    label: string;
    question: string;
    options: string[];
  }>;
  onSubmit: (answers: Record<string, string>) => void;
  onBack?: () => void; // called when user clicks Back on step 1 to cancel the flow entirely
}
```

### Changes to `src/hooks/useChatFlow.ts`
- `startFlow()` should now return a single `QuestionnaireMessage` that contains the **full list of
  steps** (all 5 questions from `RECOMMEND_FLOW`) — not just step 1.
- The JSON payload in the message text should be:
  ```json
  {
    "type": "questionnaire",
    "steps": [
      { "label": "Family Situation", "question": "...", "options": ["..."] },
      ...
    ]
  }
  ```
- `submitAnswer()` is no longer called per-step. Instead, the card calls a **single** `onSubmit`
  with all answers at once when the user finishes step 5.
- Update `ChatOverlayPanel.tsx` and `Chat.tsx` to call `buildRecommendPrompt(finalAnswers,
  products)` and `sendToAI()` directly from the questionnaire's `onSubmit` handler.

### Changes to `src/components/chatbot/ChatBubble.tsx`
- Update the JSON parser to handle the new `steps` array format (instead of per-step `question` +
  `options` fields).
- Pass `steps` down to the updated `QuestionnaireCard`.

---

## Enhancement 3 — Claude-style Q&A Summary Bubble

### Goal
After the user completes the questionnaire and submits, show a **formatted summary bubble** in the
user's chat side that looks like a structured Q&A transcript — not a plain text blob.

### Format (rendered in the user bubble, right-aligned)
```
Q: Apakah Anda sudah berkeluarga dan memiliki tanggungan?
A: Sudah menikah, punya anak

Q: Saat ini, apa yang paling Anda prioritaskan?
A: Menabung untuk pendidikan anak

Q: Apakah Anda sudah memiliki asuransi sebelumnya?
A: Sudah punya, tapi hanya dari kantor

Q: Apakah ada riwayat kesehatan yang perlu diperhatikan?
A: Tidak ada, kondisi sehat

Q: Berapa kisaran premi bulanan yang nyaman untuk Anda?
A: Rp 500.000 – Rp 2.000.000
```

### Implementation
- In `ChatOverlayPanel.tsx` and `Chat.tsx`, when the questionnaire's `onSubmit` fires, build a
  display string of the Q&A pairs in the format above using the `RECOMMEND_FLOW` step labels and the
  user's answers.
- Call `appendMessage()` with this formatted string as the user bubble text — this is separate from
  the actual AI prompt (which uses `buildRecommendPrompt`).
- In `ChatBubble.tsx`, detect user bubbles that start with `Q:` on the first line and render them
  with a distinct style:
  - `Q:` label: `color: #94a3b8, fontSize: 11px, fontWeight: 700, textTransform: uppercase,
    letterSpacing: 0.1em`
  - Answer text: `color: #e2e8f0, fontSize: 13px, fontWeight: 500`
  - Each Q&A pair separated by `12px` of vertical spacing.
  - Wrap the whole block in the existing user bubble style (right-aligned, `background: #3d4466`,
    `borderRadius: 16px`, `padding: 14px 16px`).

---

## Style & Constraints

- Dark theme: `#080a12` bg, `#0d0f1a` cards, `#1e2235` borders, `#6366f1` brand, `#e2e8f0` text.
- Font: `Segoe UI, sans-serif` throughout.
- No external UI libraries — Tailwind + inline styles only (match existing component patterns).
- `lucide-react` available for icons.
- All TypeScript — no `any` types unless absolutely unavoidable.
- Guard all `window` / browser API access with `typeof window !== "undefined"`.
- Do NOT touch: `Sidebar.tsx`, `Dashboard.tsx`, `Customers.tsx`, `Analytics.tsx`, `globals.css`,
  `data.ts`, `layout.tsx` (unless strictly necessary for the stream import).
- Preserve all existing functionality: voice input, file attachments, session history, slash
  commands, `ResponseVariantCard`.

---

## Deliverables

Produce the full updated content for each changed file:
1. `src/app/api/chat/route.ts` — streaming SSE backend
2. `src/hooks/useChatFlow.ts` — full steps payload + goBack
3. `src/components/chatbot/QuestionnaireCard.tsx` — multi-step wizard
4. `src/components/chatbot/ChatBubble.tsx` — new questionnaire format + Q&A bubble style
5. `src/components/chatbot/ChatOverlayPanel.tsx` — streaming fetch + new questionnaire handler
6. `src/components/Chat.tsx` — streaming fetch + new questionnaire handler

Output each file as a complete replacement — no partial diffs.
