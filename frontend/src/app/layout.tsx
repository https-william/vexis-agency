import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vexis — AI Automation Agency",
  description: "Command center for 6 autonomous AI agents powering lead generation, sales, and operations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Figtree:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise antialiased">
        {/* Aurora mesh background */}
        <div className="aurora">
          <div className="aurora-orb aurora-1" />
          <div className="aurora-orb aurora-2" />
          <div className="aurora-orb aurora-3" />
        </div>
        <div className="relative z-10">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
