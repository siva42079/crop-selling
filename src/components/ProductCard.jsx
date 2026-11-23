import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { formatPrice, getBrand } from '../data';
import ProductImage from './ProductImage';

const CATEGORY_EMOJI = {
  seeds: '🌾', 'crop-protection': '🛡️', 'crop-nutrition': '🧪', equipment: '🚜',
  'animal-husbandry': '🐄', organic: '🌿', 'fresh-produce': '🍅',
};

/** Star row rendered with accessible text label */
export function Stars({ rating, size = 'text-sm' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`} aria-label={`Rated ${rating} out of 5`} role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i <= full ? 'fill-amber-400' : i === full + 1 && half ? 'fill-amber-200' : 'fill-stone-200 dark:fill-stone-700'}`} aria-hidden="true">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 15l-5.3 2.6 1-5.8-4.2-4.1 5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/** The one product card used everywhere: deals, listings, related products… */
export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const navigate = useNavigate();
  const saved = isWishlisted(product.id);
  const brand = getBrand(product.brand);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] dark:border-stone-800 dark:bg-stone-900">
      {/* Discount ribbon */}
      {product.discount > 0 && (
        <span className="absolute left-0 top-3 z-10 rounded-r-full bg-accent-500 py-1 pl-2 pr-3 text-[11px] font-extrabold tracking-wide text-amber-950 shadow-sm">
          {product.discount}% OFF
        </span>
      )}
      {/* Wishlist toggle */}
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/90 p-2 text-stone-500 shadow backdrop-blur transition hover:scale-110 hover:text-red-500 dark:bg-stone-800/90 dark:text-stone-300"
      >
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${saved ? 'fill-red-500 text-red-500' : 'fill-transparent'}`} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.3l-.9-.8C6.6 15.9 3.5 12.9 3.5 9.3 3.5 6.8 5.5 4.8 8 4.8c1.6 0 3 .8 4 2 1-1.2 2.4-2 4-2 2.5 0 4.5 2 4.5 4.5 0 3.6-3.1 6.6-7.6 10.2l-.9.8z" />
        </svg>
      </button>

      <Link to={`/product/${product.id}`} className="block overflow-hidden" aria-label={`View ${product.name}`}>
        <ProductImage
          src={product.image}
          alt={`${product.name} — ${brand?.name || 'product'} pack shot`}
          emoji={CATEGORY_EMOJI[product.category] || '🌱'}
          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-48"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">{brand?.name || product.brand}</span>
        <Link to={`/product/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-stone-800 hover:text-brand-800 dark:text-stone-100 dark:hover:text-brand-300">
          {product.name}
        </Link>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-brand-800 px-1.5 py-0.5 text-[11px] font-bold text-white">
            {product.rating} ★
          </span>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">({product.reviewCount.toLocaleString('en-IN')})</span>
          {product.bought > 0 && <span className="hidden text-[10px] text-stone-400 xl:inline">• {product.bought}+ bought</span>}
        </div>

        <div className="mt-auto pt-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-extrabold text-stone-900 dark:text-white">{formatPrice(product.price)}</span>
            <span className="text-xs text-stone-400 line-through">{formatPrice(product.mrp)}</span>
            {product.discount > 0 && <span className="text-xs font-bold text-brand-700 dark:text-brand-400">Save {product.discount}%</span>}
          </div>
          <p className="text-[10px] text-stone-400">First pack: {product.packSizes[0].label}</p>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() => (outOfStock ? null : addToCart(product.id, product.packSizes[0].label, 1))}
          className="mt-2 flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-brand-700 bg-transparent text-sm font-bold text-brand-800 transition active:scale-95 hover:bg-brand-700 hover:text-white disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400 dark:border-brand-500 dark:text-brand-300 dark:hover:bg-brand-600 dark:hover:text-white"
        >
          {outOfStock ? 'Out of stock' : (
            <>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4H17M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" /></svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
