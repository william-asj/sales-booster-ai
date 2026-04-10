"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatBubble, { ChatMessage } from "./ChatBubble";
import ChatInput, { AttachedFile } from "./ChatInput";
import { useChatOverlay } from "@/hooks/useChatOverlay";

// ─── Gemini API types ─────────────────────────────────────────────────────────

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiPart[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowTime(): string {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// ─── Typing dots ──────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="message" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, flexShrink: 0,
      }}>
        🤖
      </div>
      <div style={{ paddingTop: 6, display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#6366f1",
            animation: "bounce 1s infinite",
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Empty / welcome state ────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 14, textAlign: "center",
      padding: "60px 24px", flex: 1,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: "linear-gradient(135deg, #6366f120, #8b5cf620)",
        border: "1px solid #6366f130",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
      }}>
        ✦
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
          SalesBooster AI
        </div>
        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
          Ask anything about your leads,<br />products, or sales strategy.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 260 }}>
        {[
          "Analisis lead terbaik hari ini",
          "Siapkan skrip untuk Budi Santoso",
          "Produk terbaik untuk nasabah baru",
        ].map((hint) => (
          <div key={hint} style={{
            fontSize: 11, color: "#64748b",
            background: "#0d0f1a", border: "1px solid #1e2235",
            borderRadius: 8, padding: "7px 12px", textAlign: "left",
          }}>
            {hint}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function ChatOverlayPanel() {
  const { isOpen, toggle, close } = useChatOverlay();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Core send-to-AI ─────────────────────────────────────────────────────────
  const sendToAI = useCallback(
    async (userText: string, attachment?: AttachedFile) => {
      setError(null);
      setIsTyping(true);

      const userParts: GeminiPart[] = [];

      if (attachment) {
        userParts.push({
          inlineData: { mimeType: attachment.mimeType, data: attachment.base64 },
        });
      }

      if (userText.trim()) {
        userParts.push({ text: userText.trim() });
      }

      const updatedHistory: GeminiMessage[] = [
        ...geminiHistory,
        { role: "user", parts: userParts },
      ];

      setGeminiHistory(updatedHistory);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedHistory }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();

        const replyText: string =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ??
          data?.content?.parts?.[0]?.text ??
          data?.text ??
          "Sorry, I couldn't generate a response.";

        setMessages((prev) => [...prev, {
          role: "assistant",
          text: replyText,
          time: nowTime(),
        }]);
        setGeminiHistory((prev) => [
          ...prev,
          { role: "model", parts: [{ text: replyText }] },
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to reach AI: ${msg}`);
        setGeminiHistory(geminiHistory);
      } finally {
        setIsTyping(false);
      }
    },
    [geminiHistory]
  );

  const handleSend = useCallback(
    (text: string, attachment?: AttachedFile) => {
      if (!text.trim() && !attachment) return;

      const displayText = attachment
        ? text.trim() ? `${text.trim()} [📎 ${attachment.name}]` : `[📎 ${attachment.name}]`
        : text.trim();

      setMessages((prev) => [...prev, { role: "user", text: displayText, time: nowTime() }]);
      sendToAI(text, attachment);
    },
    [sendToAI]
  );

  const handleQuestionnaireSubmit = useCallback(
    (answerText: string) => {
      setMessages((prev) => [...prev, { role: "user", text: answerText, time: nowTime() }]);
      sendToAI(answerText);
    },
    [sendToAI]
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    setGeminiHistory([]);
    setError(null);
  }, []);

  return (
    <>
      {/* Backdrop — tap outside to close */}
      {isOpen && (
        <div
          onClick={close}
          style={{ position: "fixed", inset: 0, zIndex: 999, background: "transparent" }}
        />
      )}

      {/* Slide-in panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", top: 0, right: 0,
          width: 400, height: "100vh",
          zIndex: 1000,
          display: "flex", flexDirection: "column",
          background: "#0d0f1a",
          borderLeft: "1px solid #1e2235",
          boxShadow: isOpen ? "-8px 0 40px rgba(0,0,0,0.6)" : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid #1e2235",
          display: "flex", alignItems: "center", gap: 10,
          flexShrink: 0, background: "#0d0f1a",
        }}>
          {/* Logo mark */}
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, flexShrink: 0,
          }}>
            ✦
          </div>

          {/* Title + status */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
              SalesBooster <span style={{ color: "#6366f1" }}>·</span>{" "}
              <span style={{ color: "#818cf8" }}>AI</span>
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>
              {isTyping
                ? <span style={{ color: "#22c55e" }}>● Thinking…</span>
                : <span>● Online</span>}
            </div>
          </div>

          {/* Clear conversation */}
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              title="Clear conversation"
              style={{
                width: 30, height: 30, borderRadius: 7,
                border: "1px solid #1e2235", background: "transparent",
                color: "#475569", cursor: "pointer", fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "#ef444440";
                e.currentTarget.style.background = "#ef444410";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.borderColor = "#1e2235";
                e.currentTarget.style.background = "transparent";
              }}
            >
              🗑
            </button>
          )}

          {/* Close — this is the ONLY way to close when panel is open */}
          <button
            onClick={close}
            title="Close panel"
            style={{
              width: 30, height: 30, borderRadius: 7,
              border: "1px solid #1e2235", background: "transparent",
              color: "#64748b", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, lineHeight: 1, fontWeight: 300,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#e2e8f0";
              e.currentTarget.style.borderColor = "#6366f140";
              e.currentTarget.style.background = "#6366f110";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.borderColor = "#1e2235";
              e.currentTarget.style.background = "transparent";
            }}
          >
            ✕
          </button>
        </div>

        {/* Message list */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px 18px",
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          {messages.length === 0 && !isTyping ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  message={msg}
                  onSubmitQuestionnaire={handleQuestionnaireSubmit}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}

          {error && (
            <div style={{
              background: "#ef444410", border: "1px solid #ef444430",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 12, color: "#ef4444",
              display: "flex", gap: 8, alignItems: "flex-start",
            }}>
              <span style={{ flexShrink: 0 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input — sits flush at bottom, fully within panel bounds, never overlapped */}
        <div style={{ flexShrink: 0, borderTop: "1px solid #1e2235" }}>
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </div>
      </div>

      {/*
        FAB — only visible when panel is CLOSED.
        When open, the header's ✕ button is the close control.
        This eliminates any possibility of the FAB overlapping the input area.
      */}
      {!isOpen && (
        <button
          onClick={toggle}
          title="Open AI Chat"
          style={{
            position: "fixed", bottom: 24, right: 24,
            zIndex: 1001,
            width: 52, height: 52, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none",
            boxShadow: "0 4px 20px #6366f150, 0 2px 8px rgba(0,0,0,0.4)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "#fff",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            animation: "fadeIn 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.boxShadow = "0 6px 28px #6366f170, 0 2px 8px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px #6366f150, 0 2px 8px rgba(0,0,0,0.4)";
          }}
        >
          💬
        </button>
      )}
    </>
  );
}