"use client";

import { useState } from "react";
import { Lead } from "@/app/page";

const LEADS: Lead[] = [
  { id: 1, name: "Budi Santoso", age: 34, score: 92, scoreLabel: "High", event: "Recently married", product: "Life Protection Plus", premium: "Rp 2.4M/mo", avatar: "BS", phone: "+62 812-3456-7890", policies: 1 },
  { id: 2, name: "Sari Dewi", age: 28, score: 78, scoreLabel: "High", event: "New baby", product: "Family Shield", premium: "Rp 1.8M/mo", avatar: "SD", phone: "+62 857-2345-6789", policies: 0 },
  { id: 3, name: "Reza Pratama", age: 45, score: 61, scoreLabel: "Med", event: "Approaching retirement", product: "Wealth Protector", premium: "Rp 4.2M/mo", avatar: "RP", phone: "+62 878-9012-3456", policies: 2 },
  { id: 4, name: "Mira Lestari", age: 31, score: 44, scoreLabel: "Low", event: "New home purchase", product: "Mortgage Guard", premium: "Rp 900K/mo", avatar: "ML", phone: "+62 821-4567-8901", policies: 1 },
  { id: 5, name: "Anton Wijaya", age: 52, score: 88, scoreLabel: "High", event: "Child entering college", product: "Education Saver", premium: "Rp 3.1M/mo", avatar: "AW", phone: "+62 815-6789-0123", policies: 3 },
  { id: 6, name: "Rina Kusuma", age: 39, score: 55, scoreLabel: "Med", event: "Job promotion", product: "Executive Term", premium: "Rp 1.5M/mo", avatar: "RK", phone: "+62 896-7890-1234", policies: 1 },
];

const SCORE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  High: { bg: "#22c55e20", text: "#22c55e", dot: "#22c55e" },
  Med: { bg: "#f59e0b20", text: "#f59e0b", dot: "#f59e0b" },
  Low: { bg: "#ef444420", text: "#ef4444", dot: "#ef4444" },
};

type Page = "dashboard" | "chat" | "customers" | "analytics";

interface Props {
  setActive: (page: Page) => void;
  setSelectedLead: (lead: Lead) => void;
}

export default function Dashboard({ setActive, setSelectedLead }: Props) {
  const [filter, setFilter] = useState("All");
  const [sortCol, setSortCol] = useState<"score" | "name" | "age" | null>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const filtered = (filter === "All" ? LEADS : LEADS.filter(l => l.scoreLabel === filter))
    .slice()
    .sort((a, b) => {
      if (!sortCol) return 0;
      const valA = sortCol === "name" ? a.name : sortCol === "age" ? a.age : a.score;
      const valB = sortCol === "name" ? b.name : sortCol === "age" ? b.age : b.score;
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const toggleSort = (col: "score" | "name" | "age") => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

const SortIcon = ({ col }: { col: "score" | "name" | "age" }) => (
  <span style={{ marginLeft: 4, opacity: sortCol === col ? 1 : 0.3, fontSize: 10 }}>
    {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : "▼"}
  </span>
);

  return (
    <div className="page-content" style={{ padding: "28px 32px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Agent Dashboard</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 13 }}>Selasa, 10 Maret 2026 · 6 leads aktif</p>
      </div>

      {/* Stats — className on each card individually */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Hot Leads", value: "2", icon: "🔥" },
          { label: "Avg Score", value: "69.7", icon: "📈" },
          { label: "Contacts Today", value: "5", icon: "📞" },
          { label: "Total Coverage", value: "Rp 12M", icon: "🛡️" },
        ].map(stat => (
          <div key={stat.label} className="stat-card" style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 24 }}>{stat.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, color: "#e2e8f0" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter — className on each button individually */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["All", "High", "Med", "Low"].map(f => (
          <button key={f} className="filter-btn" onClick={() => setFilter(f)}
            style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: filter === f ? "#6366f1" : "#1e2235", background: filter === f ? "#6366f115" : "transparent", color: filter === f ? "#818cf8" : "#64748b", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            {f === "All" ? "All Leads" : `${f} Priority`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e2235" }}>
              <th onClick={() => toggleSort("name")}
                style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: sortCol === "name" ? "#818cf8" : "#475569", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", userSelect: "none" }}>
                Customer <SortIcon col="name" />
              </th>
              <th onClick={() => toggleSort("score")}
                style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: sortCol === "score" ? "#818cf8" : "#475569", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", userSelect: "none" }}>
                AI Score <SortIcon col="score" />
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" }}>Life Event</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" }}>Best Product</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Est. Premium
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => {
              const c = SCORE_COLORS[lead.scoreLabel];
              return (
                <tr className="lead-row" key={lead.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #1e2235" : "none" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#6366f130", border: "1.5px solid #6366f160", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700, fontSize: 12 }}>{lead.avatar}</div>
                      <div>
                        <div
                          onClick={() => { setSelectedLead(lead); setActive("customers"); }}
                          style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", cursor: "pointer", transition: "color 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#e2e8f0")}
                        >
                          {lead.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>Age {lead.age} · {lead.policies} polis aktif</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.text, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
                      {lead.score} · {lead.scoreLabel}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, color: "#94a3b8", background: "#1e2235", padding: "3px 8px", borderRadius: 4 }}>{lead.event}</span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>{lead.product}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8" }}>{lead.premium}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <button className="action-btn" onClick={() => { setSelectedLead(lead); setActive("chat"); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#6366f115", border: "1px solid #6366f130", borderRadius: 6, color: "#818cf8", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      💬 AI Chat
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
