"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const itemSpring = { stiffness: 480, damping: 34, mass: 0.9 } as const;

export interface BentoCardProps {
  title: string;
  description: string;
  visualElement: React.ReactNode;
  spanClass?: string;
  index?: number;
  elevated?: boolean;
}

export function BentoCard({
  title,
  description,
  visualElement,
  spanClass,
  index = 0,
  elevated = false,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ ...itemSpring, delay: index * 0.015 }}
      className={cn(
        "group rounded-lg border border-hairline hover:border-hairline-strong transition-none p-6 flex flex-col justify-between overflow-hidden",
        elevated ? "bg-surface-elevated" : "bg-surface",
        spanClass,
      )}
    >
      <div>
        <h3 className="text-xl font-medium leading-[1.4] tracking-[0.2px] text-ink mb-3">
          {title}
        </h3>
        <p className="text-sm leading-[1.6] text-mute">{description}</p>
      </div>
      <div className="mt-6">{visualElement}</div>
    </motion.div>
  );
}
