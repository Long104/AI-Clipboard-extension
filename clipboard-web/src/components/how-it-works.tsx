import { Keycap } from "@/components/keycap";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-section">
      <div className="mx-auto max-w-[880px] px-6">
        <h2 className="font-display font-bold tracking-[-0.03em] text-[2rem] sm:text-[2.25rem] leading-[1.15] text-ink">
          How it works
        </h2>

        <div className="mt-12 sm:mt-16">
          {/* Step 1 */}
          <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-10 sm:py-12 border-t border-hairline">
            <span className="font-display font-extrabold text-[3.5rem] sm:text-[4.5rem] leading-none text-ink-stone select-none">
              01
            </span>
            <div>
              <h3 className="font-display font-bold tracking-[-0.02em] text-[1.375rem] sm:text-[1.5rem] leading-[1.25] text-ink">
                Select anything
              </h3>
              <p className="mt-3 text-[15px] sm:text-base leading-[1.6] text-ink-body max-w-[52ch]">
                Highlights trigger a lightweight floating card right next to your selection. Read the takeaway without losing your place.{" "}
                Press <Keycap>⌘C</Keycap> to send it to your clipboard history instead.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-10 sm:py-12 border-t border-hairline">
            <span className="font-display font-extrabold text-[3.5rem] sm:text-[4.5rem] leading-none text-ink-stone select-none">
              02
            </span>
            <div>
              <h3 className="font-display font-bold tracking-[-0.02em] text-[1.375rem] sm:text-[1.5rem] leading-[1.25] text-ink">
                Get the answer in place
              </h3>
              <p className="mt-3 text-[15px] sm:text-base leading-[1.6] text-ink-body max-w-[52ch]">
                Recalls recent clips automatically. Run one-click explain or summarize actions directly from the copy toast.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-10 sm:py-12 border-t border-hairline">
            <span className="font-display font-extrabold text-[3.5rem] sm:text-[4.5rem] leading-none text-ink-stone select-none">
              03
            </span>
            <div>
              <h3 className="font-display font-bold tracking-[-0.02em] text-[1.375rem] sm:text-[1.5rem] leading-[1.25] text-ink">
                Go deeper without leaving
              </h3>
              <p className="mt-3 text-[15px] sm:text-base leading-[1.6] text-ink-body max-w-[52ch]">
                Hit <Keycap>⌥C</Keycap> to slide out a persistent chat. Ask follow-up questions about selected text without leaving your active tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
