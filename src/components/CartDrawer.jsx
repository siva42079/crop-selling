import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../data';
import ProductImage from './ProductImage';

/** Slide-in cart drawer — overlay click or Escape closes it; body scroll locks while open */
export default function CartDrawer() {
  const navigate = useNavigate();
  const { cartOpen, setCartOpen, cartLines, totals, coupon, setQty, removeFromCart } = useShop();

  // Escape to close + lock body scroll
  useEffect(() => {
    if (!cartOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [cartOpen, setCartOpen]);

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!cartOpen}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-stone-900 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-800">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-900 dark:text-white">
            🛒 Your Cart
            {totals.count > 0 && <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-900 dark:bg-stone-800 dark:text-brand-300">{totals.count} item{totals.count > 1 ? 's' : ''}</span>}
          </h2>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart" className="rounded-xl p-2 text-stone-500 transition hover:bg-stone-100 dark:hover:bg-stone-800">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        {/* Free-delivery progress */}
        {cartLines.length > 0 && (
          <div className="border-b border-stone-100 px-4 py-2 text-[11px] font-semibold text-stone-500 dark:border-stone-800 dark:text-stone-400">
            {totals.subtotal >= 499
              ? <span className="text-brand-700 dark:text-brand-400">✓ You’ve unlocked FREE delivery</span>
              : <span>Add <b className="text-brand-800 dark:text-brand-300">{formatPrice(499 - totals.subtotal)}</b> more for FREE delivery</span>}
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
              <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${Math.min(100, (totals.subtotal / 499) * 100)}%` }} />
            </div>
          </div>
        )}

        {/* Lines */}
        <div className="nice-scroll flex-1 overflow-y-auto p-4">
          {cartLines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-6xl" role="img" aria-label="Empty cart">🧺</span>
              <h3 className="mt-3 text-lg font-extrabold text-stone-800 dark:text-stone-100">Your cart is empty</h3>
              <p className="mt-1 max-w-[240px] text-sm text-stone-500 dark:text-stone-400">Add seeds, fertilizers and tools — farmers who shop, prosper.</p>
              <Link to="/shop" onClick={() => setCartOpen(false)} className="mt-5 rounded-full bg-brand-700 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-brand-800">Start Shopping →</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {cartLines.map(({ id, pack, qty, product, packInfo, lineTotal }) => (
                <li key={`${id}-${pack}`} className="flex gap-3 rounded-2xl border border-stone-200 p-2.5 dark:border-stone-800">
                  <Link to={`/product/${id}`} onClick={() => setCartOpen(false)} className="shrink-0">
                    <ProductImage src={product.image} alt={product.name} className="h-20 w-20 rounded-xl object-cover" emoji="📦" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${id}`} onClick={() => setCartOpen(false)} className="line-clamp-2 text-[13px] font-semibold leading-snug text-stone-800 hover:text-brand-800 dark:text-stone-100">{product.name}</Link>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-400">Pack: {pack}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-lg border border-stone-300 dark:border-stone-700">
                        <button type="button" aria-label="Decrease quantity" onClick={() => setQty(id, pack, qty - 1)} className="px-2 py-1 font-bold text-stone-600 hover:text-brand-700 dark:text-stone-300">−</button>
                        <span className="w-7 text-center text-sm font-extrabold" aria-live="polite">{qty}</span>
                        <button type="button" aria-label="Increase quantity" onClick={() => setQty(id, pack, qty + 1)} className="px-2 py-1 font-bold text-stone-600 hover:text-brand-700 dark:text-stone-300">+</button>
                      </div>
                      <p className="text-sm font-extrabold text-stone-900 dark:text-white">{formatPrice(lineTotal)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeFromCart(id, pack)} aria-label={`Remove ${product.name} from cart`} className="self-start rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M10 11v6M14 11v6M9 7l1-2h4l1 2m-9 0l1 13a1 1 0 001 .9h8a1 1 0 001-.9l1-13"/></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary + CTA */}
        {cartLines.length > 0 && (
          <div className="border-t border-stone-200 p-4 dark:border-stone-800">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between text-stone-500 dark:text-stone-400"><dt>Subtotal (MRP)</dt><dd className="line-through">{formatPrice(totals.mrpTotal)}</dd></div>
              <div className="flex justify-between font-semibold text-brand-700 dark:text-brand-400"><dt>Product discount</dt><dd>− {formatPrice(totals.mrpDiscount)}</dd></div>
              {totals.couponDiscount > 0 && coupon && <div className="flex justify-between font-semibold text-brand-700 dark:text-brand-400"><dt>Coupon {coupon.code}</dt><dd>− {formatPrice(totals.couponDiscount)}</dd></div>}
              <div className="flex justify-between text-stone-500 dark:text-stone-400"><dt>Delivery</dt><dd>{totals.delivery === 0 ? 'FREE' : formatPrice(totals.delivery)}</dd></div>
              <div className="flex justify-between border-t border-dashed border-stone-300 pt-1.5 text-base font-extrabold text-stone-900 dark:border-stone-700 dark:text-white"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
            </dl>
            <p className="mt-1 text-[11px] font-bold text-brand-800 dark:text-brand-300">You save {formatPrice(totals.savings)} on this order 🎉</p>
            <button type="button" onClick={() => { setCartOpen(false); navigate('/checkout'); }} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-base font-extrabold text-amber-950 shadow transition hover:bg-accent-400 active:scale-[0.98]">
              Proceed to Checkout →
            </button>
            <Link to="/cart" onClick={() => setCartOpen(false)} className="mt-1.5 block text-center text-xs font-bold text-brand-800 underline-offset-2 hover:underline dark:text-brand-300">View full cart &amp; apply coupon</Link>
          </div>
        )}
      </aside>
    </>
  );
}
