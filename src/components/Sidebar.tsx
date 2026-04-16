"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard,
  HeartPulse,
  Sparkles,
  Briefcase,
  Users,
  PieChart,
  Settings,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";

type Page =
  | "dashboard"
  | "leads"
  | "events"
  | "products"
  | "chat"
  | "customers"
  | "analytics"
  | "settings"
  | string;

interface SidebarProps {
  active: Page;
  setActive: (page: Page) => void;
}
export default function Sidebar({ active, setActive }: SidebarProps) {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // If clicking outside both the menu and the trigger, close the menu
      if (
        menuRef.current && 
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNavBtnClass = (page: string) => {
// ... rest of the method

    const isActive = active === page;
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left mb-1 ${
      isActive
        ? "bg-indigo-500/20 text-slate-50 border border-indigo-500/30"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
    } ${isCollapsed ? "justify-center px-0" : ""}`;
  };

  return (
    <aside 
      className={`h-[calc(100vh-2rem)] sticky top-4 left-4 my-4 ml-4 flex flex-col glass-panel rounded-3xl border border-white/10 transition-all duration-300 ease-in-out z-50 shadow-2xl shadow-black/50 ${
        isCollapsed ? "w-[80px]" : "w-[260px]"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white border border-indigo-400/50 shadow-lg hover:bg-indigo-500 transition-colors z-[60]"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Header - Now a button to return to dashboard */}
      <button
        onClick={() => setActive("dashboard")}
        className={`px-5 mt-6 mb-8 flex items-center gap-3 overflow-hidden transition-opacity hover:opacity-80 active:scale-95 ${isCollapsed ? "justify-center" : ""}`}
      >
        <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20">
          ✦
        </div>
        {!isCollapsed && (
          <div className="animate-fade-in whitespace-nowrap text-left">
            <h2 className="text-base font-bold text-slate-50 tracking-wide m-0">
              Sales Booster
            </h2>
            <span className="text-[10px] text-slate-500 font-medium uppercase">AI CRM Platform</span>
          </div>
        )}
      </button>

      <div className={`flex-1 px-3 flex flex-col gap-6 overflow-y-auto scrollbar-hide ${isCollapsed ? "items-center" : ""}`}>
        {/* MAIN Section */}
        <div className="w-full">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-bold text-slate-500 mb-3 tracking-[0.2em] animate-fade-in uppercase">
              {t("Main Menu")}
            </div>
          )}

          <button
            className={getNavBtnClass("dashboard")}
            onClick={() => setActive("dashboard")}
            title={isCollapsed ? t("Dashboard") : ""}
          >
            <LayoutDashboard size={20} className="shrink-0" />
            {!isCollapsed && <span className="flex-1 animate-fade-in">{t("Dashboard")}</span>}
          </button>

          <button
            className={getNavBtnClass("leads")}
            onClick={() => setActive("leads")}
            title={isCollapsed ? t("Leads") : ""}
          >
            <Sparkles size={20} className="shrink-0" />
            {!isCollapsed && <span className="flex-1 animate-fade-in">{t("Leads")}</span>}
          </button>

          <button
            className={getNavBtnClass("events")}
            onClick={() => setActive("events")}
            title={isCollapsed ? t("Events") : ""}
          >
            <HeartPulse size={20} className="shrink-0" />
            {!isCollapsed && <span className="flex-1 animate-fade-in">{t("Events")}</span>}
          </button>

          <button
            className={getNavBtnClass("products")}
            onClick={() => setActive("products")}
            title={isCollapsed ? t("Catalog") : ""}
          >
            <Briefcase size={20} className="shrink-0" />
            {!isCollapsed && <span className="flex-1 animate-fade-in">{t("Catalog")}</span>}
          </button>

          <button
            className={getNavBtnClass("chat")}
            onClick={() => setActive("chat")}
            title={isCollapsed ? t("Chats") : ""}
          >
            <MessageSquare size={20} className="shrink-0" />
            {!isCollapsed && <span className="flex-1 animate-fade-in">{t("Chats")}</span>}
          </button>
        </div>

        {/* MANAGE Section */}
        <div className="w-full">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-bold text-slate-500 mb-3 tracking-[0.2em] animate-fade-in uppercase">
              {t("Management")}
            </div>
          )}
          <button
            className={getNavBtnClass("customers")}
            onClick={() => setActive("customers")}
            title={isCollapsed ? t("Customers") : ""}
          >
            <Users size={20} className="shrink-0" /> 
            {!isCollapsed && <span className="flex-1 animate-fade-in">{t("Customers")}</span>}
          </button>
          <button
            className={getNavBtnClass("analytics")}
            onClick={() => setActive("analytics")}
            title={isCollapsed ? t("Analytics") : ""}
          >
            <PieChart size={20} className="shrink-0" /> 
            {!isCollapsed && <span className="flex-1 animate-fade-in">{t("Analytics")}</span>}
          </button>
        </div>
      </div>

      {/* Agent Profile Footer (Discord-style) */}
      <div className={`mt-auto p-2 mx-2 mb-4 rounded-2xl bg-white/[0.03] border border-white/5 relative ${isCollapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center w-full ${isCollapsed ? "justify-center" : "gap-2"}`}>
          <div 
            ref={triggerRef}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center flex-1 min-w-0 p-1.5 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group ${isCollapsed ? "p-0 justify-center flex-none" : "gap-2"}`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                AG
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0f111a]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 animate-fade-in">
                <div className="text-[12px] font-bold text-slate-100 truncate leading-tight mb-0.5">
                  {t("Agent Login")}
                </div>
                <div className="text-[10px] text-slate-500 truncate leading-none flex items-center gap-1">
                  {t("Online")}
                </div>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <button
              onClick={() => setActive("settings")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                active === "settings"
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-400 hover:bg-white/10 hover:text-slate-100"
              }`}
              title={t("Settings")}
            >
              <Settings size={18} />
            </button>
          )}
        </div>

        {/* Profile Pop-out Menu (Works in both states) */}
        {showProfileMenu && (
          <div 
            ref={menuRef}
            className={`absolute bg-[#10121e] rounded-2xl border border-white/10 shadow-2xl animate-fade-in overflow-hidden z-[100] ${
              isCollapsed 
                ? "bottom-0 left-16 w-56" 
                : "bottom-full left-0 mb-2 w-full min-w-[240px]"
            }`}
          >
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                  AG
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-100 truncate">{t("Agent Login")}</div>
                  <div className="text-xs text-slate-400 truncate">agent@salesbooster.id</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-green-400 bg-green-400/10 px-2 py-1 rounded-lg w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {t("Online").toUpperCase()}
              </div>
            </div>
            
            <div className="p-1.5">
              <button 
                onClick={() => {
                  setActive("settings");
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <User size={16} className="text-slate-500" />
                {t("Profile Details")}
              </button>
              <button 
                onClick={() => {
                  setActive("settings");
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings size={16} className="text-slate-500" />
                {t("Settings")}
              </button>
              <div className="h-px bg-white/5 my-1 mx-2" />
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut size={16} />
                {t("Log Out")}
              </button>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}
