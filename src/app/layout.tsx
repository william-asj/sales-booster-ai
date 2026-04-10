import type { Metadata } from "next";
import "./globals.css";
import ChatOverlayPanel from "@/components/chatbot/ChatOverlayPanel";

export const metadata: Metadata = {
  title: "Sales Booster AI",
  description: "AI-powered insurance sales CRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#080a12" }}>
        {children}
        <ChatOverlayPanel />
      </body>
    </html>
  );
}