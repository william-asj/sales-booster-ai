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
  ChevronUp
} from "lucide-react";

// --- Types & Data Models ---
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
  { id: 1, label: "AI-Generated Leads", value: "142", delta: "+12%", icon: <Users size={20} color="#a5b4fc" /> },
  { id: 2, label: "Projected Premium", value: "Rp 850M", delta: "+8.4%", icon: <TrendingUp size={20} color="#a5b4fc" /> },
  { id: 3, label: "Life Events Detected", value: "28", delta: "+5%", icon: <HeartPulse size={20} color="#a5b4fc" /> },
  { id: 4, label: "Conversion Rate (AI)", value: "24.5%", delta: "+2.1%", icon: <PieChart size={20} color="#a5b4fc" /> },
];

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "New Baby": { bg: "rgba(251,191,36,0.1)", text: "#fbbf24", border: "#fbbf24" },
  "Home Purchase": { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "#3b82f6" },
  "Promotion": { bg: "rgba(168,85,247,0.1)", text: "#c084fc", border: "#a855f7" },
  "Marriage": { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "#22c55e" },
  "Health Flag": { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "#ef4444" },
};

const PRIORITY_ACTIONS: Lead[] = [
  { id: 1, name: "Budi Santoso", age: 34, score: 92, scoreLabel: "High", event: "Marriage", product: "Life Protection Plus", premium: "Rp 2.4M/mo", avatar: "BS", phone: "+62 812-3456-7890", policies: 1 },
  { id: 2, name: "Sari Dewi", age: 28, score: 88, scoreLabel: "High", event: "New Baby", product: "Family Shield", premium: "Rp 1.8M/mo", avatar: "SD", phone: "+62 857-2345-6789", policies: 0 },
  { id: 3, name: "Anton Wijaya", age: 52, score: 76, scoreLabel: "Med", event: "Promotion", product: "Wealth Protector", premium: "Rp 3.1M/mo", avatar: "AW", phone: "+62 815-6789-0123", policies: 3 },
  { id: 4, name: "Mira Lestari", age: 31, score: 64, scoreLabel: "Med", event: "Home Purchase", product: "Mortgage Guard", premium: "Rp 900K/mo", avatar: "ML", phone: "+62 821-4567-8901", policies: 1 },
  { id: 5, name: "Rina Kusuma", age: 39, score: 45, scoreLabel: "Low", event: "Health Flag", product: "Executive Term", premium: "Rp 1.5M/mo", avatar: "RK", phone: "+62 896-7890-1234", policies: 1 },
];

