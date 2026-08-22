import type { CSSProperties } from "react";

export function HeroFragments() {
  return (
    <>
      {/* Fragment A — action toolbar over a selection (lower-left) */}
      <div
        className="hero-fragment left-[3%] bottom-24 w-[250px] p-3.5"
        style={{ "--frag-rotate": "-2deg" } as unknown as CSSProperties}
      >
        <p className="text-[13px] leading-[1.6] text-ink-body">
          …relies solely on an{" "}
          <span className="motif-selection">attention mechanism</span> to draw
          global dependencies…
        </p>
        <div className="mt-2.5 flex items-center gap-0.5 rounded-full border border-hairline bg-white pl-1 pr-2 py-1 shadow-sm">
          <span className="rounded-full bg-primary text-white text-[11px] font-medium px-2.5 py-1">
            Summarize
          </span>
          <span className="text-[11px] text-ink-mute px-2 py-1">Explain</span>
          <span className="text-[11px] text-ink-mute px-2 py-1">Action&nbsp;Items</span>
          <span className="text-[11px] text-ink-mute px-2 py-1">Copy</span>
        </div>
      </div>

      {/* Fragment B — live selection state (upper-right) */}
      <div
        className="hero-fragment right-[3%] top-32 w-[240px] p-3.5"
        style={{ "--frag-rotate": "2.5deg", animationDelay: "-2.5s" } as unknown as CSSProperties}
      >
        <p className="text-[13px] leading-[1.6] text-ink-body">
          Each head independently learns a distinct relational{" "}
          <span className="motif-selection">subspace</span>…
        </p>
        <div className="mt-2.5 flex items-end gap-1.5">
          <span className="inline-flex items-center h-5 px-2 rounded-full bg-primary text-white text-[11px] font-medium">
            Select any text
          </span>
          <span
            aria-hidden
            className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary mb-1"
          />
        </div>
      </div>

      {/* Fragment C — AI result card (lower-right) */}
      <div
        className="hero-fragment right-[5%] bottom-10 w-[280px] p-4"
        style={{ "--frag-rotate": "1deg", animationDelay: "-4.5s" } as unknown as CSSProperties}
      >
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-success-surface text-success text-[10px] font-medium">
            ✓
          </span>
          <span className="font-medium text-ink">Summarize</span>
          <span className="text-ink-ash">· Done</span>
        </div>
        <p className="mt-2 text-[14px] font-semibold tracking-[-0.01em] text-ink">
          Summary: Transformer Architecture
        </p>
        <ul className="mt-1.5 space-y-1 text-[12.5px] leading-[1.55] text-ink-body list-disc pl-4">
          <li>Replaces recurrence with parallel self-attention.</li>
          <li>Cuts training time on long sequences.</li>
        </ul>
      </div>
    </>
  );
}
