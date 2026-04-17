"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export default function ThemeToggle({ isCollapsed }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-1"}`}>
      <button
        onClick={toggleTheme}
        className={`relative flex items-center w-12 h-6 rounded-full transition-all duration-300 shadow-inner group ${
          isDark 
            ? "bg-indigo-600/30 border border-indigo-500/30" 
            : "bg-slate-200/50 border border-slate-300"
        }`}
        aria-label="Toggle theme"
      >
        <div className="absolute inset-0 flex justify-between items-center px-1.5 pointer-events-none">
          <Moon 
            size={12} 
            className={`transition-all duration-300 ${isDark ? "text-indigo-300 opacity-100" : "text-slate-400 opacity-0"}`} 
          />
          <Sun 
            size={12} 
            className={`transition-all duration-300 ${!isDark ? "text-amber-500 opacity-100" : "text-indigo-300/30 opacity-0"}`} 
          />
        </div>
        
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
            isDark ? "translate-x-6 bg-indigo-50" : "translate-x-0 bg-white"
          }`}
        >
          {isDark ? (
            <Moon size={10} className="text-indigo-600" />
          ) : (
            <Sun size={10} className="text-amber-500" />
          )}
        </div>
      </button>
    </div>
  );
}
