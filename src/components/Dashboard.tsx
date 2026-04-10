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
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Page = "dashboard" | "chat" | "customers" | "analytics";
type ViewState = "overview" | "leads" | "events";

export interface Lead {
  id: number;
  name: string;
  age: number;
  score: number;
  scoreLabel: string;
  event: string;
  product: string;
  premium: string;
  avatar: string;
  phone: string;
  policies: number;
}

interface Props {
  setActive: (page: Page) => void;
  setSelectedLead: (lead: Lead) => void;
}

const STATS = [
  {
    id: 1,
    label: "AI-Generated Leads",
    value: "142",
    delta: "+12%",
    icon: <Users size={20} className="text-indigo-300" />,
  },
  {
    id: 2,
    label: "Projected Premium",
    value: "Rp 850M",
    delta: "+8.4%",
    icon: <TrendingUp size={20} className="text-indigo-300" />,
  },
  {
    id: 3,
    label: "Life Events Detected",
    value: "28",
    delta: "+5%",
    icon: <HeartPulse size={20} className="text-indigo-300" />,
  },
  {
    id: 4,
    label: "Conversion Rate (AI)",
    value: "24.5%",
    delta: "+2.1%",
    icon: <PieChart size={20} className="text-indigo-300" />,
  },
];

const EVENT_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "New Baby": {
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    border: "border-amber-400",
  },
  "Home Purchase": {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500",
  },
  Promotion: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500",
  },
  Marriage: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500",
  },
  "Health Flag": {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500",
  },
};

const PRIORITY_ACTIONS: Lead[] = [
  {
    id: 1,
    name: "Budi Santoso",
    age: 34,
    score: 92,
    scoreLabel: "High",
    event: "Marriage",
    product: "Life Protection Plus",
    premium: "Rp 2.4M/mo",
    avatar: "BS",
    phone: "+62 812-3456-7890",
    policies: 1,
  },
  {
    id: 2,
    name: "Sari Dewi",
    age: 28,
    score: 88,
    scoreLabel: "High",
    event: "New Baby",
    product: "Family Shield",
    premium: "Rp 1.8M/mo",
    avatar: "SD",
    phone: "+62 857-2345-6789",
    policies: 0,
  },
  {
    id: 3,
    name: "Anton Wijaya",
    age: 52,
    score: 76,
    scoreLabel: "Med",
    event: "Promotion",
    product: "Wealth Protector",
    premium: "Rp 3.1M/mo",
    avatar: "AW",
    phone: "+62 815-6789-0123",
    policies: 3,
  },
  {
    id: 4,
    name: "Mira Lestari",
    age: 31,
    score: 64,
    scoreLabel: "Med",
    event: "Home Purchase",
    product: "Mortgage Guard",
    premium: "Rp 900K/mo",
    avatar: "ML",
    phone: "+62 821-4567-8901",
    policies: 1,
  },
  {
    id: 5,
    name: "Rina Kusuma",
    age: 39,
    score: 45,
    scoreLabel: "Low",
    event: "Health Flag",
    product: "Executive Term",
    premium: "Rp 1.5M/mo",
    avatar: "RK",
    phone: "+62 896-7890-1234",
    policies: 1,
  },
];

const RECENT_EVENTS = [
  {
    id: 1,
    name: "Rina Kusuma",
    event: "Health Flag",
    time: "2 hrs ago",
    type: "Health Flag",
    detail: "Missed scheduled checkup 2 weeks running. High risk flag.",
  },
  {
    id: 2,
    name: "Reza Pratama",
    event: "Home Purchase",
    time: "1 day ago",
    type: "Home Purchase",
    detail: "Mortgage inquiry detected via banking partner API.",
  },
  {
    id: 3,
    name: "Sari Dewi",
    event: "New Baby",
    time: "2 days ago",
    type: "New Baby",
    detail: "Added dependent to company health portal.",
  },
];

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
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="2.5"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="transparent"
          stroke={getScoreColor(score)}
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-[13px] font-bold text-slate-50">
        {score}
      </span>
    </div>
  );
};

