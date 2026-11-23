import ProductCard from './ProductCard';

/**
 * Product grid that becomes a horizontal snap-scroll rail on small screens —
 * the common agri-app pattern for "more like this" rows.
 */
export default function ProductRow({ products }) {
  if (!products.length) return null;
  return (
    <div className="nice-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0 xl:grid-cols-6">
      {products.map((p) => (
        <div key={p.id} className="w-40 shrink-0 snap-start sm:w-48 lg:w-auto">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
