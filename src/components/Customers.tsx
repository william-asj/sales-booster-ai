"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  TrendingUp, 
  MessageSquare,
  AlertCircle,
  Filter,
  MoreVertical,
  Activity,
  Mail,
  SortAsc,
  SortDesc
} from "lucide-react";
import { db, Lead } from "@/lib/data";

interface Props {
  setActive: (page: string) => void;
  setSelectedLead: (lead: Lead) => void;
  setInitialMessage: (message: string) => void;
  selectedLead: Lead | null;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-rose-400";
};

export default function Customers({ setActive, setSelectedLead, setInitialMessage, selectedLead }: Props) {
  const leads = db.getLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredAndSortedLeads = useMemo(() => {
    return [...leads]
      .filter(lead => 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)
      )
      .sort((a, b) => {
        if (sortOrder === "asc") {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
  }, [leads, searchQuery, sortOrder]);

  const [selected, setSelected] = useState<Lead>(selectedLead || filteredAndSortedLeads[0]);
  const lastProcessedLeadId = React.useRef<number | null>(selectedLead?.id || null);

  // Sync selection dynamically
  React.useEffect(() => {
    // 1. If a NEW specific lead is passed from parent (different from what we last processed), prioritize it
    if (selectedLead && selectedLead.id !== lastProcessedLeadId.current) {
      setSelected(selectedLead);
      lastProcessedLeadId.current = selectedLead.id;
      return;
    }

    // 2. Otherwise, handle filtering logic: if current selection disappears from list, pick first visible
    if (filteredAndSortedLeads.length > 0) {
      const isStillVisible = filteredAndSortedLeads.some(l => l.id === selected?.id);
      if (!isStillVisible) {
        setSelected(filteredAndSortedLeads[0]);
      }
    }
  }, [filteredAndSortedLeads, selectedLead, selected?.id]);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden animate-fade-in p-4 lg:p-6 gap-4 lg:gap-6">
      {/* Sidebar List */}
      <div className="w-full md:w-72 lg:w-80 flex flex-col gap-4 h-[350px] md:h-full shrink-0">
        <div className="glass-panel rounded-3xl p-4 flex flex-col gap-4 overflow-hidden shadow-xl h-full">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-base lg:text-lg font-bold text-slate-50 tracking-tight">Customers</h2>
            <div className="flex gap-1">
              <button 
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors"
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
              </button>
              <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text"
              placeholder="Search by name, event, or phone..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2 pl-10 pr-4 text-xs lg:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-2">
            {filteredAndSortedLeads.map(lead => (
              <button 
                key={lead.id}
                onClick={() => setSelected(lead)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group ${
                  selected.id === lead.id 
                    ? "bg-indigo-500/20 border border-indigo-500/30 shadow-lg" 
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold text-[10px] lg:text-xs shrink-0 transition-transform group-hover:scale-110 ${
                  selected.id === lead.id ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-300"
                }`}>
                  {lead.avatar}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs lg:text-[13px] font-bold text-slate-100 truncate">{lead.name}</div>
                  <div className="text-[10px] lg:text-[11px] text-slate-500 truncate mt-0.5">{lead.event}</div>
                </div>
                {selected.id === lead.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
              </button>
            ))}
            {filteredAndSortedLeads.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                No customers found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Detail View */}
      <div className="flex-1 flex flex-col gap-4 lg:gap-6 overflow-y-auto scrollbar-hide pb-6">
        {/* Profile Header Card */}
        <div className="glass-panel card-hover rounded-[28px] lg:rounded-[32px] p-6 lg:p-8 relative overflow-hidden shrink-0">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
          
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[24px] lg:rounded-[28px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl lg:text-3xl font-bold text-white shadow-2xl shadow-indigo-500/20">
                {selected.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-7 h-7 lg:w-8 lg:h-8 rounded-xl lg:rounded-2xl bg-slate-900 border-4 border-[#080a12] flex items-center justify-center text-emerald-400">
                <ShieldCheck size={14} />
              </div>
            </div>

            <div className="flex-1 sm:pt-2 w-full">
              <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-50 tracking-tight">{selected.name}</h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 lg:gap-4 mt-2 text-slate-400">
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs lg:text-sm">
                      <Phone size={14} className="text-indigo-400 shrink-0" />
                      {selected.phone}
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs lg:text-sm">
                      <MapPin size={14} className="text-indigo-400 shrink-0" />
                      Jakarta, ID
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 lg:gap-3">
                  <button className="glass-panel p-2 lg:p-2.5 rounded-xl hover:bg-white/10 transition-colors text-slate-300">
                    <MoreVertical size={18} />
                  </button>
                  <button 
                    onClick={() => { setSelectedLead(selected); setActive("chat"); }}
                    className="flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl lg:rounded-2xl font-bold text-xs lg:text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
                  >
                    <MessageSquare size={16} />
                    AI Assistant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column: Stats & Scores */}
          <div className="xl:col-span-2 flex flex-col gap-4 lg:gap-6">
            {/* AI Insights Bar */}
            <div className="glass-panel card-hover rounded-[24px] lg:rounded-[28px] p-5 lg:p-6 border-l-4 border-indigo-500">
              <div className="flex items-center gap-4 mb-5 lg:mb-6">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xs lg:text-sm font-bold text-slate-100 uppercase tracking-widest leading-none">AI Matching Insights</h3>
                  <p className="text-[9px] md:text-[10px] lg:text-xs text-slate-500 mt-1 lg:mt-1.5">Real-time behavior analysis and scoring</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 lg:p-5">
                  <div className="flex justify-between items-end mb-3 lg:mb-4">
                    <span className="text-[9px] md:text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Intent</span>
                    <span className={`text-lg md:text-xl lg:text-2xl font-black leading-none ${getScoreColor(selected.score)}`}>{selected.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        selected.score >= 80 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : 
                        selected.score >= 60 ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" : 
                        "bg-rose-500 shadow-[0_0_10px_#f43f5e]"
                      }`}
                      style={{ width: `${selected.score}%` }}
                    />
                  </div>
                  <p className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-500 mt-3 lg:mt-4 leading-relaxed">
                    Based on recent life events and browsing history, {selected.name.split(' ')[0]} shows a 
                    <span className={`mx-1 font-bold ${getScoreColor(selected.score)}`}>{selected.scoreLabel}</span> 
                    propensity.
                  </p>
                </div>

                <div className="flex flex-col">
                  <div className="flex-1 bg-amber-400/5 border border-amber-400/10 rounded-2xl p-4 lg:p-5 flex gap-3 lg:gap-4">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] font-black text-amber-400 uppercase tracking-[0.15em] mb-1">Opportunity</div>
                      <div className="text-xs md:text-sm lg:text-base font-bold text-slate-100 leading-tight">{selected.event}</div>
                      <p className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        Historically leads to 45% conversion increase.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {[
                { icon: <Calendar size={18} />, label: "Age & DOB", value: `${selected.age} Yrs`, subValue: selected.dob, color: "text-blue-400" },
                { icon: <ShieldCheck size={18} />, label: "Policies", value: `${selected.policies} Active`, color: "text-emerald-400" },
                { icon: <TrendingUp size={18} />, label: "Premium", value: selected.premium, color: "text-indigo-400" },
                { icon: <ShieldCheck size={18} />, label: "Risk", value: "Balanced", color: "text-purple-400" },
              ].map((stat, i) => (
                <div key={i} className="glass-panel card-hover rounded-2xl p-4 lg:p-5 flex items-center gap-3 lg:gap-4">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${stat.color}`}>
                    {React.cloneElement(stat.icon as React.ReactElement<{ size?: number }>, { size: 16 })}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] md:text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{stat.label}</div>
                    <div className="flex flex-col">
                      <div className="text-xs md:text-sm lg:text-base font-bold text-slate-100 truncate">{stat.value}</div>
                      {"subValue" in stat && (
                        <div className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-400 truncate mt-0.5">{stat.subValue}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Recommendations & Action */}
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="glass-panel card-hover rounded-[24px] lg:rounded-[28px] p-5 lg:p-6 bg-indigo-600/5 border-indigo-500/20 flex flex-col gap-5 lg:gap-6">
              <div>
                <h3 className="text-[10px] md:text-xs lg:text-sm font-bold text-slate-100 uppercase tracking-widest mb-1">Recommendation</h3>
                <p className="text-[9px] md:text-[10px] lg:text-xs text-slate-500">AI-suggested product strategy</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 lg:p-6 border border-white/10">
                <div className="flex items-center gap-3 lg:gap-4 mb-4">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                    <ShieldCheck size={18} className="lg:hidden" />
                    <ShieldCheck size={24} className="hidden lg:block" />
                  </div>
                  <h4 className="text-[13px] md:text-sm lg:text-lg font-bold text-slate-50 leading-snug">{selected.product}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] md:text-[10px] lg:text-[11px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-lg uppercase tracking-wider">Best Match</span>
                </div>
                
                <div className="h-px bg-white/5 my-4 lg:my-6" />
                
                <ul className="flex flex-col gap-2.5">
                  {["Guaranteed death benefit", "Tax-advantaged growth"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-[9px] md:text-[10px] lg:text-[11px] text-slate-400">
                      <div className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => { 
                  setSelectedLead(selected); 
                  setInitialMessage(`Generate pitch for ${selected.name} to offer ${selected.product}`);
                  setActive("chat"); 
                }}
                className="w-full py-3.5 lg:py-4 bg-white text-slate-900 rounded-xl lg:rounded-2xl font-black text-[10px] md:text-xs lg:text-sm transition-all hover:bg-slate-100 active:scale-[0.98] shadow-xl whitespace-nowrap"
              >
                GENERATE PITCH
              </button>
            </div>

            <div className="glass-panel card-hover rounded-[24px] lg:rounded-[28px] p-5 lg:p-6 border border-white/5">
              <h3 className="text-[9px] md:text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Contact</h3>
              <div className="flex flex-col gap-3 lg:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="text-[10px] lg:text-[11px] text-slate-300 font-medium truncate">
                    {selected.name.split(' ')[0].toLowerCase()}@email.id
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                    <Phone size={14} />
                  </div>
                  <div className="text-[10px] lg:text-[11px] text-slate-300 font-medium truncate">
                    {selected.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
