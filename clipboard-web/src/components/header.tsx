import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import { STORE_URL, GITHUB_URL } from "@/lib/constants";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Demo" },
  { href: "#privacy", label: "Architecture" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-canvas/80 backdrop-blur-md border-b border-hairline">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 flex items-center justify-between h-full">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-medium text-ink"
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
          <span className="hidden md:inline-flex ml-3 px-2 py-0.5 font-mono text-caption-sm text-mute bg-surface border border-hairline rounded-full tabular-nums">
            Extension v2.0 • MV3 Ready
          </span>
        </div>

        <nav
          className="hidden md:flex items-center gap-6 text-sm text-body"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="h-8 w-8 flex items-center justify-center text-mute hover:text-ink border border-hairline rounded-md hover:border-hairline-strong"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          <a
            href={STORE_URL}
            className="h-9 px-4 bg-primary hover:bg-primary-hover active:bg-primary-pressed active:scale-95 text-primary-fg text-sm font-medium rounded-md flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Add to Chrome
          </a>
        </div>
      </div>
    </header>
  );
}