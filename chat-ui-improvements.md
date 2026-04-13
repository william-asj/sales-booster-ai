# Chat UI Improvements — Gemini CLI Prompt

You are a senior Next.js developer working on a Sales Booster AI chat app.
Refactor the following files to implement these 4 UI/UX improvements:

---

## TASK 1 — Remove text bubble during loading

**Files:** `src/components/Chat.tsx`, `src/components/chatbot/ChatOverlayPanel.tsx`

In the `TypingIndicator` component (present in both files):

- **REMOVE** the text label `"Gemini is thinking..."` from inside the animated dots bubble
- Keep **ONLY** the three animated dots inside the bubble container
- The avatar icon (Sparkles gradient circle) must still appear on the left
- Result: a clean, minimal dots-only animation with no text clutter while waiting

---

## TASK 2 — Rich markdown rendering in AI responses

**File:** `src/components/chatbot/ChatBubble.tsx`

Improve the `AITextMessage` component and `AssistantBubbleContent` renderer:

### Numbered & Bulleted Lists
- Lines starting with `- ` or `• ` → render as styled **bullet list items**
- Lines matching `/^\d+\.\s/` → render as styled **numbered list items**
- Each list item should have a left accent dot/number in indigo (`#6366f1`) and the text beside it
- Group consecutive list items visually (add slight spacing between groups vs paragraphs)

### Emoji Section Headers
Lines starting with an emoji (e.g. `🏆`, `💬`, `✅`, `⚠️`, `🔄`) must be detected and rendered as **section header rows**:

```
font-size: 14px
font-weight: 700
color: #e2e8f0
margin-top: 18px
margin-bottom: 6px
```

Use this regex to detect emoji-leading lines:

```js
/^[\u{1F300}-\u{1FFFF}]/u
```

> This handles structured output from `buildRecommendPrompt` which uses emoji headers like `🏆 Rekomendasi Produk`.

---

## TASK 3 — Strategic emphasis for key terms

**File:** `src/components/chatbot/ChatBubble.tsx` → `renderInline` function

The existing `renderInline` already handles `**bold**`. Make the following additions:

1. **Bold** (`**text**`) — verify it renders as:
   - `font-weight: 700`
   - `color: #e2e8f0`

2. **Italic** (`*text*` single asterisk) — add support:
   - Render as `<em>` tag
   - `color: #94a3b8`
   - `font-style: italic`

Update the `renderInline` regex split pattern to also capture single-asterisk italic:

```js
/(\*\*.*?\*\*|`.*?`|\*(?!\s).*?(?<!\s)\*)/g
```

---

## TASK 4 — Code block rendering

**File:** `src/components/chatbot/ChatBubble.tsx` → `AITextMessage` function

Add support for fenced code blocks (` ``` `):

### Detection
Before splitting by `\n`, detect triple-backtick blocks — text between ` ``` ` and ` ``` `.

### Rendering
Render them as a `<pre><code>` block with this style:

```
background:    #0d0f1a
border:        1px solid rgba(255,255,255,0.08)
border-radius: 10px
padding:       14px 16px
font-family:   'Courier New', monospace
font-size:     12px
color:         #a78bfa
overflow-x:    auto
margin:        10px 0
```

### Language Label
Add a small header bar **above** the code block showing the language (if provided after the opening backticks):

```
font-size:      10px
color:          #475569
text-transform: uppercase
margin-bottom:  6px
```

Example input → output:

````
```js
const x = 1;
```
````

Renders as a labeled (`JS`) purple-tinted code block.

---

## Files to Modify

| File | Tasks |
|---|---|
| `src/components/chatbot/ChatBubble.tsx` | 2, 3, 4 |
| `src/components/Chat.tsx` | 1 |
| `src/components/chatbot/ChatOverlayPanel.tsx` | 1 |

---

## Constraints

- Do **NOT** change any layout, sizing, or color variables outside the specific elements listed above
- Do **NOT** touch `QuestionnaireCard.tsx`, `ResponseVariantCard.tsx`, or any hook/context files
- Preserve all existing `style={}` **inline styling patterns** — no Tailwind inside chatbot components
- All changes must be **backward-compatible** — existing plain-text messages must still render correctly
