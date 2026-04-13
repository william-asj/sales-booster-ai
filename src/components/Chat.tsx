"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Plus, Trash2, MessageSquare, Sparkles } from "lucide-react";
import ChatBubble from "./chatbot/ChatBubble";
import ChatInput, { AttachedFile } from "./chatbot/ChatInput";
import QuestionnaireCard from "./chatbot/QuestionnaireCard";
import { useChatState, AiMessagePart, AiMessage } from "@/context/ChatContext";
import { useChatFlow } from "@/hooks/useChatFlow";
import { buildRecommendPrompt, RECOMMEND_FLOW, RecommendAnswers } from "@/lib/prompts";
import { db } from "@/lib/data";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nowTime(): string {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
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
          background: "rgba(255, 255, 255, 0.03)", 
          border: "1px solid rgba(255, 255, 255, 0.05)",
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

// ─── Component ────────────────────────────────────────────────────────────────
interface ChatProps {
  initialMessage?: string | null;
  onMessageSent?: () => void;
}

export default function Chat({ initialMessage, onMessageSent }: ChatProps) {
  const { sessions, activeSessionId, setActiveSessionId, createNewSession, deleteSession, appendMessage } = useChatState();
  const { startFlow, resetFlow } = useChatFlow();
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processedMessageRef = useRef<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const activeQuestionnaire = useMemo(() => {
    const msgs = activeSession?.messages || [];
    const lastMessage = msgs[msgs.length - 1];
    if (lastMessage?.role === "assistant") {
      try {
        const parsed = JSON.parse(lastMessage.text);
        if (parsed.type === "questionnaire") {
          return parsed;
        }
      } catch (e) {
        // Not JSON
      }
    }
    return null;
  }, [activeSession?.messages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping, streamingText]);

  // Reset error when switching sessions
  useEffect(() => {
    setError(null);
  }, [activeSessionId]);

  // Scrollbar hide logic
  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1500);
  };

  // Handle Send Logic (Uses Context)
  const sendToAI = useCallback(
    async (userText: string, attachments?: AttachedFile[], silent: boolean = false) => {
      let targetSessionId = activeSessionId;
      
      if (!targetSessionId) {
        targetSessionId = createNewSession();
        setActiveSessionId(targetSessionId);
      }

      setError(null);
      setIsTyping(true);
      setStreamingText("");

      const userParts: AiMessagePart[] = [];
      if (attachments && attachments.length > 0) {
        attachments.forEach((att) => userParts.push({ inlineData: { mimeType: att.mimeType, data: att.base64 } }));
      }
      if (userText.trim()) userParts.push({ text: userText.trim() });

      const newAiMessage: AiMessage = { role: "user", parts: userParts };

      const currentSession = sessions.find(s => s.id === targetSessionId);
      const updatedHistory = [...(currentSession?.aiHistory || []), newAiMessage];

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

        appendMessage(targetSessionId, { role: "assistant", text: fullText, time: nowTime() }, { role: "model", parts: [{ text: fullText }] });
        setStreamingText("");
      } catch (err) {
        setError(`Failed to reach AI: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setIsTyping(false);
      }
    },
    [activeSessionId, sessions, appendMessage, createNewSession, setActiveSessionId]
  );

  async function handleSlashCommand(command: "recommend") {
    if (command === "recommend") {
      let targetSessionId = activeSessionId;
      if (!targetSessionId) {
        targetSessionId = createNewSession();
        setActiveSessionId(targetSessionId);
      }
      const firstQuestion = startFlow();
      appendMessage(targetSessionId, firstQuestion);
    }
  }

  const handleQuestionnaireSubmit = useCallback(
    async (answers: Record<string, string>) => {
      let targetSessionId = activeSessionId;
      if (!targetSessionId) {
        targetSessionId = createNewSession();
        setActiveSessionId(targetSessionId);
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
    [activeSessionId, appendMessage, createNewSession, setActiveSessionId, sendToAI, resetFlow]
  );

  useEffect(() => {
    if (initialMessage && initialMessage !== processedMessageRef.current) {
      processedMessageRef.current = initialMessage;
      const newId = createNewSession();
      setActiveSessionId(newId);
      setInputText(initialMessage);
      if (onMessageSent) onMessageSent();
    }
  }, [initialMessage, onMessageSent, createNewSession, setActiveSessionId]);

  return (
    <div className="page-content" style={{
      display: "flex",
      gap: 24,
      height: "calc(100vh - 48px)",
      padding: "24px",
      fontFamily: "var(--font-main)",
      background: "#080a12",
      backgroundImage: `
        radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08), transparent 25%),
        radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08), transparent 25%)
      `,
      backgroundAttachment: "fixed",
      color: "var(--claude-text)"
    }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .custom-scrollbar.is-scrolling::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          opacity: 1;
        }
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          background: rgba(20, 22, 39, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
          overflow: hidden;
        }
        .centered-content {
          width: 100%;
          max-width: 850px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }
        .messages-max-width {
          width: 100%;
          max-width: 750px;
          margin: 0 auto;
        }
        .glass-sidebar {
          width: 300px;
          display: flex;
          flex-direction: column;
          background: rgba(20, 22, 39, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
          overflow: hidden;
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
      `}</style>

      {/* ─── LEFT SIDEBAR (History) ─── */}
      <div className={`glass-sidebar custom-scrollbar ${isScrolling ? 'is-scrolling' : ''}`} onScroll={handleScroll}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--claude-muted)", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "var(--font-header)" }}>Chat History</span>
          <button
            onClick={() => {
              const newId = createNewSession();
              setActiveSessionId(newId);
              resetFlow();
            }}
            title="New Chat"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)", color: "#e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"; }}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className={`custom-scrollbar ${isScrolling ? 'is-scrolling' : ''}`} style={{ flex: 1, overflowY: "auto", padding: "8px" }} onScroll={handleScroll}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--claude-muted)", fontSize: 13 }}>
              No chat history yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    resetFlow();
                  }}
                  style={{
                    position: "relative", padding: "10px 12px", borderRadius: 10,
                    background: activeSessionId === session.id ? "rgba(255, 255, 255, 0.05)" : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={e => { if (activeSessionId !== session.id) e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"; }}
                  onMouseLeave={e => { if (activeSessionId !== session.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <MessageSquare size={16} color={activeSessionId === session.id ? "#f8fafc" : "#94a3b8"} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: activeSessionId === session.id ? "#f8fafc" : "#94a3b8", fontWeight: activeSessionId === session.id ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {session.title}
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      opacity: 0, transition: "all 0.2s ease",
                    }}
                    ref={(el) => {
                      if (el && el.parentElement) {
                        el.parentElement.onmouseenter = () => { el.style.opacity = "1"; if (activeSessionId !== session.id) el.parentElement!.style.background = "rgba(255, 255, 255, 0.02)"; };
                        el.parentElement.onmouseleave = () => { el.style.opacity = "0"; if (activeSessionId !== session.id) el.parentElement!.style.background = "transparent"; };
                      }
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#475569"; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── MAIN CHAT AREA ─── */}
      <div className="chat-container">
        <div className="centered-content">
          {/* Header */}
          <div className="messages-max-width" style={{
            padding: "20px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
            display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
            background: "transparent", zIndex: 10
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", fontFamily: "var(--font-header)" }}>
                {activeSession ? activeSession.title : "SalesBooster AI"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                {isTyping ? (
                  <>
                    <div style={{ 
                      width: 8, height: 8, borderRadius: "50%", 
                      background: "linear-gradient(135deg, #4285f4, #9b72cb, #d96570)",
                      backgroundSize: "200% 200%",
                      animation: "gemini-gradient 2s linear infinite"
                    }} />
                    <span style={{ 
                      background: "linear-gradient(90deg, #4285f4, #9b72cb, #d96570, #4285f4)",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "gemini-gradient 3s linear infinite",
                      fontWeight: 600
                    }}>
                      {/* Gemini is thinking… */}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74, 222, 128, 0.4)" }} className="animate-pulse" />
                    Online
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div 
            className={`custom-scrollbar ${isScrolling ? 'is-scrolling' : ''}`} 
            style={{ 
              flex: 1, 
              overflowY: "auto", 
              display: "flex", 
              flexDirection: "column",
              position: "relative"
            }}
            onScroll={handleScroll}
          >
            <div className="messages-max-width" style={{ padding: "40px 0 200px", display: "flex", flexDirection: "column", gap: 32 }}>
              {(!activeSession || activeSession.messages.length === 0) && !isTyping && !streamingText ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh", gap: 24 }}>
                  <div style={{ fontSize: 28, fontWeight: 600, color: "#f8fafc", letterSpacing: "-0.02em", fontFamily: "var(--font-header)" }}>How can I help you today?</div>
                  <div style={{ width: "100%", maxWidth: "600px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      "Analyze my recent leads",
                      "Draft a follow-up email",
                      "Recommend insurance products",
                      "Sales strategy for Q2"
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => sendToAI(suggestion)}
                        style={{
                          padding: "16px", borderRadius: 12, background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.05)", color: "#94a3b8", textAlign: "left",
                          fontSize: 14, cursor: "pointer", transition: "all 0.2s ease",
                          fontFamily: "var(--font-main)"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"; }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {activeSession?.messages.map((msg, i) => {
                    // Skip questionnaire messages from rendering in the chat list
                    if (
                      msg.role === "assistant" &&
                      msg.text.trimStart().startsWith('{"type":"questionnaire"')
                    ) {
                      return null;
                    }

                    return (
                      <ChatBubble 
                        key={i} 
                        message={msg} 
                        onSubmitQuestionnaire={handleQuestionnaireSubmit}
                        onBackQuestionnaire={() => resetFlow()}
                      />
                    );
                  })}
                  {isTyping && !streamingText && <TypingIndicator />}
                  {streamingText && (
                    <ChatBubble 
                      message={{ role: "assistant", text: streamingText, time: nowTime() }} 
                    />
                  )}
                </>
              )}

              {error && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#fca5a5", display: "flex", gap: 10 }}>
                  <span>⚠</span> <span>{error}</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

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

          {/* Input Box Fixed at Bottom Center */}
          <div style={{ 
            position: "absolute", 
            bottom: 0, 
            left: 0, 
            right: 0, 
            padding: "20px 0 12px",
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
                <>
                  <ChatInput 
                    onSend={(text, files) => sendToAI(text, files)} 
                    disabled={isTyping} 
                    value={inputText}
                    onValueChange={setInputText}
                    onSlashCommand={handleSlashCommand}
                  />
                  <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "var(--claude-muted)" }}>
                    AI can make mistakes. Check important info.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
