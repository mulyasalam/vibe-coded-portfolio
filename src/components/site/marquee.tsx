import { tickerWords } from "@/lib/data";

export function Marquee() {
  const items = [...tickerWords, ...tickerWords, ...tickerWords];
  return (
    <div className="relative overflow-hidden border-y border-ink/20 bg-paper py-4 ticker-mask">
      <div className="flex w-max gap-12 animate-marquee whitespace-nowrap">
        {items.map((word, i) => (
          <span
            key={i}
            className="display italic text-[44px] sm:text-[56px] leading-none text-ink/85 flex items-center gap-12"
          >
            {word}
            <span className="text-accent text-[28px] not-italic font-mono">✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}
