"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  TrendingUp,
  HeartPulse,
  PieChart,
  Sparkles,
  MessageSquare,
  Search,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { db, Lead, Page } from "@/lib/data";

interface Props {
  setActive: (page: Page) => void;
  setSelectedLead: (lead: Lead) => void;
  setInitialMessage: (message: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users size={20} className="text-indigo-300" />,
  TrendingUp: <TrendingUp size={20} className="text-indigo-300" />,
  HeartPulse: <HeartPulse size={20} className="text-indigo-300" />,
  PieChart: <PieChart size={20} className="text-indigo-300" />,
};

const EVENT_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "New Baby": { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400" },
  "Home Purchase": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500" },
  Promotion: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500" },
  Marriage: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500" },
  "Recently Married": { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500" },
  "Job Promotion": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500" },
  "Health Flag": { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500" },
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

export default function Dashboard({ setActive, setSelectedLead, setInitialMessage }: Props) {
  const stats = db.getStats();
  const leads = db.getLeads();
  const events = db.getEvents();

  const [sortCol, setSortCol] = useState<"name" | "event" | "product" | "score" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (col: "name" | "event" | "product" | "score") => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const sortedActions = useMemo(() => {
    return [...leads].sort((a, b) => {
      if (!sortCol) return 0;
      const aVal = a[sortCol as keyof Lead];
      const bVal = b[sortCol as keyof Lead];
      if (aVal! < bVal!) return sortDir === "asc" ? -1 : 1;
      if (aVal! > bVal!) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [leads, sortCol, sortDir]);

  const renderSortIcon = (col: string) => {
    if (sortCol !== col) return <span className="opacity-30 inline-block w-3.5">↕</span>;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const renderLeadCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 animate-fade-in">
      {leads.slice(0, 3).map((lead) => (
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
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${EVENT_COLORS[lead.event]?.bg || "bg-white/10"} ${EVENT_COLORS[lead.event]?.text || "text-white"}`}
                >
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
            <MessageSquare size={16} /> AI Chat Assistant
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1400px] w-full mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50 m-0">Welcome back, Agent ✨</h1>
          <p className="mt-1 text-sm text-slate-400">Here&apos;s your AI-curated summary for today.</p>
        </div>
        <div className="flex gap-4">
          <button className="glass-panel btn-hover w-10 h-10 rounded-full flex items-center justify-center text-slate-200">
            <Search size={18} />
          </button>
          <button className="glass-panel btn-hover w-10 h-10 rounded-full flex items-center justify-center text-slate-200 relative">
            <Bell size={18} />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="glass-panel card-hover rounded-[20px] p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                {ICON_MAP[stat.iconName]}
              </div>
              <div className="bg-green-500/15 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">{stat.delta}</div>
            </div>
            <div className="text-3xl font-bold text-slate-50 mb-1">{stat.value}</div>
            <div className="text-[13px] text-slate-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[2.5fr_1fr] gap-6 mb-8">
        <div className="glass-panel card-hover rounded-3xl p-5 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-50 m-0">Priority Actions</h3>
            <button onClick={() => setActive("leads")} className="btn-hover text-indigo-300 text-[13px] font-medium tracking-wide">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  {["name", "event", "product", "score"].map((col) => (
                    <th key={col} onClick={() => toggleSort(col as "name" | "event" | "product" | "score")} className="text-left p-2.5 text-[11px] font-semibold tracking-wide cursor-pointer hover:text-slate-50 transition-colors select-none">
                      <div className={`inline-flex items-center gap-1 whitespace-nowrap ${sortCol === col ? "text-indigo-300" : "text-slate-500"}`}>
                        {col === "name" ? "CUSTOMER" : col === "event" ? "LIFE EVENT" : col === "product" ? "RECOMMENDATION" : "MATCH SCORE"} {renderSortIcon(col)}
                      </div>
                    </th>
                  ))}
                  <th className="text-left p-2.5 text-[11px] font-semibold text-slate-500 tracking-wide">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {sortedActions.slice(0, 4).map((action) => (
                  <tr key={action.id} className="row-hover border-b border-white/[0.03]">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-semibold shrink-0">{action.avatar}</div>
                        <span onClick={() => { setSelectedLead(action); setActive("customers"); }} className="btn-hover text-[13px] font-medium text-slate-200 cursor-pointer whitespace-nowrap">{action.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${EVENT_COLORS[action.event]?.bg || "bg-white/10"} ${EVENT_COLORS[action.event]?.text || "text-white"}`}>{action.event}</span>
                    </td>
                    <td className="p-3 text-[13px] text-slate-200">{action.product}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[120px] h-1.5 bg-white/5 rounded-full overflow-hidden shrink-0">
                          <div style={{ width: `${action.score}%`, backgroundColor: getScoreColor(action.score) }} className="h-full rounded-full transition-all duration-1000 ease-out" />
                        </div>
                        <span className="text-xs font-semibold text-slate-50 w-6">{action.score}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <button 
                        onClick={() => { 
                          setSelectedLead(action); 
                          setInitialMessage(`Get Latest Info for ${action.name}, what is the best product i can offer to him/her?`);
                          setActive("chat"); 
                        }} 
                        className="btn-hover px-3 py-1.5 rounded-lg border border-indigo-500/40 text-indigo-300 text-xs font-medium whitespace-nowrap"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="glass-panel card-hover rounded-[32px] p-5 flex-1 border border-white/10 backdrop-blur-xl bg-white/[0.02] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 shrink-0 px-1">
              <h3 className="text-[14px] font-bold text-slate-100 m-0 tracking-tight">Recent Life Events</h3>
              <button onClick={() => setActive("events")} className="btn-hover text-indigo-300 text-[11px] font-bold tracking-wide hover:underline transition-all">View All</button>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto pr-1 scrollbar-hide">
              {events.map((event) => (
                <div key={event.id} className={`flex gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/5 shrink-0`}>
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base shrink-0 border border-white/5 group-hover:scale-105 transition-transform`}>
                    {event.eventType === "Health Flag" ? "⚠️" : event.eventType === "New Baby" ? "🍼" : event.eventType === "Promotion" ? "💼" : "🏠"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="text-[12px] font-bold text-slate-100 truncate">{event.customerName}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase shrink-0">{event.timestamp}</div>
                    </div>
                    <div className={`text-[11px] font-medium ${EVENT_COLORS[event.eventType]?.text || "text-slate-400"} truncate`}>
                      {event.eventType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel card-hover rounded-[28px] p-4 bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-md shrink-0">
            <div className="flex gap-3 items-start">
              <div className="text-indigo-300 mt-0.5"><Sparkles size={16} /></div>
              <div>
                <h4 className="text-[12px] font-bold text-slate-100 mb-1 m-0 uppercase tracking-wider">AI Tip</h4>
                <p className="text-[11px] text-slate-400 leading-snug m-0 font-medium">New Baby events have 45% higher conversion within 72h.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-50 mb-5 m-0">Recommended Leads</h3>
      {renderLeadCards()}
    </div>
  );
}
