# Chat UI Fix v2 — Gemini CLI Prompt

You are a senior Next.js developer working on the **Sales Booster AI** chat app.
Fix and enhance the chatbot rendering based on the issues below.

---

## ISSUE 1 — Hide Questionnaire from the Main Chat Message List

**File:** `src/components/Chat.tsx`

**Problem:** The `QuestionnaireCard` is rendering as a bubble inside the main chat scroll area, which clutters the conversation history.

**Fix:**
- In the `messages.map()` render loop inside `Chat.tsx`, add a guard to skip rendering any message whose `text` starts with `{"type":"questionnaire"}`
- Use this check before rendering a `ChatBubble`:

```js
// Skip questionnaire messages from rendering in the chat list
if (
  msg.role === "assistant" &&
  msg.text.trimStart().startsWith('{"type":"questionnaire"')
) {
  return null;
}
```

- The questionnaire flow should only remain visible inside `ChatOverlayPanel.tsx` (the floating side panel) — do NOT remove it there
- The flow logic (`useChatFlow`, `appendMessage`, `submitAnswer`) must remain fully intact — only the **visual rendering** of questionnaire bubbles is suppressed in `Chat.tsx`

---

## ISSUE 2 — Fix AI Response Text Rendering: Bite-Sized Paragraphs + Hierarchy

**File:** `src/components/chatbot/ChatBubble.tsx` → `AITextMessage` component

**Problem:** The AI returns well-structured text but it is being rendered as one long unbroken wall of text. Bold and italic work, but:
- No visual paragraph breaks
- No section headers despite emoji headers in the response (e.g. `🏆`, `💬`, `✅`, `⚠️`, `🔄`)
- Bullet and numbered lists are not rendered as proper list UI — they appear inline as raw text
- No spacing between logical sections

---

### Fix 2A — Emoji Section Headers

Detect lines where the **first character is an emoji** and render them as bold section headers.

Use this detection:

```js
const isEmojiHeader = (line: string) => /^\p{Emoji}/u.test(line.trim());
```

Render emoji header lines as:

```jsx
<div style={{
  fontSize: 14,
  fontWeight: 700,
  color: "#e2e8f0",
  marginTop: 20,
  marginBottom: 6,
  display: "flex",
  alignItems: "center",
  gap: 6,
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  paddingBottom: 6,
}}>
  {line}
</div>
```

---

### Fix 2B — Bulleted List Items

Detect lines starting with `- ` or `• ` and render them as styled list rows:

```jsx
<div style={{
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  marginBottom: 5,
  paddingLeft: 4,
}}>
  <span style={{
    color: "#6366f1",
    flexShrink: 0,
    fontSize: 18,
    lineHeight: "1.3",
    marginTop: -1,
  }}>·</span>
  <span style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
    {renderInline(line.replace(/^[-•]\s/, ""))}
  </span>
</div>
```

---

### Fix 2C — Numbered List Items

Detect lines matching `/^\d+\.\s/` and render them as styled numbered rows:

```jsx
<div style={{
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  marginBottom: 5,
  paddingLeft: 4,
}}>
  <span style={{
    color: "#6366f1",
    fontWeight: 700,
    flexShrink: 0,
    minWidth: 18,
    fontSize: 12,
    lineHeight: "1.7",
  }}>
    {num}.
  </span>
  <span style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
    {renderInline(line.replace(/^\d+\.\s/, ""))}
  </span>
</div>
```

---

### Fix 2D — Paragraph Spacing and Section Breaks

Apply the following rules when rendering plain text lines:

| Line Content | Render As |
|---|---|
| Empty line `""` | `<div style={{ height: 10 }} />` |
| `---` | `<hr>` with `border-top: 1px solid rgba(255,255,255,0.07)`, `margin: 14px 0` |
| Lines starting with `## ` | Sub-header: `font-size: 13px`, `font-weight: 700`, `color: #94a3b8`, `text-transform: uppercase`, `letter-spacing: 0.08em`, `margin-top: 16px`, `margin-bottom: 4px` |
| Lines starting with `# ` | Header: `font-size: 15px`, `font-weight: 700`, `color: #e2e8f0`, `margin-top: 16px`, `margin-bottom: 6px` |
| Normal text | `<div style={{ marginBottom: 6, lineHeight: 1.75, color: "#cbd5e1" }}>` |

