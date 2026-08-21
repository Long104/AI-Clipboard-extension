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
      <section id="cta" aria-label="Get the extension" className="py-section">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <h2 className="text-[32px] md:text-[40px] lg:text-[48px] font-normal leading-[1.08] tracking-[-0.03em] text-ink text-center">
            Stop switching tabs to explain text.
          </h2>
          <a
            href={STORE_URL}
            className="mt-8 h-11 px-[22px] bg-primary hover:bg-primary-hover active:bg-primary-pressed hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 ease-out text-primary-fg text-[15px] font-medium tracking-[-0.01em] rounded-full mx-auto flex items-center justify-center gap-2 w-fit"
          >
            <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Add to Chrome — It&apos;s Free
          </a>
        </div>
      </section>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-[980px] px-4 sm:px-6 py-16">
          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3">
            {footerLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] text-mute hover:text-ink"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[15px] text-mute hover:text-ink"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[15px] font-semibold text-ink">AI Clipboard</span>
            <span className="text-[15px] text-mute">
              © 2026 AI Clipboard • MIT License • Built for Chrome MV3
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
