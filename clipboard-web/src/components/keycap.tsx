import * as React from "react";
import { cn } from "@/lib/cn";

export interface KeycapProps {
  children: React.ReactNode;
  className?: string;
}

export function Keycap({ children, className }: KeycapProps) {
  return (
    <div
      className={cn(
        "inline-flex h-[20px] min-w-[20px] items-center justify-center whitespace-nowrap rounded-xs border border-hairline bg-gradient-to-b from-keycap-start to-keycap-end px-1.5 py-px font-mono text-caption-md leading-none text-body",
        className,
      )}
    >
      {children}
    </div>
  );
}
