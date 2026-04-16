"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  ShieldCheck, TrendingUp, HeartPulse, GraduationCap, Home, Briefcase, Lock, Moon, 
  Activity, Heart, BarChart3, ArrowDownToLine, Stethoscope, BookOpen, Gift, Shield, 
  Crown, Banknote, Leaf, Hand, Zap, PlusCircle, Accessibility, Users, AlertTriangle,
  ArrowLeft, LucideIcon 
} from "lucide-react";
import { db, Product } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();
  const riders = db.getProducts().filter(p => p.isRider && p.riderFor?.includes(product.id));
  const Icon = ICON_MAP[product.iconName] || ShieldCheck;
  const color = CATEGORY_COLORS[product.category] || "#6366f1";

  useEffect(() => {
    // Lock both body and main container scroll
    const main = document.querySelector('main');
    const originalBodyOverflow = document.body.style.overflow;
    const originalMainOverflow = main?.style.overflow || "auto";

    document.body.style.overflow = "hidden";
    if (main) main.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      if (main) main.style.overflow = originalMainOverflow;
    };
  }, []);

  return createPortal(
    <div className="animate-fade-in fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4">
      {/* Deep Glass Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
        onClick={onBack}
      />
      
      {/* Ambient Soft Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color}33, transparent 70%)`
        }}
      />
      
      {/* Floating Workspace Panel */}
      <div className="relative w-full max-w-7xl max-h-[98vh] bg-[#0d1117] rounded-[40px] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col will-change-transform">
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          <div className="px-6 md:px-12 py-5 flex flex-col gap-5">
            {/* Header Row (Back + Hero) */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-white/5">
              <div className="flex items-center gap-5">
                <button 
                  onClick={onBack}
                  className="group w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                >
                  <ArrowLeft size={18} className="text-slate-400 group-hover:text-slate-50" />
                </button>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
                  >
                    <Icon size={32} strokeWidth={1.2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <h1 className="text-xl md:text-3xl font-black text-slate-50 tracking-tighter uppercase leading-none">{product.name}</h1>
                      <div 
                        className="px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border"
                        style={{ borderColor: `${color}40`, backgroundColor: `${color}15`, color: color }}
                      >
                        {t(product.category)}
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-slate-400 font-medium italic tracking-tight opacity-70 leading-tight">{t(product.details.tagline)}</p>
                  </div>
                </div>
              </div>
              
              <button className="hidden md:block px-6 py-2.5 bg-slate-50 text-slate-900 font-black rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-xs uppercase tracking-tight">
                {t("GENERATE AI PITCH")}
              </button>
            </div>

            {/* Stats & Benefits Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Product Scope Card */}
              <div 
                className="bg-white/[0.05] rounded-[28px] p-6 border border-white/5 flex flex-col gap-5 transition-all duration-500 hover:bg-white/[0.08] hover:border-white/10 group/island"
                style={{ '--hover-glow': `${color}10`, '--hover-border': `${color}30` } as React.CSSProperties}
              >
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{t("Product Scope")}</h3>
                <div className="flex flex-col gap-3.5">
                  {[
                    { label: "Entry Age", value: `${product.details.minEntry} - ${product.details.maxEntry} ${t("Years")}` },
                    { label: "Policy Term", value: t(product.details.policyTerm) },
                    { label: "Premium Term", value: t(product.details.premiumTerm) },
                    { label: "Max Coverage", value: product.details.maxCoverage, highlight: true }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t(item.label)}</span>
                      <span className={`text-xs md:text-sm font-black ${item.highlight ? 'text-indigo-400' : 'text-slate-100'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Benefits Card */}
              <div 
                className="bg-white/[0.05] rounded-[28px] p-6 border border-white/5 flex flex-col gap-5 transition-all duration-500 hover:bg-white/[0.08] hover:border-white/10 group/island"
                style={{ '--hover-glow': `${color}10`, '--hover-border': `${color}30` } as React.CSSProperties}
              >
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{t("Key Benefits")}</h3>
                <ul className="flex flex-col gap-3.5">
                  {product.details.keyBenefits.map((benefit, i) => (
                    <li key={i} className="flex gap-3 text-[12px] md:text-[13px] text-slate-300 font-medium leading-snug group/item">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      {t(benefit)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Highlights Strip */}
            <div className="bg-white/[0.05] rounded-[28px] p-6 border border-white/5">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5">{t("Coverage Highlights")}</h3>
              <div className="flex flex-wrap gap-x-10 gap-y-5">
                {product.details.coverageHighlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2.5 group/h">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/h:scale-110 transition-transform">
                      <ShieldCheck size={16} />
                    </div>
                    <span className="text-[12px] font-black text-slate-200 uppercase tracking-tight">{t(highlight)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compatible Riders */}
            {riders.length > 0 && (
              <div className="px-1">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{t("Compatible Riders")}</h3>
                <div className="flex flex-wrap gap-2">
                  {riders.map((rider) => (
                    <div key={rider.id} className="px-4 py-2 rounded-lg border border-white/5 bg-white/5 text-[11px] text-slate-300 font-black uppercase tracking-wider hover:bg-white/10 hover:border-white/20 transition-all">
                      {rider.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Action */}
            <button className="md:hidden w-full py-4 bg-slate-50 text-slate-900 font-black rounded-xl hover:bg-white transition-all transform active:scale-[0.98] shadow-lg text-sm uppercase tracking-tight mb-4">
              {t("Generate AI Pitch")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Catalog() {
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const allProducts = db.getProducts();
  const mainProducts = allProducts.filter(p => !p.isRider);
  const riderProducts = allProducts.filter(p => p.isRider);

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
            {t(product.category)}
          </div>
          <h3 className="text-lg font-bold text-slate-50">{product.name}</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{t(product.description)}</p>
        </div>
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-200">{product.premium}</span>
          <button 
            onClick={() => setSelectedProduct(product)}
            className="text-xs font-bold transition-colors hover:brightness-125"
            style={{ color: color }}
          >
            {t("Details →")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in px-10 py-8 max-w-[1400px] w-full mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-50 m-0 text-3xl font-bold tracking-tight">{t("Product Catalog")}</h1>
        <p className="mt-1 text-sm text-slate-400 font-medium">{t("Browse and manage available insurance products.")}</p>
      </header>

      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-50 mb-6">{t("Main Products")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainProducts.map(renderProductCard)}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-50 mb-6">{t("Riders (Add-ons)")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riderProducts.map(renderProductCard)}
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailPage 
          product={selectedProduct} 
          onBack={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
