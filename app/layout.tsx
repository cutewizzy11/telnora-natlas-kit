import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["opsz"] });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Telnora N-ATLAS Kit",
  description:
    "Open-source SDKs, React components and a playground for building with N-ATLAS, Nigeria's open multilingual LLM.",
};

function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="#1c2470" stroke="#14163a" strokeWidth="2" />
      <path d="M16 5 19 13 27 16 19 19 16 27 13 19 5 16 13 13Z" fill="#e8a317" />
      <circle cx="16" cy="16" r="2.4" fill="#1c2470" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <header className="nav">
          <Link href="/" className="brand">
            <Mark /> Telnora <small>N-ATLAS Kit</small>
          </Link>
          <nav>
            <Link href="/playground">Playground</Link>
            <Link href="/tutor">Tutor demo</Link>
            <Link href="/docs">Docs</Link>
            <a href="https://github.com/cutewizzy11/telnora-natlas-kit" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <p>
            Built by Telnora Technologies (Abuja) for the National AI Innovation Challenge. N-ATLaS is an initiative of
            the Federal Ministry of Communications, Innovation and Digital Economy, and powered by Awarri Technologies.
          </p>
        </footer>
      </body>
    </html>
  );
}
