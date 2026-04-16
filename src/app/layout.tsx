import type { Metadata } from "next";
import "./globals.css";
import ChatOverlayPanel from "@/components/chatbot/ChatOverlayPanel";
import { ChatProvider } from "@/context/ChatContext";
import { LanguageProvider } from "@/context/LanguageContext";

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
      <body>
        <LanguageProvider>
          <ChatProvider>
            {children}
            <ChatOverlayPanel />
          </ChatProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}