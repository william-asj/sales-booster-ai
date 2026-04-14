"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, TrendingUp, HeartPulse, GraduationCap, Home, Briefcase, Lock, Moon, 
  Activity, Heart, BarChart3, ArrowDownToLine, Stethoscope, BookOpen, Gift, Shield, 
  Crown, Banknote, Leaf, Hand, Zap, PlusCircle, Accessibility, Users, AlertTriangle,
  ArrowLeft, LucideIcon 
} from "lucide-react";
import { db, Product } from "@/lib/data";

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  TrendingUp,
  HeartPulse,
  GraduationCap,
  Home,
  Briefcase,
  Lock,
  Moon,
  Activity,
  Heart,
  BarChart3,
  ArrowDownToLine,
  Stethoscope,
  BookOpen,
  Gift,
  Shield,
  Crown,
  Banknote,
  Leaf,
  Hand,
  Zap,
  PlusCircle,
  Accessibility,
  Users,
  AlertTriangle
};

const CATEGORY_COLORS: Record<string, string> = {
  "Whole Life": "#6366f1", // indigo
  "Traditional Life": "#8b5cf6", // violet
  "Education": "#a78bfa", // purple
  "Syariah PAYDI": "#10b981", // emerald
  "PAYDI": "#3b82f6", // blue
  "Term Life": "#f59e0b", // amber
  "Critical Illness": "#f43f5e", // rose
  "Rider": "#94a3b8" // slate
};

function ProductDetailPage({ product, onBack }: { product: Product; onBack: () => void }) {
  const riders = db.getProducts().filter(p => p.isRider && p.riderFor?.includes(product.id));
  const Icon = ICON_MAP[product.iconName] || ShieldCheck;
  const color = CATEGORY_COLORS[product.category] || "#6366f1";

  return (
    <div className="animate-fade-in fixed inset-0 z-50 bg-[#080a12] overflow-y-auto">
      {/* Ambient Glow */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle at 50% -20%, ${color}, transparent 70%)`
        }}
      />
      
      <div className="relative px-10 py-12 max-w-[1000px] mx-auto flex flex-col gap-10">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-50 transition-colors font-bold text-sm"
          >
            <ArrowLeft size={18} /> Back to Catalog
          </button>
          <div 
            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
            style={{
              borderColor: `${color}40`,
              backgroundColor: `${color}15`,
              color: color
            }}
          >
            {product.category}
          </div>
        </div>

        {/* Hero */}
        <div className="flex items-center gap-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}dd)`
            }}
          >
            <Icon size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-50 tracking-tight mb-2 uppercase">{product.name}</h1>
            <p className="text-xl text-slate-400 font-medium italic">{product.details.tagline}</p>
          </div>
        </div>

        {/* Two-column panel row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Coverage Panel */}
          <div className="glass-panel rounded-[32px] p-8 flex flex-col gap-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Product Scope</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-sm text-slate-400">Entry Age</span>
                <span className="text-sm text-slate-50 font-bold">{product.details.minEntry} - {product.details.maxEntry} Years</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-sm text-slate-400">Policy Term</span>
                <span className="text-sm text-slate-50 font-bold">{product.details.policyTerm}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-sm text-slate-400">Premium Term</span>
                <span className="text-sm text-slate-50 font-bold">{product.details.premiumTerm}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Max Coverage</span>
                <span className="text-sm text-indigo-300 font-bold">{product.details.maxCoverage}</span>
              </div>
            </div>
          </div>

          {/* Key Benefits Panel */}
          <div className="glass-panel rounded-[32px] p-8 flex flex-col gap-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Key Benefits</h3>
            <ul className="flex flex-col gap-4">
              {product.details.keyBenefits.map((benefit, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Coverage Highlights strip */}
        <div className="glass-panel rounded-[32px] p-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Coverage Highlights</h3>
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            {product.details.coverageHighlights.map((highlight, i) => (
              <div key={i} className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-sm text-slate-200 font-bold">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compatible Riders */}
        {riders.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Compatible Riders</h3>
            <div className="flex flex-wrap gap-2">
              {riders.map((rider) => (
                <div key={rider.id} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 font-bold">
                  {rider.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl mt-4">
          GENERATE AI PITCH FOR THIS PRODUCT
        </button>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const allProducts = db.getProducts();
  const mainProducts = allProducts.filter(p => !p.isRider);
  const riderProducts = allProducts.filter(p => p.isRider);

  if (selectedProduct) {
    return <ProductDetailPage product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  const renderProductCard = (product: Product) => {
    const Icon = ICON_MAP[product.iconName] || ShieldCheck;
    const color = CATEGORY_COLORS[product.category] || "#6366f1";
    return (
      <div key={product.id} className="glass-panel card-hover rounded-[32px] p-6 flex flex-col gap-4 border border-white/5">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${color}1A`, color: color }}
        >
          <Icon size={24} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: color }}>
            {product.category}
          </div>
          <h3 className="text-lg font-bold text-slate-50">{product.name}</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{product.description}</p>
        </div>
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-200">{product.premium}</span>
          <button 
            onClick={() => setSelectedProduct(product)}
            className="text-xs font-bold transition-colors hover:brightness-125"
            style={{ color: color }}
          >
            Details →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1400px] w-full mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-50 m-0 text-3xl font-bold tracking-tight">Product Catalog</h1>
        <p className="mt-1 text-sm text-slate-400 font-medium">Browse and manage available insurance products.</p>
      </header>

      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-50 mb-6">Main Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainProducts.map(renderProductCard)}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-50 mb-6">Riders (Add-ons)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riderProducts.map(renderProductCard)}
        </div>
      </div>
    </div>
  );
}
