"use client";

import { useState } from "react";
import { Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  label?: string;
  question: string;
  inputType: "single" | "multi";
  options: string[];
  onSubmit: (answer: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuestionnaireCard({ label, question, inputType, options, onSubmit }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (opt: string) => {
    if (submitted) return;
    if (inputType === "single") {
      setSelected([opt]);
    } else {
      setSelected(prev =>
        prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
      );
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0 || submitted) return;
    const answer =
      inputType === "single"
        ? selected[0]
        : selected.map((s, i) => `${i + 1}. ${s}`).join("\n");
    setSubmitted(true);
    onSubmit(answer);
  };

  const canSubmit = selected.length > 0 && !submitted;

  return (
    <div style={{
      background: "#13151f",
      border: "1px solid #1e2235",
      borderRadius: 14,
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      maxWidth: 340,
    }}>

      {/* ── Label & Question ── */}
      <div>
        {label && (
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#6366f1",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 6
          }}>
            {label}
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.5 }}>
          {question}
        </div>
      </div>

      {/* ── Options ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              disabled={submitted}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 9,
                border: `1px solid ${isSelected ? "#4f52a8" : "#1e2235"}`,
                background: isSelected ? "#6366f114" : "transparent",
                cursor: submitted ? "default" : "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                fontFamily: "Segoe UI, sans-serif",
              }}
            >
              <div style={{
                width: 17,
                height: 17,
                borderRadius: inputType === "single" ? "50%" : 5,
                border: `1.5px solid ${isSelected ? "#6366f1" : "#2d3550"}`,
                background: isSelected ? "#6366f1" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}>
                {isSelected && (
                  inputType === "single"
                    ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                    : <Check size={10} color="#fff" strokeWidth={3} />
                )}
              </div>

              <span style={{
                fontSize: 13,
                color: isSelected ? "#c7d2fe" : "#94a3b8",
                lineHeight: 1.4,
                transition: "color 0.15s ease",
              }}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {submitted ? (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "#22c55e",
            background: "#22c55e12",
            border: "1px solid #22c55e25",
            borderRadius: 7,
            padding: "5px 11px",
          }}>
            <Check size={13} strokeWidth={2.5} />
            Submitted
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: "none",
              background: canSubmit
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "#1e2235",
              color: canSubmit ? "#fff" : "#3d4466",
              fontSize: 13,
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              fontFamily: "Segoe UI, sans-serif",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            Submit
          </button>
        )}

        {inputType === "multi" && !submitted && selected.length > 0 && (
          <span style={{ fontSize: 11, color: "#475569" }}>
            {selected.length} selected
          </span>
        )}
      </div>
    </div>
  );
}
