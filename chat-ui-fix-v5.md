# Chat UI Fix v5 — Restore Dark Glassmorphism Theme

You are a senior Next.js developer working on the **Sales Booster AI** chat app.
The chat page (`src/components/Chat.tsx`) has lost its dark glassmorphism background
and reverted to a plain light/white theme. Restore it to match the dark indigo aesthetic
of all other pages (Dashboard, Leads, Events, etc.) while keeping all typography
improvements from the previous fixes.

Reference the existing `globals.css` for the design tokens already in use:
- Background: `#080a12`
- Glass panel: `rgba(20, 22, 39, 0.4)` with `backdrop-filter: blur(24px)`
- Border: `rgba(255, 255, 255, 0.05)`
- Ambient gradient: `radial-gradient` with indigo `rgba(99, 102, 241, 0.08)` and purple `rgba(139, 92, 246, 0.08)`

---

## FIX 1 — Restore Dark Background on the Chat Page Wrapper

**File:** `src/components/Chat.tsx`

Find the outermost wrapper div of the `Chat` component (the one with className
`page-content`) and restore its background and ambient gradient:

```tsx
// BEFORE (broken — likely missing or overridden):
<div className="page-content" style={{
  display: "flex", gap: 24, height: "calc(100vh - 48px)", padding: "24px",
  fontFamily: "'Segoe UI', sans-serif", background: "#080a12"
}}>

// AFTER (restored with ambient glow):
<div className="page-content" style={{
  display: "flex",
  gap: 24,
  height: "calc(100vh - 48px)",
  padding: "24px",
  fontFamily: "'Segoe UI', sans-serif",
  background: "#080a12",
  backgroundImage: `
    radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08), transparent 25%)
  `,
  backgroundAttachment: "fixed",
}}>
```

---

## FIX 2 — Restore Glassmorphism on the Left Sidebar (Chat History Panel)

**File:** `src/components/Chat.tsx`

Find the `.glass-sidebar` div and ensure its inline styles use the correct glass values.
Replace or update the `glass-sidebar` CSS block inside the `<style>` tag in `Chat.tsx`:

```css
.glass-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  background: rgba(20, 22, 39, 0.4);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: hidden;
}
```

---

## FIX 3 — Restore Glassmorphism on the Main Chat Container

**File:** `src/components/Chat.tsx`

Find the `.chat-container` CSS block inside the `<style>` tag and restore:

```css
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: rgba(20, 22, 39, 0.4);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: hidden;
}
```

---

## FIX 4 — Restore Dark Text Colors Throughout Chat.tsx

**File:** `src/components/Chat.tsx`

Audit every hardcoded color in the file and ensure they use the dark-mode palette.
Apply these corrections wherever the light theme has crept in:

| Element | Wrong value | Correct value |
|---|---|---|
| Any background | `#fff`, `white`, `#f*`, `rgb(255*)` | `#080a12` or `rgba(20,22,39,0.4)` |
| Body text | `#000`, `#111`, `#333`, dark grays | `#cbd5e1` or `#e2e8f0` |
| Muted text | any dark muted color | `#94a3b8` |
| Very muted / labels | any dark subtle color | `#475569` |
| Borders | `#ddd`, `#eee`, light borders | `rgba(255,255,255,0.05)` |
| Input background | light color | `rgba(255,255,255,0.03)` |
| Hover states | light hover | `rgba(255,255,255,0.05)` |

Specifically check and fix these sections:
- The **Chat History** sidebar header text (should be `#94a3b8`)
- The **session list items** — active item background `rgba(255,255,255,0.05)`, text `#f8fafc`; inactive text `#94a3b8`
- The **empty state** "No chat history yet." text (should be `#475569`)
- The **"How can I help you today?"** heading (should be `#f8fafc`)
- The **suggestion buttons** in the empty state:
  - background: `rgba(255,255,255,0.02)`
  - border: `1px solid rgba(255,255,255,0.05)`
  - color: `#94a3b8`
  - hover background: `rgba(255,255,255,0.05)`
- The **error banner** (already correct — keep as is)
- The **"AI can make mistakes"** footer text (should be `#475569`)

---

## FIX 5 — Restore Glassmorphism on the ChatInput Component

**File:** `src/components/chatbot/ChatInput.tsx`

The input box must match the dark theme. Find the main input wrapper div (the one with
`borderRadius: 24`, `border`, `background`) and ensure:

```tsx
// The outer input container:
style={{
  background: "rgba(13, 15, 26, 0.92)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  borderRadius: 24,
  border: `1px solid ${focused ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.12)"}`,
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  // ... rest unchanged
}}
```

Also ensure the textarea itself has:
```tsx
style={{
  background: "transparent",
  color: "#e2e8f0",
  caretColor: "#818cf8",
  // ... rest unchanged
}}
```

---

## FIX 6 — Restore Header Area Inside the Chat Panel

**File:** `src/components/Chat.tsx`

Find the chat header div (the one showing session title and Online status) and ensure:

```tsx
// Session title:
style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc" }}

// Online indicator dot:
style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74, 222, 128, 0.4)" }}

// "Online" label text:
style={{ color: "#94a3b8" }}

// Header border bottom:
style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}
```

---

## FIX 7 — Do NOT Change ChatBubble.tsx

**File:** `src/components/chatbot/ChatBubble.tsx`

**Do not touch this file at all.** The typography improvements (fluid font sizing,
`renderInline`, `AITextMessage`, emoji headers, bullet lists) from v4 must be preserved
exactly as they are. The visual breakage is only in `Chat.tsx` and `ChatInput.tsx`.

---

## FIX 8 — Verify ChatOverlayPanel.tsx is Unaffected

**File:** `src/components/chatbot/ChatOverlayPanel.tsx`

Do a quick audit — ensure the overlay panel still uses:
- Outer wrapper: `background: "rgba(255, 255, 255, 0.04)"`, `backdropFilter: "blur(24px)"`, `border: "1px solid rgba(255, 255, 255, 0.08)"`
- Header: `background: "rgba(13, 15, 26, 0.2)"`

If these values are correct, make no changes to this file.

---

## Summary of Files to Modify

| File | What to Change |
|---|---|
| `src/components/Chat.tsx` | Restore dark background, glass sidebar, glass chat container, all text colors |
| `src/components/chatbot/ChatInput.tsx` | Verify and restore dark glass input styling |
| `src/components/chatbot/ChatOverlayPanel.tsx` | Audit only — fix if broken, skip if correct |

---

## Constraints

- Do **NOT** touch `ChatBubble.tsx` — typography from v4 must be preserved
- Do **NOT** change `globals.css` — the design tokens are already correct there
- Do **NOT** add Tailwind classes inside chatbot component files — use inline `style={}`
- Do **NOT** touch any hook, context, or API route files
- The `clamp()` font sizing values from v4 must remain intact in `ChatBubble.tsx`
- After the fix, the Chat page must visually match the dark indigo glassmorphism style of the Dashboard, Leads, Events, and Customers pages
