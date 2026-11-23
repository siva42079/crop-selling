import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct, COUPONS } from '../data';

// ── Global shop state ─────────────────────────────────────────────────────────
// Cart, wishlist, login and coupons are kept in memory (per spec).
// Theme preference is the only thing persisted (localStorage).

const ShopContext = createContext(null);

const FREE_DELIVERY_AT = 499;
const DELIVERY_FEE = 40;

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([]); // [{ id, pack, qty }]
  const [wishlist, setWishlist] = useState([]); // [productId]
  const [user, setUser] = useState(null); // { name, contact } | null
  const [coupon, setCoupon] = useState(null); // applied coupon object
  const [toasts, setToasts] = useState([]); // [{ id, message }]
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('fp-theme') === 'dark' ? 'dark' : 'light'
  );

  // Apply / remove the `dark` class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('fp-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  // ── Toasts ──────────────────────────────────────────────────────────────────
  const toast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message }]); // keep max 3
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  // ── Cart operations ─────────────────────────────────────────────────────────
  const addToCart = useCallback((productId, packLabel, qty = 1) => {
    const product = getProduct(productId);
    if (!product) return;
    const pack = packLabel || product.packSizes[0].label;
    setCart((prev) => {
      const i = prev.findIndex((l) => l.id === productId && l.pack === pack);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(next[i].qty + qty, 20) };
        return next;
      }
      return [...prev, { id: productId, pack, qty }];
    });
    setCartOpen(true);
    toast(`Added to cart — ${product.name.slice(0, 48)}${product.name.length > 48 ? '…' : ''}`);
  }, [setCartOpen, toast]);

  const removeFromCart = useCallback((productId, pack) => {
    setCart((prev) => prev.filter((l) => !(l.id === productId && l.pack === pack)));
  }, []);

  const setQty = useCallback((productId, pack, qty) => {
    setCart((prev) =>
      qty < 1
        ? prev.filter((l) => !(l.id === productId && l.pack === pack))
        : prev.map((l) => (l.id === productId && l.pack === pack ? { ...l, qty: Math.min(qty, 20) } : l))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
  }, []);

  // ── Wishlist ────────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      toast(exists ? 'Removed from wishlist' : 'Saved to wishlist ♥');
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  }, [toast]);

  // ── Coupons ────────────────────────────────────────────────────────────────
  const applyCoupon = useCallback((code) => {
    const clean = String(code || '').trim().toUpperCase();
    const found = COUPONS[clean];
    if (!found) return { ok: false, message: `Coupon "${clean || '?'}" is not valid. Try FARM10.` };
    setCoupon(found);
    return { ok: true, message: `${found.code} applied — ${found.label}` };
  }, []);

  const removeCoupon = useCallback(() => setCoupon(null), []);

  // ── Derived cart totals (recomputed instantly) ──────────────────────────────
  const cartLines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = getProduct(line.id);
          if (!product) return null;
          const packInfo = product.packSizes.find((s) => s.label === line.pack) || product.packSizes[0];
          return { ...line, product, packInfo, lineTotal: packInfo.price * line.qty, lineMrp: packInfo.mrp * line.qty };
        })
        .filter(Boolean),
    [cart]
  );

  const totals = useMemo(() => {
    const subtotal = cartLines.reduce((s, l) => s + l.lineTotal, 0);       // what customer pays for goods
    const mrpTotal = cartLines.reduce((s, l) => s + l.lineMrp, 0);         // MRP value
    const mrpDiscount = mrpTotal - subtotal;                               // product-level discount
    const couponDiscount = coupon
      ? coupon.type === 'percent'
        ? Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount || Infinity)
        : Math.min(coupon.value, subtotal)
      : 0;
    const delivery = subtotal === 0 || subtotal - couponDiscount >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
    const total = Math.max(0, subtotal - couponDiscount) + delivery;
    const count = cartLines.reduce((s, l) => s + l.qty, 0);
    const savings = mrpDiscount + couponDiscount;
    return { subtotal, mrpTotal, mrpDiscount, couponDiscount, delivery, total, count, savings };
  }, [cartLines, coupon]);

  // ── Dummy auth ─────────────────────────────────────────────────────────────
  const login = useCallback((contact) => setUser({ name: contact.name, contact: contact.id }), []);
  const logout = useCallback(() => {
    setUser(null);
    toast('Logged out. See you on the farm!');
  }, [toast]);

  const value = {
    cart, cartLines, totals, coupon, applyCoupon, removeCoupon,
    addToCart, removeFromCart, setQty, clearCart,
    wishlist, toggleWishlist, isWishlisted: (id) => wishlist.includes(id),
    user, login, logout,
    cartOpen, setCartOpen, loginOpen, setLoginOpen,
    toasts, toast,
    theme, toggleTheme,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within <ShopProvider>');
  return ctx;
}
