import { Link } from 'react-router-dom';

/** Section heading used across the home page: title, subtitle, optional "View all" link */
export default function SectionTitle({ emoji, title, subtitle, viewAllTo, viewAllLabel = 'View All' }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4 sm:mb-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-2xl">
          {emoji && <span aria-hidden="true">{emoji}</span>}
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-[11px] font-medium text-stone-500 dark:text-stone-400 sm:text-xs">{subtitle}</p>}
      </div>
      {viewAllTo && (
        <Link to={viewAllTo} className="group flex shrink-0 items-center gap-1 rounded-full border border-brand-200 px-3 py-1.5 text-[11px] font-extrabold text-brand-800 transition hover:border-brand-500 hover:bg-brand-50 dark:border-stone-700 dark:text-brand-300 sm:text-xs">
          {viewAllLabel}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </Link>
      )}
    </div>
  );
}
