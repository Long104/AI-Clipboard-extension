import { DemoStage } from "@/components/demo-stage";

export function Demo() {
  return (
    <section id="demo" role="region" aria-label="Interactive demo" className="py-section max-w-[980px] mx-auto px-4 sm:px-6">
      <p className="text-[19px] md:text-[21px] leading-[1.47] tracking-[0.01em] text-body text-center max-w-[680px] mx-auto">
        Select text or press Cmd+C anywhere. The explanation appears in place.
      </p>
      <div className="mt-12 max-w-[720px] mx-auto">
        <DemoStage />
      </div>
    </section>
  );
}