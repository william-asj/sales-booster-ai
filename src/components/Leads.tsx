"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { db, Lead } from "@/lib/data";

const EVENT_COLORS: Record<string, { bg: string; text: string }> = {
  "New Baby": { bg: "bg-amber-400/10", text: "text-amber-400" },
  "Home Purchase": { bg: "bg-blue-500/10", text: "text-blue-400" },
  Promotion: { bg: "bg-purple-500/10", text: "text-purple-400" },
  Marriage: { bg: "bg-green-500/10", text: "text-green-400" },
  "Recently Married": { bg: "bg-green-500/10", text: "text-green-400" },
  "Job Promotion": { bg: "bg-purple-500/10", text: "text-purple-400" },
  "Health Flag": { bg: "bg-red-500/10", text: "text-red-400" },
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
      <span className="absolute text-[13px] font-bold text-slate-50">{score}</span>
    </div>
  );
};

interface LeadsProps {
  setActive: (page: string) => void;
  setSelectedLead: (lead: Lead) => void;
  setInitialMessage: (message: string) => void;
}

export default function Leads({ setActive, setSelectedLead, setInitialMessage }: LeadsProps) {
  const leads = db.getLeads();

  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1400px] w-full mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-50 m-0">Leads Recommendation</h1>
        <p className="mt-1 text-sm text-slate-400">Full list of AI-curated opportunities.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {leads.map((lead) => (
          <div key={lead.id} className="glass-panel card-hover rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 font-semibold text-sm">
                  {lead.avatar}
                </div>
                <div>
                  <div
                    onClick={() => { setSelectedLead(lead); setActive("customers"); }}
                    className="btn-hover text-[15px] font-semibold text-slate-50 cursor-pointer"
                  >
                    {lead.name}
                  </div>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${EVENT_COLORS[lead.event]?.bg || "bg-white/10"} ${EVENT_COLORS[lead.event]?.text || "text-white"}`}>
                    {lead.event}
                  </span>
                </div>
              </div>
              <CircularGauge score={lead.score} />
            </div>

            <div className="bg-black/20 rounded-xl p-4 mb-5 flex-1">
              <div className="flex justify-between mb-3">
                <span className="text-xs text-slate-400">Best Product</span>
                <span className="text-xs text-slate-200 font-medium">{lead.product}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Est. Premium</span>
                <span className="text-[13px] text-indigo-300 font-semibold">{lead.premium}</span>
              </div>
            </div>

            <button
              onClick={() => { 
                setSelectedLead(lead); 
                setInitialMessage(`Get Latest Info for ${lead.name}, what is the best product i can offer to him/her?`);
                setActive("chat"); 
              }}
              className="btn-hover w-full py-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-slate-200 text-[13px] font-semibold flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} /> Ask AI
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
