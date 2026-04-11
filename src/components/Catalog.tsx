"use client";

import React from "react";
import { ShieldCheck, TrendingUp, HeartPulse, GraduationCap, Home, Briefcase } from "lucide-react";

const PRODUCTS = [
  { id: 1, name: "Life Protection Plus", category: "Life", icon: <ShieldCheck size={24} />, description: "Comprehensive life coverage with flexible premium options.", premium: "From Rp 500K/mo" },
  { id: 2, name: "Wealth Protector", category: "Investment", icon: <TrendingUp size={24} />, description: "Unit-linked insurance with high-yield potential.", premium: "From Rp 1.5M/mo" },
  { id: 3, name: "Family Shield", category: "Health", icon: <HeartPulse size={24} />, description: "Full medical coverage for you and your dependents.", premium: "From Rp 1.2M/mo" },
  { id: 4, name: "Education Saver", category: "Education", icon: <GraduationCap size={24} />, description: "Secure your child's future with guaranteed education funds.", premium: "From Rp 800K/mo" },
  { id: 5, name: "Mortgage Guard", category: "Asset", icon: <Home size={24} />, description: "Protect your home and family from mortgage burdens.", premium: "From Rp 300K/mo" },
  { id: 6, name: "Executive Term", category: "Corporate", icon: <Briefcase size={24} />, description: "High-value term life protection for professionals.", premium: "From Rp 2M/mo" },
];

export default function Catalog() {
  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1400px] w-full mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-50 m-0">Product Catalog</h1>
        <p className="mt-1 text-sm text-slate-400">Browse and manage available insurance products.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="glass-panel card-hover rounded-[32px] p-6 flex flex-col gap-4 border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              {product.icon}
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
        ))}
      </div>
    </div>
  );
}
