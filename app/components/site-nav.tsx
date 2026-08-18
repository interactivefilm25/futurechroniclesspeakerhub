"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "../lib/content";

export function SiteNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <span className="brand-line1">{site.brandLine1}</span>
          <span className="brand-line2">{site.brandLine2}</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/" aria-current={isHome ? "page" : undefined}>
            Archive
          </Link>
          <Link href="/#themes">Programme</Link>
          <a href="https://www.futurechronicles.org" target="_blank" rel="noopener">
            futurechronicles.org ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
