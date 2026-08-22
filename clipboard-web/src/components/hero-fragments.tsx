import type { CSSProperties } from "react";

export function HeroFragments() {
  return (
    <>
      {/* Fragment A — action toolbar over a selection (lower-left, dominant)
          Left edge deliberately crops past the fold: the document continues
          off-canvas, like a real screenshot rather than a centered card. */}
      <div
        className="hero-fragment hero-fragment--near -left-4 lg:left-6 bottom-6 w-[340px] p-4"
        style={
          {
            "--frag-rotate": "-1.5deg",
            "--float-dur": "7.5s",
          } as unknown as CSSProperties
        }
      >
        <p className="text-[13.5px] leading-[1.65] text-ink-body">
          The Transformer eschews recurrence entirely and relies solely on an{" "}
          <span className="motif-selection">attention mechanism</span> to draw
          global dependencies between input and output…
        </p>
        <div className="mt-3 flex items-center gap-1 rounded-full border border-hairline bg-white pl-1 pr-2.5 py-1 shadow-[var(--shadow-popover)]">
          <span className="rounded-full bg-primary text-white text-[12px] font-medium px-3 py-1.5">
            Summarize
          </span>
          <span className="text-[12px] text-ink-mute px-2 py-1.5">Explain</span>
          <span className="text-[12px] text-ink-mute px-2 py-1.5">Action&nbsp;Items</span>
          <span className="text-[12px] text-ink-mute px-2 py-1.5">Copy</span>
        </div>
      </div>

      {/* Fragment B — live selection state (upper-right, supporting) */}
      <div
        className="hero-fragment right-[4%] top-36 w-[270px] p-4"
        style={
          {
            "--frag-rotate": "1.25deg",
            "--float-dur": "9s",
            animationDelay: "-3s",
          } as unknown as CSSProperties
        }
      >
        <p className="text-[13.5px] leading-[1.65] text-ink-body">
          Each head independently learns a distinct relational{" "}
          <span className="motif-selection">subspace</span>…
        </p>
        <div className="mt-3 flex items-end gap-1.5">
          <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-primary text-white text-[12px] font-medium">
            Select any text
          </span>
          <span
            aria-hidden
            className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[7px] border-l-transparent border-r-transparent border-t-primary mb-1.5"
          />
        </div>
      </div>

      {/* Fragment C — AI result card (lower-right, supporting) */}
      <div
        className="hero-fragment right-[6%] bottom-3 w-[310px] p-4"
        style={
          {
            "--frag-rotate": "-0.5deg",
            "--float-dur": "6.5s",
            animationDelay: "-1.8s",
          } as unknown as CSSProperties
        }
      >
        <div className="flex items-center gap-2 font-mono text-[11.5px] text-ink-mute">
          <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-success-surface text-success text-[11px] font-medium">
            ✓
          </span>
          <span className="text-ink">summarize</span>
          <span>· done</span>
          <span className="ml-auto text-ink-ash">just now</span>
        </div>
        <p className="mt-2.5 text-[15px] font-semibold tracking-[-0.01em] text-ink leading-snug">
          Summary: Transformer Architecture
        </p>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-[1.55] text-ink-body list-disc pl-4">
          <li>Replaces recurrence with parallel self-attention.</li>
          <li>Cuts training time on long sequences.</li>
        </ul>
      </div>
    </>
  );
}
