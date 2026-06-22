import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muhammad Ahmad Sohail · Electrical & Electronic Engineer",
  description:
    "Interactive digital twin of a custom-designed multimeter. Power electronics, embedded systems and PCB design portfolio of Muhammad Ahmad Sohail. Follow a live voltage signal from input jack to LCD.",
  keywords: [
    "Electrical Engineer",
    "Power Electronics",
    "Embedded Systems",
    "PCB Design",
    "Altium Designer",
    "KiCad",
    "ATmega328",
    "Hardware Development",
  ],
  authors: [{ name: "Muhammad Ahmad Sohail" }],
  openGraph: {
    title: "Muhammad Ahmad Sohail · Electrical & Electronic Engineer",
    description:
      "Follow a voltage signal through a real multimeter PCB. An interactive engineering case study.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-ink text-paper">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
