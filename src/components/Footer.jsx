import { Link } from 'react-router-dom';
import { CATEGORIES, HELPLINE, SELLER_EMAIL } from '../data';
import { Logo } from './Header';

/** Rich multi-column footer */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-brand-100 bg-brand-950 text-brand-100">
      {/* USP strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 text-center md:grid-cols-4">
          {[
            ['🚚', 'Pan-India Delivery', '22,000+ villages covered'],
            ['🔬', 'Genuine Products', 'Direct from brands & FPOs'],
            ['💰', 'Best Prices', 'MRP savings + coupons'],
            ['🧑‍🌾', 'Agri Experts', 'Kisan call centre 8AM–8PM'],
          ].map(([icon, title, sub]) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 text-left">
              <span className="text-2xl sm:text-3xl" aria-hidden="true">{icon}</span>
              <span>
                <span className="block text-xs font-extrabold text-white sm:text-sm">{title}</span>
                <span className="block text-[10px] text-brand-200 sm:text-[11px]">{sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4 lg:grid-cols-5">
        {/* Brand + social */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <div className="rounded-2xl bg-white/5 p-4">
            <Logo compact />
            <p className="mt-2 text-xs text-brand-200">India’s friendly agri marketplace — seeds to harvest support, delivered to your doorstep.</p>
            <div className="mt-3 flex gap-2" aria-label="Social media">
              {['YouTube', 'Instagram', 'Facebook', 'LinkedIn', 'X'].map((s) => (
                <a key={s} href={`https://www.${s === 'X' ? 'x' : s.toLowerCase()}.com/farmersproducts`} target="_blank" rel="noreferrer" aria-label={`Farmers Products on ${s}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[10px] font-extrabold transition hover:bg-brand-700">
                  {s === 'YouTube' ? '▶' : s === 'Instagram' ? '◎' : s === 'Facebook' ? 'f' : s === 'LinkedIn' ? 'in' : '𝕏'}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Shop categories */}
        <nav aria-label="Footer shops links">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-300">Shop</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {CATEGORIES.filter((c) => c.slug !== 'blogs').map((c) => (
              <li key={c.slug}><Link to={`/shop?category=${c.slug}`} className="hover:text-white hover:underline">{c.name}</Link></li>
            ))}
          </ul>
        </nav>

        {/* Customer care */}
        <nav aria-label="Customer care">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-300">Customer Care</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li><Link to="/track" className="hover:text-white hover:underline">Track Order</Link></li>
            <li><Link to="/wishlist" className="hover:text-white hover:underline">My Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-white hover:underline">Cart &amp; Checkout</Link></li>
            <li><a href="#faq" className="hover:text-white hover:underline">FAQs</a></li>
            <li><a href={`mailto:${SELLER_EMAIL}`} className="hover:text-white hover:underline">Sell on Farmers Products</a></li>
            <li><a href="mailto:support@farmersproducts.in" className="hover:text-white hover:underline">support@farmersproducts.in</a></li>
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-300">Registered Office</p>
          <address className="mt-2 text-sm not-italic">
            Farmers Products Pvt. Ltd.<br />
            4th Floor, Krishi Bhavan,<br />
            Hyderabad, Telangana – 500032<br />
            <a href={`tel:${HELPLINE.replace(/-/g, '')}`} className="mt-2 block font-extrabold text-accent-400 hover:underline">📞 {HELPLINE}</a>
            <span className="text-[11px] text-brand-300">8 AM – 8 PM, all days</span>
          </address>
        </div>

        {/* Sell / bulk */}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-300">For Business</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li><a href={`mailto:${SELLER_EMAIL}`} className="hover:text-white hover:underline">Become a Seller</a></li>
            <li><a href="mailto:bulk@farmersproducts.in" className="hover:text-white hover:underline">Bulk &amp; FPO Orders</a></li>
            <li><a href="mailto:corporate@farmersproducts.in" className="hover:text-white hover:underline">Corporate / CSR</a></li>
            <li><a href="mailto:careers@farmersproducts.in" className="hover:text-white hover:underline">Careers</a></li>
          </ul>
          <div className="mt-3 rounded-2xl bg-white/5 p-3 text-[11px] text-brand-200">
            <p className="font-bold text-white">We accept</p>
            <p className="mt-1">UPI · RuPay · Visa · Mastercard · NetBanking · Wallets · Cash on Delivery</p>
          </div>
        </div>
      </div>

      {/* Bottom legal bar */}
      <div className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-[11px] text-brand-200 sm:flex-row">
          <p>© {year} Farmers Products Pvt. Ltd. All rights reserved. GSTIN: 36ABCPF1234A1Z5</p>
          <nav className="flex flex-wrap items-center gap-4" aria-label="Legal">
            <a href="#terms" className="hover:text-white">Terms</a>
            <a href="#privacy" className="hover:text-white">Privacy</a>
            <a href="#returns" className="hover:text-white">Returns &amp; Refunds</a>
            <a href="#shipping" className="hover:text-white">Shipping</a>
            <a href="#seeds-act" className="hover:text-white">Seeds Act Compliance</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
