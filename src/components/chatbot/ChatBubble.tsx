"use client";

import React from "react";
import { Sparkles } from "lucide-react";
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
  steps: Array<{
    label: string;
    question: string;
    options: string[];
  }>;
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


import ReactMarkdown from "react-markdown";

// ... (renderInline and AITextMessage functions will be replaced)

function AITextMessage({ text }: { text: string }) {
  return (
    <div style={{ 
      fontSize: "var(--base-size)", 
      color: "var(--claude-text)", 
      lineHeight: "var(--line-height)", 
      fontFamily: "var(--font-main)",
    }}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 style={{ fontSize: "1.2rem", fontWeight: "700", margin: "1rem 0 0.5rem 0", lineHeight: "1.4" }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "1rem 0 0.4rem 0", lineHeight: "1.4" }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: "1rem", fontWeight: "700", margin: "0.875rem 0 0.35rem 0", lineHeight: "1.4" }}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p style={{ margin: "0 0 0.75rem 0", lineHeight: "1.6", fontSize: "0.9rem" }}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: "0 0 0.75rem 0", paddingLeft: "1.25rem" }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: "0 0 0.75rem 0", paddingLeft: "1.25rem" }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: "0.35rem", lineHeight: "1.6", fontSize: "0.9rem" }}>
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: "700" }}>{children}</strong>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

// ─── Assistant bubble ─────────────────────────────────────────────────────────

function AssistantBubbleContent({
  text,
  onSubmitQuestionnaire,
  onBackQuestionnaire,
}: {
  text: string;
  onSubmitQuestionnaire?: (answers: Record<string, string>) => void;
  onBackQuestionnaire?: () => void;
}) {
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    // not JSON
  }

  if (parsed && typeof parsed === "object") {
    if (parsed.type === "questionnaire") {
      const data = parsed as unknown as QuestionnaireData;
      return (
        <div style={{ marginTop: 12 }}>
          <QuestionnaireCard 
            steps={data.steps} 
            onSubmit={onSubmitQuestionnaire!}
            onBack={onBackQuestionnaire}
          />
        </div>
      );
    }

    if (parsed.type === "variants") {
      const data = parsed as unknown as VariantsData;
      return <ResponseVariantCard variants={data.variants} />;
    }
  }

  return <AITextMessage text={text} />;
}

// ─── User Q&A Formatted Bubble ──────────────────────────────────────────────

function UserQABubble({ text }: { text: string }) {
  const lines = text.split("\n");
  const pairs: Array<{ q: string; a: string }> = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("Q: ")) {
      const q = lines[i].slice(3);
      const a = lines[i + 1]?.startsWith("A: ") ? lines[i + 1].slice(3) : "";
      pairs.push({ q, a });
      i++; // skip next line as it's the answer
    }
  }

  if (pairs.length === 0) return <>{text}</>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {pairs.map((pair, idx) => (
        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ 
            color: "#94a3b8", 
            fontSize: 11, 
            fontWeight: 700, 
            textTransform: "uppercase", 
            letterSpacing: "0.1em" 
          }}>
            Q: {pair.q}
          </div>
          <div style={{ 
            color: "#e2e8f0", 
            fontSize: 13, 
            fontWeight: 500 
          }}>
            {pair.a}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface ChatBubbleProps {
  message: ChatMessage;
  onSubmitQuestionnaire?: (answers: Record<string, string>) => void;
  onBackQuestionnaire?: () => void;
}

export default function ChatBubble({ message, onSubmitQuestionnaire, onBackQuestionnaire }: ChatBubbleProps) {
  let isQuestionnaire = false;
  try {
    const parsed = JSON.parse(message.text);
    if (parsed.type === "questionnaire") isQuestionnaire = true;
  } catch { /* not JSON */ }

  // USER BUBBLE
  if (message.role === "user") {
    const isQA = message.text.startsWith("Q: ");

    return (
      <div className="message" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, maxWidth: "80%" }}>

          {/* ATTACHMENTS RENDERER */}
          {message.attachments && message.attachments.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
              {message.attachments.map((att, idx) => (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "var(--claude-accent)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12, padding: "6px 12px 6px 6px",
                  maxWidth: 220
                }}>
                  <FileBadge name={att.name} mimeType={att.mimeType} />
                  <span style={{
                    fontSize: 12, color: "var(--claude-text)", fontWeight: 500,
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
              background: "var(--claude-accent)",
              borderRadius: "16px",
              padding: "14px 16px",
              fontSize: "var(--base-size)",
              color: "var(--claude-text)",
              lineHeight: "var(--line-height)",
              fontFamily: "var(--font-main)",
              wordBreak: "break-word",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}>
              {isQA ? <UserQABubble text={message.text} /> : message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ASSISTANT BUBBLE
  return (
    <div className="message" style={{ 
      display: "flex", 
      gap: 12, 
      alignItems: "flex-start",
      padding: "4px 0",
      marginBottom: 16,
      width: isQuestionnaire ? "100%" : "auto"
    }}>
      {!isQuestionnaire && (
        <div style={{
          width: 32, height: 32, borderRadius: 10, 
          background: "linear-gradient(135deg, #4285f4, #9b72cb, #d96570)",
          display: "flex", alignItems: "center", justifyContent: "center", 
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(155, 114, 203, 0.2)",
          marginTop: 4
        }}>
          <Sparkles size={16} color="white" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ fontSize: "var(--base-size)", color: "var(--claude-text)", lineHeight: "var(--line-height)" }}>
          <AssistantBubbleContent 
            text={message.text} 
            onSubmitQuestionnaire={onSubmitQuestionnaire}
            onBackQuestionnaire={onBackQuestionnaire}
          />
        </div>
      </div>
    </div>
  );
}
