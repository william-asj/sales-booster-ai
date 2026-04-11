"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import Chat from "../components/Chat";
import Customers from "../components/Customers";
import Analytics from "../components/Analytics";
import Leads from "../components/Leads";
import Events from "../components/Events";
import Catalog from "../components/Catalog";

// 1. Expanded the Page type to include all the new Sidebar sections
export type Page =
  | "dashboard"
  | "leads"
  | "events"
  | "products"
  | "chat"
  | "customers"
  | "analytics"
  | "settings"
  | string;

export interface Lead {
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

export default function Home() {
  const [active, setActive] = useState<Page>("dashboard");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  return (
    <div style={{ display: "flex", background: "#080a12", minHeight: "100vh" }}>
      <Sidebar active={active} setActive={setActive} />

      <main style={{ flex: 1, overflowY: "auto", maxHeight: "100vh" }}>
        {/* 2. Global Animation Wrapper: Forces React to replay the fade-in on every tab switch */}
        <div key={active} className="animate-[fadeIn_0.2s_ease-in-out]">
          {active === "dashboard" && (
            <Dashboard
              setActive={setActive}
              setSelectedLead={setSelectedLead}
            />
          )}

          {active === "chat" && <Chat />}

          {active === "customers" && (
            <Customers
              setActive={setActive}
              setSelectedLead={setSelectedLead}
              selectedLead={selectedLead}
            />
          )}

          {active === "analytics" && <Analytics />}

          {active === "leads" && (
            <Leads
              setActive={setActive}
              setSelectedLead={setSelectedLead}
            />
          )}
          
          {active === "events" && (
            <Events
              setActive={setActive}
              setSelectedLead={setSelectedLead}
            />
          )}
          
          {active === "products" && <Catalog />}
          
          {active === "settings" && (
            <div className="p-8 text-slate-400">Settings coming soon...</div>
          )}
        </div>
      </main>
    </div>
  );
}
