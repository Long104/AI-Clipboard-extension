import Link from "next/link";
import { Download } from "lucide-react";
import { STORE_URL, GITHUB_URL, PRIVACY_URL } from "@/lib/constants";

const footerLinks = [
  { label: "Product", href: "#features" },
  { label: "Extension Features", href: "#features" },
  { label: "Privacy Policy", href: PRIVACY_URL },
  { label: "GitHub Repository", href: GITHUB_URL, external: true },
  {
    label: "Cloudflare Workers AI",
    href: "https://workers.cloudflare.com",
    external: true,
  },
  { label: "Chrome Web Store", href: STORE_URL },
];

export function FinalCta() {
  return (
    <>
      <section id="cta" aria-label="Get the extension" className="py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <h2 className="text-[32px] sm:text-[56px] font-medium leading-[1.17] tracking-[0.2px] text-ink">
            Stop switching tabs to explain text.
          </h2>
          <a
            href={STORE_URL}
            className="mt-8 h-11 px-7 bg-primary hover:bg-primary-hover active:bg-primary-pressed active:scale-95 text-primary-fg font-medium rounded-full text-sm mx-auto flex items-center justify-center gap-2 w-fit"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Add to Chrome — It&apos;s Free
          </a>
        </div>
      </section>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-16">
          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3">
            {footerLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-mute hover:text-ink"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-mute hover:text-ink"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <div className="mt-10 pt-6 border-t border-hairline-soft flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink">AI Clipboard</span>
            <span className="font-mono text-caption-sm text-mute">
              © 2026 AI Clipboard • MIT License • Built for Chrome MV3
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
