# Chat UI Fix v4 — Title Asterisks, Text Sizing & Bottom Blur

You are a senior Next.js developer working on the **Sales Booster AI** chat app.
Fix the three visual issues described below.

---

## ISSUE 1 — Raw `**asterisks**` Showing in Emoji Section Headers

**File:** `src/components/chatbot/ChatBubble.tsx` → `AITextMessage` component

**Problem:** Lines like `🏆 **Rekomendasi Produk / Product Recommendation**` are rendered
as an emoji header div, but the `**...**` inside is passed as a raw string instead of
going through `renderInline`. So the asterisks show up literally on screen.

**Fix:** When rendering emoji header lines, wrap the content in `renderInline()` instead
of outputting the raw string:

```tsx
// BEFORE (broken):
if (/^\p{Emoji}/u.test(trimmed)) {
  return (
    <div key={i} style={{ ... }}>
      {trimmed}   // ← raw string, asterisks show up
    </div>
  );
}

// AFTER (fixed):
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
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}>
      {renderInline(trimmed)}  // ← pass through inline renderer
    </div>
  );
}
```

Apply the same fix to **every other heading branch** in `AITextMessage` that currently
passes raw strings — H1, H2, bullet items, and numbered items all already call
`renderInline()`, so only the emoji header branch needs this fix.

---

## ISSUE 2 — Text Too Small: Implement Fluid Auto-Sizing

**Problem:** The AI message text at `font-size: 13px` is too small, especially on wider
screens. Apply responsive fluid sizing across all chat text elements.

### 2A — `AITextMessage` base font size

**File:** `src/components/chatbot/ChatBubble.tsx` → `AITextMessage`

Change the wrapper div font size from `13px` to `clamp(13px, 1.1vw, 15px)`:

```tsx
// BEFORE:
<div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.75, fontFamily: "inherit" }}>

// AFTER:
<div style={{ fontSize: "clamp(13px, 1.1vw, 15px)", color: "#cbd5e1", lineHeight: 1.8, fontFamily: "inherit" }}>
```

### 2B — Emoji section header font size

In the emoji header branch, change `fontSize: 14` to `fontSize: "clamp(14px, 1.2vw, 16px)"`:

```tsx
<div style={{
  fontSize: "clamp(14px, 1.2vw, 16px)",
  fontWeight: 700,
  ...
}}>
```

### 2C — H1 heading font size

Change `fontSize: 15` to `fontSize: "clamp(15px, 1.3vw, 17px)"`:

```tsx
<div style={{
  fontSize: "clamp(15px, 1.3vw, 17px)",
  fontWeight: 700,
  ...
}}>
```

### 2D — H2 subheading font size

Change `fontSize: 13` to `fontSize: "clamp(12px, 1vw, 14px)"`:

```tsx
<div style={{
  fontSize: "clamp(12px, 1vw, 14px)",
  fontWeight: 700,
  ...
}}>
```

### 2E — Assistant bubble outer wrapper

**File:** `src/components/chatbot/ChatBubble.tsx` → ASSISTANT BUBBLE section

Find the assistant bubble content wrapper div and update its font size:

```tsx
// BEFORE:
<div style={{ fontSize: "15.5px", color: "#e2e8f0", lineHeight: "1.75" }}>

// AFTER:
<div style={{ fontSize: "clamp(14px, 1.2vw, 16px)", color: "#e2e8f0", lineHeight: "1.8" }}>
```

### 2F — User bubble font size

Find the user bubble text div and update:

```tsx
// BEFORE:
<div style={{
  ...
  fontSize: "14.5px",
  ...
}}>

// AFTER:
<div style={{
  ...
  fontSize: "clamp(13px, 1.1vw, 15px)",
  ...
}}>
```

---

## ISSUE 3 — Bottom Blur Overlay So Text Doesn't Bleed Behind the Input Box

**Problem:** Messages scroll underneath the floating input box and remain fully readable
behind it. There should be a frosted-glass fade that masks the text as it approaches
the bottom, making the input area feel elevated and cutting off the text cleanly.

### 3A — Add a gradient fade overlay in `Chat.tsx`

**File:** `src/components/Chat.tsx`

Inside the `.chat-container` → `.centered-content` div, add a **fade overlay div**
directly above the fixed input area. It must be `position: absolute` so it sits on top
of the scrolling message list but below the input box:

```tsx
{/* Bottom fade overlay — masks scrolling text behind the input */}
<div style={{
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 180,
  background: "linear-gradient(to top, #080a12 0%, #080a12 30%, rgba(8,10,18,0.85) 60%, transparent 100%)",
  pointerEvents: "none",
  zIndex: 14,
}} />
```

Place this div **inside** `.centered-content`, right **before** the fixed input area div
(the one with `position: "absolute", bottom: 0, zIndex: 15`).

> The `zIndex: 14` ensures the fade sits above messages (`z: auto`) but below the input
> box (`z: 15`), so the input remains fully interactive.

### 3B — Add the same fade overlay in `ChatOverlayPanel.tsx`

**File:** `src/components/chatbot/ChatOverlayPanel.tsx`

Inside the scrollable message area wrapper div (the one with `flex: 1, overflowY: "auto"`),
add a fade overlay as a **sibling after** the scrollable div, before the fixed input div:

```tsx
{/* Bottom fade overlay */}
<div style={{
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 140,
  background: "linear-gradient(to top, rgba(13,15,26,1) 0%, rgba(13,15,26,0.9) 25%, rgba(13,15,26,0.5) 60%, transparent 100%)",
  pointerEvents: "none",
  zIndex: 14,
}} />
```

> Use `rgba(13,15,26,...)` to match the overlay panel's background color (`#0d0f1a`),
> not the main chat's `#080a12`.

### 3C — Increase bottom padding on message list so last message is not hidden

**File:** `src/components/Chat.tsx`

Find the messages inner div with `paddingBottom: 180` and increase it slightly to ensure
the last message is never completely hidden behind the fade + input:

```tsx
// BEFORE:
<div className="messages-max-width" style={{ padding: "40px 0 180px", ... }}>

// AFTER:
<div className="messages-max-width" style={{ padding: "40px 0 200px", ... }}>
```

**File:** `src/components/chatbot/ChatOverlayPanel.tsx`

Find the messages inner div with `paddingBottom: 120` and update:

```tsx
// BEFORE:
<div style={{ padding: "20px", ... paddingBottom: 120 }}>

// AFTER:
<div style={{ padding: "20px 20px 140px 20px", ... }}>
```

---

## Summary of Files to Modify

| File | Issues Fixed |
|---|---|
| `src/components/chatbot/ChatBubble.tsx` | Issue 1 (asterisks in headers), Issue 2A–2F (fluid text sizing) |
| `src/components/Chat.tsx` | Issue 3A (bottom fade), Issue 3C (padding) |
| `src/components/chatbot/ChatOverlayPanel.tsx` | Issue 3B (overlay fade), Issue 3C (padding) |

---

## Constraints

- Do **NOT** change any logic, hooks, context, or API files
- Do **NOT** change Tailwind classes elsewhere in the app — these fixes use inline `style={}`
- The `pointerEvents: "none"` on fade overlays is critical — do not remove it or the input will break
- `clamp()` values use `px` units inside — ensure they are passed as **strings** in the style object, not numbers
- Do **NOT** touch `QuestionnaireCard.tsx` or `ResponseVariantCard.tsx`
