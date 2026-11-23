import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CATEGORIES } from '../data';

/**
 * Desktop: hover / focus-within dropdown nav.
 * Mobile: collapsible panel rendered under the header (toggled from the hamburger).
 */
export default function CategoryMenu({ mobileOpen = false, onCloseMobile = () => {} }) {
  const navigate = useNavigate();
  const [openSlug, setOpenSlug] = useState(null);

  return (
    <>
      {/* ── Desktop nav ── */}
      <nav aria-label="Product categories" className="relative hidden border-b border-brand-100 bg-white dark:border-stone-800 dark:bg-stone-950 lg:block">
        <ul className="mx-auto flex max-w-7xl items-stretch justify-between px-4">
          {CATEGORIES.map((cat) => (
            <li
              key={cat.slug}
              className="group static"
              onMouseEnter={() => setOpenSlug(cat.slug)}
              onMouseLeave={() => setOpenSlug(null)}
            >
              <button
                type="button"
                aria-expanded={openSlug === cat.slug}
                aria-haspopup="true"
                onClick={() => navigate(`/shop?category=${cat.slug}`)}
                onFocus={() => setOpenSlug(cat.slug)}
                className="flex h-12 items-center gap-1.5 border-b-2 border-transparent px-3 text-[13px] font-bold text-stone-700 transition hover:border-brand-600 hover:text-brand-800 focus:border-brand-600 focus:text-brand-800 dark:text-stone-200 dark:hover:text-brand-300"
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.name}
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path strokeLinecap="round" d="M6 9l6 6 6-6"/></svg>
              </button>

              {/* Dropdown panel */}
              <div
                role="region"
                aria-label={`${cat.name} subcategories`}
                className={`absolute left-0 right-0 top-full z-40 border-b border-brand-100 bg-white shadow-[var(--shadow-lift)] transition-all duration-150 dark:border-stone-800 dark:bg-stone-900 ${openSlug === cat.slug ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}
              >
                <div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 px-6 py-5">
                  <div className="rounded-2xl bg-brand-50 p-4 dark:bg-stone-800">
                    <p className="text-2xl" aria-hidden="true">{cat.icon}</p>
                    <p className="mt-1 font-extrabold text-brand-900 dark:text-brand-200">{cat.name}</p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{cat.blurb}</p>
                    <Link to={`/shop?category=${cat.slug}`} onClick={() => setOpenSlug(null)} className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-brand-800 hover:underline dark:text-brand-300">View all {cat.name} →</Link>
                  </div>
                  <ul className="col-span-3 grid grid-cols-3 gap-1 self-start">
                    {cat.subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          to={`/shop?category=${cat.slug}&q=${encodeURIComponent(sub)}`}
                          onClick={() => setOpenSlug(null)}
                          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-brand-50 hover:text-brand-900 dark:text-stone-200 dark:hover:bg-stone-800"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Mobile panel ── */}
      {mobileOpen && (
        <div id="mobile-category-panel" className="max-h-[70vh] overflow-y-auto border-b border-brand-100 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-950 lg:hidden">
          <ul className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/shop?category=${cat.slug}`}
                  onClick={onCloseMobile}
                  className="flex items-center gap-2 rounded-2xl border border-stone-200 p-3 text-sm font-bold text-stone-800 transition active:scale-95 dark:border-stone-800 dark:text-stone-100"
                >
                  <span className="text-xl" aria-hidden="true">{cat.icon}</span>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/track" onClick={onCloseMobile} className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-900 dark:bg-stone-900 dark:text-brand-200">📦 Track my order</Link>
        </div>
      )}
    </>
  );
}
