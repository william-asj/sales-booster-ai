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
    createNewSession: (title?: string) => string;
    deleteSession: (id: string) => void;
    appendMessage: (sessionId: string, message: ChatMessage, aiMessage?: AiMessage) => void;

    // Overlay state
    isOverlayOpen: boolean;
    setIsOverlayOpen: (open: boolean) => void;
    overlaySessionId: string | null;
    setOverlaySessionId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [overlaySessionId, setOverlaySessionId] = useState<string | null>(null);

    const createNewSession = (title: string = "New Chat") => {
        const id = Date.now().toString();
        const newSession: ChatSession = {
            id,
            title: title,
            updatedAt: Date.now(),
            messages: [],
            aiHistory: [],
        };
        setSessions((prev) => [newSession, ...prev]);
        return id;
    };

    const deleteSession = (id: string) => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSessionId === id) {
            setActiveSessionId(null);
        }
        if (overlaySessionId === id) {
            setOverlaySessionId(null);
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
            value={{ 
                sessions, 
                activeSessionId, 
                setActiveSessionId, 
                createNewSession, 
                deleteSession, 
                appendMessage,
                isOverlayOpen,
                setIsOverlayOpen,
                overlaySessionId,
                setOverlaySessionId
            }}
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