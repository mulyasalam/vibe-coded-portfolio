"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono uppercase tracking-[0.18em] text-[11px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        solid:
          "bg-ink text-paper hover:bg-accent hover:text-paper px-5 py-3 border border-ink",
        outline:
          "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper px-5 py-3",
        ghost:
          "bg-transparent text-ink hover:text-accent px-2 py-2",
        accent:
          "bg-accent text-paper hover:bg-ink px-5 py-3 border border-accent hover:border-ink",
      },
      size: {
        default: "h-auto",
        sm: "px-3 py-2 text-[10px]",
        lg: "px-7 py-4 text-[12px]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "solid", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
