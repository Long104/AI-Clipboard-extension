import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Demo } from "@/components/demo";
import { BentoGrid } from "@/components/bento-grid";
import { Privacy } from "@/components/privacy";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-canvas text-ink-primary">
      <Header />
      <main className="relative">
        <Hero />
        <Demo />
        <BentoGrid />
        <Privacy />
        <Faq />
        <FinalCta />
      </main>
    </div>
  );
}