"use client";

import React, { useState, useMemo } from "react";
import {
  Baby,
  TrendingUp,
  Activity,
  MoreVertical,
  HeartPulse,
  Search,
  Clock,
  ArrowUpRight,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Sparkles,
  RefreshCw,
  ArrowUpCircle,
  AlertOctagon,
  FileText,
  HeartCrack,
  UserX,
  CircleMinus,
  FileEdit
} from "lucide-react";
import { db, LifeEvent, Lead, Page } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

const RETENTION_TYPES = ["Surrender Intent", "Lapse Warning", "Fund Withdrawal", "Surrender", "Lapse"];
const CLAIM_TYPES = ["Health Claim", "Death Claim", "Critical Illness Claim", "Freelook"];
const GROWTH_TYPES = ["Top-Up Request", "Top-Up Reinstate", "Endorsement", "Fund Switching", "Reinstate", "Birthday"];

// Helper to weigh timestamps for sorting (Future -> Present -> Past)
const getTimestampWeight = (ts: string): number => {
  const lower = ts.toLowerCase();

  // FUTURE — show first
  if (lower.includes("tomorrow")) return 200;
  const inDaysMatch = lower.match(/in\s+(\d+)\s+day/);
  if (inDaysMatch) return 200 - parseInt(inDaysMatch[1]);

  // TODAY — recent activity
  const minsMatch = lower.match(/(\d+)\s+min.*ago/);
  if (minsMatch) return 100 - parseInt(minsMatch[1]);
  const hrsMatch = lower.match(/(\d+)\s+hr.*ago/);
  if (hrsMatch) return 80 - parseInt(hrsMatch[1]);
  if (lower === "today" || lower === "just now") return 75;

  // PAST — show last
  const daysAgoMatch = lower.match(/(\d+)\s+day.*ago/);
  if (daysAgoMatch) return -parseInt(daysAgoMatch[1]);
  const weeksAgoMatch = lower.match(/(\d+)\s+week.*ago/);
  if (weeksAgoMatch) return -parseInt(weeksAgoMatch[1]) * 7;

  return 0;
};

const getEventTimeCategory = (timestamp: string) => {
  const lower = timestamp.toLowerCase();
  if (lower.includes("today") || lower.includes("just now") || lower.includes("min") || lower.includes("hr")) return "Happening Today";
  if (lower.includes("tomorrow") || lower.includes("in ")) return "Upcoming Milestones";
  return "Previous Milestones";
};

interface Props {
  setActive: (page: Page) => void;
  setSelectedLead: (lead: Lead | null) => void;
  setInitialMessage: (message: string | null) => void;
}

