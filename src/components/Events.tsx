"use client";

import React, { useState } from "react";
import {
  Baby,
  Home,
  TrendingUp,
  Activity,
  MoreVertical,
  HeartPulse,
  Briefcase,
  Search,
  Filter,
  Clock,
  ArrowUpRight,
  MessageSquare,
  Users
} from "lucide-react";

// 1. Define the TypeScript interfaces
interface LifeEvent {
  id: string;
  customerName: string;
  eventType: "New Baby" | "Home Purchase" | "Promotion" | "Health Flag" | "Marriage";
  description: string;
  timestamp: string;
  priority: "High" | "Medium" | "Low";
}

interface Lead {
  id: number;
  name: string;
  age: number;
  dob?: string;
  score: number;
  scoreLabel: string;
  event: string;
  product: string;
  premium: string;
  avatar: string;
  phone: string;
  policies: number;
}

interface EventsProps {
  setActive: (page: string) => void;
  setSelectedLead: (lead: Lead) => void;
}

// 2. Mock Data aligned with dashboard.tsx
const MOCK_EVENTS: LifeEvent[] = [
  {
    id: "evt_001",
    customerName: "Rina Kusuma",
    eventType: "Health Flag",
    description: "Missed scheduled checkup 2 weeks running. High risk flag detected via hospital partnership API.",
    timestamp: "2 hrs ago",
    priority: "High",
  },
  {
    id: "evt_002",
    customerName: "Reza Pratama",
    eventType: "Home Purchase",
    description: "Mortgage inquiry detected via banking partner API. Customer is likely seeking homeowner insurance.",
    timestamp: "1 day ago",
    priority: "Medium",
  },
  {
    id: "evt_003",
    customerName: "Sari Dewi",
    eventType: "New Baby",
    description: "Added dependent to company health portal. High propensity for education funds and family life plans.",
    timestamp: "2 days ago",
    priority: "High",
  },
  {
    id: "evt_004",
    customerName: "Budi Santoso",
    eventType: "Marriage",
    description: "Relationship status updated to Married. Opportunity for joint policies and beneficiary updates.",
    timestamp: "3 days ago",
    priority: "Medium",
  },
  {
    id: "evt_005",
    customerName: "Anton Wijaya",
    eventType: "Promotion",
    description: "New job title detected on professional network. Income increase suggests wealth protector up-sell.",
    timestamp: "4 days ago",
    priority: "Low",
  },
];

// 3. Helper to determine styles based on event type
const getEventStyles = (type: string) => {
  switch (type) {
    case "Health Flag":
      return {
        icon: <Activity size={18} className="text-rose-400" />,
        bg: "bg-rose-400/5",
        border: "border-rose-500/20",
        text: "text-rose-400",
        glow: "bg-rose-400/20"
      };
    case "Home Purchase":
      return {
        icon: <Home size={18} className="text-blue-400" />,
        bg: "bg-blue-400/5",
        border: "border-blue-500/20",
        text: "text-blue-400",
        glow: "bg-blue-400/20"
      };
    case "New Baby":
      return {
        icon: <Baby size={18} className="text-amber-400" />,
        bg: "bg-amber-400/5",
        border: "border-amber-500/20",
        text: "text-amber-400",
        glow: "bg-amber-400/20"
      };
    case "Promotion":
      return {
        icon: <Briefcase size={18} className="text-purple-400" />,
        bg: "bg-purple-400/5",
        border: "border-purple-500/20",
        text: "text-purple-400",
        glow: "bg-purple-400/20"
      };
    case "Marriage":
      return {
        icon: <Users size={18} className="text-emerald-400" />,
        bg: "bg-emerald-400/5",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        glow: "bg-emerald-400/20"
      };
    default:
      return {
        icon: <HeartPulse size={18} className="text-indigo-400" />,
        bg: "bg-indigo-400/5",
        border: "border-indigo-500/20",
        text: "text-indigo-400",
        glow: "bg-indigo-400/20"
      };
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "High": return "text-rose-300 bg-rose-500/10 border-rose-500/20";
    case "Medium": return "text-amber-300 bg-amber-500/10 border-amber-500/20";
    default: return "text-slate-400 bg-white/5 border-white/10";
  }
};