const RECENT_EVENTS = [
  { id: 1, name: "Rina Kusuma", event: "Health Flag", time: "2 hrs ago", type: "Health Flag", detail: "Missed scheduled checkup 2 weeks running. High risk flag." },
  { id: 2, name: "Reza Pratama", event: "Home Purchase", time: "1 day ago", type: "Home Purchase", detail: "Mortgage inquiry detected via banking partner API." },
  { id: 3, name: "Sari Dewi", event: "New Baby", time: "2 days ago", type: "New Baby", detail: "Added dependent to company health portal." },
  { id: 4, name: "Anton Wijaya", event: "Promotion", time: "3 days ago", type: "Promotion", detail: "LinkedIn status updated to VP of Engineering." },
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
  const meterColor = getScoreColor(score);

  return (
    <div style={{ position: "relative", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="60" height="60" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="30" cy="30" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
        <circle
          cx="30" cy="30" r={radius} fill="transparent"
          stroke={meterColor} strokeWidth="2.5"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s ease" }}
        />
      </svg>
      <span style={{ position: "absolute", fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>{score}</span>
    </div>
  );
};

export default function Dashboard({ setActive, setSelectedLead }: Props) {
  const [currentView, setCurrentView] = useState<ViewState>("overview");
  const [sortCol, setSortCol] = useState<"name" | "event" | "product" | "score" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (col: "name" | "event" | "product" | "score") => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const sortedActions = useMemo(() => {
    return [...PRIORITY_ACTIONS].sort((a, b) => {
      if (!sortCol) return 0;
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortCol, sortDir]);

  const renderSortIcon = (col: string) => {
    if (sortCol !== col) return <span style={{ opacity: 0.3, display: "inline-block", width: 14 }}>↕</span>;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const renderLeadCards = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, paddingBottom: 40 }} className="animate-fade-in">
      {PRIORITY_ACTIONS.map(lead => (
        <div key={`grid-${lead.id}`} className="glass-panel card-hover" style={{ borderRadius: 24, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>
                {lead.avatar}
              </div>
              <div>
                <div onClick={() => { setSelectedLead(lead); setActive("customers"); }} className="btn-hover" style={{ fontSize: 15, fontWeight: 600, color: "#f8fafc", cursor: "pointer" }}>
                  {lead.name}
                </div>
                <span style={{ display: "inline-block", marginTop: 4, background: EVENT_COLORS[lead.event]?.bg || "rgba(255,255,255,0.1)", color: EVENT_COLORS[lead.event]?.text || "#fff", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                  {lead.event}
                </span>
              </div>
            </div>
            <CircularGauge score={lead.score} />
          </div>

          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 16, marginBottom: 20, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Best Product</span>
              <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}>{lead.product}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Est. Premium</span>
              <span style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 600 }}>{lead.premium}</span>
            </div>
          </div>

          <button onClick={() => { setSelectedLead(lead); setActive("chat"); }} className="btn-hover" style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: 12, color: "#e2e8f0", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <MessageSquare size={16} /> AI Chat Assistant
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ padding: "32px 40px", maxWidth: 1400, color: "#e2e8f0", fontFamily: '"Segoe UI", sans-serif' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .glass-panel {
          background: rgba(13, 15, 26, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 24px 48px rgba(0,0,0,0.4);
        }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 24px 48px rgba(0,0,0,0.6), 0 0 20px rgba(99, 102, 241, 0.1);
        }
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover { opacity: 0.88; }
        .btn-hover:active { transform: scale(0.96); }
        .row-hover { transition: background 0.2s ease; }
        .row-hover:hover { background: rgba(255, 255, 255, 0.03); }
        
        /* Fixed Header Alignment without forcing nowrap on whole table */
        .sort-header { transition: color 0.2s ease; cursor: pointer; user-select: none; }
        .sort-header:hover { color: #f8fafc !important; }
        .header-content { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
      `}</style>

      {/* Top Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          {currentView === "overview" ? (
            <>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: "#f8fafc" }}>Welcome back, Agent ✨</h1>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#94a3b8" }}>Here's your AI-curated summary for today.</p>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => setCurrentView("overview")}
                className="glass-panel btn-hover"
                style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e2e8f0" }}>
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: "#f8fafc" }}>
                  {currentView === "leads" ? "Leads Recommendation" : "Recent Life Events"}
                </h1>
                <p style={{ margin: "4px 0 0", fontSize: 14, color: "#94a3b8" }}>
                  {currentView === "leads" ? "Full list of AI-curated opportunities." : "All tracked milestones requiring your attention."}
                </p>
              </div>
            </div>
          )}
        </div>

        {currentView === "overview" && (
          <div style={{ display: "flex", gap: 16 }}>
            <button className="glass-panel btn-hover" style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e2e8f0" }}>
              <Search size={18} />
            </button>
            <button className="glass-panel btn-hover" style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e2e8f0", position: "relative" }}>
              <Bell size={18} />
              <div style={{ position: "absolute", top: 10, right: 10, width: 6, height: 6, background: "#ef4444", borderRadius: "50%" }} />
            </button>
          </div>
        )}
      </header>

      {/* OVERVIEW RENDER */}
      {currentView === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
            {STATS.map(stat => (
              <div key={stat.id} className="glass-panel card-hover" style={{ borderRadius: 20, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {stat.icon}
                  </div>
                  <div style={{ background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", padding: "4px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {stat.delta}
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: 24, marginBottom: 32 }}>

            {/* Table Area - Removed minWidth, reduced internal padding and font sizes */}
            <div className="glass-panel" style={{ borderRadius: 24, padding: "20px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f8fafc" }}>Priority Actions</h3>
                <button onClick={() => setCurrentView("leads")} className="btn-hover" style={{ background: "transparent", border: "none", color: "#a5b4fc", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>View All</button>
              </div>
              <div style={{ flex: 1, overflowX: "auto" }}>
                {/* Reverted width to 100% to stop horizontal scroll */}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <th className="sort-header" onClick={() => toggleSort("name")} style={{ textAlign: "left", padding: "10px", fontSize: 11, color: sortCol === "name" ? "#a5b4fc" : "#475569", fontWeight: 600, letterSpacing: "0.5px" }}>
                        <div className="header-content">CUSTOMER {renderSortIcon("name")}</div>
                      </th>
                      <th className="sort-header" onClick={() => toggleSort("event")} style={{ textAlign: "left", padding: "10px", fontSize: 11, color: sortCol === "event" ? "#a5b4fc" : "#475569", fontWeight: 600, letterSpacing: "0.5px" }}>
                        <div className="header-content">LIFE EVENT {renderSortIcon("event")}</div>
                      </th>
                      <th className="sort-header" onClick={() => toggleSort("product")} style={{ textAlign: "left", padding: "10px", fontSize: 11, color: sortCol === "product" ? "#a5b4fc" : "#475569", fontWeight: 600, letterSpacing: "0.5px" }}>
                        <div className="header-content">RECOMMENDATION {renderSortIcon("product")}</div>
                      </th>
                      <th className="sort-header" onClick={() => toggleSort("score")} style={{ textAlign: "left", padding: "10px", fontSize: 11, color: sortCol === "score" ? "#a5b4fc" : "#475569", fontWeight: 600, letterSpacing: "0.5px" }}>
                        <div className="header-content">MATCH SCORE {renderSortIcon("score")}</div>
                      </th>
                      <th style={{ textAlign: "left", padding: "10px", fontSize: 11, color: "#475569", fontWeight: 600, letterSpacing: "0.5px" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedActions.slice(0, 4).map((action) => (
                      <tr key={action.id} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{action.avatar}</div>
                            <span onClick={() => { setSelectedLead(action); setActive("customers"); }} className="btn-hover" style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", cursor: "pointer", whiteSpace: "nowrap" }}>
                              {action.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ background: EVENT_COLORS[action.event]?.bg || "rgba(255,255,255,0.1)", color: EVENT_COLORS[action.event]?.text || "#fff", padding: "4px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                            {action.event}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: 13, color: "#e2e8f0" }}>
                          {action.product}
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {/* Thin and long meter: Height lowered to 5px, width explicitly locked at 120px */}
                            <div style={{ width: 120, height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                              <div style={{ width: `${action.score}%`, height: "100%", background: getScoreColor(action.score), borderRadius: 3, transition: "width 1s ease, background 0.3s ease" }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#f8fafc", width: 24 }}>{action.score}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <button onClick={() => { setSelectedLead(action); setActive("chat"); }} className="btn-hover" style={{ padding: "6px 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(99, 102, 241, 0.4)", color: "#a5b4fc", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="glass-panel" style={{ borderRadius: 24, padding: "24px", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f8fafc" }}>Recent Life Events</h3>
                  <button onClick={() => setCurrentView("events")} className="btn-hover" style={{ background: "transparent", border: "none", color: "#a5b4fc", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>See All</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {RECENT_EVENTS.slice(0, 3).map(event => (
                    <div key={event.id} style={{ display: "flex", gap: 12, paddingLeft: 12, borderLeft: `3px solid ${EVENT_COLORS[event.type]?.border || "#fff"}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc" }}>{event.name}</div>
                        <div style={{ fontSize: 13, color: EVENT_COLORS[event.type]?.text || "#fff", marginTop: 2 }}>{event.event}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{event.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel" style={{ borderRadius: 24, padding: "20px", background: "rgba(99, 102, 241, 0.05)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ color: "#a5b4fc", marginTop: 2 }}><Sparkles size={18} /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#f8fafc", marginBottom: 6 }}>AI Tip for Today</h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                      Customers experiencing a "New Baby" life event have a 45% higher conversion rate when approached within 72 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 600, color: "#f8fafc" }}>Recommended Leads</h3>
          {renderLeadCards()}
        </>
      )}

      {/* LEADS RECOMMENDATION VIEW */}
      {currentView === "leads" && renderLeadCards()}

      {/* LIFE EVENTS VIEW */}
      {currentView === "events" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="animate-fade-in">
          {RECENT_EVENTS.map(event => (
            <div key={event.id} className="glass-panel card-hover" style={{ display: "flex", gap: 20, padding: 24, borderRadius: 20, borderLeft: `4px solid ${EVENT_COLORS[event.type]?.border || "#fff"}` }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {event.type === "Health Flag" ? "⚠️" : event.type === "New Baby" ? "🍼" : event.type === "Promotion" ? "💼" : "🏠"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#f8fafc" }}>{event.name}</h3>
                    <span style={{ display: "inline-block", marginTop: 6, background: EVENT_COLORS[event.type]?.bg || "rgba(255,255,255,0.1)", color: EVENT_COLORS[event.type]?.text || "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                      {event.event}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{event.time}</span>
                </div>
                <p style={{ margin: "12px 0 0", fontSize: 14, color: "#cbd5e1", lineHeight: 1.5 }}>
                  {event.detail}
                </p>
                <div style={{ marginTop: 16 }}>
                  <button className="btn-hover" style={{ padding: "8px 20px", borderRadius: 8, background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.4)", color: "#a5b4fc", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
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