"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import { STORE_URL } from "@/lib/constants";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "#playground", label: "Try it live" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#privacy", label: "Privacy" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4">
      <div
        className={cn(
          "mx-auto max-w-[920px] h-[56px] rounded-full border backdrop-blur-md flex items-center justify-between px-5 sm:px-6 transition-shadow duration-300",
          scrolled
            ? "bg-[#FAFAF8]/85 border-black/[0.08] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)]"
            : "bg-[#FAFAF8]/60 border-black/[0.06] shadow-[0_2px_10px_-6px_rgba(0,0,0,0.06)]"
        )}
      >
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-ink"
            aria-label="AI Clipboard home"
          >
            <Image
              src="/logo.png"
              alt=""
              width={24}
              height={24}
              className="rounded-md"
            />
            AI Clipboard
          </Link>
        </div>

        <nav
          className="hidden md:flex items-center gap-6"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="min-h-[44px] flex items-center text-[15px] text-ink-mute hover:text-ink transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center">
          <a
            href={STORE_URL}
            className="min-h-[40px] px-5 sm:px-6 rounded-full bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-colors inline-flex items-center gap-2 shadow-[0_6px_16px_-6px_rgba(37,99,235,0.5)]"
          >
            <Download className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline-flex">Add to Chrome — Free</span>
            <span className="sm:hidden">Install</span>
          </a>
        </div>
      </div>
    </header>
  );
}
