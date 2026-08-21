"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface BentoCardProps {
  title: string;
  description: string;
  visualElement: React.ReactNode;
  index: number;
  layout: "left" | "right" | "center";
}

export function FeatureRow({
  title,
  description,
  visualElement,
  index,
  layout,
}: BentoCardProps) {
  const isCenter = layout === "center";
  const isLeft = layout === "left";

  const motionDelay = isCenter ? 0 : 0.06 * (index % 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: motionDelay }}
    >
      {isCenter ? (
        <div className="flex flex-col items-center text-center max-w-[720px] mx-auto">
          <h2 className="text-[24px] md:text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
            {title}
          </h2>
          <p className="mt-3 text-[19px] md:text-[21px] leading-[1.47] tracking-[0.01em] text-body">
            {description}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className={
            cn(
              "md:col-span-5",
              isLeft ? "md:order-first" : "md:order-last"
            )
          }>
            <h2 className="text-[24px] md:text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
              {title}
            </h2>
            <p className="mt-3 text-[19px] md:text-[21px] leading-[1.47] tracking-[0.01em] text-body">
              {description}
            </p>
          </div>
          <div className="md:col-span-7">
            {visualElement}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export { FeatureRow as BentoCard };


