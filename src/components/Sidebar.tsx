"use client";

import React from "react";
import {
  LayoutDashboard,
  HeartPulse,
  Sparkles,
  Briefcase,
  Users,
  PieChart,
  Settings
} from "lucide-react";

type Page = "dashboard" | "chat" | "customers" | "analytics";

interface SidebarProps {
  active: Page | string;
  setActive: (page: Page) => void;
}

export default function Sidebar({ active, setActive }: SidebarProps) {
  return (
    <aside className="glass-panel" style={{
      width: 260,
      borderRight: "1px solid rgba(255,255,255,0.05)",
      borderTop: "none",
      borderBottom: "none",
      borderLeft: "none",
      borderRadius: 0,
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0
    }}>
      <style>{`
        .nav-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: none;
          border-left: 3px solid transparent;
          border-radius: 0 8px 8px 0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-family: inherit;
          background: transparent;
          color: #94a3b8;
        }
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }
        .nav-btn.active {
          background: rgba(99, 102, 241, 0.15);
          border-left: 3px solid #6366f1;
          color: #f8fafc;
        }
      `}</style>

      {/* Logo Header */}
      <div style={{ padding: "0 24px", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 20 }}>
          ✦
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f8fafc", letterSpacing: "0.5px" }}>Sales Booster</h2>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>AI CRM Platform</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>

        {/* MAIN Section */}
        <div>
          <div style={{ padding: "0 12px", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 8, letterSpacing: "1px" }}>MAIN</div>

          <button className={`nav-btn ${active === "dashboard" ? "active" : ""}`} onClick={() => setActive("dashboard")}>
            <LayoutDashboard size={18} />
            <span style={{ flex: 1 }}>Dashboard</span>
          </button>

          <button className="nav-btn" onClick={() => setActive("dashboard")}>
            <Sparkles size={18} />
            <span style={{ flex: 1 }}>Lead Recommendations</span>
            <span style={{ background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>8</span>
          </button>

          <button className="nav-btn" onClick={() => setActive("dashboard")}>
            <HeartPulse size={18} />
            <span style={{ flex: 1 }}>Life Events</span>
            <span style={{ background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>12</span>
          </button>

          <button className="nav-btn">
            <Briefcase size={18} />
            <span style={{ flex: 1 }}>Product Catalog</span>
          </button>
        </div>

        {/* MANAGE Section */}
        <div>
          <div style={{ padding: "0 12px", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 8, letterSpacing: "1px" }}>MANAGE</div>
          <button className={`nav-btn ${active === "customers" ? "active" : ""}`} onClick={() => setActive("customers")}>
            <Users size={18} /> <span style={{ flex: 1 }}>Customers</span>
          </button>
          <button className={`nav-btn ${active === "analytics" ? "active" : ""}`} onClick={() => setActive("analytics")}>
            <PieChart size={18} /> <span style={{ flex: 1 }}>Analytics</span>
          </button>
        </div>

        {/* SYSTEM Section */}
        <div>
          <div style={{ padding: "0 12px", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 8, letterSpacing: "1px" }}>SYSTEM</div>
          <button className="nav-btn">
            <Settings size={18} /> <span style={{ flex: 1 }}>Settings</span>
          </button>
        </div>
      </div>

      {/* Agent Profile Footer */}
      <div style={{ padding: "0 24px", marginTop: "auto", paddingTop: 20 }}>
        <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", padding: "12px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#f8fafc" }}>AG</div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: "#22c55e", borderRadius: "50%", border: "2px solid #080a12" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>Agent Login</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>agent@salesbooster.id</div>
          </div>
        </div>
      </div>
    </aside>
  );
}