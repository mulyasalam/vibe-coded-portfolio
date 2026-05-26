import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "ink" | "accent";
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  const tones = {
    default: "bg-transparent text-ink border border-ink/30",
    ink: "bg-ink text-paper border border-ink",
    accent: "bg-accent/10 text-accent border border-accent/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-[3px] mono-label !text-[9.5px] !tracking-[0.2em] leading-none",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
