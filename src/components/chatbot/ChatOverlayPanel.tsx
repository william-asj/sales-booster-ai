"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput, { AttachedFile } from "./ChatInput";
import { useChatOverlay } from "@/hooks/useChatOverlay";
import { useChatState, AiMessage, AiMessagePart } from "@/context/ChatContext";

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

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 20, textAlign: "center", padding: "40px 10px", flex: 1,
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: "#f8fafc", letterSpacing: "-0.01em" }}>How can I help?</div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "Analyze my recent leads",
          "Recommend insurance products",
          "Draft a follow-up email"
        ].map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(suggestion)}
            style={{
              padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)", color: "#94a3b8", textAlign: "left",
              fontSize: 13, cursor: "pointer", transition: "all 0.2s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatOverlayPanel() {
  const { isOpen, toggle, close } = useChatOverlay();
  const { sessions, overlaySessionId, setOverlaySessionId, createNewSession, appendMessage } = useChatState();

  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === overlaySessionId);
  const messages = activeSession?.messages || [];
  const aiHistory = activeSession?.aiHistory || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1500);
  };

  const sendToAI = useCallback(
    async (userText: string, attachments?: AttachedFile[]) => {
      let targetSessionId = overlaySessionId;
      
      if (!targetSessionId) {
        targetSessionId = createNewSession("Overlay Chat");
        setOverlaySessionId(targetSessionId);
      }

      setError(null);
      setIsTyping(true);

      const userParts: AiMessagePart[] = [];
      if (attachments && attachments.length > 0) {
        attachments.forEach((att) => {
          userParts.push({ inlineData: { mimeType: att.mimeType, data: att.base64 } });
        });
      }
      if (userText.trim()) {
        userParts.push({ text: userText.trim() });
      }

      const newAiMessage: AiMessage = { role: "user", parts: userParts };
      const updatedHistory: AiMessage[] = [...aiHistory, newAiMessage];

      appendMessage(targetSessionId, { role: "user", text: userText, time: nowTime(), attachments }, newAiMessage);

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

        appendMessage(targetSessionId, { role: "assistant", text: replyText, time: nowTime() }, { role: "model", parts: [{ text: replyText }] });
      } catch (err) {
        setError(`Failed to reach AI: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setIsTyping(false);
      }
    },
    [aiHistory, overlaySessionId, appendMessage, createNewSession, setOverlaySessionId]
  );

  const handleSend = useCallback(
    (text: string, attachments?: AttachedFile[]) => {
      if (!text.trim() && (!attachments || attachments.length === 0)) return;
      sendToAI(text, attachments);
    },
    [sendToAI]
  );

  const handleQuestionnaireSubmit = useCallback(
    (answerText: string) => {
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
        .overlay-custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .overlay-custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .overlay-custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .overlay-custom-scrollbar.is-scrolling::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          opacity: 1;
        }
      `}</style>

      {isOpen && (
        <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.1)", backdropFilter: "blur(2px)" }} />
      )}

      <div onClick={(e) => e.stopPropagation()} style={{
        position: "fixed", top: 20, right: 20, bottom: 20, width: 420, zIndex: 1000,
        display: "flex", flexDirection: "column",
        background: "rgba(255, 255, 255, 0.04)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 24,
        boxShadow: isOpen ? "0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)" : "none",
        transform: isOpen ? "translateX(0) scale(1)" : "translateX(120%) scale(0.95)",
        opacity: isOpen ? 1 : 0, transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
        fontFamily: "'Segoe UI', sans-serif", pointerEvents: isOpen ? "auto" : "none", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          background: "rgba(13, 15, 26, 0.2)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
          }}>✦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>SalesBooster AI</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              {isTyping ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Thinking…
                </>
              ) : (
                <>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74, 222, 128, 0.4)" }} className="animate-pulse" />
                  Online
                </>
              )}
            </div>
          </div>
          <button onClick={close} style={{
            width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(255,255,255,0.03)", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>✕</button>
        </div>

        {/* Scrollable Message Area */}
        <div 
          className={`overlay-custom-scrollbar ${isScrolling ? 'is-scrolling' : ''}`}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", position: "relative" }}
        >
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 24, paddingBottom: 120 }}>
            {messages.length === 0 && !isTyping ? (
              <EmptyState onSuggestionClick={(t) => sendToAI(t)} />
            ) : (
              <>
                {messages.map((msg, i) => (
                  <ChatBubble key={i} message={msg} onSubmitQuestionnaire={handleQuestionnaireSubmit} />
                ))}
                {isTyping && <TypingIndicator />}
              </>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#fca5a5", margin: "0 20px 10px" }}>
            <span>⚠</span> <span>{error}</span>
          </div>
        )}

        {/* Fixed Input area at Bottom */}
        <div style={{ 
          position: "absolute", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: "16px 12px 12px",
          zIndex: 15,
          pointerEvents: "none"
        }}>
          <div style={{ pointerEvents: "auto" }}>
            <ChatInput onSend={handleSend} disabled={isTyping} />
          </div>
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
