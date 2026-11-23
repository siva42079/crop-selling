import { Link } from 'react-router-dom';

/** Friendly empty state used for empty cart/wishlist/search results */
export default function EmptyState({ emoji = '🔍', title, subtitle, actionTo, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-200 bg-white/60 px-6 py-14 text-center dark:border-stone-800 dark:bg-stone-900/50">
      <span className="text-6xl" role="img" aria-label={title}>{emoji}</span>
      <h3 className="mt-4 text-xl font-extrabold text-stone-800 dark:text-stone-100">{title}</h3>
      {subtitle && <p className="mt-1.5 max-w-md text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>}
      {actionTo && (
        <Link to={actionTo} className="mt-6 rounded-full bg-brand-700 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-brand-800">
          {actionLabel || 'Browse products →'}
        </Link>
      )}
    </div>
  );
}
