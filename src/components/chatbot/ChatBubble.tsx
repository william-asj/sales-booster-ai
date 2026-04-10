"use client";

import React from "react";
import QuestionnaireCard from "./QuestionnaireCard";
import ResponseVariantCard from "./ResponseVariantCard";

// Re-export AttachedFile from ChatInput so ChatOverlayPanel has one import source
export type { AttachedFile } from "./ChatInput";

// ─── Chat message type ────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  time: string;
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
          return <hr key={i} style={{ border: "none", borderTop: "1px solid #1e2235", margin: "10px 0" }} />;
        if (line.trim() === "")
          return <div key={i} style={{ height: 6 }} />;
        return <div key={i} style={{ marginBottom: 2 }}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

// ─── Assistant bubble — tries JSON parse, falls back to plain text ────────────

function AssistantBubbleContent({
  text,
  onSubmitQuestionnaire,
}: {
  text: string;
  onSubmitQuestionnaire?: (answerText: string) => void;
}) {
  try {
    const parsed = JSON.parse(text);

    if (parsed.type === "questionnaire") {
      const data = parsed as QuestionnaireData;
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
      const data = parsed as VariantsData;
      return <ResponseVariantCard variants={data.variants} />;
    }
  } catch {
    // not JSON — render as markdown
  }

  return <AITextMessage text={text} />;
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface ChatBubbleProps {
  message: ChatMessage;
  onSubmitQuestionnaire?: (answerText: string) => void;
}

export default function ChatBubble({ message, onSubmitQuestionnaire }: ChatBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="message" style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ maxWidth: "75%" }}>
          <div style={{
            background: "#6366f1",
            borderRadius: "12px 12px 4px 12px",
            padding: "9px 13px",
            fontSize: 13, color: "#fff", lineHeight: 1.6, wordBreak: "break-word",
          }}>
            {message.text}
          </div>
          <div style={{ fontSize: 10, color: "#334155", marginTop: 3, textAlign: "right" }}>
            {message.time}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, flexShrink: 0, marginTop: 2,
      }}>
        🤖
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "#475569", marginBottom: 6, fontWeight: 600 }}>
          AI Sales Assistant · {message.time}
        </div>
        <AssistantBubbleContent text={message.text} onSubmitQuestionnaire={onSubmitQuestionnaire} />
      </div>
    </div>
  );
}