"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import ChatBubble from "./chatbot/ChatBubble";
import ChatInput, { AttachedFile } from "./chatbot/ChatInput";
import { useChatState, AiMessagePart, AiMessage } from "@/context/ChatContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nowTime(): string {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="message" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0,
      }}>🤖</div>
      <div style={{ paddingTop: 6, display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#6366f1",
            animation: "bounce 1s infinite", animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Chat() {
  const { sessions, activeSessionId, setActiveSessionId, createNewSession, deleteSession, appendMessage } = useChatState();
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping]);

  // Reset error when switching sessions
  useEffect(() => {
    setError(null);
  }, [activeSessionId]);

  // Handle Send Logic (Uses Context)
  const sendToAI = useCallback(
    async (userText: string, attachments?: AttachedFile[]) => {
      let targetSessionId = activeSessionId;
      if (!targetSessionId) {
        targetSessionId = createNewSession();
      }

      setError(null);
      setIsTyping(true);

      const userParts: AiMessagePart[] = [];
      if (attachments && attachments.length > 0) {
        attachments.forEach((att) => userParts.push({ inlineData: { mimeType: att.mimeType, data: att.base64 } }));
      }
      if (userText.trim()) userParts.push({ text: userText.trim() });

      const newAiMessage: AiMessage = { role: "user", parts: userParts };

      // Get current session's AI history BEFORE appending (from the sessions array in scope)
      const currentSession = sessions.find(s => s.id === targetSessionId);
      const updatedHistory = [...(currentSession?.aiHistory || []), newAiMessage];

      appendMessage(targetSessionId, { role: "user", text: userText, time: nowTime(), attachments }, newAiMessage);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedHistory }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        const replyText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? data?.content?.parts?.[0]?.text ?? data?.text ?? data?.message ?? "Sorry, I couldn't generate a response.";

        appendMessage(targetSessionId, { role: "assistant", text: replyText, time: nowTime() }, { role: "model", parts: [{ text: replyText }] });
      } catch (err) {
        setError(`Failed to reach AI: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setIsTyping(false);
      }
    },
    [activeSessionId, sessions, appendMessage, createNewSession]  // add `sessions` to deps
  );

  return (
    <div className="page-content" style={{
      display: "flex", gap: 24, height: "calc(100vh - 48px)", padding: "24px",
      fontFamily: "'Segoe UI', sans-serif"
    }}>

      {/* ─── LEFT SIDEBAR (History) ─── */}
      <div style={{
        width: 320, display: "flex", flexDirection: "column",
        background: "rgba(13, 15, 26, 0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 24, overflow: "hidden",
      }}>
        {/* Sidebar Header & Glassmorphic "+" Button */}
        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>Chat History</span>
          <button
            onClick={() => createNewSession()}
            title="New Chat"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)", color: "#e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* History List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", fontSize: 13 }}>
              No chat history yet. <br /> Start a new conversation!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  style={{
                    position: "relative", padding: "14px 16px", borderRadius: 16,
                    background: activeSessionId === session.id ? "rgba(99, 102, 241, 0.15)" : "transparent",
                    border: activeSessionId === session.id ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={e => { if (activeSessionId !== session.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={e => { if (activeSessionId !== session.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <MessageSquare size={18} color={activeSessionId === session.id ? "#818cf8" : "#64748b"} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: activeSessionId === session.id ? "#e2e8f0" : "#cbd5e1", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {session.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Hover-to-Delete Trash Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    title="Delete Chat"
                    style={{
                      position: "absolute", right: 12, width: 32, height: 32, borderRadius: 10,
                      background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      opacity: 0, transition: "opacity 0.2s ease", // Hidden by default
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
                    // We reveal it on parent hover using a simple trick
                    ref={(el) => {
                      if (el && el.parentElement) {
                        el.parentElement.onmouseenter = () => { el.style.opacity = "1"; if (activeSessionId !== session.id) el.parentElement!.style.background = "rgba(255,255,255,0.03)"; };
                        el.parentElement.onmouseleave = () => { el.style.opacity = "0"; if (activeSessionId !== session.id) el.parentElement!.style.background = "transparent"; };
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT CHAT WINDOW ─── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: "rgba(13, 15, 26, 0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 24, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: "0 2px 10px rgba(99, 102, 241, 0.4)"
          }}>✦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
              {activeSession ? activeSession.title : "SalesBooster AI"}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{isTyping ? "● Thinking…" : "● Online"}</div>
          </div>
        </div>

        {/* Message List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
          {(!activeSession || activeSession.messages.length === 0) && !isTyping ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>✦</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>How can I help you today?</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Select a chat from the left or type below to start a new one.</div>
              </div>
            </div>
          ) : (
            <>
              {activeSession?.messages.map((msg, i) => (
                <ChatBubble key={i} message={msg} onSubmitQuestionnaire={(t) => sendToAI(t)} />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#fca5a5", display: "flex", gap: 10 }}>
              <span>⚠</span> <span>{error}</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
          <ChatInput onSend={(text, files) => sendToAI(text, files)} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}