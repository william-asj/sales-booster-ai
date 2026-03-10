"use client";

import { useState, useRef, useEffect } from "react";
import { Lead } from "@/app/page";

const LEADS: Lead[] = [
  { id: 1, name: "Budi Santoso", age: 34, score: 92, scoreLabel: "High", event: "Recently married", product: "Life Protection Plus", premium: "Rp 2.4M/mo", avatar: "BS", phone: "+62 812-3456-7890", policies: 1 },
  { id: 2, name: "Sari Dewi", age: 28, score: 78, scoreLabel: "High", event: "New baby", product: "Family Shield", premium: "Rp 1.8M/mo", avatar: "SD", phone: "+62 857-2345-6789", policies: 0 },
  { id: 3, name: "Reza Pratama", age: 45, score: 61, scoreLabel: "Med", event: "Approaching retirement", product: "Wealth Protector", premium: "Rp 4.2M/mo", avatar: "RP", phone: "+62 878-9012-3456", policies: 2 },
  { id: 4, name: "Mira Lestari", age: 31, score: 44, scoreLabel: "Low", event: "New home purchase", product: "Mortgage Guard", premium: "Rp 900K/mo", avatar: "ML", phone: "+62 821-4567-8901", policies: 1 },
  { id: 5, name: "Anton Wijaya", age: 52, score: 88, scoreLabel: "High", event: "Child entering college", product: "Education Saver", premium: "Rp 3.1M/mo", avatar: "AW", phone: "+62 815-6789-0123", policies: 3 },
  { id: 6, name: "Rina Kusuma", age: 39, score: 55, scoreLabel: "Med", event: "Job promotion", product: "Executive Term", premium: "Rp 1.5M/mo", avatar: "RK", phone: "+62 896-7890-1234", policies: 1 },
];

interface Message {
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface Props {
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead) => void;
}

export default function Chat({ selectedLead, setSelectedLead }: Props) {
  const [activeLead, setActiveLead] = useState<Lead>(selectedLead || LEADS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLead) setActiveLead(selectedLead);
  }, [selectedLead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const now = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: input, time: now() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: `Berdasarkan profil ${activeLead.name} (Score: ${activeLead.score}, ${activeLead.event}), rekomendasi saya adalah **${activeLead.product}** dengan premium ${activeLead.premium}. Apakah Anda ingin saya siapkan skrip panggilan?`,
        time: now(),
      }]);
    }, 1500);
  };

  return (
    <div className="page-content" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Lead list */}
      <div style={{ width: 260, background: "#0d0f1a", borderRight: "1px solid #1e2235", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1e2235" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Conversations</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Select a customer</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {LEADS.map(lead => (
            <button key={lead.id} className="nav-item" onClick={() => { setActiveLead(lead); setSelectedLead(lead); setMessages([]); }}
              style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, border: "none", borderBottom: "1px solid #1e2235", background: activeLead.id === lead.id ? "#6366f110" : "transparent", cursor: "pointer", textAlign: "left", borderLeft: activeLead.id === lead.id ? "2px solid #6366f1" : "2px solid transparent", fontFamily: "inherit" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6366f130", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{lead.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.event}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e2235", display: "flex", alignItems: "center", gap: 14, background: "#0d0f1a" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#6366f130", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700 }}>{activeLead.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{activeLead.name}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{activeLead.event} · Score {activeLead.score}</div>
          </div>
          <div style={{ background: "#22c55e15", border: "1px solid #22c55e30", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#22c55e", fontWeight: 600 }}>
            🤖 AI Online
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#334155", gap: 12, textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: 40 }}>🤖</div>
              <div style={{ fontSize: 14, color: "#475569" }}>Ask me anything about {activeLead.name.split(" ")[0]}</div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className="message" style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
              )}
              <div style={{ maxWidth: "70%" }}>
                <div style={{ background: msg.role === "user" ? "#6366f1" : "#1e2235", borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "10px 14px", fontSize: 13, color: msg.role === "user" ? "#fff" : "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {msg.text.split("**").map((part, j) =>
                    j % 2 === 1 ? <strong key={j} style={{ color: "#c4b5fd" }}>{part}</strong> : part
                  )}
                </div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 3, textAlign: msg.role === "user" ? "right" : "left" }}>{msg.time}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="message" style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>🤖</div>
              <div style={{ background: "#1e2235", borderRadius: "12px 12px 12px 4px", padding: "12px 16px", display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: `bounce 1s infinite`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div style={{ padding: "8px 24px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Analisis profil", "Siapkan skrip", "Produk terbaik?", "Waktu terbaik hubungi?"].map(chip => (
            <button key={chip} className="chip" onClick={() => setInput(chip)}
              style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #1e2235", background: "transparent", color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 24px 20px", display: "flex", gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder={`Tanya tentang ${activeLead.name.split(" ")[0]}...`}
            style={{ flex: 1, background: "#1e2235", border: "1px solid #2d3550", borderRadius: 10, padding: "11px 16px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s ease" }} />
          <button className="send-btn" onClick={sendMessage}
            style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", cursor: "pointer", fontSize: 18, transition: "all 0.2s ease" }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
