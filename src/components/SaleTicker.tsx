const ITEMS = ['SEPT TERM BATCHES ARE LIVE', 'SALE IS LIVE'];

function TickerTrack() {
  const units = Array.from({ length: 8 }, (_, i) => ITEMS[i % ITEMS.length]);
  return (
    <div className="flex shrink-0 items-center gap-6 pr-6">
      {units.map((text, i) => (
        <span key={`${text}-${i}`} className="flex items-center gap-6">
          <span className="whitespace-nowrap">{text}</span>
          <span aria-hidden className="text-white/70">•</span>
        </span>
      ))}
    </div>
  );
}

export default function SaleTicker() {
  return (
    <div
      className="w-full bg-[#ef4444] text-white border-b-[3px] border-[#0b1120] overflow-hidden"
      role="status"
      aria-label="Sept term batches are live. Sale is live."
    >
      <div className="sale-ticker-track flex w-max items-center py-1.5 md:py-2 font-black text-[11px] md:text-xs tracking-widest uppercase">
        <TickerTrack />
        <TickerTrack />
      </div>
    </div>
  );
}