// Mock mapping to Lead object for redirection
const getLeadFromEvent = (event: LifeEvent): Lead => ({
  id: Math.random(),
  name: event.customerName,
  age: 35,
  score: event.priority === 'High' ? 90 : 60,
  scoreLabel: event.priority,
  event: event.eventType,
  product: "Life Protection Plus",
  premium: "Rp 2.4M/mo",
  avatar: event.customerName.split(' ').map(n => n[0]).join(''),
  phone: "+62 812-3456-7890",
  policies: 1
});

export default function EventsTimeline({ setActive, setSelectedLead }: EventsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = MOCK_EVENTS.filter(event => 
    event.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in px-6 md:px-10 py-8 max-w-[1400px] w-full mx-auto min-h-screen">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[20px] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <HeartPulse size={22} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight m-0">Recent Life Events</h1>
          </div>
          <p className="text-sm md:text-base text-slate-400 max-w-xl font-medium">
            AI-detected milestones and behavior triggers from your customer network.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search events or customers..."
              className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[20px] py-3 pl-12 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="glass-panel p-3 rounded-[18px] hover:bg-white/[0.08] transition-colors text-slate-400 border border-white/10 backdrop-blur-lg shrink-0">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10 items-start">
        {/* MAIN TIMELINE */}
        <div className="space-y-6">
          {filteredEvents.map((event, idx) => {
            const styles = getEventStyles(event.eventType);
            const isLast = idx === filteredEvents.length - 1;

            return (
              <div key={event.id} className="group relative flex gap-6">
                {/* Timeline connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center border transition-all duration-500 group-hover:scale-110 z-10 backdrop-blur-xl ${styles.bg} ${styles.border}`}>
                    {styles.icon}
                  </div>
                  {!isLast && <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent my-2" />}
                </div>

                {/* Event Card */}
                <div className="flex-1 pb-10">
                  <div className="glass-panel card-hover rounded-[32px] p-6 md:p-8 border border-white/10 backdrop-blur-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden group/card">
                    {/* Background decoration - Fixed bug by strictly containing it with overflow-hidden */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover/card:opacity-20 transition-opacity duration-700 pointer-events-none ${styles.glow}`} />
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-100 tracking-tight">{event.customerName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyles(event.priority)}`}>
                            {event.priority}
                          </span>
                        </div>
                        <div className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${styles.text}`}>
                          {event.eventType}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-slate-500 text-[11px] font-bold uppercase tracking-tighter">
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <Clock size={12} />
                          {event.timestamp}
                        </span>
                        <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl mb-8 font-medium">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/5">
                      <button 
                        onClick={() => {
                          setSelectedLead(getLeadFromEvent(event));
                          setActive("customers");
                        }}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-[18px] text-[13px] font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        Review Profile
                        <ArrowUpRight size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedLead(getLeadFromEvent(event));
                          setActive("chat");
                        }}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-200 rounded-[18px] text-[13px] font-bold transition-all border border-white/10 flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <MessageSquare size={16} className="text-indigo-400" />
                        Ask AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="glass-panel rounded-[32px] p-6 border border-white/10 backdrop-blur-xl bg-white/[0.02]">
            <h3 className="text-sm font-bold text-slate-100 mb-6 uppercase tracking-widest px-2">Insights Summary</h3>
            <div className="space-y-4">
              {[
                { label: "High Urgency", value: "02", color: "rose" },
                { label: "Detected Today", value: "12", color: "indigo" },
                { label: "Actioned", value: "08", color: "emerald" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-colors">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  <span className={`text-lg font-bold text-${item.color}-400`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6 border border-indigo-500/20 backdrop-blur-xl bg-indigo-500/[0.03]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
              <TrendingUp size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-100 mb-2 uppercase tracking-wider leading-tight">Conversion Tip</h4>
            <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
              Customers undergoing a <span className="text-indigo-300">Life Event</span> are 4.5x more likely to increase their coverage within the first 72 hours of detection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
