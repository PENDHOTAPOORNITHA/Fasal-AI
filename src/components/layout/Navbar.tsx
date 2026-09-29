"use client";

import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Container } from "@/components/ui/Container";

const links = [
  { href: "/scan", label: "AI Crop Scan" },
  { href: "/my-farm", label: "My Farm" },
  { href: "/farm-intelligence", label: "Farm Intelligence" },
  { href: "/assistant", label: "AI Assistant" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream">
      <Container className="flex h-16 items-center justify-between gap-4">
        <a href="/" className="shrink-0" aria-label="Fasal AI home">
          <Wordmark />
        </a>

        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Primary"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-forest/80 transition-colors hover:text-forest"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-muted"
            aria-label="Language selector"
          >
            EN
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <a
            href="/scan"
            className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-leaf"
          >
            Scan Your Crop
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </Container>

      {open && (
        <div className="border-t border-line bg-paper md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-forest"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <a
              href="/scan"
              className="mt-2 rounded-full bg-forest px-4 py-2.5 text-center text-sm font-medium text-cream"
              onClick={() => setOpen(false)}
            >
              Scan Your Crop
            </a>
          </Container>
        </div>
      )}
    </header>
  );
}