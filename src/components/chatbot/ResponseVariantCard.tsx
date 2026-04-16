"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Variant {
  label: string;
  content: string;
}

interface Props {
  variants: Variant[];
}

// Tab letter: 0 → A, 1 → B, etc.
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResponseVariantCard({ variants }: Props) {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(variants[activeIdx].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silent fail
    }
  }, [activeIdx, variants]);

  const active = variants[activeIdx];

  return (
    <div style={{
      background: "#13151f",
      border: "1px solid #1e2235",
      borderRadius: 14,
      overflow: "hidden",
      maxWidth: 340,
    }}>

      {/* ── Tab row ── */}
      <div style={{
        display: "flex",
        gap: 6,
        padding: "12px 14px 10px",
        borderBottom: "1px solid #1e2235",
        flexWrap: "wrap",
      }}>
        {variants.map((v, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 10px 5px 6px",
                borderRadius: 20,
                border: `1px solid ${isActive ? "#3d4166" : "#1e2235"}`,
                background: isActive ? "#6366f112" : "transparent",
                cursor: "pointer",
                fontFamily: "Segoe UI, sans-serif",
                transition: "all 0.15s ease",
              }}
            >
              {/* Circle badge */}
              <div style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: isActive ? "#e2e8f0" : "transparent",
                border: isActive ? "none" : "1.5px solid #2d3550",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: isActive ? "#080a12" : "#475569",
                  lineHeight: 1,
                  fontFamily: "Segoe UI, sans-serif",
                }}>
                  {LETTERS[i] ?? i + 1}
                </span>
              </div>

              {/* Label */}
              <span style={{
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#818cf8" : "#475569",
                whiteSpace: "nowrap",
                transition: "color 0.15s ease",
              }}>
                {v.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content body ── */}
      <div style={{
        padding: "14px 16px 12px",
        fontSize: 13,
        color: "#cbd5e1",
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        minHeight: 60,
        animation: "fadeIn 0.15s ease",
        // key re-triggers animation on tab change — handled by key prop on wrapper
      }}>
        {active.content}
      </div>

      {/* ── Footer with copy button ── */}
      <div style={{
        padding: "8px 12px 10px",
        borderTop: "1px solid #1e2235",
        display: "flex",
        justifyContent: "flex-end",
      }}>
        <button
          onClick={handleCopy}
          title={copied ? t("Copied!") : t("Copy to clipboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px",
            borderRadius: 7,
            border: `1px solid ${copied ? "#22c55e30" : "#1e2235"}`,
            background: copied ? "#22c55e10" : "transparent",
            cursor: "pointer",
            fontFamily: "Segoe UI, sans-serif",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            if (!copied) {
              (e.currentTarget as HTMLElement).style.borderColor = "#2d3550";
              (e.currentTarget as HTMLElement).style.background = "#ffffff06";
            }
          }}
          onMouseLeave={e => {
            if (!copied) {
              (e.currentTarget as HTMLElement).style.borderColor = "#1e2235";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }
          }}
        >
          {copied ? (
            <>
              <Check size={13} color="#22c55e" strokeWidth={2.5} />
              <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 500 }}>{t("Copied")}</span>
            </>
          ) : (
            <>
              <Copy size={13} color="#475569" />
              <span style={{ fontSize: 11, color: "#475569" }}>{t("Copy")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}