import { CATEGORIES, BRANDS, formatPrice } from '../data';

/**
 * Reusable filter sidebar for the listing page.
 * All state lives in the parent (Listing) — this component is controlled.
 */
export default function FilterPanel({ filters, onChange, onClear, resultCount }) {
  const { category, brands, minPrice, maxPrice, minRating, minDiscount } = filters;

  const toggleBrand = (slug) =>
    onChange({ ...filters, brands: brands.includes(slug) ? brands.filter((b) => b !== slug) : [...brands, slug] });

  const sectionTitle = 'text-[11px] font-extrabold uppercase tracking-widest text-stone-500 dark:text-stone-400';
  const radioRow = (checked) =>
    `flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium transition ${checked ? 'bg-brand-50 text-brand-900 dark:bg-stone-800 dark:text-brand-200' : 'text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800/60'}`;

  return (
    <aside aria-label="Product filters" className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-stone-900 dark:text-white">Filters</h2>
        <button type="button" onClick={onClear} className="text-xs font-bold text-brand-800 underline-offset-2 hover:underline dark:text-brand-300">Clear all</button>
      </div>
      <p className="mt-0.5 text-[11px] text-stone-400" aria-live="polite">{resultCount} product{resultCount === 1 ? '' : 's'} match</p>

      {/* Category */}
      <fieldset className="mt-4">
        <legend className={sectionTitle}>Category</legend>
        <div className="mt-1.5 max-h-44 space-y-0.5 overflow-y-auto">
          <label className={radioRow(!category)}>
            <input type="radio" name="category" className="accent-green-700" checked={!category} onChange={() => onChange({ ...filters, category: '' })} /> All categories
          </label>
          {CATEGORIES.filter((c) => c.slug !== 'blogs').map((cat) => (
            <label key={cat.slug} className={radioRow(category === cat.slug)}>
              <input type="radio" name="category" className="accent-green-700" checked={category === cat.slug} onChange={() => onChange({ ...filters, category: cat.slug })} />
              <span className="truncate">{cat.icon} {cat.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Brand */}
      <fieldset className="mt-4">
        <legend className={sectionTitle}>Brand</legend>
        <div className="mt-1.5 max-h-44 space-y-0.5 overflow-y-auto">
          {BRANDS.map((brand) => (
            <label key={brand.slug} className={radioRow(brands.includes(brand.slug))}>
              <input type="checkbox" className="accent-green-700" checked={brands.includes(brand.slug)} onChange={() => toggleBrand(brand.slug)} />
              {brand.name}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Price range */}
      <fieldset className="mt-4">
        <legend className={sectionTitle}>Price range</legend>
        <div className="mt-1.5 flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">Minimum price</span>
            <input type="number" min={0} inputMode="numeric" placeholder="₹ Min" value={minPrice} onChange={(e) => onChange({ ...filters, minPrice: e.target.value })} className="h-10 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100" />
          </label>
          <span className="text-stone-400" aria-hidden="true">–</span>
          <label className="flex-1">
            <span className="sr-only">Maximum price</span>
            <input type="number" min={0} inputMode="numeric" placeholder="₹ Max" value={maxPrice} onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })} className="h-10 w-full rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100" />
          </label>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {[[0, 500], [500, 1000], [1000, 5000], [5000, '']].map(([lo, hi]) => (
            <button key={`${lo}-${hi}`} type="button" onClick={() => onChange({ ...filters, minPrice: String(lo || ''), maxPrice: hi === '' ? '' : String(hi) })} className="rounded-full border border-stone-200 px-2.5 py-1 text-[10px] font-bold text-stone-500 transition hover:border-brand-500 hover:text-brand-800 dark:border-stone-700 dark:text-stone-400">
              {lo === 0 && hi !== '' ? `Under ${formatPrice(hi)}` : hi === '' ? `${formatPrice(lo)}+` : `${formatPrice(lo)}–${formatPrice(hi)}`}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Rating */}
      <fieldset className="mt-4">
        <legend className={sectionTitle}>Customer rating</legend>
        <div className="mt-1.5 space-y-0.5">
          {[[0, 'All ratings'], [4, '4★ & above'], [3, '3★ & above']].map(([value, label]) => (
            <label key={value} className={radioRow(Number(minRating) === value)}>
              <input type="radio" name="min-rating" className="accent-green-700" checked={Number(minRating) === value} onChange={() => onChange({ ...filters, minRating: value })} /> {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Discount */}
      <fieldset className="mt-4">
        <legend className={sectionTitle}>Discount</legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {[0, 10, 20, 40].map((d) => (
            <button key={d} type="button" aria-pressed={Number(minDiscount) === d} onClick={() => onChange({ ...filters, minDiscount: d })} className={`rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${Number(minDiscount) === d ? 'border-brand-700 bg-brand-700 text-white' : 'border-stone-200 text-stone-600 hover:border-brand-500 dark:border-stone-700 dark:text-stone-300'}`}>
              {d === 0 ? 'All' : `${d}%+`}
            </button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
