import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FilterPanel from '../components/FilterPanel';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { PRODUCTS, getBrand, getCategory } from '../data';

const PAGE_SIZE = 12;

const DEFAULT_FILTERS = { category: '', brands: [], minPrice: '', maxPrice: '', minRating: 0, minDiscount: 0 };

// Token match with plural tolerance — "insecticides" matches tag "insecticide"
function matchesQuery(product, q) {
  const haystack = [
    product.name,
    getBrand(product.brand)?.name || '',
    getCategory(product.category)?.name || '',
    product.tags.join(' '),
    product.crop || '',
  ].join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((token) => {
    const t = token.replace(/s$/, '');
    return haystack.includes(token) || (t.length > 2 && haystack.includes(t));
  });
}

/** Product listing: filters, sorting, search, pagination — 12 per page */
export default function Listing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState('popularity');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile filter sheet

  // Re-initialise from the URL whenever navigation occurs (nav menu, search…)
  useEffect(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      category: searchParams.get('category') || '',
      brands: searchParams.getAll('brand'),
    });
    setSort(searchParams.get('sort') || 'popularity');
    setPage(1);
    setFiltersOpen(false);
    window.scrollTo({ top: 0 });
  }, [searchParams]);

  const q = searchParams.get('q') || '';
  const crop = searchParams.get('crop') || '';
  const dealsOnly = searchParams.get('deals') === '1';

  // Apply filters + query
  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      if (dealsOnly && p.discount < 18) return false;
      if (crop && p.crop !== crop) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (filters.minPrice !== '' && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== '' && p.price > Number(filters.maxPrice)) return false;
      if (Number(filters.minRating) && p.rating < Number(filters.minRating)) return false;
      if (Number(filters.minDiscount) && p.discount < Number(filters.minDiscount)) return false;
      if (q && !matchesQuery(p, q)) return false;
      return true;
    });

    switch (sort) {
      case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'newest': list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id.localeCompare(a.id)); break;
      case 'rating': list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'discount': list = [...list].sort((a, b) => b.discount - a.discount); break;
      case 'popularity':
      default: list = [...list].sort((a, b) => (b.bought + b.reviewCount) - (a.bought + a.reviewCount));
    }
    return list;
  }, [filters, sort, q, crop, dealsOnly]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const heading = q
    ? `Results for “${q}”`
    : dealsOnly
      ? 'Top Deals — up to 40% off'
      : crop
        ? `Products for ${crop[0].toUpperCase()}${crop.slice(1)}`
        : filters.category
          ? getCategory(filters.category)?.name || 'Products'
          : 'All Products';

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({}, { replace: true });
  };

  const applyFilters = (next) => { setFilters(next); setPage(1); };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      {/* Breadcrumb + heading */}
      <nav aria-label="Breadcrumb" className="text-[11px] font-semibold text-stone-400">
        <ol className="flex items-center gap-1.5">
          <li><Link to="/">Home</Link></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-brand-800 dark:text-brand-300">{heading}</li>
        </ol>
      </nav>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-2xl">{heading} <span className="text-sm font-bold text-stone-400">({filtered.length})</span></h1>
        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <button type="button" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen} className="flex h-11 items-center gap-2 rounded-xl border border-stone-300 px-3 text-sm font-bold text-stone-700 dark:border-stone-700 dark:text-stone-200 lg:hidden">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="M4 6h16M7 12h10M10 18h4"/></svg>
            Filters
          </button>
          <label className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <span className="hidden sm:inline">Sort by</span>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} aria-label="Sort products" className="h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
              <option value="popularity">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-3 grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Filters — collapsible on mobile */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
          <FilterPanel filters={filters} onChange={applyFilters} onClear={clearAll} resultCount={filtered.length} />
        </div>

        {/* Results */}
        <div>
          {pageItems.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="No products match those filters"
              subtitle="Try removing a filter or two, or search a broader term like 'fertilizer' or 'seeds'."
              actionTo="/shop"
              actionLabel="Reset shopping →"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
              {pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <nav aria-label="Pagination" className="mt-5 flex items-center justify-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Previous page" className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M15 6l-6 6 6 6"/></svg>
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" onClick={() => setPage(n)} aria-label={`Page ${n}`} aria-current={n === safePage ? 'page' : undefined} className={`h-11 w-11 rounded-xl text-sm font-extrabold transition ${n === safePage ? 'bg-brand-700 text-white' : 'border border-stone-300 hover:border-brand-600 dark:border-stone-700'}`}>{n}</button>
              ))}
              <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} aria-label="Next page" className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M9 6l6 6-6 6"/></svg>
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
