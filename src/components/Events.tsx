"use client";

import React, { useState, useMemo } from "react";
import {
  Baby,
  TrendingUp,
  Activity,
  MoreVertical,
  HeartPulse,
  Search,
  Filter,
  Clock,
  ArrowUpRight,
  MessageSquare,
  ShieldCheck,
  CircleAlert,
  Eye,
  RefreshCw,
  CircleMinus,
  CheckCircle2
} from "lucide-react";
import { db, Lead } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

interface EventsProps {
  setActive: (page: string) => void;
  setSelectedLead: (lead: Lead) => void;
  setInitialMessage: (message: string) => void;
}

interface ColorStyle {
  bg: string;
  border: string;
  text: string;
  glow: string;
}

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const BIRTHDAY_TYPES = ["Birthday"];
const POLICY_STATUS_TYPES = ["Inforce", "Policy Being Processed", "Lapse", "Surrender", "Reinstate"];
const CLAIM_WAIVER_TYPES = ["Health Claim", "Freelook"];

const INSIGHT_STYLES: Record<string, { activeBg: string; dot: string; textActive: string; textValue: string; }> = {
  emerald: {
    activeBg: "bg-emerald-500/20 border-emerald-500/30 shadow-lg shadow-emerald-500/10",
    dot: "bg-emerald-400",
    textActive: "text-emerald-600 dark:text-emerald-300",
    textValue: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    activeBg: "bg-amber-500/20 border-amber-500/30 shadow-lg shadow-amber-500/10",
    dot: "bg-amber-400",
    textActive: "text-amber-600 dark:text-amber-300",
    textValue: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    activeBg: "bg-rose-500/20 border-rose-500/30 shadow-lg shadow-rose-500/10",
    dot: "bg-rose-400",
    textActive: "text-rose-600 dark:text-rose-300",
    textValue: "text-rose-600 dark:text-rose-400",
  }
};

/**
 * Calculates a weight for sorting. 
 * Larger number = Newer/More Recent for "ago" events.
 * Smaller number = Sooner/Nearer for "future" events.
 */
const getTimestampWeight = (ts: string) => {
  const lower = ts.toLowerCase();
  
  // FUTURE EVENTS (Positive weights)
  if (lower.includes("tomorrow")) return 1;
  const inDayMatch = lower.match(/in\s+(\d+)\s+day/);
  if (inDayMatch) return parseInt(inDayMatch[1]);
  
  // TODAY & PAST EVENTS (We use negative minutes from "now")
  const minMatch = lower.match(/(\d+)\s+min/);
  if (minMatch && lower.includes("ago")) return -parseInt(minMatch[1]);
  
  const hrMatch = lower.match(/(\d+)\s+hr/);
  if (hrMatch && lower.includes("ago")) return -parseInt(hrMatch[1]) * 60;
  
  if (lower === "today") return -1439;
  
  const dayMatch = lower.match(/(\d+)\s+day/);
  if (dayMatch && lower.includes("ago")) return -parseInt(dayMatch[1]) * 1440;
  
  const weekMatch = lower.match(/(\d+)\s+week/);
  if (weekMatch && lower.includes("ago")) return -parseInt(weekMatch[1]) * 10080;
  
  return -999999;
};

const getEventCategory = (timestamp: string) => {
  const ts = timestamp.toLowerCase();
  if (ts.startsWith("in ") || ts.includes("tomorrow")) return "Future";
  if (ts.includes("today") || (ts.includes("ago") && (ts.includes("min") || ts.includes("hr")))) return "Today";
  return "Past";
};

