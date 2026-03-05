import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vexis — AI Automation Agency",
  description:
    "Command center for 6 autonomous AI agents. Lead generation, sales automation, and business operations at scale.",
  keywords: ["AI agency", "automation", "lead generation", "sales AI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise antialiased">
        {/* Ambient gradient orbs */}
        <div className="orb orb-gold" />
        <div className="orb orb-cyan" />

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
