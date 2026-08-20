import { DemoStage } from "@/components/demo-stage";

export function Demo() {
  return (
    <section id="demo" className="py-16 sm:py-24 border-t border-hairline/60 bg-surface-1/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-center text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
            Select text or press Cmd+C anywhere. The explanation appears in place.
          </h2>
          <p className="text-sm text-ink-tertiary text-center mt-2">
            Three distinct modes tailored to how you read and take notes.
          </p>
        </div>

        <DemoStage />
      </div>
    </section>
  );
}