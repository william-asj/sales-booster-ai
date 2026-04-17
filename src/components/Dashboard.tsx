"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Baby,
  Clock,
  CircleAlert,
  ShieldCheck,
  CircleMinus,
  Eye,
  RefreshCw,
  Activity
} from "lucide-react";
import { db, Lead, Page } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

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

const getEventStyles = (type: string) => {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    "Birthday": { bg: "bg-emerald-400/10", text: "text-emerald-400", icon: <Baby size={14} /> },
    "Inforce": { bg: "bg-emerald-400/10", text: "text-emerald-400", icon: <ShieldCheck size={14} /> },
    "Policy Being Processed": { bg: "bg-amber-400/10", text: "text-amber-400", icon: <Clock size={14} /> },
    "Health Claim": { bg: "bg-rose-400/10", text: "text-rose-400", icon: <Activity size={14} /> },
    "Lapse": { bg: "bg-rose-400/10", text: "text-rose-400", icon: <CircleAlert size={14} /> },
    "Surrender": { bg: "bg-rose-400/10", text: "text-rose-400", icon: <CircleMinus size={14} /> },
    "Freelook": { bg: "bg-blue-400/10", text: "text-blue-400", icon: <Eye size={14} /> },
    "Reinstate": { bg: "bg-indigo-400/10", text: "text-indigo-400", icon: <RefreshCw size={14} /> }
  };
  return styles[type] || { bg: "bg-white/10", text: "text-white", icon: <HeartPulse size={14} /> };
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#4ade80";
  if (score >= 60) return "#fbbf24";
  return "#f87171";
};

