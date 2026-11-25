import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../data';
import { supabase } from '../supabaseClient';
import { createOrder } from '../api/shop';

const INDIAN_STATES = ['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Bihar', 'West Bengal', 'Odisha', 'Kerala', 'Delhi', 'Other'];

/** Checkout — address with validation, UPI/Card/COD payment, orders saved to Supabase */
export default function Checkout() {
  const navigate = useNavigate();
  const { cartLines, totals, clearCart, user, toast, setLoginOpen } = useShop();

  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: 'Andhra Pradesh', pincode: '' });
  const [payment, setPayment] = useState('upi'); // upi | card | cod
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // { id, name, total, address }
  const MERCHANT_UPI_ID = '9347939628@ybl';
  const MERCHANT_NAME = 'Farmers Products';

  // Pre-fill name from the logged-in session
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name }));
  }, [user]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setCardField = (key) => (e) => {
    let value = e.target.value;
    if (key === 'number') value = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (key === 'expiry') value = value.replace(/[^\d/]/g, '').slice(0, 5);
    if (key === 'cvv') value = value.replace(/\D/g, '').slice(0, 3);
    setCard({ ...card, [key]: value });
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 3) next.name = 'Enter your full name (min 3 characters).';
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) next.phone = 'Enter a valid 10-digit Indian mobile number (starts 6–9).';
    if (form.address.trim().length < 10) next.address = 'Enter a complete address — house, street, village/town (min 10 characters).';
    if (form.city.trim().length < 2) next.city = 'Enter your city/district.';
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = 'Enter a valid 6-digit PIN code.';
    if (payment === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) next.upiId = 'Enter a valid UPI ID, e.g. name@oksbi';
    if (payment === 'card') {
      if (card.number.replace(/\s/g, '').length !== 16) next.cardNumber = 'Enter the 16-digit card number.';
      if (card.name.trim().length < 3) next.cardName = 'Name on card is required.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry.trim())) next.expiry = 'Use MM/YY format, e.g. 09/28.';
      if (!/^\d{3}$/.test(card.cvv.trim())) next.cvv = 'CVV must be 3 digits.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (placing) return;
    if (!validate()) { toast('Please fix the highlighted fields.'); return; }

    // Orders are saved per user, so a real Supabase login is required
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast('Please log in to place your order.');
      setLoginOpen(true);
      return;
    }

    const fullAddress = `${form.address.trim()}, ${form.city.trim()}, ${form.state} – ${form.pincode.trim()}`;
    const paymentLabel = payment === 'upi' ? 'UPI' : payment === 'card' ? 'Card' : 'Cash on Delivery';

    setPlacing(true);
    const { data, error } = await createOrder({
      customer: { name: form.name, phone: form.phone, address: fullAddress },
      items: cartLines.map(({ id, pack, qty, product, lineTotal }) => ({
        id,
        pack,
        qty,
        name: product.name,
        lineTotal,
      })),
      total: Math.round(totals.total * 100) / 100,
      paymentMethod: paymentLabel, // card number / CVV / UPI ID are never sent or stored
    });
    setPlacing(false);

    if (error) {
      toast(error.code === '42501'
        ? 'Please log in again to place your order.'
        : `Could not place order: ${error.message}`);
      return;
    }

    setPlacedOrder({
      id: data.order_code,
      name: form.name.trim(),
      total: totals.total,
      items: totals.count,
      address: fullAddress,
      payment: paymentLabel,
    });
    clearCart();
    window.scrollTo({ top: 0 });
  };

  // ── Order success screen ──────────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="rounded-3xl border border-brand-200 bg-white p-8 shadow-[var(--shadow-lift)] dark:border-stone-800 dark:bg-stone-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 dark:bg-stone-800">
            <svg viewBox="0 0 52 52" className="h-12 w-12 text-brand-700 dark:text-brand-400" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Order placed successfully">
              <path d="M14 27l9 9 16-18" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-stone-900 dark:text-white">Order placed! 🎉</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Thank you, {placedOrder.name.split(' ')[0]}! Your order is being packed at our Hyderabad warehouse.</p>
          <div className="mt-5 rounded-2xl bg-brand-50 p-4 dark:bg-stone-800">
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Your Order ID</p>
            <p className="mt-1 select-all text-3xl font-black tracking-[0.2em] text-brand-900 dark:text-brand-300">{placedOrder.id}</p>
            <p className="mt-1 text-[10px] text-stone-400">Save this ID — use it on the Track Order page.</p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-left text-sm">
            <div className="rounded-xl border border-stone-200 p-3 dark:border-stone-700"><dt className="text-[10px] font-bold uppercase text-stone-400">Order total</dt><dd className="font-extrabold">{formatPrice(placedOrder.total)} · {placedOrder.payment}</dd></div>
            <div className="rounded-xl border border-stone-200 p-3 dark:border-stone-700"><dt className="text-[10px] font-bold uppercase text-stone-400">Items</dt><dd className="font-extrabold">{placedOrder.items}</dd></div>
            <div className="col-span-2 rounded-xl border border-stone-200 p-3 dark:border-stone-700"><dt className="text-[10px] font-bold uppercase text-stone-400">Deliver to</dt><dd className="font-semibold">{placedOrder.address}</dd></div>
          </dl>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to={`/track?id=${placedOrder.id}`} className="rounded-2xl border-2 border-brand-700 px-6 py-3 text-sm font-extrabold text-brand-800 transition hover:bg-brand-50 dark:border-brand-500 dark:text-brand-300">📦 Track this order</Link>
            <Link to="/shop" className="rounded-2xl bg-accent-500 px-6 py-3 text-sm font-extrabold text-amber-950 transition hover:bg-accent-400">Continue Shopping →</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty cart guard ───────────────────────────────────────────────────────
  if (cartLines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState emoji="🛒" title="Nothing to check out yet" subtitle="Add a few products to your cart and come back — the seeds won’t wait all season!" actionTo="/shop" actionLabel="Browse catalogue →" />
      </div>
    );
  }

  const inputCls = (hasError) =>
    `h-12 w-full rounded-xl border-2 bg-white px-4 text-sm font-medium outline-none transition placeholder:text-stone-400 focus:border-brand-600 dark:bg-stone-900 dark:text-stone-100 ${hasError ? 'border-red-400' : 'border-stone-200 dark:border-stone-700'}`;
  const err = (key) => errors[key] && <p role="alert" className="mt-1 text-xs font-semibold text-red-600">{errors[key]}</p>;

  return (
    <form onSubmit={placeOrder} noValidate className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">Checkout</h1>
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Demo payment — no real payment is processed. Your order is saved to your account.</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ── Delivery address ── */}
        <section aria-labelledby="address-heading" className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 id="address-heading" className="flex items-center gap-2 text-base font-extrabold text-stone-900 dark:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs text-white">1</span> Delivery Address</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="ck-name" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Full Name *</label>
              <input id="ck-name" value={form.name} onChange={set('name')} placeholder="e.g. Venkatesh Reddy" autoComplete="name" className={`mt-1 ${inputCls(errors.name)}`} aria-invalid={!!errors.name} />{err('name')}
            </div>
            <div>
              <label htmlFor="ck-phone" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Mobile *</label>
              <input id="ck-phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} placeholder="9876543210" autoComplete="tel" className={`mt-1 ${inputCls(errors.phone)}`} aria-invalid={!!errors.phone} />{err('phone')}
            </div>
            <div>
              <label htmlFor="ck-pincode" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">PIN Code *</label>
              <input id="ck-pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })} placeholder="521101" autoComplete="postal-code" className={`mt-1 ${inputCls(errors.pincode)}`} aria-invalid={!!errors.pincode} />{err('pincode')}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ck-address" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Address (House / Village / Street) *</label>
              <input id="ck-address" value={form.address} onChange={set('address')} placeholder="e.g. H.No 8-12, Main Road, near Temple" autoComplete="street-address" className={`mt-1 ${inputCls(errors.address)}`} aria-invalid={!!errors.address} />{err('address')}
            </div>
            <div>
              <label htmlFor="ck-city" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">City / District *</label>
              <input id="ck-city" value={form.city} onChange={set('city')} placeholder="e.g. Krishna" className={`mt-1 ${inputCls(errors.city)}`} aria-invalid={!!errors.city} />{err('city')}
            </div>
            <div>
              <label htmlFor="ck-state" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">State</label>
              <select id="ck-state" value={form.state} onChange={set('state')} className={`mt-1 ${inputCls(false)}`}>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* ── Payment ── */}
          <h2 className="mt-6 flex items-center gap-2 text-base font-extrabold text-stone-900 dark:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs text-white">2</span> Payment Method</h2>
          <fieldset className="mt-3 grid gap-2">
            <legend className="sr-only">Choose payment method</legend>

            {[
              ['upi', '📱', 'UPI', 'Google Pay, PhonePe, Paytm, BHIM'],
              ['card', '💳', 'Credit / Debit Card', 'RuPay, Visa, Mastercard — 16-digit number'],
              ['cod', '💵', 'Cash on Delivery', 'Pay in cash when the parcel arrives'],
            ].map(([value, icon, title, sub]) => (
              <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition ${payment === value ? 'border-brand-700 bg-brand-50/60 dark:border-brand-500 dark:bg-stone-800' : 'border-stone-200 hover:border-brand-300 dark:border-stone-700'}`}>
                <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="h-5 w-5 accent-green-700" />
                <span className="text-2xl" aria-hidden="true">{icon}</span>
                <span>
                  <span className="block text-sm font-extrabold text-stone-800 dark:text-stone-100">{title}</span>
                  <span className="block text-[10px] text-stone-400">{sub}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {payment === 'upi' && (
            <div className="mt-3">
              <label htmlFor="upi-id" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">UPI ID *</label>
              <input id="upi-id" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@oksbi" autoComplete="off" className={`mt-1 ${inputCls(errors.upiId)}`} aria-invalid={!!errors.upiId} />{err('upiId')}
            </div>
          )}
          {payment === 'card' && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="card-number" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Card Number *</label>
                <input id="card-number" inputMode="numeric" value={card.number} onChange={setCardField('number')} placeholder="4111 1111 1111 1111" autoComplete="cc-number" className={`mt-1 ${inputCls(errors.cardNumber)}`} aria-invalid={!!errors.cardNumber} />{err('cardNumber')}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="card-name" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Name on Card *</label>
                <input id="card-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="VENKATESH REDDY" autoComplete="cc-name" className={`mt-1 ${inputCls(errors.cardName)}`} />{err('cardName')}
              </div>
              <div>
                <label htmlFor="card-expiry" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Expiry (MM/YY) *</label>
                <input id="card-expiry" inputMode="numeric" value={card.expiry} onChange={setCardField('expiry')} placeholder="09/28" autoComplete="cc-exp" className={`mt-1 ${inputCls(errors.expiry)}`} />{err('expiry')}
              </div>
              <div>
                <label htmlFor="card-cvv" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">CVV *</label>
                <input id="card-cvv" type="password" inputMode="numeric" value={card.cvv} onChange={setCardField('cvv')} placeholder="•••" autoComplete="cc-csc" className={`mt-1 ${inputCls(errors.cvv)}`} />{err('cvv')}
              </div>
            </div>
          )}
          {payment === 'cod' && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 dark:bg-stone-800 dark:text-amber-200">💡 Keep exact change or a UPI app ready at the doorstep. COD is free for orders above ₹999.</p>
          )}
        </section>

        {/* ── Order summary ── */}
        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-lift)] dark:border-stone-800 dark:bg-stone-900" aria-label="Order summary">
          <h2 className="text-base font-extrabold text-stone-900 dark:text-white">Your Order</h2>
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
            {cartLines.map(({ id, pack, qty, product, lineTotal }) => (
              <li key={`${id}-${pack}`} className="flex items-center justify-between gap-3 text-xs">
                <span className="line-clamp-2 font-medium text-stone-600 dark:text-stone-300">{product.name} <span className="text-stone-400">× {qty} ({pack})</span></span>
                <span className="shrink-0 font-bold text-stone-800 dark:text-stone-100">{formatPrice(lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-dashed border-stone-300 pt-3 text-sm dark:border-stone-700">
            <div className="flex justify-between text-stone-500"><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
            <div className="flex justify-between font-semibold text-brand-700 dark:text-brand-400"><dt>Coupon savings</dt><dd>− {formatPrice(totals.couponDiscount)}</dd></div>
            <div className="flex justify-between text-stone-500"><dt>Delivery</dt><dd>{totals.delivery === 0 ? 'FREE' : formatPrice(totals.delivery)}</dd></div>
            <div className="flex justify-between border-t border-stone-300 pt-2 text-lg font-extrabold text-stone-900 dark:border-stone-700 dark:text-white"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
          </dl>
          <button type="submit" disabled={placing} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-base font-extrabold text-amber-950 shadow transition hover:bg-accent-400 active:scale-[0.98] disabled:opacity-60">
            {placing ? 'Placing order…' : `🔒 Place Order · ${formatPrice(totals.total)}`}
          </button>
          <p className="mt-2 text-center text-[10px] font-semibold text-stone-400">By placing the order you agree to our Terms &amp; Seeds Act compliance policy. GST invoice will be emailed post-dispatch.</p>
        </aside>
      </div>
    </form>
  );
}