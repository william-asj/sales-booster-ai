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

type Page = "dashboard" | "chat" | "customers" | "analytics";

interface Props {
  setActive: (page: Page) => void;
  setSelectedLead: (lead: Lead) => void;
  selectedLead: Lead | null;
}

export default function Customers({ setActive, setSelectedLead, selectedLead }: Props) {
  const [selected, setSelected] = useState<Lead>(selectedLead || LEADS[0]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* List */}
      <div style={{ width: 280, borderRight: "1px solid #1e2235", overflowY: "auto" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1e2235" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>All Customers</div>
        </div>
        {LEADS.map(lead => (
          <button key={lead.id} className="nav-item" onClick={() => setSelected(lead)}
            style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, border: "none", borderBottom: "1px solid #1e2235", background: selected.id === lead.id ? "#6366f110" : "transparent", cursor: "pointer", textAlign: "left", borderLeft: selected.id === lead.id ? "2px solid #6366f1" : "2px solid transparent", fontFamily: "inherit" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#6366f130", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{lead.avatar}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{lead.name}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{lead.event}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div className="page-content" style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        {/* Customer header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#6366f130", border: "2px solid #6366f160", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700, fontSize: 18 }}>{selected.avatar}</div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>{selected.name}</h2>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{selected.phone}</div>
          </div>
          <button className="ai-btn" onClick={() => { setSelectedLead(selected); setActive("chat"); }}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease" }}>
            💬 AI Assist
          </button>
        </div>

        {/* Life event alert */}
        <div style={{ background: "#f59e0b10", border: "1px solid #f59e0b30", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div>
            <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>Life Event Detected</div>
            <div style={{ fontSize: 12, color: "#92400e", marginTop: 2 }}>{selected.event} — high opportunity window</div>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "Age", value: String(selected.age) },
            { label: "AI Score", value: `${selected.score} · ${selected.scoreLabel}` },
            { label: "Active Policies", value: String(selected.policies) },
            { label: "Recommended Product", value: selected.product },
            { label: "Est. Premium", value: selected.premium },
            { label: "Phone", value: selected.phone },
          ].map(field => (
            <div key={field.label} className="stat-card" style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 10, padding: "16px" }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{field.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{field.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
