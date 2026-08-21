import { DemoStage } from "@/components/demo-stage";

export function Demo() {
  return (
    <section id="demo" aria-label="Interactive demo" className="py-section max-w-[1240px] mx-auto px-4 sm:px-6">
      <h2 className="text-lg leading-[1.6] text-body text-center max-w-2xl mx-auto">
        Select text or press Cmd+C anywhere. The explanation appears in place.
      </h2>
      <div className="mt-10">
        <DemoStage />
      </div>
    </section>
  );
}