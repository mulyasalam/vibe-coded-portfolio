"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        unstyled: false,
        className:
          "!bg-ink !text-paper !border !border-ink !rounded-none !font-mono !uppercase !tracking-[0.18em] !text-[10.5px]",
      }}
    />
  );
}
