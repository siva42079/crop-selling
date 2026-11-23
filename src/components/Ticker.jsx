import { TRUST_ITEMS } from '../data';

/** Green scrolling trust ticker — pauses on hover, duplicated for a seamless loop */
export default function Ticker() {
  const phrase = TRUST_ITEMS.map((t) => `${t}`).join('  •  ');
  const segment = `  ${phrase}  •  `;
  const repeated = segment.repeat(6);
  return (
    <div className="overflow-hidden bg-brand-800 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-100" role="marquee" aria-label="100% Support, Trust, Quality, Knowledge">
      <div className="animate-ticker" aria-hidden="true">
        <span className="pr-4">{repeated}</span>
        <span className="pr-4">{repeated}</span>
      </div>
    </div>
  );
}
