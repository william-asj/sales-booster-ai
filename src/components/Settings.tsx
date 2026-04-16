"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Settings as SettingsIcon, Globe, Check } from "lucide-react";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1000px] w-full mx-auto">
      <header className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-50 m-0 tracking-tight">{t("Settings")}</h1>
          <p className="mt-1 text-sm text-slate-400 font-medium">{t("Manage your application preferences.")}</p>
        </div>
      </header>

      <div className="glass-panel rounded-[32px] p-8 border border-white/5 flex flex-col gap-8">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Globe size={20} className="text-slate-400" />
            <h2 className="text-xl font-bold text-slate-100 m-0">{t("Language")}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage("en")}
              className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                language === "en"
                  ? "bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {language === "en" && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-50 mb-1">English</h3>
              <p className="text-xs text-slate-400">Application interface and data in English.</p>
            </button>

            <button
              onClick={() => setLanguage("id")}
              className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                language === "id"
                  ? "bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {language === "id" && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-50 mb-1">Bahasa Indonesia</h3>
              <p className="text-xs text-slate-400">Antarmuka aplikasi dan data dalam Bahasa Indonesia.</p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
