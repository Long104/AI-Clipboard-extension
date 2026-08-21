"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import { STORE_URL } from "@/lib/constants";
import { cn } from "@/lib/cn";

const navLinks = [
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
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 h-[52px] transition-none",
        scrolled
          ? "bg-[#FAFAF8]/85 backdrop-blur-md border-b border-hairline"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto max-w-[980px] px-4 sm:px-6 flex items-center justify-between h-full">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-ink"
            aria-label="AI Clipboard home"
          >
            <Image
              src="/icon.png"
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
            className="min-h-[44px] px-4 sm:px-5 rounded-md bg-primary hover:bg-primary-hover text-white text-[14px] font-medium transition-colors inline-flex items-center gap-2"
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