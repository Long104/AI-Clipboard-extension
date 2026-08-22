import { MotionConfig } from "framer-motion";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { FeatureRows } from "@/components/feature-rows";
import { SidePanelDemo } from "@/components/side-panel-demo";
import { PrivacyStrip } from "@/components/privacy-strip";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen bg-canvas text-ink">
        <Header />
        <main className="relative">
          <Hero />
          <HowItWorks />
          <FeatureRows />
          <SidePanelDemo />
          <PrivacyStrip />
          <Faq />
          <FinalCta />
        </main>
      </div>
    </MotionConfig>
  );
}
