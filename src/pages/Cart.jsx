import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ProductImage from '../components/ProductImage';
import { useShop } from '../context/ShopContext';
import { formatPrice, COUPONS } from '../data';

/** Full cart page — quantity editing, remove, coupon FARM10, price summary */
export default function Cart() {
  const navigate = useNavigate();
  const { cartLines, totals, coupon, applyCoupon, removeCoupon, setQty, removeFromCart } = useShop();
  const [code, setCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null); // { ok, message }

  const submitCoupon = (e) => {
    e.preventDefault();
    const result = applyCoupon(code);
    setCouponMsg(result);
    if (result.ok) setCode('');
  };

  if (cartLines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white">Shopping Cart</h1>
        <div className="mt-4">
          <EmptyState emoji="🧺" title="Your cart is empty" subtitle="Add seeds, crop nutrition, equipment or fresh produce — delivered to your doorstep in 1–4 days." actionTo="/shop" actionLabel="Explore products →" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">Shopping Cart <span className="text-base font-bold text-stone-400">({totals.count} item{totals.count > 1 ? 's' : ''})</span></h1>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Cart lines ── */}
        <ul className="space-y-3" aria-label="Cart items">
          {cartLines.map(({ id, pack, qty, product, packInfo, lineTotal, lineMrp }) => (
            <li key={`${id}-${pack}`} className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-[var(--shadow-card)] dark:border-stone-800 dark:bg-stone-900 sm:gap-4">
              <Link to={`/product/${id}`} className="shrink-0">
                <ProductImage src={product.image} alt={product.name} emoji="📦" className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/product/${id}`} className="line-clamp-2 text-sm font-semibold text-stone-800 hover:text-brand-800 dark:text-stone-100">{product.name}</Link>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-400">Pack: {pack} · SKU {id.toUpperCase()}</p>
                  </div>
                  <button type="button" onClick={() => removeFromCart(id, pack)} aria-label={`Remove ${product.name} from cart`} className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M10 11v6M14 11v6M9 7l1-2h4l1 2m-9 0l1 13a1 1 0 001 .9h8a1 1 0 001-.9l1-13"/></svg>
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center rounded-xl border border-stone-300 dark:border-stone-700">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setQty(id, pack, qty - 1)} className="h-9 w-9 font-extrabold text-stone-600 hover:text-brand-700 dark:text-stone-300">−</button>
                    <span className="w-8 text-center text-sm font-extrabold" aria-live="polite">{qty}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => setQty(id, pack, qty + 1)} className="h-9 w-9 font-extrabold text-stone-600 hover:text-brand-700 dark:text-stone-300">+</button>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-stone-900 dark:text-white">{formatPrice(lineTotal)}</p>
                    {lineMrp > lineTotal && <p className="text-[10px] font-semibold text-stone-400 line-through">{formatPrice(lineMrp)}</p>}
                  </div>
                </div>
              </div>
            </li>
          ))}
          <li className="flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-xs font-semibold text-brand-900 dark:border-stone-800 dark:bg-stone-900 dark:text-brand-300">
            <span>Have a coupon? Try <strong>FARM10</strong> for 10% off</span>
            <span aria-hidden="true">🎟️</span>
          </li>
        </ul>

        {/* ── Summary ── */}
        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-lift)] dark:border-stone-800 dark:bg-stone-900" aria-label="Order summary">
          <h2 className="text-base font-extrabold text-stone-900 dark:text-white">Price Summary</h2>

          {/* Coupon box */}
          <form onSubmit={submitCoupon} className="mt-3">
            <label htmlFor="coupon" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Coupon code</label>
            <div className="mt-1 flex overflow-hidden rounded-xl border-2 border-dashed border-brand-300 focus-within:border-brand-600 dark:border-stone-700">
              <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="FARM10" autoComplete="off" className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-bold uppercase tracking-widest outline-none placeholder:text-stone-400" />
              <button type="submit" className="bg-brand-700 px-4 text-sm font-extrabold text-white transition hover:bg-brand-800">Apply</button>
            </div>
            {couponMsg && (
              <p role="status" className={`mt-1.5 text-xs font-bold ${couponMsg.ok ? 'text-brand-700 dark:text-brand-400' : 'text-red-600'}`}>{couponMsg.message}</p>
            )}
            {coupon && (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-900 dark:bg-stone-800 dark:text-brand-200">
                <span>🎟️ {coupon.code} applied — {coupon.label}</span>
                <button type="button" onClick={() => { removeCoupon(); setCouponMsg(null); }} className="text-red-500 hover:underline">Remove</button>
              </div>
            )}
            <p className="mt-1.5 text-[10px] text-stone-400">Valid coupons: {Object.values(COUPONS).map((c) => c.code).join(', ')}</p>
          </form>

          <dl className="mt-4 space-y-1.5 border-t border-dashed border-stone-300 pt-4 text-sm dark:border-stone-700">
            <div className="flex justify-between text-stone-500 dark:text-stone-400"><dt>Subtotal (MRP)</dt><dd>{formatPrice(totals.mrpTotal)}</dd></div>
            <div className="flex justify-between font-semibold text-brand-700 dark:text-brand-400"><dt>Product discount</dt><dd>− {formatPrice(totals.mrpDiscount)}</dd></div>
            <div className="flex justify-between font-semibold text-brand-700 dark:text-brand-400"><dt>Coupon discount</dt><dd>{totals.couponDiscount > 0 ? `− ${formatPrice(totals.couponDiscount)}` : '—'}</dd></div>
            <div className="flex justify-between text-stone-500 dark:text-stone-400"><dt>Delivery</dt><dd>{totals.delivery === 0 ? <span className="font-extrabold text-brand-700 dark:text-brand-400">FREE</span> : formatPrice(totals.delivery)}</dd></div>
            <div className="flex justify-between border-t border-stone-300 pt-2 text-lg font-extrabold text-stone-900 dark:border-stone-700 dark:text-white"><dt>Total payable</dt><dd>{formatPrice(totals.total)}</dd></div>
          </dl>
          <p className="mt-1.5 inline-block rounded-lg bg-accent-500/15 px-2 py-1 text-[11px] font-extrabold text-accent-700 dark:text-accent-400">🎉 You save {formatPrice(totals.savings)} on this order</p>

          <button type="button" onClick={() => navigate('/checkout')} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-base font-extrabold text-amber-950 shadow transition hover:bg-accent-400 active:scale-[0.98]">
            Proceed to Checkout →
          </button>
          <Link to="/shop" className="mt-2 block text-center text-xs font-bold text-stone-500 hover:text-brand-800 dark:hover:text-brand-300">or continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
