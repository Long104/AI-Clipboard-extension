import * as React from "react";
import { cn } from "@/lib/cn";

export interface BentoCardProps {
  title: string;
  description: string;
  visualElement: React.ReactNode;
  spanClass?: string;
  index?: number;
}

export function BentoCard({ title, description, visualElement, spanClass, index }: BentoCardProps) {
  const colors = [
    "border-lime/20 bg-lime/5",
    "border-semantic-blue/20 bg-semantic-blue/5",
    "border-semantic-amber/20 bg-semantic-amber/5",
    "border-semantic-green/20 bg-semantic-green/5",
    "border-semantic-red/20 bg-semantic-red/5",
  ];
  const color = colors[index ?? 0];

  return (
    <div className={cn(
      "group relative bg-surface-card border border-hairline rounded-xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-1",
      spanClass,
      color,
    )}>
      <div>
        <h3 className="text-xl font-semibold text-ink-primary tracking-tight mb-3">
          {title}
        </h3>
        <p className="text-sm text-ink-secondary leading-relaxed">
          {description}
        </p>
      </div>
      <div className="mt-6">
        {visualElement}
      </div>
    </div>
  );
}