import { useState } from 'react';
import { Check, Copy, Tag } from 'lucide-react';

const CODE = 'GENZ5';

/** Slim promo bar shown on the home page: 5% off with code GENZ5 (tap to copy). */
export default function SaleTicker() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className="w-full text-white"
      style={{ background: 'linear-gradient(90deg,#312e81,#4f46e5 50%,#7c3aed)' }}
      role="status"
      aria-label={`Get 5 percent off any course with code ${CODE} at checkout`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-2 text-center text-[12px] font-semibold sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          Save 5% on any course — apply code
        </span>
        <button
          type="button"
          onClick={copy}
          title="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-amber-300/80 bg-white/10 px-2.5 py-0.5 font-black tracking-widest text-amber-200 transition-colors hover:bg-white/20 cursor-pointer"
        >
          {CODE}
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5 opacity-80" />}
        </button>
        <span className="text-indigo-100">at checkout{copied ? ' · copied!' : ''}</span>
      </div>
    </div>
  );
}
