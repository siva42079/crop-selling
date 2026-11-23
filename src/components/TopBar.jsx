import { HELPLINE, SELLER_EMAIL } from '../data';

// Thin utility strip above the main header
export default function TopBar() {
  return (
    <div className="hidden bg-brand-900 text-[11px] font-medium text-brand-100 md:block">
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4">
        <nav className="flex items-center gap-4" aria-label="Business enquiries">
          <a href={`mailto:${SELLER_EMAIL}`} className="flex items-center gap-1.5 transition hover:text-white">
            <span aria-hidden="true">🏪</span> Sell on Farmers Products
          </a>
          <span className="text-brand-700" aria-hidden="true">|</span>
          <a href={`mailto:bulk@farmersproducts.in`} className="flex items-center gap-1.5 transition hover:text-white">
            <span aria-hidden="true">📦</span> Bulk Orders
          </a>
          <span className="text-brand-700" aria-hidden="true">|</span>
          <a href={`mailto:corporate@farmersproducts.in`} className="flex items-center gap-1.5 transition hover:text-white">
            <span aria-hidden="true">🏢</span> Corporate
          </a>
        </nav>
        <a
          href={`tel:${HELPLINE.replace(/-/g, '')}`}
          className="flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-0.5 text-[11px] font-extrabold text-amber-950 transition hover:bg-accent-400"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.4 2.7.6 4.1.6.7 0 1.3.6 1.3 1.3V20c0 .7-.6 1.3-1.3 1.3C10.4 21.3 2.7 13.6 2.7 4.6 2.7 3.9 3.3 3.3 4 3.3h3.2c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.8.6 4.1.1.4 0 .9-.2 1.2l-2.3 1z"/></svg>
          Helpline: {HELPLINE} (8 AM – 8 PM)
        </a>
      </div>
    </div>
  );
}
