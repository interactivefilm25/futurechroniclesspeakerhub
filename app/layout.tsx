import type { Metadata } from "next";
import localFont from "next/font/local";
import { site } from "./lib/content";
import "./globals.css";

// Self-hosted so the build never depends on a font CDN being reachable.
const display = localFont({
  src: "./fonts/Michroma-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: [
    { path: "./fonts/NotoSans-Regular.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/NotoSans-Italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Future Chronicles — Speaker Archive",
  description: site.heroSub,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
