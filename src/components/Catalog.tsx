"use client";

import React from "react";
import { ShieldCheck, TrendingUp, HeartPulse, GraduationCap, Home, Briefcase, LucideIcon } from "lucide-react";
import { db } from "@/lib/data";

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  TrendingUp,
  HeartPulse,
  GraduationCap,
  Home,
  Briefcase
};

export default function Catalog() {
  const products = db.getProducts();

  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1400px] w-full mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-50 m-0">Product Catalog</h1>
        <p className="mt-1 text-sm text-slate-400">Browse and manage available insurance products.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const Icon = ICON_MAP[product.iconName] || ShieldCheck;
          return (
            <div key={product.id} className="glass-panel card-hover rounded-[32px] p-6 flex flex-col gap-4 border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Icon size={24} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{product.category}</div>
                <h3 className="text-lg font-bold text-slate-50">{product.name}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{product.description}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-slate-200">{product.premium}</span>
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Details →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
