import { useShop } from '../context/ShopContext';

/** Toast notifications (bottom-center) — aria-live so screen readers announce them */
export default function Toasts() {
  const { toasts } = useShop();
  if (toasts.length === 0) return null;
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-24 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} role="status" className="rounded-2xl bg-stone-900/95 px-4 py-2.5 text-center text-xs font-semibold text-white shadow-lg backdrop-blur dark:bg-white dark:text-stone-900">
          {t.message}
        </div>
      ))}
    </div>
  );
}