const getEventStyles = (type: string) => {
  const colorMap: Record<string, ColorStyle> = {
    rose: { bg: "bg-rose-500/5", border: "border-rose-500/20", text: "text-rose-600 dark:text-rose-400", glow: "bg-rose-400/20" },
    blue: { bg: "bg-blue-500/5", border: "border-blue-500/20", text: "text-blue-600 dark:text-blue-400", glow: "bg-blue-400/20" },
    amber: { bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-600 dark:text-amber-400", glow: "bg-amber-400/20" },
    emerald: { bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", glow: "bg-emerald-400/20" },
    purple: { bg: "bg-purple-500/5", border: "border-purple-500/20", text: "text-purple-600 dark:text-purple-400", glow: "bg-purple-400/20" },
    indigo: { bg: "bg-indigo-500/5", border: "border-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400", glow: "bg-indigo-400/20" }
  };

  const typeToColor: Record<string, string> = {
    "Birthday": "emerald", "Inforce": "emerald", "Policy Being Processed": "amber",
    "Health Claim": "rose", "Lapse": "rose", "Surrender": "rose",
    "Freelook": "blue", "Reinstate": "indigo"
  };

  const color = typeToColor[type] || "indigo";
  const style = colorMap[color] || colorMap.indigo;

  let IconComponent = HeartPulse;
  switch (type) {
    case "Birthday": IconComponent = Baby; break;
    case "Policy Being Processed": IconComponent = Clock; break;
    case "Lapse": IconComponent = CircleAlert; break;
    case "Inforce": IconComponent = ShieldCheck; break;
    case "Surrender": IconComponent = CircleMinus; break;
    case "Freelook": IconComponent = Eye; break;
    case "Reinstate": IconComponent = RefreshCw; break;
    case "Health Claim": IconComponent = Activity; break;
  }

  return { ...style, icon: <IconComponent size={16} className={style.text} /> };
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "High": return "text-rose-600 dark:text-rose-300 bg-rose-500/10 border-rose-500/20";
    case "Medium": return "text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/20";
    default: return "text-[var(--app-text-muted)] bg-[var(--sidebar-item-bg)] border-[var(--sidebar-item-border)]";
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventsTimeline({ setActive, setSelectedLead, setInitialMessage }: EventsProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const events = db.getEvents();

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.eventType.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === t("Birthday Greetings")) return BIRTHDAY_TYPES.includes(event.eventType);
      if (activeFilter === t("Policy Milestones")) return POLICY_STATUS_TYPES.includes(event.eventType);
      if (activeFilter === t("Claims & Requests")) return CLAIM_WAIVER_TYPES.includes(event.eventType);
      return true;
    });
  }, [events, searchQuery, activeFilter, t]);

  const categories = [
    { id: "Future", label: t("Upcoming Milestones"), icon: <TrendingUp size={14} className="text-indigo-500 dark:text-indigo-400" />, bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { id: "Today", label: t("Happening Today"), icon: <Activity size={14} className="text-emerald-500 dark:text-emerald-400" />, bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { id: "Past", label: t("Previous Events"), icon: <Clock size={14} className="text-[var(--app-text-muted)]" />, bg: "var(--sidebar-item-bg)", border: "var(--sidebar-item-border)" }
  ];

  const birthdayCount = events.filter(e => BIRTHDAY_TYPES.includes(e.eventType)).length;
  const policyStatusCount = events.filter(e => POLICY_STATUS_TYPES.includes(e.eventType)).length;
  const claimWaiverCount = events.filter(e => CLAIM_WAIVER_TYPES.includes(e.eventType)).length;

  return (
    <div className="animate-fade-in px-6 md:px-10 py-8 max-w-[1400px] w-full mx-auto min-h-screen">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
              <HeartPulse size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--app-header)] tracking-tight m-0">{t("Recent Life Events")}</h1>
          </div>
          <p className="text-sm md:text-base text-[var(--app-text-muted)] max-w-xl font-medium">{t("AI-detected milestones and behavior triggers.")}</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" placeholder={t("Search events or customers...")}
              className="w-full bg-[var(--sidebar-item-bg)] backdrop-blur-md border border-[var(--sidebar-item-border)] rounded-[20px] py-3 pl-12 pr-4 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setSearchQuery(""); setActiveFilter(null); }}
            className={`glass-panel p-3 rounded-[18px] transition-colors border backdrop-blur-lg shrink-0 ${activeFilter || searchQuery ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' : 'text-[var(--app-text-muted)] border-[var(--sidebar-item-border)] hover:bg-black/5 dark:hover:bg-white/[0.08]'}`}
          >
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10 items-start">
        <div className="space-y-12">
          {categories.map((cat) => {
            const categoryEvents = filteredEvents
              .filter(e => getEventCategory(e.timestamp) === cat.id)
              .sort((a, b) => {
                const wA = getTimestampWeight(a.timestamp);
                const wB = getTimestampWeight(b.timestamp);
                if (cat.id === "Future") return wA - wB;
                return wB - wA;
              });

            if (categoryEvents.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-6">
                <div className="flex items-center gap-3 px-1 mb-8">
                  <div className={`flex items-center gap-2 ${cat.id === "Past" ? "bg-[var(--sidebar-item-bg)] border-[var(--sidebar-item-border)]" : `${cat.bg} border ${cat.border}`} px-3 py-1.5 rounded-xl`}>
                    {cat.icon}
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--app-text-muted)]">{cat.label}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[var(--sidebar-item-border)] to-transparent" />
                </div>

                <div className="space-y-2">
                  {categoryEvents.map((event, idx) => {
                    const styles = getEventStyles(event.eventType);
                    const isLast = idx === categoryEvents.length - 1;

                    return (
                      <div key={event.id} className="group relative flex gap-6">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 z-10 backdrop-blur-xl ${styles.bg} ${styles.border}`}>
                            {styles.icon}
                          </div>
                          {!isLast && <div className="w-px h-full bg-gradient-to-b from-[var(--sidebar-item-border)] to-transparent my-1" />}
                        </div>

                        <div className="flex-1 pb-2">
                          <div className="glass-panel card-hover rounded-[24px] p-4 md:p-5 border border-[var(--sidebar-item-border)] backdrop-blur-xl transition-all duration-500 relative overflow-hidden group/card">
                            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[50px] opacity-0 group-hover/card:opacity-20 transition-opacity duration-700 pointer-events-none ${styles.glow}`} />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-bold text-[var(--app-header)] tracking-tight">{event.customerName}</h3>
                                  <span className={`px-2 py-0.5 rounded-[8px] text-[9px] font-bold uppercase tracking-wider border ${getPriorityStyles(event.priority)}`}>{t(event.priority)}</span>
                                </div>
                                <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${styles.text}`}>{t(event.eventType)}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-4 text-[var(--app-text-muted)] text-[10px] font-bold uppercase tracking-tighter">
                                  <span className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full border border-[var(--sidebar-item-border)]"><Clock size={10} />{t(event.timestamp)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => { const lead = db.getLeadByName(event.customerName); if (lead) { setSelectedLead(lead); setActive("customers"); } }} className="h-9 w-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center active:scale-[0.95]"><ArrowUpRight size={16} /></button>
                                  <button onClick={() => { const lead = db.getLeadByName(event.customerName); if (lead) { setSelectedLead(lead); setInitialMessage(`Get Latest Info for ${lead.name}, what is the best product i can offer to him/her?`); setActive("chat"); } }} className="h-9 w-9 bg-[var(--sidebar-item-bg)] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--app-text)] rounded-xl transition-all border border-[var(--sidebar-item-border)] flex items-center justify-center active:scale-[0.95]"><MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" /></button>
                                  <button className="h-9 w-9 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--app-text-muted)] flex items-center justify-center"><MoreVertical size={16} /></button>
                                </div>
                              </div>
                            </div>
                            <p className="text-[var(--app-text-muted)] text-xs md:text-sm leading-relaxed max-w-4xl mt-3 font-medium line-clamp-2 group-hover/card:line-clamp-none transition-all">{t(event.description)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="glass-panel rounded-[32px] p-6 border border-[var(--sidebar-item-border)] backdrop-blur-xl">
            <h3 className="text-sm font-bold text-[var(--app-header)] mb-6 uppercase tracking-widest px-2">{t("Insights Summary")}</h3>
            <div className="space-y-4">
              {[
                { label: t("Birthday Greetings"), value: birthdayCount.toString().padStart(2, "0"), color: "emerald" },
                { label: t("Policy Milestones"), value: policyStatusCount.toString().padStart(2, "0"), color: "amber" },
                { label: t("Claims & Requests"), value: claimWaiverCount.toString().padStart(2, "0"), color: "rose" },
              ].map((item, i) => {
                const isActive = activeFilter === item.label;
                const styles = INSIGHT_STYLES[item.color];
                return (
                  <button key={i} onClick={() => setActiveFilter(isActive ? null : item.label)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border duration-300 group ${isActive ? `${styles.activeBg}` : 'bg-[var(--sidebar-item-bg)] border-[var(--sidebar-item-border)] hover:bg-black/5 dark:hover:bg-white/[0.05] hover:border-black/10 dark:hover:border-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full transition-transform duration-300 ${isActive ? 'scale-125' : 'scale-100'} ${styles.dot}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? styles.textActive : 'text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]'}`}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold transition-colors ${styles.textValue}`}>{item.value}</span>
                      {isActive && <CheckCircle2 size={16} className={`${styles.textValue} animate-in zoom-in-50 duration-300`} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="glass-panel rounded-[32px] p-6 border border-indigo-500/20 backdrop-blur-xl bg-indigo-500/[0.03]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-500/20"><TrendingUp size={20} /></div>
            <h4 className="text-sm font-bold text-[var(--app-header)] mb-2 uppercase tracking-wider leading-tight">{t("Conversion Tip")}</h4>
            <p className="text-[13px] text-[var(--app-text-muted)] leading-relaxed font-medium">{t("Customers undergoing a")} <span className="text-indigo-600 dark:text-indigo-300">{t("Life Event")}</span> {t("are 4.5x more likely to increase their coverage within the first 72 hours.")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
