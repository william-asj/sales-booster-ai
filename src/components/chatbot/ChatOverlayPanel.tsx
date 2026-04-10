"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatBubble, { ChatMessage } from "./ChatBubble";
import ChatInput, { AttachedFile } from "./ChatInput";
import { useChatOverlay } from "@/hooks/useChatOverlay";

interface AiMessagePart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface AiMessage {
  role: "user" | "model" | "system";
  parts: AiMessagePart[];
}

function nowTime(): string {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="message" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, flexShrink: 0,
      }}>🤖</div>
      <div style={{ paddingTop: 6, display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#6366f1", animation: "bounce 1s infinite", animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 14, textAlign: "center", padding: "60px 24px", flex: 1,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #6366f120, #8b5cf620)",
        border: "1px solid rgba(99, 102, 241, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
      }}>✦</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>SalesBooster AI</div>
        <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>Ask anything about your leads,<br />products, or sales strategy.</div>
      </div>
    </div>
  );
}

export default function ChatOverlayPanel() {
  const { isOpen, toggle, close } = useChatOverlay();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiHistory, setAiHistory] = useState<AiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendToAI = useCallback(
    async (userText: string, attachments?: AttachedFile[]) => {
      setError(null);
      setIsTyping(true);

      const userParts: AiMessagePart[] = [];

      if (attachments && attachments.length > 0) {
        attachments.forEach((att) => {
          userParts.push({
            inlineData: { mimeType: att.mimeType, data: att.base64 },
          });
        });
      }

      if (userText.trim()) {
        userParts.push({ text: userText.trim() });
      }

      const updatedHistory: AiMessage[] = [...aiHistory, { role: "user", parts: userParts }];
      setAiHistory(updatedHistory);

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
          data?.content?.parts?.[0]?.text ?? data?.text ?? data?.message ??
          "Sorry, I couldn't generate a response.";

        setMessages((prev) => [...prev, { role: "assistant", text: replyText, time: nowTime() }]);
        setAiHistory((prev) => [...prev, { role: "model", parts: [{ text: replyText }] }]);
      } catch (err) {
        setError(`Failed to reach AI: ${err instanceof Error ? err.message : "Unknown error"}`);
        setAiHistory(aiHistory);
      } finally {
        setIsTyping(false);
      }
    },
    [aiHistory]
  );

  const handleSend = useCallback(
    (text: string, attachments?: AttachedFile[]) => {
      if (!text.trim() && (!attachments || attachments.length === 0)) return;

      // Passing the attachments directly into the message state!
      setMessages((prev) => [
        ...prev,
        { role: "user", text: text.trim(), time: nowTime(), attachments }
      ]);
      sendToAI(text, attachments);
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

  return (
    <>
      <style>{`
        @keyframes fab-elastic-entrance {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(10deg); opacity: 1; }
          80% { transform: scale(0.95) rotate(-5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fab-pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6); }
          70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
      `}</style>

      {isOpen && (
        <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.1)", backdropFilter: "blur(2px)" }} />
      )}

      <div onClick={(e) => e.stopPropagation()} style={{
        position: "fixed", top: 20, right: 20, bottom: 20, width: 400, zIndex: 1000,
        display: "flex", flexDirection: "column",
        background: "rgba(13, 15, 26, 0.75)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 24,
        boxShadow: isOpen ? "0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset" : "none",
        transform: isOpen ? "translateX(0) scale(1)" : "translateX(120%) scale(0.95)",
        opacity: isOpen ? 1 : 0, transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
        fontFamily: "'Segoe UI', sans-serif", pointerEvents: isOpen ? "auto" : "none", overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
          }}>✦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>SalesBooster <span style={{ color: "#818cf8" }}>AI</span></div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{isTyping ? "● Thinking…" : "● Online"}</div>
          </div>
          <button onClick={close} style={{
            width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.length === 0 && !isTyping ? <EmptyState /> : messages.map((msg, i) => <ChatBubble key={i} message={msg} onSubmitQuestionnaire={handleQuestionnaireSubmit} />)}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <div style={{ flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </div>
      </div>

      {!isOpen && (
        <button
          onClick={toggle}
          title="Open AI Chat"
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 1001,
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "#fff",
            animation: "fab-elastic-entrance 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, fab-pulse-glow 2.5s infinite 1s",
            transition: "filter 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
        >
          ✦
        </button>
      )}
    </>
  );
}