export default function Events({ setActive, setSelectedLead, setInitialMessage }: Props) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(t("All Events"));
  
  // NLP State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [events, setEvents] = useState<LifeEvent[]>(db.getEvents());

  const handleAnalyze = async () => {
    if (!noteText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/events/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText })
      });
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        data.events.forEach((e: Omit<LifeEvent, "id">) => db.addEvent(e));
        setEvents(db.getEvents());
        setNoteText("");
      }
    } catch (e) {
      console.error("NLP Analysis Error:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getEventStyles = (type: string) => {
    let IconComponent = HeartPulse;
    let colorClass = "indigo";

    // Enhanced mappings for policy and data events
    switch (type) {
      case "Birthday":
        IconComponent = Baby;
        colorClass = "emerald";
        break;
      case "Top-Up Request":
      case "Top-Up":
        IconComponent = ArrowUpCircle;
        colorClass = "emerald";
        break;
      case "Top-Up Reinstate":
      case "Reinstate":
        IconComponent = RefreshCw;
        colorClass = "emerald";
        break;
      case "Surrender Intent":
      case "Surrender":
        IconComponent = UserX;
        colorClass = "rose";
        break;
      case "Lapse Warning":
      case "Lapse":
        IconComponent = AlertOctagon;
        colorClass = "rose";
        break;
      case "Fund Withdrawal":
        IconComponent = CircleMinus;
        colorClass = "rose";
        break;
      case "Endorsement":
      case "Fund Switching":
        IconComponent = FileEdit;
        colorClass = "indigo";
        break;
      case "Health Claim":
      case "Critical Illness Claim":
        IconComponent = HeartCrack;
        colorClass = "rose";
        break;
      case "Death Claim":
        IconComponent = FileText;
        colorClass = "rose";
        break;
      case "Inforce":
        IconComponent = ShieldCheck;
        colorClass = "blue";
        break;
      case "Policy Being Processed":
        IconComponent = Clock;
        colorClass = "amber";
        break;
      case "Freelook":
        IconComponent = FileEdit;
        colorClass = "blue";
        break;
      default:
        IconComponent = HeartPulse;
        colorClass = "indigo";
    }

    return { IconComponent, colorClass };
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType.toLowerCase().includes(searchTerm.toLowerCase());

      if (activeFilter === t("All Events")) return matchesSearch;
      if (activeFilter === t("Retention & Risks")) return matchesSearch && RETENTION_TYPES.includes(event.eventType);
      if (activeFilter === t("Claims & Servicing")) return matchesSearch && CLAIM_TYPES.includes(event.eventType);
      if (activeFilter === t("Growth & Milestones")) return matchesSearch && GROWTH_TYPES.includes(event.eventType);
      if (activeFilter === t("High Priority")) return matchesSearch && event.priority === "High";

      return matchesSearch;
    });
  }, [events, searchTerm, activeFilter, t]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, LifeEvent[]> = {
      "Upcoming Milestones": [],
      "Happening Today": [],
      "Previous Milestones": [],
    };

    filteredEvents.forEach((event) => {
      const cat = getEventTimeCategory(event.timestamp);
      groups[cat].push(event);
    });

    // Sort within each group: High priority first, then by timestamp weight
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        const aWeight = priorityWeight[a.priority] || 0;
        const bWeight = priorityWeight[b.priority] || 0;
        
        if (aWeight !== bWeight) return bWeight - aWeight;
        return getTimestampWeight(b.timestamp) - getTimestampWeight(a.timestamp);
      });
    });

    return groups;
  }, [filteredEvents]);

  const insights = [
    { label: t("Retention & Risks"), value: events.filter(e => RETENTION_TYPES.includes(e.eventType)).length.toString().padStart(2, "0"), color: "rose" },
    { label: t("Claims & Servicing"), value: events.filter(e => CLAIM_TYPES.includes(e.eventType)).length.toString().padStart(2, "0"), color: "amber" },
    { label: t("Growth & Milestones"), value: events.filter(e => GROWTH_TYPES.includes(e.eventType)).length.toString().padStart(2, "0"), color: "emerald" },
  ];

  const handleChat = (event: LifeEvent) => {
    const lead = db.getLeadByName(event.customerName);
    
    let prompt = `Analyze life event for ${event.customerName}: ${event.eventType}. What is the best product recommendation?`;
    
    if (RETENTION_TYPES.includes(event.eventType)) {
      prompt = `Draft a retention script for ${event.customerName} who has a ${event.eventType}. Highlight potential losses if they proceed (surrender values vs premium holiday) and suggest empathetic alternatives.`;
    } else if (GROWTH_TYPES.includes(event.eventType)) {
      prompt = `Analyze this ${event.eventType} for ${event.customerName}. Suggest the best fund allocation or product upsell based on their profile, and draft a persuasive WhatsApp message for the agent to send.`;
    } else if (CLAIM_TYPES.includes(event.eventType)) {
      prompt = `Draft an empathetic service message for ${event.customerName} regarding their ${event.eventType}. Outline the next steps for processing and how I as an agent can help.`;
    } else if (lead) {
      prompt = `Get Latest Info for ${lead.name}, based on their ${event.eventType} event, what is the best product i can offer to him/her?`;
    }

    if (lead) setSelectedLead(lead);
    setInitialMessage(prompt);
    setActive("chat");
  };

  return (
    <div className="p-8 pb-32 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[var(--app-header)] mb-2 tracking-tight">
            {t("Customer Life Events")}
          </h1>
          <p className="text-[var(--app-text-muted)] max-w-2xl">
            {t("AI-powered intent detection from policy triggers and unstructured customer notes.")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--app-text-muted)] group-focus-within:text-indigo-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t("Search name or event...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-[var(--sidebar-item-bg)] border border-[var(--sidebar-item-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all w-64 text-[var(--app-text)]"
            />
          </div>
        </div>
      </div>

      {/* AI Note Analyzer */}
      <div className="mb-6 p-4 glass-panel rounded-[24px] border border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Sparkles size={18} />
              </div>
              <h3 className="font-bold text-[var(--app-header)] text-sm tracking-wide uppercase">{t("AI Event Extractor")}</h3>
            </div>
            <div className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              {t("Powered by Gemini")}
            </div>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t("Paste customer chat, email, or meeting notes here to automatically extract events (e.g., 'Customer wants to top up his Maxi Pro policy')...")}
            className="w-full h-16 bg-[var(--sidebar-item-bg)] border border-[var(--sidebar-item-border)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] transition-all"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !noteText.trim()}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isAnalyzing ? <RefreshCw size={16} className="animate-spin" /> : <TrendingUp size={16} />}
              {isAnalyzing ? t("Analyzing...") : t("Extract Events")}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Insights Summary */}
        <div className="space-y-6 sticky top-6 h-fit">
          <div className="glass-panel p-6 rounded-[24px] border border-[var(--sidebar-item-border)] shadow-sm">
            <h3 className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-widest mb-6">
              {t("Insights Summary")}
            </h3>
            <div className="space-y-4">
              {insights.map((insight) => (
                <button
                  key={insight.label}
                  onClick={() => setActiveFilter(activeFilter === insight.label ? t("All Events") : insight.label)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                    activeFilter === insight.label
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-[var(--app-text-muted)] hover:bg-[var(--sidebar-item-bg)]"
                  }`}
                >
                  <span className="text-sm font-medium">{insight.label}</span>
                  <span className={`text-lg font-bold text-${insight.color}-500`}>
                    {insight.value}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-[var(--sidebar-item-border)]">
              <button
                onClick={() => setActiveFilter(activeFilter === t("High Priority") ? t("All Events") : t("High Priority"))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeFilter === t("High Priority")
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                    : "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                }`}
              >
                <Activity size={16} />
                {t("Review High Urgency")}
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-[24px] border border-[var(--sidebar-item-border)] bg-indigo-600 text-white overflow-hidden relative shadow-xl">
            <div className="absolute -right-6 -top-6 p-12 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <h4 className="text-sm font-bold mb-2 relative z-10">{t("Pro Tip")}</h4>
            <p className="text-xs text-indigo-100 leading-relaxed mb-4 relative z-10">
              {t("Policy modification requests often hide secondary needs. Always ask about their long-term goals.")}
            </p>
            <button className="text-xs font-bold flex items-center gap-1.5 hover:gap-2 transition-all relative z-10">
              {t("Learn more")} <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Right column: Event Timeline */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--app-header)]">
              {activeFilter}
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-500 rounded-full">
                {Object.values(groupedEvents).flat().length}
              </span>
            </h3>
          </div>

          {Object.values(groupedEvents).flat().length > 0 ? (
            <div className="space-y-10">
              {["Upcoming Milestones", "Happening Today", "Previous Milestones"].map((groupName) => {
                const groupEvents = groupedEvents[groupName];
                if (groupEvents.length === 0) return null;

                let CategoryIcon = Calendar;
                let iconColor = "text-indigo-500";
                if (groupName === "Happening Today") {
                  CategoryIcon = Activity;
                  iconColor = "text-emerald-500";
                } else if (groupName === "Previous Milestones") {
                  CategoryIcon = Clock;
                  iconColor = "text-[var(--app-text-muted)]";
                }

                return (
                  <div key={groupName} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-2 mb-6">
                      <CategoryIcon size={16} className={iconColor} />
                      <h4 className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-[0.2em] ml-1">{t(groupName)}</h4>
                      <div className="flex-1 h-px bg-gradient-to-r from-[var(--sidebar-item-border)] to-transparent ml-2" />
                    </div>
                    <div className="space-y-4">
                      {groupEvents.map((event) => {
                        const { IconComponent, colorClass } = getEventStyles(event.eventType);
                        return (
                          <div
                            key={event.id}
                            className="group glass-panel p-5 rounded-[24px] border border-[var(--sidebar-item-border)] hover:border-indigo-500/30 transition-all hover:shadow-lg bg-white dark:bg-white/5"
                          >
                            <div className="flex items-start gap-5">
                              <div className={`mt-1 p-3.5 rounded-2xl bg-${colorClass}-500/10 text-${colorClass}-500 transition-transform group-hover:scale-110 duration-300`}>
                                <IconComponent size={24} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                  <h4 className="text-base font-bold text-[var(--app-header)] truncate">
                                    {event.customerName}
                                  </h4>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-[var(--app-text-muted)] flex items-center gap-1">
                                      <Clock size={12} />
                                      {event.timestamp}
                                    </span>
                                    <button className="p-1 text-[var(--app-text-muted)] hover:text-indigo-500 transition-colors">
                                      <MoreVertical size={16} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-${colorClass}-500/10 text-${colorClass}-600 dark:text-${colorClass}-400 border border-${colorClass}-500/20`}>
                                    {event.eventType}
                                  </span>
                                  {event.priority === "High" && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500 text-white">
                                      {t("URGENT")}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-[var(--app-text-muted)] leading-relaxed mb-5 group-hover:text-[var(--app-text)] transition-colors">
                                  {event.description}
                                </p>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleChat(event)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white text-xs font-bold rounded-xl transition-all border border-indigo-500/20"
                                  >
                                    <MessageSquare size={14} />
                                    {t("Chat AI Assistant")}
                                  </button>
                                  <button className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-[var(--sidebar-item-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-xs font-bold rounded-xl transition-all border border-[var(--sidebar-item-border)]">
                                    <Calendar size={14} />
                                    {t("Book Meeting")}
                                  </button>
                                </div>
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
          ) : (
            <div className="text-center py-20 glass-panel rounded-[32px] border border-dashed border-[var(--sidebar-item-border)]">
              <div className="w-16 h-16 bg-[var(--sidebar-item-bg)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--app-text-muted)]">
                <Search size={24} />
              </div>
              <h4 className="font-bold text-[var(--app-header)] mb-1">{t("No events found")}</h4>
              <p className="text-sm text-[var(--app-text-muted)]">{t("Try adjusting your search or filters.")}</p>
            </div>
          )}

          {/* Marketing/Stats footer */}
          <div className="mt-8 p-6 glass-panel rounded-[24px] bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-lg">
                <TrendingUp size={24} />
              </div>
              <p className="text-sm text-[var(--app-text)] font-medium leading-relaxed">
                {t("Customers with a")} <span className="text-indigo-600 dark:text-indigo-300 font-bold">{t("Life Event")}</span> {t("are 4.5x more likely to increase their coverage within the first 72 hours.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
