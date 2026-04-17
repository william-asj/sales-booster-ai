"use client";

import React, { useState, useMemo } from "react";
import { MessageSquare, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { db, Lead } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

const EVENT_COLORS: Record<string, { bg: string; text: string }> = {
  "Birthday": { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  "Inforce": { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  "Policy Being Processed": { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  "Lapse": { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  "Surrender": { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  "Freelook": { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  "Reinstate": { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#4ade80";
  if (score >= 60) return "#fbbf24";
  return "#f87171";
};

const CircularGauge = ({ score }: { score: number }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-[60px] h-[60px] flex items-center justify-center">
      <svg width="60" height="60" className="-rotate-90">
        <circle cx="30" cy="30" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
        <circle cx="30" cy="30" r={radius} fill="transparent" stroke={getScoreColor(score)} strokeWidth="2.5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute text-[13px] font-bold text-[var(--app-header)]">{score}</span>
    </div>
  );
};

interface LeadsProps {
  setActive: (page: string) => void;
  setSelectedLead: (lead: Lead) => void;
  setInitialMessage: (message: string) => void;
}

type SortField = "score" | "name" | "event";
type SortOrder = "asc" | "desc";

interface SortButtonProps {
  field: SortField;
  label: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  handleSort: (field: SortField) => void;
}

const SortButton = ({ field, label, sortBy, sortOrder, handleSort }: SortButtonProps) => (
  <button
    onClick={() => handleSort(field)}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
      sortBy === field
        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-600 dark:text-indigo-300"
        : "bg-white/5 border-[var(--sidebar-item-border)] text-[var(--app-text-muted)] hover:bg-black/5 dark:hover:bg-white/10"
    }`}
  >
    {label}
    {sortBy === field ? (
      sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    ) : (
      <ArrowUpDown size={14} className="opacity-30" />
    )}
  </button>
);

export default function Leads({ setActive, setSelectedLead, setInitialMessage }: LeadsProps) {
  const { t } = useLanguage();
  const leads = db.getLeads();
  const [sortBy, setSortBy] = useState<SortField>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "score") {
        comparison = a.score - b.score;
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "event") {
        comparison = a.event.localeCompare(b.event);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [leads, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1400px] w-full mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-header)] m-0">{t("Leads Recommendation")}</h1>
          <p className="mt-1 text-sm text-[var(--app-text-muted)] font-medium">{t("Full list of AI-curated opportunities sorted by your priority.")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[var(--sidebar-item-bg)] p-2 rounded-2xl border border-[var(--sidebar-item-border)]">
          <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest px-2">{t("Sort By")}</span>
          <SortButton field="score" label={t("Match Score")} sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} />
          <SortButton field="name" label={t("Customer Name")} sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} />
          <SortButton field="event" label={t("Life Event")} sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {sortedLeads.map((lead) => (
          <div key={lead.id} className="glass-panel card-hover rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[var(--sidebar-item-bg)] border border-[var(--sidebar-item-border)] flex items-center justify-center text-[var(--app-text)] font-semibold text-sm">
                  {lead.avatar}
                </div>
                <div>
                  <div
                    onClick={() => { setSelectedLead(lead); setActive("customers"); }}
                    className="btn-hover text-[15px] font-semibold text-[var(--app-header)] cursor-pointer"
                  >
                    {lead.name}
                  </div>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${EVENT_COLORS[lead.event]?.bg || "bg-white/10"} ${EVENT_COLORS[lead.event]?.text || "text-[var(--app-text)]"}`}>
                    {t(lead.event)}
                  </span>
                </div>
              </div>
              <CircularGauge score={lead.score} />
            </div>

            <div className="bg-black/5 dark:bg-black/20 rounded-xl p-4 mb-5 flex-1 border border-[var(--sidebar-item-border)]">
              <div className="flex justify-between mb-3">
                <span className="text-xs text-[var(--app-text-muted)]">{t("Best Product")}</span>
                <span className="text-xs text-[var(--app-text)] font-medium">{t(lead.product)}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-xs text-[var(--app-text-muted)]">{t("Est. Premium")}</span>
                <span className="text-[13px] text-indigo-600 dark:text-indigo-300 font-semibold">{lead.premium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[var(--app-text-muted)]">{t("Est. Commission")}</span>
                <span className="text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">{lead.estCommission}</span>
              </div>
            </div>

            <button
              onClick={() => { 
                setSelectedLead(lead); 
                setInitialMessage(`Get Latest Info for ${lead.name}, what is the best product i can offer to him/her?`);
                setActive("chat"); 
              }}
              className="btn-hover w-full py-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-500/20 dark:border-indigo-500/30 rounded-xl text-[var(--app-text)] text-[13px] font-semibold flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-300" /> {t("Ask AI")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
