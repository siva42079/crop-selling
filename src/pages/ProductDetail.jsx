import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Stars } from '../components/ProductCard';
import ProductCard from '../components/ProductCard';
import ProductRow from '../components/ProductRow';
import ProductImage from '../components/ProductImage';
import EmptyState from '../components/EmptyState';
import { useShop } from '../context/ShopContext';
import { getProduct, getBrand, getCategory, PRODUCTS, REVIEWS, formatPrice } from '../data';

/** Product detail — gallery, pack sizes, quantity, cart/buy CTAs, tabs, related products */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProduct(id);
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen } = useShop();

  const [selectedPack, setSelectedPack] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description'); // description | usage | reviews
  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Reset state when navigating between products
  useEffect(() => {
    setSelectedPack(0);
    setQty(1);
    setTab('description');
    setPincodeMsg('');
    setPincode('');
    setGalleryIndex(0);
    window.scrollTo({ top: 0 });
  }, [id]);

  const brand = product ? getBrand(product.brand) : null;
  const category = product ? getCategory(product.category) : null;

  // "Gallery" views — same shot rendered with different crop anchors (demo)
  const gallery = useMemo(() => {
    if (!product) return [];
    const base = product.image.split('?')[0];
    return [
      { src: product.image, label: 'Pack shot' },
      { src: `${base}?auto=format&fit=crop&crop=entropy&w=900&q=75`, label: 'Close-up' },
      { src: `${base}?auto=format&fit=crop&crop=edges&w=900&q=75`, label: 'In field' },
    ];
  }, [product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState emoji="🌱" title="Product not found" subtitle="The product you are looking for may have been moved or sold out." actionTo="/shop" actionLabel="Browse catalogue →" />
      </div>
    );
  }

  const pack = product.packSizes[selectedPack];
  const discount = pack.mrp > pack.price ? Math.round(((pack.mrp - pack.price) / pack.mrp) * 100) : 0;
  const saved = isWishlisted(product.id);
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);
  const productReviews = REVIEWS.filter((r) => product.name.toLowerCase().includes(r.product.split(' ')[0].toLowerCase())).slice(0, 3);
  const reviewsToShow = productReviews.length >= 2 ? productReviews : REVIEWS.slice(0, 3);

  const checkPincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) { setPincodeMsg('Enter a valid 6-digit PIN code.'); return; }
    setPincodeMsg(`Delivery to ${pincode} by ${new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}. Free above ₹499.`);
  };

  const buyNow = () => {
    addToCart(product.id, pack.label, qty);
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-[11px] font-semibold text-stone-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link to="/" className="hover:text-brand-800">Home</Link></li>
          <li aria-hidden="true">›</li>
          <li><Link to={`/shop?category=${product.category}`} className="hover:text-brand-800">{category?.name}</Link></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="max-w-[200px] truncate text-brand-800 dark:text-brand-300 sm:max-w-md">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-3 grid gap-5 lg:grid-cols-2">
        {/* ── Gallery ── */}
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            {discount > 0 && <span className="absolute left-0 top-4 z-10 rounded-r-full bg-accent-500 py-1.5 pl-3 pr-4 text-xs font-extrabold text-amber-950 shadow">{discount}% OFF</span>}
            <ProductImage src={gallery[galleryIndex]?.src} alt={`${product.name} — ${gallery[galleryIndex]?.label}`} emoji="🌾" className="h-64 w-full object-cover sm:h-96 lg:h-[28rem]" />
          </div>
          <div className="mt-2 flex gap-2" role="tablist" aria-label="Product image views">
            {gallery.map((view, i) => (
              <button key={i} role="tab" aria-selected={galleryIndex === i} onClick={() => setGalleryIndex(i)} className={`h-16 w-20 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-24 ${galleryIndex === i ? 'border-brand-600 ring-2 ring-brand-200' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                <ProductImage src={view.src} alt={view.label} emoji="🌾" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-stone-500 dark:text-stone-400">
            {[['🔬', 'Genuine product'], ['🧾', 'GST invoice'], ['↩️', '48-hr returns']].map(([icon, label]) => (
              <div key={label} className="rounded-2xl border border-stone-200 p-2.5 dark:border-stone-800">
                <span className="text-xl" aria-hidden="true">{icon}</span>
                <span className="mt-0.5 block leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Purchase panel ── */}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-700 dark:text-brand-400">{brand?.name}</p>
          <h1 className="mt-1 text-xl font-extrabold leading-snug tracking-tight text-stone-900 dark:text-white sm:text-2xl">{product.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 rounded-md bg-brand-800 px-2 py-1 font-bold text-white">{product.rating} ★ <span className="font-normal opacity-80">| {product.reviewCount.toLocaleString('en-IN')} reviews</span></span>
            {product.bought > 0 && <span className="font-semibold text-stone-500 dark:text-stone-400">{product.bought}+ bought this month</span>}
            <span className="font-semibold text-stone-400">SKU: {product.id.toUpperCase()}</span>
          </div>

          {/* Price */}
          <div className="mt-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">{formatPrice(pack.price)}</span>
              <span className="text-lg text-stone-400 line-through">{formatPrice(pack.mrp)}</span>
              {discount > 0 && <span className="rounded-md bg-accent-100 px-2 py-0.5 text-sm font-extrabold text-accent-700">Save {discount}%</span>}
            </div>
            <p className="mt-0.5 text-[10px] font-semibold text-stone-500 dark:text-stone-400">Inclusive of all taxes · MRP for {pack.label}</p>

            {/* Pack size selector */}
            <fieldset className="mt-3">
              <legend className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 dark:text-stone-400">Pack size</legend>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {product.packSizes.map((size, i) => (
                  <button key={size.label} type="button" onClick={() => setSelectedPack(i)} aria-pressed={selectedPack === i} className={`rounded-xl border-2 px-3 py-2 text-left transition ${selectedPack === i ? 'border-brand-700 bg-white shadow dark:border-brand-500 dark:bg-stone-800' : 'border-stone-200 hover:border-brand-400 dark:border-stone-700'}`}>
                    <span className="block text-xs font-extrabold text-stone-800 dark:text-stone-100">{size.label}</span>
                    <span className="block text-[11px] font-bold text-brand-800 dark:text-brand-300">{formatPrice(size.price)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Qty + stock */}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-xl border-2 border-stone-200 dark:border-stone-700" aria-label="Quantity selector">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((v) => Math.max(1, v - 1))} className="h-10 w-10 text-lg font-bold text-stone-600 hover:text-brand-700 dark:text-stone-300">−</button>
                <span className="w-10 text-center text-base font-extrabold" aria-live="polite">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty((v) => Math.min(20, v + 1))} className="h-10 w-10 text-lg font-bold text-stone-600 hover:text-brand-700 dark:text-stone-300">+</button>
              </div>
              <p className={`text-xs font-extrabold ${product.stock > 20 ? 'text-brand-700 dark:text-brand-400' : 'text-accent-700'}`}>
                {product.stock > 20 ? '✓ In stock' : `Only ${product.stock} left — order soon`}
              </p>
            </div>

            {/* Pincode check */}
            <form onSubmit={checkPincode} className="mt-3 flex items-center gap-2">
              <label htmlFor="pincode" className="sr-only">PIN code for delivery estimate</label>
              <input id="pincode" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="Enter PIN code" className="h-10 w-36 rounded-xl border border-stone-300 px-3 text-sm outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-800" />
              <button type="submit" className="h-10 rounded-xl border border-brand-700 px-3 text-xs font-extrabold text-brand-800 transition hover:bg-brand-50 dark:border-brand-500 dark:text-brand-300">Check</button>
              {pincodeMsg && <span role="status" className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">{pincodeMsg}</span>}
            </form>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-stretch gap-2">
            <button type="button" onClick={() => addToCart(product.id, pack.label, qty)} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-brand-700 text-sm font-extrabold text-brand-800 transition hover:bg-brand-50 active:scale-[0.98] dark:border-brand-500 dark:text-brand-300 dark:hover:bg-stone-800 sm:text-base">
              🛒 Add to Cart
            </button>
            <button type="button" onClick={buyNow} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent-500 text-sm font-extrabold text-amber-950 shadow transition hover:bg-accent-400 active:scale-[0.98] sm:text-base">
              ⚡ Buy Now
            </button>
            <button type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} title={saved ? 'Saved to wishlist' : 'Add to wishlist'} className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-stone-200 text-stone-500 transition hover:border-red-300 hover:text-red-500 dark:border-stone-700">
              <svg viewBox="0 0 24 24" className={`h-6 w-6 ${saved ? 'fill-red-500 text-red-500' : 'fill-transparent'}`} stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.3l-.9-.8C6.6 15.9 3.5 12.9 3.5 9.3 3.5 6.8 5.5 4.8 8 4.8c1.6 0 3 .8 4 2 1-1.2 2.4-2 4-2 2.5 0 4.5 2 4.5 4.5 0 3.6-3.1 6.6-7.6 10.2l-.9.8z"/></svg>
            </button>
          </div>
          <Link to="/cart" className="mt-2 block text-center text-xs font-bold text-brand-800 hover:underline dark:text-brand-300">View cart →</Link>
        </div>
      </div>

      {/* ── Tabs: description / usage / reviews ── */}
      <section className="mt-6" aria-label="Product information">
        <div role="tablist" aria-label="Product details" className="flex gap-1 overflow-x-auto border-b border-stone-200 dark:border-stone-800">
          {[['description', 'Description'], ['usage', 'Usage & Dosage'], ['reviews', `Reviews (${product.reviewCount.toLocaleString('en-IN')})`]].map(([key, label]) => (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-extrabold transition ${tab === key ? 'border-brand-700 text-brand-800 dark:border-brand-400 dark:text-brand-300' : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400'}`}>{label}</button>
          ))}
        </div>
        <div className="py-4">
          {tab === 'description' && (
            <div className="max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300">
              <p>{product.description}</p>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                <li>✅ Category: <strong>{category?.name}</strong></li>
                <li>✅ Brand: <strong>{brand?.name}</strong></li>
                <li>✅ Tags: {product.tags.join(', ')}</li>
                <li>✅ Sold by: Farmers Products Authorised Depot, Hyderabad</li>
              </ul>
            </div>
          )}
          {tab === 'usage' && (
            <div className="max-w-3xl rounded-2xl border border-accent-400/50 bg-amber-50 p-4 text-sm leading-7 text-amber-950 dark:border-amber-900/40 dark:bg-stone-900 dark:text-amber-100">
              <p className="flex items-center gap-2 font-extrabold">⚠️ Read the label before use</p>
              <p className="mt-1.5">{product.usage}</p>
              <p className="mt-2 text-xs">Safety: wear gloves and mask while handling · do not eat or smoke during application · wash hands thoroughly · keep away from children, cattle and ponds · triple-rinse and dispose empties responsibly. For free agronomy advice call 1800-000-0000.</p>
            </div>
          )}
          {tab === 'reviews' && (
            <div className="grid gap-3 md:grid-cols-3">
              {reviewsToShow.map((review) => (
                <figure key={review.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
                  <Stars rating={review.rating} />
                  <blockquote className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">“{review.text}”</blockquote>
                  <figcaption className="mt-2 text-[10px] font-bold text-stone-500">{review.name} · {review.location}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <section className="mt-2" aria-labelledby="related-products">
          <h2 id="related-products" className="mb-3 text-lg font-extrabold text-stone-900 dark:text-white">Frequently bought together</h2>
          <ProductRow products={related} />
        </section>
      )}
    </div>
  );
}
