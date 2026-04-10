"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import Chat from "../components/Chat";
import Customers from "../components/Customers";
import Analytics from "../components/Analytics";

type Page = "dashboard" | "chat" | "customers" | "analytics";

export interface Lead {
  id: number;
  name: string;
  age: number;
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
      </main>
    </div>
  );
}