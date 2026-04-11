"use client";

import React from "react";
import QuestionnaireCard from "./QuestionnaireCard";
import ResponseVariantCard from "./ResponseVariantCard";

// Re-export AttachedFile from ChatInput
export type { AttachedFile } from "./ChatInput";
import { AttachedFile } from "./ChatInput";

// ─── Chat message type ────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  time: string;
  attachments?: AttachedFile[]; // Now accepts attachments!
}

// ─── Internal JSON payload types ──────────────────────────────────────────────

interface QuestionnaireData {
  type: "questionnaire";
  question: string;
  inputType: "single" | "multi";
  options: string[];
}

interface VariantsData {
  type: "variants";
  variants: Array<{ label: string; content: string }>;
}

// ─── File Icon Badge (Mirrors ChatInput Aesthetic) ────────────────────────────

function FileBadge({ name, mimeType }: { name: string; mimeType: string }) {
  const ext = name.split('.').pop()?.toUpperCase() || "FILE";
  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType.startsWith("image/");
  const isSpreadsheet = mimeType === "text/csv" || mimeType.includes("excel") || mimeType.includes("spreadsheetml");

  const bgColor = isSpreadsheet ? "rgba(34, 197, 94, 0.15)" : isPdf ? "rgba(239, 68, 68, 0.15)" : isImage ? "rgba(139, 92, 246, 0.15)" : "rgba(99, 102, 241, 0.15)";
  const textColor = isSpreadsheet ? "#86efac" : isPdf ? "#fca5a5" : isImage ? "#c4b5fd" : "#a5b4fc";
  const borderColor = isSpreadsheet ? "rgba(34, 197, 94, 0.3)" : isPdf ? "rgba(239, 68, 68, 0.3)" : isImage ? "rgba(139, 92, 246, 0.3)" : "rgba(99, 102, 241, 0.3)";

  return (
    <div style={{
      width: 34, height: 34, borderRadius: 8,
      background: bgColor, border: `1px solid ${borderColor}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: textColor, letterSpacing: 0.5 }}>
        {ext.substring(0, 4)}
      </span>
    </div>
  );
}


// ─── Inline renderer: **bold** + `code` ──────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} style={{ color: "#e2e8f0", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} style={{
          background: "#1e2235", color: "#a78bfa",
          padding: "1px 6px", borderRadius: 4,
          fontSize: 12, fontFamily: "monospace",
        }}>
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

// ─── Markdown-style plain text renderer ──────────────────────────────────────

function AITextMessage({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8, fontFamily: "inherit" }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## "))
          return <div key={i} style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginTop: 14, marginBottom: 5 }}>{line.slice(3)}</div>;
        if (line.startsWith("# "))
          return <div key={i} style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0", marginTop: 14, marginBottom: 7 }}>{line.slice(2)}</div>;
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "flex-start" }}>
              <span style={{ color: "#6366f1", flexShrink: 0, fontSize: 16, lineHeight: 1.4 }}>·</span>
              <span>{renderInline(line.replace(/^[-•]\s/, ""))}</span>
            </div>
          );
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\./)?.[1];
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "flex-start" }}>
              <span style={{ color: "#6366f1", fontWeight: 700, flexShrink: 0, minWidth: 16, fontSize: 12 }}>{num}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }
        if (line === "---")
          return <hr key={i} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.05)", margin: "10px 0" }} />;
        if (line.trim() === "")
          return <div key={i} style={{ height: 6 }} />;
        return <div key={i} style={{ marginBottom: 2 }}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

// ─── Assistant bubble ─────────────────────────────────────────────────────────

function AssistantBubbleContent({
  text,
  onSubmitQuestionnaire,
}: {
  text: string;
  onSubmitQuestionnaire?: (answerText: string) => void;
}) {
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    // not JSON — render as markdown
  }

  if (parsed && typeof parsed === "object") {
    if (parsed.type === "questionnaire") {
      const data = parsed as unknown as QuestionnaireData;
      return (
        <QuestionnaireCard
          question={data.question}
          inputType={data.inputType}
          options={data.options}
          onSubmit={(answerText: string) => onSubmitQuestionnaire?.(answerText)}
        />
      );
    }

    if (parsed.type === "variants") {
      const data = parsed as unknown as VariantsData;
      return <ResponseVariantCard variants={data.variants} />;
    }
  }

  return <AITextMessage text={text} />;
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface ChatBubbleProps {
  message: ChatMessage;
  onSubmitQuestionnaire?: (answerText: string) => void;
}

export default function ChatBubble({ message, onSubmitQuestionnaire }: ChatBubbleProps) {

  // USER BUBBLE
  if (message.role === "user") {
    return (
      <div className="message" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, maxWidth: "80%" }}>

          {/* ATTACHMENTS RENDERER */}
          {message.attachments && message.attachments.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
              {message.attachments.map((att, idx) => (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12, padding: "6px 12px 6px 6px",
                  maxWidth: 220
                }}>
                  <FileBadge name={att.name} mimeType={att.mimeType} />
                  <span style={{
                    fontSize: 12, color: "#cbd5e1", fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    {att.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TEXT BUBBLE - Claude-like round square */}
          {message.text && (
            <div style={{
              background: "#3d4466",
              borderRadius: "16px",
              padding: "12px 16px",
              fontSize: "14.5px",
              color: "#f8fafc",
              lineHeight: "1.6",
              wordBreak: "break-word",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ASSISTANT BUBBLE - Ultra-minimalist: Just text
  return (
    <div className="message" style={{ 
      display: "flex", 
      gap: 16, 
      alignItems: "flex-start",
      padding: "4px 0",
      marginBottom: 16
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "15.5px", color: "#e2e8f0", lineHeight: "1.75" }}>
          <AssistantBubbleContent text={message.text} onSubmitQuestionnaire={onSubmitQuestionnaire} />
        </div>
      </div>
    </div>
  );
  }