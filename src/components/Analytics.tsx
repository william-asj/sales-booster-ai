"use client";

export default function Analytics() {
  const bars = [
    { label: "Jan", value: 62 }, { label: "Feb", value: 74 },
    { label: "Mar", value: 58 }, { label: "Apr", value: 81 },
    { label: "May", value: 69 }, { label: "Jun", value: 91 },
  ];
  const max = Math.max(...bars.map(b => b.value));

  return (
    <div style={{ padding: "28px 32px", maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Analytics</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 13 }}>Conversion & performance overview</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Bar chart */}
        <div style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 20 }}>Leads Converted / Month</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", background: "linear-gradient(180deg, #6366f1, #8b5cf680)", borderRadius: "4px 4px 0 0", height: `${(b.value / max) * 100}px`, position: "relative" }}>
                  <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "#818cf8", fontWeight: 600 }}>{b.value}</div>
                </div>
                <div style={{ fontSize: 10, color: "#475569" }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Product breakdown */}
        <div style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 20 }}>Top Products</div>
          {[
            { name: "Life Protection Plus", pct: 68, color: "#6366f1" },
            { name: "Family Shield", pct: 54, color: "#8b5cf6" },
            { name: "Wealth Protector", pct: 41, color: "#a78bfa" },
          ].map((p, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>{p.name}</span>
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{p.pct}%</span>
              </div>
              <div style={{ height: 6, background: "#1e2235", borderRadius: 3 }}>
                <div style={{ height: "100%", borderRadius: 3, background: p.color, width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* KPI cards */}
        {[
          { label: "Conversion Rate", value: "23.4%", delta: "+4.2% vs last month", color: "#22c55e" },
          { label: "Avg. Deal Size", value: "Rp 2.3M", delta: "+8.1% vs last month", color: "#6366f1" },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 12, padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>{kpi.value}</div>
            </div>
            <div style={{ fontSize: 12, color: kpi.color, fontWeight: 600, background: kpi.color + "15", padding: "4px 10px", borderRadius: 6 }}>{kpi.delta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}