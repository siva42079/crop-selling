import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../data';
import { getOrderByCode, getMyOrders } from '../api/shop';

const STEPS = [
  ['placed', 'Order placed', '🧾'],
  ['packed', 'Packed', '📦'],
  ['shipped', 'Shipped', '🚚'],
  ['delivered', 'Delivered', '🏡'],
];

/** Track Order — looks up real orders saved in Supabase */
export default function TrackOrder() {
  const { user, setLoginOpen } = useShop();
  const [params, setParams] = useSearchParams();
  const idParam = params.get('id') || '';

  const [code, setCode] = useState(idParam);
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [myOrders, setMyOrders] = useState([]);

  const lookup = async (value) => {
    const clean = value.trim();
    if (!clean) return;
    setLoading(true);
    setMessage('');
    setOrder(null);
    const { data, error } = await getOrderByCode(clean);
    setLoading(false);
    if (error) { setMessage(error.message); return; }
    if (!data) {
      setMessage('No order found with that ID in your account. Check the ID, or log in with the account you used to order.');
      return;
    }
    setOrder(data);
  };

  // Look up when the page opens with ?id=...
  useEffect(() => {
    if (idParam) { setCode(idParam); lookup(idParam); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam]);

  // Load the logged-in user's recent orders
  useEffect(() => {
    if (!user) { setMyOrders([]); return; }
    getMyOrders().then(({ data }) => setMyOrders(data || []));
  }, [user]);

  const submit = (e) => {
    e.preventDefault();
    const clean = code.trim();
    if (!clean) return;
    if (clean.toUpperCase() === idParam.toUpperCase()) lookup(clean);
    else setParams({ id: clean });
  };

  const stepIndex = order ? STEPS.findIndex(([key]) => key === order.status) : -1;
  const cancelled = order?.status === 'cancelled';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">Track your order</h1>
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Enter the Order ID you received after checkout.</p>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <label htmlFor="track-id" className="sr-only">Order ID</label>
        <input
          id="track-id"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. FP-3F9A1C2B"
          className="h-12 flex-1 rounded-xl border-2 border-stone-200 bg-white px-4 text-sm font-medium uppercase outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
        <button type="submit" disabled={loading} className="h-12 rounded-xl bg-brand-700 px-6 text-sm font-extrabold text-white hover:bg-brand-800 disabled:opacity-60">
          {loading ? 'Searching…' : 'Track'}
        </button>
      </form>

      {message && (
        <div role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:bg-stone-800 dark:text-amber-200">
          {message}
          {!user && (
            <button type="button" onClick={() => setLoginOpen(true)} className="ml-2 underline">Log in</button>
          )}
        </div>
      )}

      {order && (
        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900" aria-label="Order details">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Order ID</p>
              <p className="text-xl font-black tracking-widest text-brand-900 dark:text-brand-300">{order.order_code}</p>
            </div>
            <p className="text-xs text-stone-500">Placed {new Date(order.created_at).toLocaleString('en-IN')}</p>
          </div>

          {/* Status timeline */}
          {cancelled ? (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">This order was cancelled.</p>
          ) : (
            <ol className="mt-5 grid grid-cols-4 gap-2 text-center">
              {STEPS.map(([key, label, icon], i) => {
                const done = i <= stepIndex;
                return (
                  <li key={key} className="flex flex-col items-center gap-1">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${done ? 'bg-brand-700 text-white' : 'bg-stone-100 text-stone-400 dark:bg-stone-800'}`} aria-hidden="true">{icon}</span>
                    <span className={`text-[11px] font-bold ${done ? 'text-brand-800 dark:text-brand-300' : 'text-stone-400'}`}>{label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          <ul className="mt-5 space-y-2 border-t border-dashed border-stone-300 pt-4 dark:border-stone-700">
            {(order.items || []).map((it, i) => (
              <li key={`${it.id}-${it.pack}-${i}`} className="flex justify-between gap-3 text-sm">
                <span className="text-stone-600 dark:text-stone-300">{it.name} <span className="text-stone-400">× {it.qty}{it.pack ? ` (${it.pack})` : ''}</span></span>
                <span className="font-bold">{formatPrice(it.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 p-3 dark:border-stone-700"><dt className="text-[10px] font-bold uppercase text-stone-400">Total · Payment</dt><dd className="font-extrabold">{formatPrice(order.total)} · {order.payment_method || '—'}</dd></div>
            <div className="rounded-xl border border-stone-200 p-3 dark:border-stone-700"><dt className="text-[10px] font-bold uppercase text-stone-400">Deliver to</dt><dd className="font-semibold">{order.customer_name}, {order.address}</dd></div>
          </dl>
        </section>
      )}

      {myOrders.length > 0 && (
        <section className="mt-8" aria-label="My recent orders">
          <h2 className="text-base font-extrabold text-stone-900 dark:text-white">My recent orders</h2>
          <ul className="mt-2 space-y-2">
            {myOrders.slice(0, 5).map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => { setCode(o.order_code); setParams({ id: o.order_code }); }} className="flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white p-3 text-left text-sm hover:border-brand-400 dark:border-stone-700 dark:bg-stone-900">
                  <span className="font-extrabold tracking-wider">{o.order_code}</span>
                  <span className="text-xs text-stone-500">{formatPrice(o.total)} · {o.status}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-center text-xs text-stone-400">
        Need help? <Link to="/shop" className="font-bold text-brand-700 underline">Continue shopping</Link>
      </p>
    </div>
  );
}