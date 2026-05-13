import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "來新當鋪客戶審核後台",
  description: "Laixin Pawn Admin Console"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}