// Helper to weigh timestamps for sorting (Future -> Present -> Past)
const getTimestampWeight = (ts: string): number => {
  const lower = ts.toLowerCase();

  // FUTURE — show first
  if (lower.includes("tomorrow")) return 200;
  const inDaysMatch = lower.match(/in\s+(\d+)\s+day/);
  if (inDaysMatch) return 200 - parseInt(inDaysMatch[1]); // "in 2 days" = 198

  // TODAY — recent activity
  const minsMatch = lower.match(/(\d+)\s+min.*ago/);
  if (minsMatch) return 100 - parseInt(minsMatch[1]); // fewer minutes ago = higher
  const hrsMatch = lower.match(/(\d+)\s+hr.*ago/);
  if (hrsMatch) return 80 - parseInt(hrsMatch[1]);
  if (lower === "today") return 75;

  // PAST — show last, more recent past ranks higher
  const daysAgoMatch = lower.match(/(\d+)\s+day.*ago/);
  if (daysAgoMatch) return -parseInt(daysAgoMatch[1]);
  const weeksAgoMatch = lower.match(/(\d+)\s+week.*ago/);
  if (weeksAgoMatch) return -parseInt(weeksAgoMatch[1]) * 7;

  return 0;
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

export default function Dashboard({ setActive, setSelectedLead, setInitialMessage }: Props) {
  const { t } = useLanguage();
  const stats = db.getStats();
  const leads = db.getLeads();
  const events = db.getEvents();

  const [dailyTip, setDailyTip] = useState(t("Loading today's tip..."));
  const [tipLoading, setTipLoading] = useState(false);

  const fetchTip = useCallback(async () => {
    setTipLoading(true);
    try {
      const res = await fetch('/api/daily-tip', { method: 'POST' });
      const data = await res.json();
      if (data.tip) setDailyTip(data.tip);
    } catch (err) {
      console.error("Failed to fetch daily tip:", err);
      setDailyTip(t("Check back later for today's tip."));
    } finally {
      setTipLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchTip();
    }
    return () => { mounted = false; };
  }, [fetchTip]);

  const [sortCol, setSortCol] = useState<"name" | "event" | "product" | "score" | null>("score");
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

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => getTimestampWeight(b.timestamp) - getTimestampWeight(a.timestamp));
  }, [events]);

  const renderSortIcon = (col: string) => {
    if (sortCol !== col) return <span className="opacity-30 inline-block w-3.5">↕</span>;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const renderLeadCards = () => {
    const topLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 3);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 animate-fade-in">
        {topLeads.map((lead) => {
          const eventStyle = getEventStyles(lead.event);
          return (
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
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${eventStyle.bg} ${eventStyle.text}`}
                    >
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
                  <span className="text-[13px] text-indigo-500 dark:text-indigo-300 font-semibold">{lead.premium}</span>
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
                <MessageSquare size={16} className="text-indigo-500 dark:text-indigo-300" /> {t("AI Chat Assistant")}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1400px] w-full mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--app-header)] m-0">{t("Welcome back, Agent ✨")}</h1>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">{t("Here's your AI-curated summary for today.")}</p>
        </div>
        <div className="flex gap-4">
          <button className="glass-panel btn-hover w-10 h-10 rounded-full flex items-center justify-center text-[var(--app-text)]">
            <Search size={18} />
          </button>
          <button className="glass-panel btn-hover w-10 h-10 rounded-full flex items-center justify-center text-[var(--app-text)] relative">
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
              <div className="bg-green-500/15 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-semibold">{stat.delta}</div>
            </div>
            <div className="text-3xl font-bold text-[var(--app-header)] mb-1">{stat.value}</div>
            <div className="text-[13px] text-[var(--app-text-muted)] font-medium">{t(stat.label)}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[2.5fr_1fr] gap-6 mb-8 items-stretch">
        <div className="glass-panel card-hover rounded-3xl p-5 md:p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-[var(--app-header)] m-0">{t("Priority Actions")}</h3>
            <button onClick={() => setActive("leads")} className="btn-hover text-indigo-500 dark:text-indigo-300 text-[13px] font-medium tracking-wide">{t("View All")}</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--sidebar-item-border)]">
                  {["name", "event", "product", "score"].map((col) => (
                    <th key={col} onClick={() => toggleSort(col as "name" | "event" | "product" | "score")} className="text-left p-2.5 text-[11px] font-semibold tracking-wide cursor-pointer hover:text-[var(--app-header)] transition-colors select-none">
                      <div className={`inline-flex items-center gap-1 whitespace-nowrap ${sortCol === col ? "text-indigo-500 dark:text-indigo-300" : "text-[var(--app-text-muted)]"}`}>
                        {col === "name" ? t("CUSTOMER") : col === "event" ? t("LIFE EVENT") : col === "product" ? t("RECOMMENDATION") : t("MATCH SCORE")} {renderSortIcon(col)}
                      </div>
                    </th>
                  ))}
                  <th className="text-left p-2.5 text-[11px] font-semibold text-[var(--app-text-muted)] tracking-wide">{t("ACTION")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedActions.slice(0, 6).map((action) => {
                  const eventStyle = getEventStyles(action.event);
                  return (
                    <tr key={action.id} className="row-hover border-b border-[var(--sidebar-item-border)]">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[var(--sidebar-item-bg)] flex items-center justify-center text-[11px] font-semibold shrink-0 text-[var(--app-text)]">{action.avatar}</div>
                          <span onClick={() => { setSelectedLead(action); setActive("customers"); }} className="btn-hover text-[13px] font-medium text-[var(--app-text)] cursor-pointer whitespace-nowrap">{action.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${eventStyle.bg} ${eventStyle.text}`}>{t(action.event)}</span>
                      </td>
                      <td className="p-3 text-[13px] text-[var(--app-text)]">{t(action.product)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[120px] h-1.5 bg-[var(--sidebar-item-bg)] rounded-full overflow-hidden shrink-0 border border-[var(--sidebar-item-border)]">
                            <div style={{ width: `${action.score}%`, backgroundColor: getScoreColor(action.score) }} className="h-full rounded-full transition-all duration-1000 ease-out" />
                          </div>
                          <span className="text-xs font-semibold text-[var(--app-header)] w-6">{action.score}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => { 
                            setSelectedLead(action); 
                            setInitialMessage(`Get Latest Info for ${action.name}, what is the best product i can offer to him/her?`);
                            setActive("chat"); 
                          }} 
                          className="btn-hover px-3 py-1.5 rounded-lg border border-indigo-500/40 text-indigo-600 dark:text-indigo-300 text-xs font-medium whitespace-nowrap"
                        >
                          {t("Review")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-panel card-hover rounded-[32px] p-5 flex flex-col overflow-hidden border border-[var(--sidebar-item-border)] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4 shrink-0 px-1">
              <h3 className="text-[14px] font-bold text-[var(--app-header)] m-0 tracking-tight">{t("Recent Life Events")}</h3>
              <button onClick={() => setActive("events")} className="btn-hover text-indigo-500 dark:text-indigo-300 text-[11px] font-bold tracking-wide transition-all">{t("View All")}</button>
            </div>
            <div className="flex flex-col gap-1.5 overflow-hidden">
              {sortedEvents.slice(0, 5).map((event) => {
                const eventStyle = getEventStyles(event.eventType);
                return (
                  <div key={event.id} className={`flex gap-3.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[var(--sidebar-item-border)] shrink-0`}>
                    <div className={`w-8 h-8 rounded-lg bg-[var(--sidebar-item-bg)] flex items-center justify-center text-base shrink-0 border border-[var(--sidebar-item-border)] group-hover:scale-105 transition-transform ${eventStyle.text}`}>
                      {React.cloneElement(eventStyle.icon as React.ReactElement<{ size?: number }>, { size: 14 })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <div className="text-[13px] font-bold text-[var(--app-header)] truncate">{event.customerName}</div>
                        <div className="text-[9px] font-bold text-[var(--app-text-muted)] uppercase shrink-0">{event.timestamp}</div>
                      </div>
                      <div className={`text-[11px] font-medium ${eventStyle.text} truncate`}>
                        {t(event.eventType)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel card-hover rounded-[28px] p-5 bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-md shrink-0 mt-auto">
            <div className="flex gap-3 items-start">
              <div className="text-indigo-500 dark:text-indigo-300 mt-0.5"><Sparkles size={18} /></div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[13px] font-bold text-[var(--app-header)] m-0 uppercase tracking-wider">{t("AI Tips of the Day")}</h4>
                  <button 
                    onClick={fetchTip} 
                    disabled={tipLoading}
                    className="text-indigo-500 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-100 transition-colors disabled:opacity-50"
                    title={t("Refresh Tip")}
                  >
                    <RefreshCw size={14} className={tipLoading ? "animate-spin" : ""} />
                  </button>
                </div>
                <p className={`text-[12px] text-[var(--app-text-muted)] leading-snug m-0 font-medium transition-opacity duration-300 ${tipLoading ? "opacity-50" : "opacity-100"}`}>
                  {dailyTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-[var(--app-header)] mb-5 m-0">{t("Recommended Leads")}</h3>
      {renderLeadCards()}
    </div>
  );
}
