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
import Settings from "../components/Settings";
import { Lead, Page } from "@/lib/data";

export default function Home() {
  const [active, setActive] = useState<Page>("dashboard");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", backgroundColor: "var(--app-bg)", minHeight: "100vh", position: "relative" }}>
      <Sidebar active={active} setActive={setActive} />

      <main style={{ flex: 1, overflowY: "auto", maxHeight: "100vh" }}>
        {/* 2. Global Animation Wrapper: Forces React to replay the fade-in on every tab switch */}
        <div key={active} className="animate-[fadeIn_0.2s_ease-in-out]">
          {active === "dashboard" && (
            <Dashboard
              setActive={setActive}
              setSelectedLead={setSelectedLead}
              setInitialMessage={setInitialMessage}
            />
          )}

          {active === "chat" && (
            <Chat 
              initialMessage={initialMessage} 
              onMessageSent={() => setInitialMessage(null)} 
            />
          )}

          {active === "customers" && (
            <Customers
              setActive={setActive}
              setSelectedLead={setSelectedLead}
              setInitialMessage={setInitialMessage}
              selectedLead={selectedLead}
            />
          )}

          {active === "analytics" && <Analytics />}

          {active === "leads" && (
            <Leads
              setActive={setActive}
              setSelectedLead={setSelectedLead}
              setInitialMessage={setInitialMessage}
            />
          )}
          
          {active === "events" && (
            <Events
              setActive={setActive}
              setSelectedLead={setSelectedLead}
              setInitialMessage={setInitialMessage}
            />
          )}
          
          {active === "products" && <Catalog />}
          
          {active === "settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}
