// ── Global constants ─────────────────────────────────────────────────────────
// Change CURRENCY / LOCALE here and the whole site re-prices itself.
export const CURRENCY = '₹';
export const LOCALE = 'en-IN';

/** Format a number as an INR price string, e.g. ₹1,299 */
export function formatPrice(value) {
  const n = Number(value) || 0;
  return `${CURRENCY}${n.toLocaleString(LOCALE, { maximumFractionDigits: 0 })}`;
}

/** Whole-percentage discount between MRP and price */
export function discountPct(price, mrp) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export const COUPONS = {
  FARM10: { code: 'FARM10', type: 'percent', value: 10, maxDiscount: 500, label: '10% off up to ₹500' },
};

export const HELPLINE = '1800-000-0000';
export const SELLER_EMAIL = 'sell@farmersproducts.in';
