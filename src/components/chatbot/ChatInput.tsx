"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Plus, X, FileText, ArrowUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttachedFile {
  file: File;
  name: string;      // ← added
  mimeType: string;  // ← added
  base64: string;
}

interface Props {
  onSend: (text: string, attachment?: AttachedFile) => void;
  disabled?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
};

type SpeechWin = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as SpeechWin;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<AttachedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false);
  const [focused, setFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);

  useEffect(() => { setVoiceSupported(!!getSpeechRecognition()); }, []);

  // Auto-grow textarea up to 4 rows
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 22 * 4 + 32;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [text]);

  const canSend = (text.trim().length > 0 || !!attachment) && !disabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(text.trim(), attachment ?? undefined);
    setText("");
    setAttachment(null);
    setFileError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [text, attachment, canSend, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Unsupported type. Use PDF, JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError("File exceeds 10 MB limit.");
      return;
    }
    try {
      const base64 = await toBase64(file);
      // ← populate name and mimeType alongside base64
      setAttachment({ file, name: file.name, mimeType: file.type, base64 });
    } catch {
      setFileError("Failed to read file.");
    }
  };

  const toggleRecording = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const recognition = new SR();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0][0].transcript;
      setText(prev => prev ? prev + " " + t : t);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  return (
    <div style={{ padding: "0 12px 16px" }}>

      {/* Attachment preview chip */}
      {attachment && (
        <div style={{ marginBottom: 8 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#1a1d2e", border: "1px solid #2d3550",
            borderRadius: 8, padding: "5px 10px",
            fontSize: 12, color: "#94a3b8",
          }}>
            <FileText size={13} color="#6366f1" style={{ flexShrink: 0 }} />
            <span style={{
              overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", maxWidth: 200,
            }}>
              {attachment.name}
            </span>
            <button
              onClick={() => { setAttachment(null); setFileError(null); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 0, display: "flex", color: "#64748b", marginLeft: 2,
              }}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* File error */}
      {fileError && (
        <div style={{ marginBottom: 6, fontSize: 11, color: "#ef4444", paddingLeft: 2 }}>
          {fileError}
        </div>
      )}

      {/* Input container */}
      <div style={{
        background: "#1e2235",
        borderRadius: 18,
        border: `1.5px solid ${focused ? "#3d4466" : "#262b40"}`,
        transition: "border-color 0.2s ease",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Textarea */}
        <div style={{ padding: "13px 16px 6px" }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            placeholder="Reply..."
            rows={1}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              color: "#e2e8f0",
              fontSize: 15,
              fontFamily: "Segoe UI, sans-serif",
              lineHeight: "22px",
              overflowY: "hidden",
              boxSizing: "border-box",
              caretColor: "#818cf8",
              display: "block",
            }}
          />
        </div>

        {/* Bottom toolbar */}
        <div style={{
          padding: "4px 8px 8px",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* + attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: "1.5px solid #2d3550",
              background: "transparent",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, padding: 0,
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#6366f1";
              (e.currentTarget as HTMLElement).style.background = "#6366f110";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#2d3550";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Plus size={17} color="#94a3b8" strokeWidth={2} />
          </button>

          <div style={{ flex: 1 }} />

          {/* Mic button */}
          <div style={{ position: "relative" }}>
            <button
              disabled={!voiceSupported}
              onClick={voiceSupported ? toggleRecording : undefined}
              onMouseEnter={() => { if (!voiceSupported) setShowVoiceTooltip(true); }}
              onMouseLeave={() => setShowVoiceTooltip(false)}
              title={voiceSupported ? (isRecording ? "Stop recording" : "Voice input") : "Voice not supported in this browser"}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                border: `1.5px solid ${isRecording ? "#ef4444" : "#2d3550"}`,
                background: "transparent",
                cursor: voiceSupported ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, padding: 0,
                transition: "border-color 0.15s",
              }}
            >
              {isRecording
                ? <MicOff size={16} color="#ef4444" />
                : <Mic size={16} color={voiceSupported ? "#94a3b8" : "#3d4466"} />
              }
            </button>

            {isRecording && (
              <span style={{
                position: "absolute", top: 5, right: 5,
                width: 6, height: 6, borderRadius: "50%",
                background: "#ef4444",
                animation: "bounce 1s infinite",
                pointerEvents: "none",
              }} />
            )}

            {showVoiceTooltip && !voiceSupported && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 8px)", right: 0,
                background: "#1a1d2e", border: "1px solid #2d3550",
                borderRadius: 7, padding: "5px 10px",
                fontSize: 11, color: "#94a3b8",
                whiteSpace: "nowrap", pointerEvents: "none", zIndex: 20,
              }}>
                Voice not supported in this browser
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            title="Send (Enter)"
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: "none",
              background: canSend ? "#e2e8f0" : "#1a1d2e",
              cursor: canSend ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, padding: 0,
              transition: "background 0.2s ease, transform 0.1s ease",
              transform: "scale(1)",
            }}
            onMouseEnter={e => {
              if (canSend) (e.currentTarget as HTMLElement).style.transform = "scale(1.06)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <ArrowUp size={17} color={canSend ? "#080a12" : "#2d3550"} strokeWidth={2.5} />
          </button>

        </div>
      </div>
    </div>
  );
}