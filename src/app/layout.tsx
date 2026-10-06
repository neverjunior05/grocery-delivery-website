import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreshHarvest Express — Farm Fresh Grocery Delivery & Live Tracking",
  description:
    "Fast, low-friction grocery platform. Select delivery windows, track live packing & courier milestones, with stock-aware checkout and 1-click reorder.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-zinc-50 text-zinc-900 antialiased font-['Inter',sans-serif]">
        {children}
      </body>
    </html>
  );
}
