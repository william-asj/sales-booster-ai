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

// ─── Inline renderer: bold + code ───────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "#e2e8f0", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} style={{ background: "#1e2235", color: "#a78bfa", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

// ─── Claude-style AI message renderer ───────────────────────────────────────
function AIMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.8, fontFamily: "inherit" }}>
      {lines.map((line, i) => {
        if (line.startsWith("## "))
          return <div key={i} style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginTop: 16, marginBottom: 6 }}>{line.replace("## ", "")}</div>;
        if (line.startsWith("# "))
          return <div key={i} style={{ fontWeight: 700, fontSize: 17, color: "#e2e8f0", marginTop: 16, marginBottom: 8 }}>{line.replace("# ", "")}</div>;
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 4, alignItems: "flex-start" }}>
              <span style={{ color: "#6366f1", flexShrink: 0, fontSize: 18, lineHeight: 1.4 }}>·</span>
              <span>{renderInline(line.replace(/^[-•]\s/, ""))}</span>
            </div>
          );
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\./)?.[1];
          return (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 4, alignItems: "flex-start" }}>
              <span style={{ color: "#6366f1", fontWeight: 700, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{num}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }
        if (line === "---")
          return <hr key={i} style={{ border: "none", borderTop: "1px solid #1e2235", margin: "12px 0" }} />;
        if (line.trim() === "")
          return <div key={i} style={{ height: 8 }} />;
        return <div key={i} style={{ marginBottom: 2 }}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

// ─── Mock AI reply generator ─────────────────────────────────────────────────
function getAIReply(lead: Lead, question: string): string {
  const q = question.toLowerCase();
  if (q.includes("skrip") || q.includes("script")) {
    return `Berikut skrip panggilan untuk **${lead.name}**:\n\n---\n\n**Pembuka:**\n"Selamat pagi, Pak/Bu ${lead.name.split(" ")[0]}. Saya dari tim SalesBooster Insurance. Apakah ini waktu yang tepat?"\n\n**Identifikasi kebutuhan:**\n"Kami melihat Anda baru saja ${lead.event.toLowerCase()}. Ini momen penting untuk memastikan perlindungan finansial keluarga."\n\n**Rekomendasi:**\n"Saya merekomendasikan **${lead.product}** dengan manfaat:\n- Perlindungan komprehensif\n- Premium terjangkau ${lead.premium}\n- Klaim mudah & cepat"\n\n**Penutup:**\n"Apakah Anda tertarik? Saya bisa kirimkan ilustrasi lengkapnya."`;
  }
  if (q.includes("analisis") || q.includes("profil")) {
    return `## Analisis Profil — ${lead.name}\n\n**AI Score:** ${lead.score}/100 (${lead.scoreLabel} Priority)\n\n**Life Event Terdeteksi:**\n${lead.event} — momen kritis untuk pendekatan penjualan.\n\n**Rekomendasi Produk:**\n**${lead.product}** dengan estimasi premium ${lead.premium}\n\n**Strategi Pendekatan:**\n- Hubungi via WhatsApp sebelum telepon\n- Waktu terbaik: Selasa–Kamis pukul 09.00–11.00\n- Fokus pada manfaat proteksi, bukan harga\n\n**Estimasi Konversi:** ${lead.score > 80 ? "Tinggi (>70%)" : lead.score > 60 ? "Sedang (40–70%)" : "Rendah (<40%)"}`;
  }
  if (q.includes("produk") || q.includes("rekomendasi")) {
    return `Berdasarkan profil **${lead.name}**, berikut rekomendasi produk:\n\n## ${lead.product}\n\n- **Premium:** ${lead.premium}\n- **Alasan:** Cocok untuk kondisi "${lead.event}"\n- **AI Match Score:** ${lead.score}%\n\n**Kenapa produk ini?**\nPelanggan dengan life event "${lead.event}" memiliki kebutuhan perlindungan yang meningkat. Produk ini memberikan coverage optimal sesuai profil.\n\nApakah Anda ingin saya siapkan skrip panggilan?`;
  }
  if (q.includes("waktu") || q.includes("hubungi")) {
    return `**Waktu terbaik menghubungi ${lead.name.split(" ")[0]}:**\n\n- **Hari:** Selasa, Rabu, atau Kamis\n- **Jam:** 09.00–11.00 atau 14.00–16.00\n- **Channel:** WhatsApp dulu, baru telepon jika tidak direspons dalam 2 jam\n\n**Tips:**\nSebutkan life event mereka ("${lead.event}") di awal percakapan untuk membangun relevansi.`;
  }
  return `Berdasarkan data **${lead.name}** (Score: ${lead.score}, ${lead.event}):\n\nRekomendasi utama adalah **${lead.product}** dengan premium ${lead.premium}.\n\nAnda bisa tanyakan lebih lanjut tentang:\n- Analisis profil lengkap\n- Skrip panggilan\n- Rekomendasi produk\n- Waktu terbaik hubungi`;
}

// ─── Main Component ──────────────────────────────────────────────────────────
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
    const question = input;
    setMessages(prev => [...prev, { role: "user", text: question, time: now() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "assistant", text: getAIReply(activeLead, question), time: now() }]);
    }, 1500);
  };

  return (
    <div className="page-content" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Lead list */}
      <div style={{ width: 260, background: "#0d0f1a", borderRight: "1px solid #1e2235", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1e2235" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Chat History</div>
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

      {/* Chat main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e2235", display: "flex", alignItems: "center", gap: 14, background: "#0d0f1a" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#6366f130", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700 }}>{activeLead.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{activeLead.name}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{activeLead.event} · Score {activeLead.score}</div>
          </div>
          <div style={{ background: "#22c55e15", border: "1px solid #22c55e30", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#22c55e", fontWeight: 600 }}>🤖 AI Online</div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: 40 }}>🤖</div>
              <div style={{ fontSize: 14, color: "#475569" }}>Ask me anything about {activeLead.name.split(" ")[0]}</div>
              <div style={{ fontSize: 12, color: "#334155" }}>Try: "Analisis profil" or "Siapkan skrip"</div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="message">
              {msg.role === "user" ? (
                // User — right-aligned bubble
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "65%" }}>
                    <div style={{ background: "#6366f1", borderRadius: "12px 12px 4px 12px", padding: "10px 14px", fontSize: 13, color: "#fff", lineHeight: 1.6 }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: 10, color: "#334155", marginTop: 3, textAlign: "right" }}>{msg.time}</div>
                  </div>
                </div>
              ) : (
                // AI — Claude-style, no bubble, full width
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2 }}>🤖</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, fontWeight: 600 }}>AI Sales Assistant · {msg.time}</div>
                    <AIMessage text={msg.text} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="message" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🤖</div>
              <div style={{ paddingTop: 8, display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: `bounce 1s infinite`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        <div style={{ padding: "8px 28px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Analisis profil", "Siapkan skrip", "Produk terbaik?", "Waktu terbaik hubungi?"].map(chip => (
            <button key={chip} className="chip" onClick={() => setInput(chip)}
              style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #1e2235", background: "transparent", color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 28px 20px", display: "flex", gap: 10 }}>
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