import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Ticker from '../components/Ticker';
import Carousel from '../components/Carousel';
import ProductRow from '../components/ProductRow';
import SectionTitle from '../components/SectionTitle';
import ProductImage from '../components/ProductImage';
import { Stars } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { CATEGORIES, CROPS, BRANDS, BLOGS, REVIEWS, PRODUCTS } from '../data';

export default function Home() {
  const { toast } = useShop();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');

  const deals = useMemo(() => [...PRODUCTS].sort((a, b) => b.discount - a.discount).filter((p) => p.discount >= 18).slice(0, 6), []);
  const bestSellers = useMemo(() => PRODUCTS.filter((p) => p.bestSeller).slice(0, 6), []);
  const newArrivals = useMemo(() => PRODUCTS.filter((p) => p.isNew).slice(0, 6), []);

  const subscribe = (e) => {
    e.preventDefault();
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      setEmailError('Please enter a valid email address, e.g. farmer@example.com');
      return;
    }
    setEmailError('');
    setSubscribed(true);
    toast('Subscribed! Welcome to the Farmers Products Kisan Circle 🌾');
  };

  return (
    <>
      <Ticker />

      <div className="mx-auto max-w-7xl space-y-6 px-3 py-4 sm:px-4 sm:py-6 lg:space-y-9">
        {/* Hero carousel */}
        <Carousel />

        {/* ── Categories grid ── */}
        <section aria-labelledby="home-categories">
          <SectionTitle emoji="🧭" title="Shop by Category" subtitle="Everything your farm needs, one basket away" viewAllTo="/shop" viewAllLabel="View All" />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 sm:gap-4 md:grid-cols-8">
            {CATEGORIES.filter((c) => c.slug !== 'blogs').map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center gap-1.5 rounded-2xl border border-transparent p-2 text-center transition hover:border-brand-200 hover:bg-white hover:shadow-[var(--shadow-card)] dark:hover:border-stone-800 dark:hover:bg-stone-900"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl transition group-hover:scale-110 dark:bg-stone-800 sm:h-16 sm:w-16" aria-hidden="true">{cat.icon}</span>
                <span className="text-[10px] font-bold leading-tight text-stone-700 group-hover:text-brand-900 dark:text-stone-200 dark:group-hover:text-brand-300 sm:text-[11px]">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Top Deals ── */}
        <section aria-labelledby="home-deals">
          <SectionTitle emoji="🔥" title="Top Deals" subtitle="Highest discounts this week — stocks are limited" viewAllTo="/deals" viewAllLabel="All Deals" />
          <ProductRow products={deals} />
        </section>

        {/* ── Best Sellers ── */}
        <section aria-labelledby="home-bestsellers">
          <SectionTitle emoji="⭐" title="Best Sellers" subtitle="Most loved by farmers across India" viewAllTo="/shop?sort=popularity" viewAllLabel="See All" />
          <ProductRow products={bestSellers} />
        </section>

        {/* ── Shop by Crop ── */}
        <section aria-labelledby="home-crops">
          <SectionTitle emoji="🌾" title="Shop by Crop" subtitle="Inputs curated for your crop cycle" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-4">
            {CROPS.map((crop) => (
              <Link
                key={crop.name}
                to={`/shop?crop=${crop.name.toLowerCase()}`}
                className="group relative h-28 overflow-hidden rounded-2xl sm:h-40"
                aria-label={`Shop ${crop.name} products`}
              >
                <ProductImage src={crop.image} alt={`${crop.name} crop`} emoji={crop.emoji} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" aria-hidden="true" />
                <span className="absolute bottom-2 left-3 flex items-center gap-1.5 text-sm font-extrabold text-white drop-shadow sm:text-base">
                  <span aria-hidden="true">{crop.emoji}</span> {crop.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── New Arrivals ── */}
        <section aria-labelledby="home-new">
          <SectionTitle emoji="✨" title="New Arrivals" subtitle="Fresh from brand labs and FPOs" viewAllTo="/shop?sort=newest" viewAllLabel="See All" />
          <ProductRow products={newArrivals} />
        </section>

        {/* ── Shop by Brand ── */}
        <section aria-labelledby="home-brands">
          <SectionTitle emoji="🏷️" title="Shop by Brand" subtitle="Official stock, authorised distributors only" viewAllTo="/shop" viewAllLabel="All Brands" />
          <ul className="nice-scroll flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-10 lg:overflow-visible">
            {BRANDS.map((brand) => (
              <li key={brand.slug} className="shrink-0">
                <Link
                  to={`/shop?brand=${brand.slug}`}
                  title={brand.tagline}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-2xl border border-stone-200 bg-white p-1 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 lg:h-auto lg:aspect-square lg:w-full"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: brand.color }} aria-hidden="true">{brand.initials}</span>
                  <span className="max-w-full truncate text-[9px] font-bold text-stone-600 dark:text-stone-300">{brand.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Farmer Tips / Blogs ── */}
        <section aria-labelledby="home-blogs">
          <SectionTitle emoji="📰" title="Farmer Tips &amp; News" subtitle="Practical advice from agronomists — free for every farmer" />
          <div className="nice-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6">
            {BLOGS.map((post) => (
              <article key={post.id} className="flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] dark:border-stone-800 dark:bg-stone-900 md:w-auto">
                <ProductImage src={post.image} alt={post.title} emoji="📰" className="h-28 w-full object-cover" />
                <div className="flex flex-1 flex-col p-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-accent-700 dark:text-accent-400">{post.category}</span>
                  <h3 className="mt-1 line-clamp-3 text-[11px] font-bold leading-snug text-stone-800 dark:text-stone-100">{post.title}</h3>
                  <p className="mt-auto pt-2 text-[9px] font-semibold text-stone-400">{post.date} · {post.readTime}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Customer Reviews ── */}
        <section aria-labelledby="home-reviews">
          <SectionTitle emoji="💬" title="What Farmers Say" subtitle="Real orders, real harvests — 1.2 lakh+ verified deliveries" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REVIEWS.slice(0, 8).map((review) => (
              <figure key={review.id} className="flex flex-col rounded-2xl border border-brand-100 bg-brand-50/60 p-4 dark:border-stone-800 dark:bg-stone-900">
                <Stars rating={review.rating} />
                <blockquote className="mt-2 line-clamp-4 text-xs leading-relaxed text-stone-700 dark:text-stone-200">“{review.text}”</blockquote>
                <figcaption className="mt-auto pt-3">
                  <p className="text-xs font-extrabold text-stone-800 dark:text-stone-100">{review.name}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">{review.location}</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-400">{review.crop} · {review.product}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Newsletter signup ── */}
        <section aria-labelledby="home-newsletter" className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-5 text-white shadow-[var(--shadow-lift)] sm:p-8">
          <div className="grid items-center gap-5 md:grid-cols-2">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-accent-400">Kisan Circle Newsletter</p>
              <h2 id="home-newsletter" className="mt-1 text-xl font-extrabold leading-snug sm:text-2xl">Weekly crop advice, mandi rates &amp; schemes — in your language</h2>
              <p className="mt-1 text-xs text-brand-200 sm:text-sm">Join 86,000 farmers getting one useful WhatsApp-style digest every Monday. Unsubscribe anytime.</p>
            </div>
            {subscribed ? (
              <div role="status" className="rounded-2xl bg-white/10 p-6 text-center">
                <span className="text-4xl" aria-hidden="true">✅</span>
                <p className="mt-2 font-extrabold">You’re in, Kisan Mitra!</p>
                <p className="text-xs text-brand-200">First digest arrives Monday, 6 AM. Happy farming! 🌾</p>
              </div>
            ) : (
              <form onSubmit={subscribe} noValidate className="rounded-2xl bg-white/10 p-4">
                <label htmlFor="newsletter-email" className="text-[11px] font-bold uppercase tracking-wide text-brand-100">Email address</label>
                <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder="farmer@example.com"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? 'newsletter-error' : undefined}
                    className="h-12 flex-1 rounded-xl border-2 border-transparent bg-white px-4 text-sm font-medium text-stone-800 outline-none placeholder:text-stone-400 focus:border-accent-400"
                  />
                  <button type="submit" className="h-12 rounded-xl bg-accent-500 px-6 text-sm font-extrabold text-amber-950 transition hover:bg-accent-400 active:scale-95">Subscribe</button>
                </div>
                {emailError && <p id="newsletter-error" role="alert" className="mt-1.5 text-xs font-semibold text-amber-300">{emailError}</p>}
                <p className="mt-1.5 text-[10px] text-brand-300">We never spam. Your email stays on this device only (demo).</p>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Floating support handled globally in App */}
    </>
  );
}
