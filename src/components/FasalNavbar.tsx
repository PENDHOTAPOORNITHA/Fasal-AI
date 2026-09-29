"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import "./FasalNavbar.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/my-farm", label: "My Farm" },
  { href: "/crops", label: "My Crops" },
  { href: "/calendar", label: "Calendar" },
  { href: "/weather", label: "Weather" },
  { href: "/farm-intelligence", label: "Intelligence" },
  { href: "/farm-economics", label: "Economics" },
  { href: "/assistant", label: "AI Assistant" },
];

export default function FasalNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="fasal-navbar">
      <div className="fasal-navbar-inner">
        <Link
          href="/"
          className="fasal-navbar-brand"
          onClick={() => setMenuOpen(false)}
        >
          <div className="fasal-navbar-logo-mark">✦</div>

          <span>
            Fasal<span className="fasal-navbar-logo-ai">AI</span>
          </span>
        </Link>

        <nav className="fasal-navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive(link.href)
                  ? "fasal-navbar-link active"
                  : "fasal-navbar-link"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="fasal-navbar-actions">
          <Link href="/scan" className="fasal-navbar-scan">
            Scan Crop
            <ArrowRight size={15} />
          </Link>

          <button
            type="button"
            className="fasal-navbar-menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fasal-navbar-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive(link.href)
                  ? "fasal-navbar-mobile-link active"
                  : "fasal-navbar-mobile-link"
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/scan"
            className="fasal-navbar-mobile-scan"
            onClick={() => setMenuOpen(false)}
          >
            Scan Your Crop
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </header>
  );
}