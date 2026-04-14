"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Plus, X, ArrowUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttachedFile {
  file: File;
  name: string;
  mimeType: string;
  base64: string;
}

interface Props {
  onSend: (text: string, attachments?: AttachedFile[]) => void;
  onSlashCommand?: (command: "recommend") => void;
  disabled?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

const MAX_BYTES = 10 * 1024 * 1024;

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
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

// ─── File Icon Badge ──────────────────────────────────────────────────────────

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
      width: 38, height: 38, borderRadius: 8,
      background: bgColor, border: `1px solid ${borderColor}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: textColor, letterSpacing: 0.5 }}>
        {ext.substring(0, 4)}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const SLASH_COMMANDS = [
  { 
    command: "recommend" as const, 
    icon: "⚡", 
    label: "/recommend", 
    description: "Panduan rekomendasi produk / Product recommendation guide" 
  }
];

export default function ChatInput({ onSend, onSlashCommand, disabled = false, value = "", onValueChange }: Props) {
  const [text, setText] = useState(value);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVoiceSupported(!!getSpeechRecognition()), 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync internal text state with value prop
  useEffect(() => {
    setText(value);
  }, [value]);

  // Auto-focus when re-enabled (e.g. after AI finishes typing)
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    setShowCommandPalette(newText.startsWith("/"));
    if (onValueChange) onValueChange(newText);
  }, [onValueChange]);

  const handleCommandSelect = (command: "recommend") => {
    handleTextChange("");
    setShowCommandPalette(false);
    onSlashCommand?.(command);
  };

  // ─── Buttery Smooth Momentum Scrolling ──────────────────────────────────────
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let targetScroll = el.scrollLeft;
    let animationFrameId: number;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        e.preventDefault();
        targetScroll += e.deltaY * 1.5;
        const maxScroll = el.scrollWidth - el.clientWidth;
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

        const step = () => {
          if (!el) return;
          const diff = targetScroll - el.scrollLeft;
          if (Math.abs(diff) < 1) {
            el.scrollLeft = targetScroll;
            return;
          }
          el.scrollLeft += diff * 0.15;
          animationFrameId = requestAnimationFrame(step);
        };

        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(step);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, [attachments.length]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 22 * 4 + 32;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [text]);

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    
    if (text.trim() === "/recommend" && onSlashCommand) {
      onSlashCommand("recommend");
      handleTextChange("");
      setAttachments([]);
      setFileError(null);
      return;
    }

    onSend(text.trim(), attachments.length > 0 ? attachments : undefined);
    handleTextChange("");
    setAttachments([]);
    setFileError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }, [text, attachments, canSend, onSend, handleTextChange, onSlashCommand]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setFileError(null);

    if (attachments.length + files.length > 5) {
      setFileError("You can only attach up to 5 files maximum.");
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFileError(`Unsupported type: ${file.name}. Use PDF, Images, CSV, or Excel.`);
        return;
      }
      if (file.size > MAX_BYTES) {
        setFileError(`File exceeds 10 MB limit: ${file.name}`);
        return;
      }
      validFiles.push(file);
    }

    try {
      const newAttachments = await Promise.all(
        validFiles.map(async (file) => {
          const base64 = await toBase64(file);
          return { file, name: file.name, mimeType: file.type, base64 };
        })
      );
      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch {
      setFileError("Failed to read one or more files.");
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
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
      handleTextChange(text ? text + " " + t : t);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, text, handleTextChange]);

  return (
    <div style={{ padding: "0" }}>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .command-row:hover { background: rgba(99, 102, 241, 0.08); }
        @keyframes mic-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes mic-active-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          70%  { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      {fileError && (
        <div style={{ marginBottom: 6, fontSize: 11, color: "#ef4444", paddingLeft: 2 }}>
          {fileError}
        </div>
      )}

      <div style={{
        background: "rgba(8, 10, 18, 0.75)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRadius: 20,
        border: `1px solid ${focused ? "rgba(99, 102, 241, 0.4)" : "rgba(255, 255, 255, 0.07)"}`,
        boxShadow: focused
          ? "0 0 0 1px rgba(99, 102, 241, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4)"
          : "0 8px 32px rgba(0, 0, 0, 0.3)",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative"
      }}>

        {/* Command Palette */}
        {showCommandPalette && (
          <div style={{
            position: "absolute", bottom: "100%", left: 0, right: 0,
            marginBottom: 8, zIndex: 20,
            background: "rgba(13, 15, 26, 0.97)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            overflow: "hidden"
          }}>
            {SLASH_COMMANDS.map((cmd) => (
              <div
                key={cmd.command}
                className="command-row"
                onClick={() => handleCommandSelect(cmd.command)}
                style={{
                  padding: "10px 14px",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
              >
                <div style={{
                  background: "rgba(99, 102, 241, 0.15)",
                  borderRadius: 8,
                  padding: "4px 8px",
                  fontSize: 14
                }}>
                  {cmd.icon}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#818cf8", fontSize: 13, fontWeight: 600 }}>{cmd.label}</span>
                  <span style={{ color: "#475569", fontSize: 11 }}>{cmd.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Horizontal Attachment Carousel */}
        {attachments.length > 0 && (
          <div
            ref={scrollContainerRef}
            className="hide-scrollbar"
            style={{
              display: "flex",
              gap: 12,
              padding: "16px 16px 0 16px",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch"
            }}
          >
            {attachments.map((att, idx) => {
              return (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(0, 0, 0, 0.25)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12, padding: "8px 12px 8px 8px",
                  flexShrink: 0, maxWidth: 220, position: "relative",
                  marginTop: 6
                }}>
                  <FileBadge name={att.name} mimeType={att.mimeType} />
                  <span style={{
                    fontSize: 13, color: "var(--claude-text)", fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    {att.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    style={{
                      position: "absolute", top: -8, right: -8,
                      background: "#3d4466", border: "1px solid #1e2235",
                      cursor: "pointer", width: 22, height: 22, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#cbd5e1", padding: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                      transition: "all 0.15s ease", zIndex: 10
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#ef4444";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#3d4466";
                      e.currentTarget.style.color = "#cbd5e1";
                      e.currentTarget.style.borderColor = "#1e2235";
                    }}
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Textarea */}
        <div style={{ padding: attachments.length > 0 ? "12px 20px 8px" : "18px 20px 8px" }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            placeholder="Reply..."
            rows={1}
            style={{
              width: "100%", background: "transparent", border: "none",
              outline: "none", resize: "none", color: "#e2e8f0",
              fontSize: 16, fontFamily: "var(--font-main)",
              lineHeight: "24px", overflowY: "hidden",
              boxSizing: "border-box", caretColor: "#818cf8", display: "block",
            }}
          />
        </div>

        {/* Bottom toolbar */}
        <div style={{ padding: "4px 12px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            title={`Attach files (${attachments.length}/5)`}
            disabled={attachments.length >= 5}
            style={{
              width: 38, height: 38, borderRadius: "50%", border: "1.5px solid var(--claude-accent)",
              background: "transparent", cursor: attachments.length >= 5 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0,
              transition: "border-color 0.15s, background 0.15s", opacity: attachments.length >= 5 ? 0.5 : 1,
            }}
            onMouseEnter={e => {
              if (attachments.length < 5) {
                (e.currentTarget as HTMLElement).style.borderColor = "#6366f1";
                (e.currentTarget as HTMLElement).style.background = "#6366f110";
              }
            }}
            onMouseLeave={e => {
              if (attachments.length < 5) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--claude-accent)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }
            }}
          >
            <Plus size={20} color="var(--claude-muted)" strokeWidth={2} />
          </button>

          <div style={{ flex: 1 }} />

          {text.trim() === "" && attachments.length === 0 ? (
            /* ── Voice Button ── */
            <button
              disabled={!voiceSupported}
              onClick={voiceSupported ? toggleRecording : undefined}
              title={
                !voiceSupported
                  ? "Voice not supported in this browser"
                  : isRecording
                  ? "Stop recording"
                  : "Voice input"
              }
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: `1.5px solid ${isRecording ? "#ef4444" : "rgba(99, 102, 241, 0.6)"}`,
                background: isRecording ? "rgba(239, 68, 68, 0.12)" : "rgba(99, 102, 241, 0.08)",
                cursor: voiceSupported ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                padding: 0,
                transition: "all 0.2s ease",
                /* Pulse when idle, breathe-red when recording */
                animation: isRecording ? "mic-active-pulse 1s infinite" : "mic-pulse 2s infinite",
                opacity: voiceSupported ? 1 : 0.4,
              }}
            >
              <Mic
                size={18}
                color={isRecording ? "#ef4444" : voiceSupported ? "#818cf8" : "#475569"}
              />
            </button>
          ) : (
            /* ── Send Button ── */
            <button
              onClick={handleSend}
              disabled={!canSend}
              title="Send (Enter)"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                background: canSend ? "#e2e8f0" : "#1a1d2e",
                cursor: canSend ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                padding: 0,
                transition: "background 0.2s ease, transform 0.1s ease",
                transform: "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (canSend) (e.currentTarget as HTMLElement).style.transform = "scale(1.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              <ArrowUp size={20} color={canSend ? "#080a12" : "#2d3550"} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
      
      {!showCommandPalette && text.toLowerCase().includes("recommend") && (
        <div style={{ fontSize: 11, color: "#6366f1", marginTop: 6, paddingLeft: 4 }}>
          💡 Coba /recommend untuk panduan rekomendasi produk
        </div>
      )}
    </div>
  );
}
