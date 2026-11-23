import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data';

/** Wishlist page — saved products with quick add-to-cart via the card itself */
export default function Wishlist() {
  const { wishlist, toggleWishlist } = useShop();
  const saved = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">My Wishlist ♥</h1>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{saved.length} saved product{saved.length === 1 ? '' : 's'} — prices update live.</p>
        </div>
        {saved.length > 0 && (
          <button type="button" onClick={() => saved.forEach((p) => toggleWishlist(p.id))} className="text-xs font-bold text-red-500 hover:underline">Clear all</button>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="mt-6">
          <EmptyState emoji="💚" title="No saved products yet" subtitle="Tap the heart on any product to build your sowing-season wishlist." actionTo="/shop" actionLabel="Start exploring →" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {saved.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      <p className="mt-6 text-center text-[11px] text-stone-400">Need help choosing for your crop? <Link to="/shop?category=seeds" className="font-bold text-brand-800 hover:underline dark:text-brand-300">Browse seed catalogue</Link> or call 1800-000-0000.</p>
    </div>
  );
}
