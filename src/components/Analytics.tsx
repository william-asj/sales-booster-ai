"use client";

import React from "react";
import { TrendingUp, PieChart, Activity } from "lucide-react";
import { db } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

export default function Analytics() {
  const { t } = useLanguage();
  const analytics = db.getAnalytics();
  const max = Math.max(...analytics.conversionChart.map(b => b.value));

  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1400px] w-full mx-auto min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--app-header)] tracking-tight m-0">{t("Analytics")}</h1>
        <p className="mt-1 text-sm text-[var(--app-text-muted)] font-medium">{t("Conversion performance and product distribution overview.")}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart */}
        <div className="glass-panel card-hover rounded-[32px] p-8 border border-[var(--sidebar-item-border)] flex flex-col h-[350px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Activity size={20} />
            </div>
            <h3 className="text-sm font-bold text-[var(--app-header)] uppercase tracking-widest">{t("Leads Converted / Month")}</h3>
          </div>
          
          <div className="flex-1 flex items-end gap-4 md:gap-6 px-2">
            {analytics.conversionChart.map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="w-full relative">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500/40 to-indigo-600 dark:to-indigo-400 rounded-t-lg transition-all duration-700 group-hover:from-indigo-500 group-hover:to-indigo-500 dark:group-hover:to-indigo-300 relative shadow-lg"
                    style={{ height: `${(b.value / max) * 180}px` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 whitespace-nowrap">
                      {b.value}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-tighter">{t(b.label)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Product breakdown */}
        <div className="glass-panel card-hover rounded-[32px] p-8 border border-[var(--sidebar-item-border)] flex flex-col h-[350px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <PieChart size={20} />
            </div>
            <h3 className="text-sm font-bold text-[var(--app-header)] uppercase tracking-widest">{t("Top Products Distribution")}</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-6">
            {analytics.topProducts.map((p, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-[var(--app-text)]">{t(p.name)}</span>
                  <span className="text-xs font-black text-[var(--app-header)]">{p.pct}%</span>
                </div>
                <div className="h-2 w-full bg-[var(--app-bg)] border border-[var(--sidebar-item-border)] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 shadow-sm"
                    style={{ 
                      width: `${p.pct}%`, 
                      backgroundColor: p.color 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics.kpis.map(kpi => (
          <div key={kpi.label} className="glass-panel card-hover rounded-[32px] p-8 border border-[var(--sidebar-item-border)] flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">{t(kpi.label)}</div>
              <div className="text-4xl font-black text-[var(--app-header)] tracking-tighter">{kpi.value}</div>
            </div>
            <div 
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0"
              style={{ 
                color: kpi.color, 
                backgroundColor: `${kpi.color}15`,
                borderColor: `${kpi.color}20`
              }}
            >
              <TrendingUp size={14} />
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
