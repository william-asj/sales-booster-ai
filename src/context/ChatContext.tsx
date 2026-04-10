"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AttachedFile } from "@/components/chatbot/ChatInput";
import { ChatMessage } from "@/components/chatbot/ChatBubble";

// ─── AI Payload Types ─────────────────────────────────────────────────────────
export interface AiMessagePart {
    text?: string;
    inlineData?: { mimeType: string; data: string };
}

export interface AiMessage {
    role: "user" | "model" | "system";
    parts: AiMessagePart[];
}

// ─── Session Type ─────────────────────────────────────────────────────────────
export interface ChatSession {
    id: string;
    title: string;
    updatedAt: number;
    messages: ChatMessage[];
    aiHistory: AiMessage[];
}

interface ChatContextType {
    sessions: ChatSession[];
    activeSessionId: string | null;
    setActiveSessionId: (id: string | null) => void;
    createNewSession: () => string;
    deleteSession: (id: string) => void;
    appendMessage: (sessionId: string, message: ChatMessage, aiMessage?: AiMessage) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    const createNewSession = () => {
        const id = Date.now().toString();
        const newSession: ChatSession = {
            id,
            title: "New Chat",
            updatedAt: Date.now(),
            messages: [],
            aiHistory: [],
        };
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(id);
        return id;
    };

    const deleteSession = (id: string) => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSessionId === id) {
            setActiveSessionId(null);
        }
    };

    const appendMessage = (sessionId: string, message: ChatMessage, aiMessage?: AiMessage) => {
        setSessions((prev) =>
            prev.map((session) => {
                if (session.id === sessionId) {
                    // Auto-generate title from the first user message
                    let title = session.title;
                    if (title === "New Chat" && message.role === "user" && message.text) {
                        title = message.text.slice(0, 28) + (message.text.length > 28 ? "..." : "");
                    }

                    return {
                        ...session,
                        title,
                        updatedAt: Date.now(), // Bump updated time so it sorts to the top
                        messages: [...session.messages, message],
                        aiHistory: aiMessage ? [...session.aiHistory, aiMessage] : session.aiHistory,
                    };
                }
                return session;
            }).sort((a, b) => b.updatedAt - a.updatedAt) // Keep list sorted descending
        );
    };

    return (
        <ChatContext.Provider
            value={{ sessions, activeSessionId, setActiveSessionId, createNewSession, deleteSession, appendMessage }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChatState() {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChatState must be used within a ChatProvider");
    return context;
}