export default function Dashboard({ setActive, setSelectedLead }: Props) {
  const [currentView, setCurrentView] = useState<ViewState>("overview");
  const [sortCol, setSortCol] = useState<
    "name" | "event" | "product" | "score" | null
  >(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (col: "name" | "event" | "product" | "score") => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const sortedActions = useMemo(() => {
    return [...PRIORITY_ACTIONS].sort((a, b) => {
      if (!sortCol) return 0;
      if (a[sortCol] < b[sortCol]) return sortDir === "asc" ? -1 : 1;
      if (a[sortCol] > b[sortCol]) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortCol, sortDir]);

  const renderSortIcon = (col: string) => {
    if (sortCol !== col)
      return <span className="opacity-30 inline-block w-3.5">↕</span>;
    return sortDir === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  const renderLeadCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 animate-fade-in">
      {PRIORITY_ACTIONS.map((lead) => (
        <div
          key={lead.id}
          className="glass-panel card-hover rounded-3xl p-6 flex flex-col"
        >
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 font-semibold text-sm">
                {lead.avatar}
              </div>
              <div>
                <div
                  onClick={() => {
                    setSelectedLead(lead);
                    setActive("customers");
                  }}
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
              <span className="text-xs text-slate-200 font-medium">
                {lead.product}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Est. Premium</span>
              <span className="text-[13px] text-indigo-300 font-semibold">
                {lead.premium}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedLead(lead);
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
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          {currentView === "overview" ? (
            <>
              <h1 className="text-2xl font-semibold text-slate-50 m-0">
                Welcome back, Agent ✨
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Here&apos;s your AI-curated summary for today.
              </p>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView("overview")}
                className="glass-panel btn-hover w-10 h-10 rounded-full flex items-center justify-center text-slate-200"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-slate-50 m-0">
                  {currentView === "leads"
                    ? "Leads Recommendation"
                    : "Recent Life Events"}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {currentView === "leads"
                    ? "Full list of AI-curated opportunities."
                    : "All tracked milestones requiring your attention."}
                </p>
              </div>
            </div>
          )}
        </div>

        {currentView === "overview" && (
          <div className="flex gap-4">
            <button className="glass-panel btn-hover w-10 h-10 rounded-full flex items-center justify-center text-slate-200">
              <Search size={18} />
            </button>
            <button className="glass-panel btn-hover w-10 h-10 rounded-full flex items-center justify-center text-slate-200 relative">
              <Bell size={18} />
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        )}
      </header>

      {/* OVERVIEW RENDER */}
      {currentView === "overview" && (
        <>
          <div className="grid grid-cols-4 gap-5 mb-8">
            {STATS.map((stat) => (
              <div
                key={stat.id}
                className="glass-panel card-hover rounded-[20px] p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div className="bg-green-500/15 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                    {stat.delta}
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-50 mb-1">
                  {stat.value}
                </div>
                <div className="text-[13px] text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[2.5fr_1fr] gap-6 mb-8">
            {/* Table Area */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-slate-50 m-0">
                  Priority Actions
                </h3>
                <button
                  onClick={() => setCurrentView("leads")}
                  className="btn-hover text-indigo-300 text-[13px] font-medium tracking-wide"
                >
                  View All
                </button>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["name", "event", "product", "score"].map((col) => (
                        <th
                          key={col}
                          onClick={() => toggleSort(col as "name" | "event" | "product" | "score")}
                          className="text-left p-2.5 text-[11px] font-semibold tracking-wide cursor-pointer hover:text-slate-50 transition-colors select-none"
                        >
                          <div
                            className={`inline-flex items-center gap-1 whitespace-nowrap ${sortCol === col ? "text-indigo-300" : "text-slate-500"}`}
                          >
                            {col === "name"
                              ? "CUSTOMER"
                              : col === "event"
                                ? "LIFE EVENT"
                                : col === "product"
                                  ? "RECOMMENDATION"
                                  : "MATCH SCORE"}{" "}
                            {renderSortIcon(col)}
                          </div>
                        </th>
                      ))}
                      <th className="text-left p-2.5 text-[11px] font-semibold text-slate-500 tracking-wide">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedActions.slice(0, 4).map((action) => (
                      <tr
                        key={action.id}
                        className="row-hover border-b border-white/[0.03]"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-semibold shrink-0">
                              {action.avatar}
                            </div>
                            <span
                              onClick={() => {
                                setSelectedLead(action);
                                setActive("customers");
                              }}
                              className="btn-hover text-[13px] font-medium text-slate-200 cursor-pointer whitespace-nowrap"
                            >
                              {action.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${EVENT_COLORS[action.event]?.bg || "bg-white/10"} ${EVENT_COLORS[action.event]?.text || "text-white"}`}
                          >
                            {action.event}
                          </span>
                        </td>
                        <td className="p-3 text-[13px] text-slate-200">
                          {action.product}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-[120px] h-1.5 bg-white/5 rounded-full overflow-hidden shrink-0">
                              <div
                                style={{
                                  width: `${action.score}%`,
                                  backgroundColor: getScoreColor(action.score),
                                }}
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-50 w-6">
                              {action.score}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedLead(action);
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

            {/* Side Column */}
            <div className="flex flex-col gap-5">
              <div className="glass-panel rounded-3xl p-6 flex-1">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-base font-semibold text-slate-50 m-0">
                    Recent Life Events
                  </h3>
                  <button
                    onClick={() => setCurrentView("events")}
                    className="btn-hover text-indigo-300 text-[13px] font-medium tracking-wide"
                  >
                    View All
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {RECENT_EVENTS.map((event) => (
                    <div
                      key={event.id}
                      className={`flex gap-3 pl-3 border-l-2 ${EVENT_COLORS[event.type]?.border || "border-white"}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm shrink-0">
                        👤
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-50">
                          {event.name}
                        </div>
                        <div
                          className={`text-[13px] mt-0.5 ${EVENT_COLORS[event.type]?.text || "text-white"}`}
                        >
                          {event.event}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {event.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-5 bg-indigo-500/5">
                <div className="flex gap-3 items-start">
                  <div className="text-indigo-300 mt-0.5">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-50 mb-1.5 m-0">
                      AI Tip for Today
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed m-0">
                      Customers experiencing a &quot;New Baby&quot; life event have a 45%
                      higher conversion rate when approached within 72 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-50 mb-5 m-0">
            Recommended Leads
          </h3>
          {renderLeadCards()}
        </>
      )}

      {currentView === "leads" && renderLeadCards()}

      {currentView === "events" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {RECENT_EVENTS.map((event) => (
            <div
              key={event.id}
              className={`glass-panel card-hover flex gap-5 p-6 rounded-3xl border-l-4 ${EVENT_COLORS[event.type]?.border || "border-white"}`}
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-lg shrink-0">
                {event.type === "Health Flag"
                  ? "⚠️"
                  : event.type === "New Baby"
                    ? "🍼"
                    : event.type === "Promotion"
                      ? "💼"
                      : "🏠"}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50 m-0">
                      {event.name}
                    </h3>
                    <span
                      className={`inline-block mt-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${EVENT_COLORS[event.type]?.bg || "bg-white/10"} ${EVENT_COLORS[event.type]?.text || "text-white"}`}
                    >
                      {event.event}
                    </span>
                  </div>
                  <span className="text-[13px] text-slate-500 font-medium">
                    {event.time}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  {event.detail}
                </p>
                <div className="mt-4">
                  <button className="btn-hover px-5 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 text-[13px] font-medium">
                    Take Action
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
