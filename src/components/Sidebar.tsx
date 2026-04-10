"use client";

import React from "react";
import {
  LayoutDashboard,
  HeartPulse,
  Sparkles,
  Briefcase,
  Users,
  PieChart,
  Settings,
} from "lucide-react";

type Page = "dashboard" | "chat" | "customers" | "analytics";

interface SidebarProps {
  active: Page | string;
  setActive: (page: Page) => void;
}

export default function Sidebar({ active, setActive }: SidebarProps) {
  const getNavBtnClass = (page: string) => {
    const isActive = active === page;
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-r-lg border-l-3 text-sm font-medium transition-all duration-200 text-left ${
      isActive
        ? "bg-indigo-500/15 border-indigo-500 text-slate-50"
        : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
    }`;
  };

  return (
    <aside className="w-[260px] flex-shrink-0 h-screen sticky top-0 flex flex-col py-6 glass-panel rounded-none border-y-0 border-l-0 border-r border-white/5">
      {/* Logo Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl shadow-md shadow-indigo-500/20">
          ✦
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-50 tracking-wide m-0">
            Sales Booster
          </h2>
          <span className="text-[11px] text-slate-400">AI CRM Platform</span>
        </div>
      </div>

      <div className="flex-1 px-3 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
        {/* MAIN Section */}
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-500 mb-2 tracking-widest">
            MAIN
          </div>

          <button
            className={getNavBtnClass("dashboard")}
            onClick={() => setActive("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span className="flex-1">Dashboard</span>
          </button>

          <button
            className={getNavBtnClass("leads")}
            onClick={() => setActive("dashboard")}
          >
            <Sparkles size={18} />
            <span className="flex-1">Lead Recommendations</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[11px] px-2 py-0.5 rounded-full font-semibold">
              8
            </span>
          </button>

          <button
            className={getNavBtnClass("events")}
            onClick={() => setActive("dashboard")}
          >
            <HeartPulse size={18} />
            <span className="flex-1">Life Events</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[11px] px-2 py-0.5 rounded-full font-semibold">
              12
            </span>
          </button>

          <button className={getNavBtnClass("products")}>
            <Briefcase size={18} />
            <span className="flex-1">Product Catalog</span>
          </button>
        </div>

        {/* MANAGE Section */}
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-500 mb-2 tracking-widest">
            MANAGE
          </div>
          <button
            className={getNavBtnClass("customers")}
            onClick={() => setActive("customers")}
          >
            <Users size={18} /> <span className="flex-1">Customers</span>
          </button>
          <button
            className={getNavBtnClass("analytics")}
            onClick={() => setActive("analytics")}
          >
            <PieChart size={18} /> <span className="flex-1">Analytics</span>
          </button>
        </div>

        {/* SYSTEM Section */}
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-500 mb-2 tracking-widest">
            SYSTEM
          </div>
          <button className={getNavBtnClass("settings")}>
            <Settings size={18} /> <span className="flex-1">Settings</span>
          </button>
        </div>
      </div>

      {/* Agent Profile Footer */}
      <div className="px-6 mt-auto pt-5">
        <div className="bg-black/20 border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-semibold text-slate-50">
              AG
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#080a12]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-semibold text-slate-50 truncate">
              Agent Login
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              agent@salesbooster.id
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}