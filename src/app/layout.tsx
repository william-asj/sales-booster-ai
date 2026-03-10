import type { Metadata } from "next";
import "./globals.css";

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
      <body style={{ margin: 0, background: "#080a12" }}>{children}</body>
    </html>
  );
}