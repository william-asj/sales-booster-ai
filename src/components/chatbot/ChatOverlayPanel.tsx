"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Sparkles } from "lucide-react";
import ChatBubble from "./ChatBubble";
import ChatInput, { AttachedFile } from "./ChatInput";
import QuestionnaireCard from "./QuestionnaireCard";
import { useChatOverlay } from "@/hooks/useChatOverlay";
import { useChatState, AiMessage, AiMessagePart } from "@/context/ChatContext";
import { useChatFlow } from "@/hooks/useChatFlow";
import { buildRecommendPrompt, RECOMMEND_FLOW, RecommendAnswers } from "@/lib/prompts";
import { db } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

function nowTime(): string {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  const { t } = useLanguage();
  return (
    <div className="message" style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 24, animation: "fadeIn 0.3s ease-out" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 10, 
        background: "linear-gradient(135deg, #4285f4, #9b72cb, #d96570)",
        display: "flex", alignItems: "center", justifyContent: "center", 
        flexShrink: 0,
        boxShadow: "0 0 12px rgba(155, 114, 203, 0.3)",
        animation: "gemini-pulse 2s infinite ease-in-out"
      }}>
        <Sparkles size={16} color="white" />
      </div>
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: 8,
        paddingTop: 4
      }}>
        <div style={{ 
          display: "flex", 
          gap: 5, 
          padding: "12px 16px", 
          background: "var(--sidebar-item-bg)", 
          border: "1px solid var(--sidebar-item-border)",
          borderRadius: "4px 16px 16px 16px",
          width: "fit-content",
          alignItems: "center"
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%", 
              background: "linear-gradient(135deg, #4285f4, #9b72cb)",
              animation: "gemini-bounce 1.4s infinite", animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const { t } = useLanguage();
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 20, textAlign: "center", padding: "40px 10px", flex: 1,
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: "var(--claude-header)", letterSpacing: "-0.01em" }}>{t("How can I help?")}</div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          "Analyze my recent leads",
          "Recommend insurance products",
          "Draft a follow-up email"
        ].map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(t(suggestion))}
            style={{
              padding: "12px 16px", borderRadius: 12, background: "var(--sidebar-item-bg)",
              border: "1px solid var(--sidebar-item-border)", color: "var(--claude-text)", textAlign: "left",
              fontSize: 13, cursor: "pointer", transition: "all 0.2s ease"
            }}
          >
            {t(suggestion)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatOverlayPanel() {
  const { t } = useLanguage();
  const { isOpen, toggle, close } = useChatOverlay();
  const { sessions, overlaySessionId, setOverlaySessionId, createNewSession, appendMessage } = useChatState();
  const { startFlow, resetFlow } = useChatFlow();

  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === overlaySessionId);
  const messages = useMemo(() => activeSession?.messages || [], [activeSession]);
  const aiHistory = useMemo(() => activeSession?.aiHistory || [], [activeSession]);

  const activeQuestionnaire = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      try {
        const parsed = JSON.parse(lastMessage.text);
        if (parsed.type === "questionnaire") {
          return parsed;
        }
      } catch {
        // Not JSON
      }
    }
    return null;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, streamingText]);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1500);
  };

  const sendToAI = useCallback(
    async (userText: string, attachments?: AttachedFile[], silent: boolean = false) => {
      let targetSessionId = overlaySessionId;
      
      if (!targetSessionId) {
        targetSessionId = createNewSession("Overlay Chat");
        setOverlaySessionId(targetSessionId);
      }

      setError(null);
      setIsTyping(true);
      setStreamingText("");

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

      if (!silent) {
        appendMessage(targetSessionId, { role: "user", text: userText, time: nowTime(), attachments }, newAiMessage);
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedHistory }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        
        const data = await res.json();
        const fullText = data.text;

        // Claude-like word-by-word animation
        const tokens = fullText.split(/(\s+)/);
        let currentText = "";
        let i = 0;

        const interval = setInterval(() => {
          if (i < tokens.length) {
            currentText += tokens[i];
            setStreamingText(currentText);
            i++;
          } else {
            clearInterval(interval);
            appendMessage(targetSessionId, { role: "assistant", text: fullText, time: nowTime() }, { role: "model", parts: [{ text: fullText }] });
            setStreamingText("");
            setIsTyping(false);
          }
        }, 25);
      } catch (err) {
        setError(`Failed to reach AI: ${err instanceof Error ? err.message : "Unknown error"}`);
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

  async function handleSlashCommand(command: "recommend") {
    if (command === "recommend") {
      let targetSessionId = overlaySessionId;
      if (!targetSessionId) {
        targetSessionId = createNewSession("Overlay Chat");
        setOverlaySessionId(targetSessionId);
      }
      const firstQuestion = startFlow();
      appendMessage(targetSessionId, firstQuestion);
    }
  }

  const handleQuestionnaireSubmit = useCallback(
    async (answers: Record<string, string>) => {
      let targetSessionId = overlaySessionId;
      if (!targetSessionId) {
        targetSessionId = createNewSession("Overlay Chat");
        setOverlaySessionId(targetSessionId);
      }

      // Format user's answers as a Q&A bubble
      const qaLines = RECOMMEND_FLOW.map(q => `Q: ${q.question}\nA: ${answers[q.label]}`).join("\n\n");
      appendMessage(targetSessionId, { role: "user", text: qaLines, time: nowTime() });

      // Map answers to the format required by buildRecommendPrompt
      const finalAnswers: RecommendAnswers = {
        familySituation: answers["Family Situation"] || "",
        currentPriority: answers["Current Priority"] || "",
        existingCoverage: answers["Existing Coverage"] || "",
        healthConcern: answers["Health Concern"] || "",
        monthlyBudget: answers["Monthly Budget"] || ""
      };

      const prompt = buildRecommendPrompt(finalAnswers, db.getProducts());
      await sendToAI(prompt, undefined, true);
      resetFlow();
    },
    [overlaySessionId, appendMessage, createNewSession, setOverlaySessionId, sendToAI, resetFlow]
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
          background: rgba(155, 155, 155, 0.2);
          border-radius: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .overlay-custom-scrollbar.is-scrolling::-webkit-scrollbar-thumb {
          background: rgba(155, 155, 155, 0.3);
          opacity: 1;
        }
        @keyframes gemini-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gemini-pulse {
          0% { transform: scale(1); box-shadow: 0 0 12px rgba(155, 114, 203, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(155, 114, 203, 0.5); }
          100% { transform: scale(1); box-shadow: 0 0 12px rgba(155, 114, 203, 0.3); }
        }
        @keyframes gemini-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gemini-fab-glow {
          0% { box-shadow: 0 0 0 0 rgba(155, 114, 203, 0.6); }
          70% { box-shadow: 0 0 0 20px rgba(155, 114, 203, 0); }
          100% { box-shadow: 0 0 0 0 rgba(155, 114, 203, 0); }
        }
      `}</style>

      {isOpen && (
        <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.1)", backdropFilter: "blur(2px)" }} />
      )}

      <div onClick={(e) => e.stopPropagation()} style={{
        position: "fixed", top: 20, right: 20, bottom: 20, width: 420, zIndex: 1000,
        display: "flex", flexDirection: "column",
        background: "var(--glass-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid var(--glass-border)", borderRadius: 24,
        boxShadow: isOpen ? "var(--glass-shadow)" : "none",
        transform: isOpen ? "translateX(0) scale(1)" : "translateX(120%) scale(0.95)",
        opacity: isOpen ? 1 : 0, transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
        fontFamily: "var(--font-main)", pointerEvents: isOpen ? "auto" : "none", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--glass-border)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          background: "rgba(13, 15, 26, 0.05)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #4285f4, #9b72cb, #d96570)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: "0 0 10px rgba(155, 114, 203, 0.3)"
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--claude-header)", fontFamily: "var(--font-header)" }}>SalesBooster AI</div>
            <div style={{ fontSize: 11, color: "var(--claude-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              {isTyping ? (
                <>
                  <div style={{ 
                    width: 8, height: 8, borderRadius: "50%", 
                    background: "linear-gradient(135deg, #4285f4, #9b72cb, #d96570)",
                    backgroundSize: "200% 200%",
                    animation: "gemini-gradient 2s linear infinite"
                  }} />
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
            width: 32, height: 32, borderRadius: 10, border: "1px solid var(--glass-border)", background: "transparent", color: "var(--claude-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>✕</button>
        </div>

        {/* Scrollable Message Area */}
        <div 
          className={`overlay-custom-scrollbar ${isScrolling ? 'is-scrolling' : ''}`}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", position: "relative" }}
        >
          <div style={{ padding: "20px 20px 140px 20px", display: "flex", flexDirection: "column", gap: 24 }}>
            {messages.length === 0 && !isTyping && !streamingText ? (
              <EmptyState onSuggestionClick={(t) => sendToAI(t)} />
            ) : (
              <>
                {messages.map((msg, i) => (
                  <ChatBubble 
                    key={i} 
                    message={msg} 
                    onSubmitQuestionnaire={handleQuestionnaireSubmit}
                    onBackQuestionnaire={() => resetFlow()}
                  />
                ))}
                {((isTyping && !streamingText) || (streamingText && streamingText.trim().length < 3)) && (
                  <TypingIndicator />
                )}
                {streamingText && streamingText.trim().length >= 3 && (
                  <ChatBubble 
                    message={{ role: "assistant", text: streamingText, time: nowTime() }} 
                  />
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Bottom fade overlay */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: "var(--chat-fade-overlay)",
          pointerEvents: "none",
          zIndex: 14,
        }} />

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
            {activeQuestionnaire ? (
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                <QuestionnaireCard 
                  steps={activeQuestionnaire.steps}
                  onSubmit={handleQuestionnaireSubmit}
                  onBack={() => resetFlow()}
                />
              </div>
            ) : (
              <ChatInput 
                onSend={handleSend} 
                onSlashCommand={handleSlashCommand}
                disabled={isTyping} 
              />
            )}
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
            background: "linear-gradient(135deg, #4285f4, #9b72cb, #d96570)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "#fff",
            animation: "fab-elastic-entrance 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, gemini-fab-glow 2.5s infinite 1s",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 8px 32px rgba(155, 114, 203, 0.4)",
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.transform = "scale(1.1) translateY(-5px)";
            e.currentTarget.style.filter = "brightness(1.1)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(155, 114, 203, 0.6)";
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.filter = "brightness(1)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(155, 114, 203, 0.4)";
          }}
        >
          <Sparkles size={28} />
        </button>
      )}
    </>
  );
}
