import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Telnora N-ATLAS Kit",
  description:
    "Open-source SDK, React components and playground for building with N-ATLAS, Nigeria's open multilingual LLM.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <Link href="/" className="brand">Telnora N-ATLAS Kit</Link>
          <nav>
            <Link href="/playground">Playground</Link>
            <Link href="/docs">Docs</Link>
            <a href="https://huggingface.co/NCAIR1/N-ATLaS" target="_blank" rel="noreferrer">N-ATLaS model</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">
          Built by Telnora Technologies for the National AI Innovation Challenge. N-ATLaS is an initiative of the Federal Ministry of Communications, Innovation and Digital Economy, and powered by Awarri Technologies.
        </footer>
      </body>
    </html>
  );
}
