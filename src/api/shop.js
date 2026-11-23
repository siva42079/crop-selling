import { supabase } from '../supabaseClient';

/* ── Orders ───────────────────────────────────────── */
export async function createOrder({ customer, items, total, paymentMethod }) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      items,
      total,
      payment_method: paymentMethod,
    })
    .select('id, order_code')
    .single();
  return { data, error };
}

export async function getMyOrders() {
  return supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
}

export async function getOrderByCode(code) {
  return supabase
    .from('orders')
    .select('*')
    .eq('order_code', code.trim().toUpperCase())
    .maybeSingle();
}

/* ── Wishlist ─────────────────────────────────────── */
export async function getWishlist() {
  const { data, error } = await supabase.from('wishlist').select('product_id');
  return { data: (data || []).map((r) => r.product_id), error };
}

export async function addToWishlist(productId) {
  return supabase.from('wishlist').upsert({ product_id: String(productId) });
}

export async function removeFromWishlist(productId) {
  return supabase.from('wishlist').delete().eq('product_id', String(productId));
}