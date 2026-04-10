## PENDING
- useChatOverlay.ts — open/close hook, isOpen: boolean
- ChatOverlayPanel.tsx — fixed right panel, 400px, accepts children
- ChatBubble.tsx — left (assistant) / right (user) bubble, handles: text | questionnaire | variants

## JSON Schemas (frozen, do not change)
- type: "questionnaire" → { question, inputType: "single"|"multi", options[] }
- type: "variants" → { variants: [{ label, content }] }

## Pending 🔲
- QuestionnaireCard.tsx
- ResponseVariantCard.tsx
- ChatInput.tsx