**Key rule:** After a list block ends (next line is not a list item), add an extra `marginBottom: 10` spacer before the next paragraph.

---

### Fix 2E — Complete Rewrite of `AITextMessage`

Replace the existing `AITextMessage` implementation with this improved version:

```tsx
function AITextMessage({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.75, fontFamily: "inherit" }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Empty line → spacer
        if (trimmed === "") {
          return <div key={i} style={{ height: 10 }} />;
        }

        // Horizontal rule
        if (trimmed === "---") {
          return (
            <hr key={i} style={{
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              margin: "14px 0"
            }} />
          );
        }

        // Emoji section header
        if (/^\p{Emoji}/u.test(trimmed)) {
          return (
            <div key={i} style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#e2e8f0",
              marginTop: i === 0 ? 0 : 20,
              marginBottom: 6,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: 6,
            }}>
              {trimmed}
            </div>
          );
        }

        // H1
        if (trimmed.startsWith("# ")) {
          return (
            <div key={i} style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#e2e8f0",
              marginTop: 16,
              marginBottom: 6,
            }}>
              {renderInline(trimmed.slice(2))}
            </div>
          );
        }

        // H2
        if (trimmed.startsWith("## ")) {
          return (
            <div key={i} style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              marginTop: 16,
              marginBottom: 4,
            }}>
              {renderInline(trimmed.slice(3))}
            </div>
          );
        }

        // Bullet list item
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return (
            <div key={i} style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              marginBottom: 5,
              paddingLeft: 4,
            }}>
              <span style={{
                color: "#6366f1",
                flexShrink: 0,
                fontSize: 18,
                lineHeight: "1.3",
                marginTop: -1,
              }}>·</span>
              <span style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
                {renderInline(trimmed.replace(/^[-•]\s/, ""))}
              </span>
            </div>
          );
        }

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={i} style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              marginBottom: 5,
              paddingLeft: 4,
            }}>
              <span style={{
                color: "#6366f1",
                fontWeight: 700,
                flexShrink: 0,
                minWidth: 18,
                fontSize: 12,
                lineHeight: "1.7",
              }}>
                {numMatch[1]}.
              </span>
              <span style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
                {renderInline(numMatch[2])}
              </span>
            </div>
          );
        }

        // Normal paragraph line
        return (
          <div key={i} style={{ marginBottom: 6, lineHeight: 1.75, color: "#cbd5e1" }}>
            {renderInline(trimmed)}
          </div>
        );
      })}
    </div>
  );
}
```

---

## ISSUE 3 — Fix `renderInline` to Handle Bold, Italic, and Code Correctly

**File:** `src/components/chatbot/ChatBubble.tsx` → `renderInline` function

Replace the existing `renderInline` with this version that handles all three patterns without conflict:

```tsx
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    // Bold
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "#e2e8f0", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Italic (single asterisk, not double)
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={i} style={{ color: "#94a3b8", fontStyle: "italic" }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    // Inline code
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} style={{
          background: "#1e2235",
          color: "#a78bfa",
          padding: "1px 6px",
          borderRadius: 4,
          fontSize: 12,
          fontFamily: "monospace",
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
```

---

## Summary of Files to Modify

| File | What to Change |
|---|---|
| `src/components/Chat.tsx` | Skip rendering questionnaire-type messages in the chat bubble list |
| `src/components/chatbot/ChatBubble.tsx` | Replace `AITextMessage` and `renderInline` with the improved versions above |

---

## Constraints

- Do **NOT** remove questionnaire logic from `ChatOverlayPanel.tsx` — it must remain there
- Do **NOT** touch `QuestionnaireCard.tsx`, `ResponseVariantCard.tsx`, or any context/hook files
- Do **NOT** convert inline `style={}` to Tailwind inside chatbot components
- The `AssistantBubbleContent` JSON parsing block (for `questionnaire` and `variants` types) must remain **fully intact** in `ChatBubble.tsx`
- All plain-text AI responses must still render correctly after these changes
