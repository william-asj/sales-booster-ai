"use client";

type Page = "dashboard" | "chat" | "customers" | "analytics";

interface SidebarProps {
  active: Page;
  setActive: (page: Page) => void;
}

export default function Sidebar({ active, setActive }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "chat", label: "AI Chat", icon: "💬" },
    { id: "customers", label: "Customers", icon: "👤" },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ];

  return (
    <div style={{ width: 220, background: "#0d0f1a", borderRight: "1px solid #1e2235", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1e2235" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>SalesBooster</div>
            <div style={{ fontSize: 10, color: "#475569" }}>AI · Insurance CRM</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {navItems.map(item => (
          <button
            key={item.id}
            className="nav-item"
            onClick={() => setActive(item.id as Page)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: active === item.id ? "#6366f115" : "transparent", color: active === item.id ? "#818cf8" : "#64748b", cursor: "pointer", marginBottom: 2, fontSize: 13, fontWeight: active === item.id ? 600 : 400, textAlign: "left", fontFamily: "inherit" }}>
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Hot leads alert */}
      <div style={{ padding: "10px", margin: "0 10px 8px", borderRadius: 8, background: "#ef444410", border: "1px solid #ef444420" }}>
        <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 600 }}>🔥 3 hot leads today</div>
        <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Budi, Anton, +1 more</div>
      </div>

      {/* Agent */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1e2235", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6366f130", border: "1.5px solid #6366f160", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700, fontSize: 12 }}>AG</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>Agent Login</div>
          <div style={{ fontSize: 10, color: "#475569" }}>agent@salesbooster.id</div>
        </div>
      </div>
    </div>
  );
}
