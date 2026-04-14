"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Pencil } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  label: string;
  question: string;
  options: string[];
}

interface Props {
  steps: Step[];
  onSubmit: (answers: Record<string, string>) => void;
  onBack?: () => void; // called when user clicks Back on step 1
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuestionnaireCard({ steps, onSubmit, onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState("");

  const totalSteps = steps.length;
  const current = steps[currentStep];

  const handleSelect = (option: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [current.label]: option }));
    setShowOtherInput(false);
  };

  const handleOtherClick = () => {
    if (submitted) return;
    setShowOtherInput(true);
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[current.label];
      return newAnswers;
    });
  };

  const handleOtherSubmit = () => {
    if (otherText.trim()) {
      setAnswers(prev => ({ ...prev, [current.label]: otherText.trim() }));
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      setShowOtherInput(false);
      setOtherText("");
    } else {
      setSubmitted(true);
      onSubmit(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowOtherInput(false);
      setOtherText("");
    } else {
      onBack?.();
    }
  };

  const currentAnswer = answers[current.label];
  const canNext = currentAnswer !== undefined || (showOtherInput && otherText.trim().length > 0);

  // Auto-submit other text if user moves forward
  const onNextClick = () => {
    if (showOtherInput && otherText.trim()) {
      handleOtherSubmit();
    }
    handleNext();
  };

  return (
    <div style={{
      background: "#18191f",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      display: "flex",
      flexDirection: "column",
      width: "100%",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
      fontFamily: "Segoe UI, sans-serif",
    }}>
      
      {/* ── Header ── */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255, 255, 255, 0.01)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                style={{
                  height: 6,
                  borderRadius: 3,
                  width: idx === currentStep ? 24 : 8,
                  background: idx === currentStep ? "#6366f1" : idx < currentStep ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Step {currentStep + 1} of {totalSteps}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleBack}
            disabled={submitted || (currentStep === 0 && !onBack)}
            style={{
              width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: (currentStep === 0 && !onBack) || submitted ? "default" : "pointer",
              opacity: (currentStep === 0 && !onBack) || submitted ? 0.3 : 1
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={onNextClick}
            disabled={!canNext || submitted}
            style={{
              width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", color: canNext ? "#e2e8f0" : "#475569",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: !canNext || submitted ? "default" : "pointer",
              opacity: !canNext || submitted ? 0.3 : 1
            }}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            {current.label}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.4 }}>
            {current.question}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {current.options.map((opt, idx) => {
            const isSelected = !showOtherInput && currentAnswer === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={submitted}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 18px",
                  borderRadius: 14,
                  border: `1px solid ${isSelected ? "#6366f1" : "rgba(255,255,255,0.05)"}`,
                  background: isSelected ? "rgba(99, 102, 241, 0.08)" : "rgba(255,255,255,0.02)",
                  cursor: submitted ? "default" : "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: isSelected ? "#6366f1" : "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: isSelected ? "#fff" : "#94a3b8",
                  flexShrink: 0,
                  transition: "all 0.2s"
                }}>
                  {idx + 1}
                </div>
                <span style={{ fontSize: 15, color: isSelected ? "#f1f5f9" : "#94a3b8", fontWeight: isSelected ? 500 : 400 }}>
                  {opt}
                </span>
              </button>
            );
          })}

          {/* ── Something Else ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={handleOtherClick}
              disabled={submitted}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 18px",
                borderRadius: 14,
                border: `1px solid ${showOtherInput ? "#6366f1" : "rgba(255,255,255,0.05)"}`,
                background: showOtherInput ? "rgba(99, 102, 241, 0.08)" : "rgba(255,255,255,0.02)",
                cursor: submitted ? "default" : "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: showOtherInput ? "#6366f1" : "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: showOtherInput ? "#fff" : "#94a3b8",
                flexShrink: 0
              }}>
                <Pencil size={12} />
              </div>
              <span style={{ fontSize: 15, color: showOtherInput ? "#f1f5f9" : "#94a3b8", fontWeight: showOtherInput ? 500 : 400 }}>
                Something else...
              </span>
            </button>

            {showOtherInput && (
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Tell us more about your situation..."
                disabled={submitted}
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f1f5f9",
                  fontSize: 14,
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  marginTop: -4,
                  animation: "fadeIn 0.2s ease-out"
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: "20px 40px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0,0,0,0.1)"
      }}>
        <div style={{ fontSize: 13, color: "#475569" }}>
          {submitted ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ade80", fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Submitted
            </div>
          ) : (
            "Select an option to continue"
          )}
        </div>

        {!submitted && (
          <button
            onClick={onNextClick}
            disabled={!canNext}
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              border: "none",
              background: canNext 
                ? "linear-gradient(135deg, #6366f1, #4f46e5)" 
                : "rgba(255,255,255,0.05)",
              color: canNext ? "#fff" : "#475569",
              fontSize: 14,
              fontWeight: 700,
              cursor: canNext ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
          >
            {currentStep === totalSteps - 1 ? "Submit ✓" : "Next →"}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
