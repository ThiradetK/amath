import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A-Math Online - เกมต่อสมการคณิตศาสตร์ Multiplayer",
  description: "เกม A-Math ออนไลน์ Realtime 2-4 ผู้เล่น",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
