/* ══════════════════════════════════════════════════════════════
   Harvest Direct — app logic
   • Catalog, filters, cart, checkout (static demo)
   • Orders & farmer listings POST to /api when the Node server
     is running (see server.js); otherwise fall back to
     localStorage so nothing is lost on this device.
   ══════════════════════════════════════════════════════════════ */
'use strict';

/* ── CONFIG — swap these for the real thing ───────────────────
   1. SHOP_WHATSAPP: full international number, digits only. */
const SHOP_WHATSAPP = '91-9347939628';

/* ── Sample catalog (placeholders — replace with real data) ── */
const CROPS = [
  { id: 'wheat-sharbati', name: 'Sharbati Wheat', category: 'grains', price: 28, unit: 'kg',
    farm: 'Kisan Agro Farms · Sehore, MP', emoji: '🌾', badge: 'Bestseller' },
  { id: 'rice-basmati', name: 'Pusa Basmati Rice', category: 'grains', price: 96, unit: 'kg',
    farm: 'Godavari Green Fields · Karnal, HR', emoji: '🍚', badge: 'Aged 2 yrs' },
  { id: 'toor-dal', name: 'Toor Dal (Arhar)', category: 'pulses', price: 145, unit: 'kg',
    farm: 'Deccan Dal Farms · Latur, MH', emoji: '🫘', badge: null },
  { id: 'kabuli-chana', name: 'Kabuli Chana', category: 'pulses', price: 112, unit: 'kg',
    farm: 'Malwa Pulses Co-op · Indore, MP', emoji: '🫛', badge: null },
  { id: 'turmeric-lakadong', name: 'Lakadong Turmeric', category: 'spices', price: 240, unit: 'kg',
    farm: 'Jaintia Hills Spice Co. · Meghalaya', emoji: '🟡', badge: 'High curcumin' },
  { id: 'redchilli-guntur', name: 'Guntur Red Chilli', category: 'spices', price: 175, unit: 'kg',
    farm: 'Guntur Spice Gardens · Guntur, AP', emoji: '🌶️', badge: null },
  { id: 'tomato-vine', name: 'Vine-Ripened Tomato', category: 'vegetables', price: 34, unit: 'kg',
    farm: 'Sahyadri Fresh Produce · Nashik, MH', emoji: '🍅', badge: 'Picked today' },
  { id: 'palak-fresh', name: 'Fresh Palak (Spinach)', category: 'vegetables', price: 48, unit: 'kg',
    farm: 'Kurla Greens Farm · Mumbai, MH', emoji: '🥬', badge: null },
];

const CATEGORIES = [
  { id: 'all', label: 'All crops' },
  { id: 'grains', label: '🌾 Grains' },
  { id: 'pulses', label: '🫘 Pulses' },
  { id: 'spices', label: '🌶️ Spices' },
  { id: 'vegetables', label: '🥬 Vegetables' },
];

const CART_KEY = 'hd.cart';
const ORDERS_KEY = 'hd.orders';
const LISTINGS_KEY = 'hd.listings';

/* ── State ────────────────────────────────────────────────── */
let activeCategory = 'all';
let cart = loadJSON(CART_KEY, {}); // { cropId: kg }

/* ── Helpers ──────────────────────────────────────────────── */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const formatINR = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const cropById = (id) => CROPS.find((c) => c.id === id);

function loadJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode etc. */ }
}

function isValidIndianPhone(raw) {
  const digits = String(raw).replace(/[\s\-()]/g, '').replace(/^\+/, '');
  return /^(91)?[6-9]\d{9}$/.test(digits);
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 3400);
}

/** Try the Node API; throw if unavailable/error so callers can fall back. */
async function api(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
  return res.json();
}

const cartQty = (id) => Number(cart[id] || 0);
const cartEntries = () => Object.entries(cart).filter(([, kg]) => kg > 0);
const cartTotal = () => cartEntries().reduce((sum, [id, kg]) => sum + (cropById(id)?.price || 0) * kg, 0);
const cartCount = () => cartEntries().length;

/* ════════════════════════════════════════════════════════════
   Catalog rendering
   ════════════════════════════════════════════════════════════ */
function renderFilters() {
  const wrap = $('#categoryFilters');
  wrap.innerHTML = '';
  for (const cat of CATEGORIES) {
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.type = 'button';
    btn.textContent = cat.label;
    btn.setAttribute('aria-pressed', String(cat.id === activeCategory));
    btn.addEventListener('click', () => {
      activeCategory = cat.id;
      renderFilters();
      renderCatalog();
    });
    wrap.appendChild(btn);
  }
}

function renderCatalog() {
  const grid = $('#cropGrid');
  grid.innerHTML = '';
  const visible = CROPS.filter((c) => activeCategory === 'all' || c.category === activeCategory);
  $('#emptyState').hidden = visible.length !== 0;

  for (const crop of visible) {
    const card = document.createElement('article');
    card.className = 'crop-card';
    card.innerHTML = `
      <div class="crop-visual">${crop.badge ? `<span class="crop-badge">${crop.badge}</span>` : ''}<span aria-hidden="true">${crop.emoji}</span></div>
      <span class="crop-category">${crop.category}</span>
      <h3 class="crop-name">${crop.name}</h3>
      <p class="crop-farm">${crop.farm}</p>
      <p class="crop-price"><strong>${formatINR(crop.price)}</strong><span>/ ${crop.unit}</span></p>
      <div class="kg-row">
        <div class="kg-stepper" aria-label="Choose quantity in kilograms">
          <button type="button" data-step="-0.5" aria-label="Decrease quantity">−</button>
          <span class="kg-value" data-role="kg">1 kg</span>
          <button type="button" data-step="0.5" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="add-btn">Add to cart</button>
      </div>`;

    const kgEl = $('[data-role="kg"]', card);
    let kg = 1;
    const syncKg = () => { kgEl.textContent = `${formatKg(kg)} kg`; };
    $$('.kg-stepper button', card).forEach((btn) => {
      btn.addEventListener('click', () => {
        kg = Math.min(50, Math.max(0.5, kg + Number(btn.dataset.step)));
        syncKg();
      });
    });
    $('.add-btn', card).addEventListener('click', () => {
      cart[crop.id] = (cart[crop.id] || 0) + kg;
      persistCart();
      toast(`${crop.name} — ${formatKg(kg)} kg added to cart`);
    });

    grid.appendChild(card);
  }
}

const formatKg = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/* ════════════════════════════════════════════════════════════
   Cart
   ════════════════════════════════════════════════════════════ */
function persistCart() {
  saveJSON(CART_KEY, cart);
  renderCart();
}

function renderCart() {
  $('#cartCount').textContent = cartCount();
  const list = $('#cartItems');
  list.innerHTML = '';
  const entries = cartEntries();

  $('#cartEmpty').hidden = entries.length !== 0;
  $('#cartSummary').hidden = entries.length === 0;

  for (const [id, kg] of entries) {
    const crop = cropById(id);
    if (!crop) continue;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <span class="cart-item-emoji" aria-hidden="true">${crop.emoji}</span>
      <div class="cart-item-info">
        <strong>${crop.name}</strong>
        <small>${formatINR(crop.price)} / kg</small>
        <div class="cart-item-controls">
          <button class="mini-btn" data-act="dec" aria-label="Decrease quantity">−</button>
          <span aria-live="polite">${formatKg(kg)} kg</span>
          <button class="mini-btn" data-act="inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-item-line">
        ${formatINR(crop.price * kg)}
        <button class="remove-link" data-act="remove">Remove</button>
      </div>`;

    $('[data-act="dec"]', li).addEventListener('click', () => changeQty(id, -0.5));
    $('[data-act="inc"]', li).addEventListener('click', () => changeQty(id, 0.5));
    $('[data-act="remove"]', li).addEventListener('click', () => { delete cart[id]; persistCart(); });
    list.appendChild(li);
  }

  $('#cartSubtotal').textContent = formatINR(cartTotal());
  $('#cartTotal').textContent = formatINR(cartTotal());
}

function changeQty(id, delta) {
  const next = Math.min(50, (cart[id] || 0) + delta);
  if (next <= 0) delete cart[id]; else cart[id] = next;
  persistCart();
}

/* ── Cart drawer open/close ───────────────────────────────── */
const drawer = $('#cartDrawer');
const overlay = $('#overlay');
let lastFocus = null;

function openCart() {
  lastFocus = document.activeElement;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('visible'));
  $('#cartToggle').setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  $('#cartClose').focus();
}
function closeCart() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('visible');
  setTimeout(() => { overlay.hidden = true; }, 250);
  $('#cartToggle').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
$('#cartToggle').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', closeCart);
$('.cart-shop-link').addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#confirmModal').hidden) { closeConfirmModal(); return; }
  if (drawer.classList.contains('open')) closeCart();
});

/* ════════════════════════════════════════════════════════════
   Checkout & orders
   ════════════════════════════════════════════════════════════ */
function buildOrderSummaryText(customerName) {
  const lines = cartEntries().map(([id, kg]) => {
    const c = cropById(id);
    return `• ${c.name} — ${formatKg(kg)} kg × ${formatINR(c.price)} = ${formatINR(c.price * kg)}`;
  });
  return [
    `🌾 New order on Harvest Direct`,
    `Name: ${customerName}`,
    ...lines,
    `Total: ${formatINR(cartTotal())}`,
  ].join('\n');
}

function whatsappLink(text) {
  return `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

function validateCheckout() {
  const form = $('#checkoutForm');
  const name = form.customerName.value.trim();
  const phone = form.customerPhone.value.trim();
  const address = form.customerAddress.value.trim();
  if (name.length < 2) return { error: 'Please enter your full name.' };
  if (!isValidIndianPhone(phone)) return { error: 'Enter a valid 10-digit Indian mobile number.' };
  if (address.length < 10) return { error: 'Please enter a complete delivery address (min. 10 characters).' };
  return { name, phone, address };
}

$('#checkoutForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const note = $('#checkoutNote');
  note.classList.remove('error');
  note.textContent = '';

  const check = validateCheckout();
  if (check.error) { note.textContent = check.error; note.classList.add('error'); return; }

  const order = {
    id: 'HD-' + Date.now().toString(36).toUpperCase(),
    placedAt: new Date().toISOString(),
    customer: { name: check.name, phone: check.phone, address: check.address },
    items: cartEntries().map(([id, kg]) => {
      const c = cropById(id);
      return { id, name: c.name, qtyKg: kg, pricePerKg: c.price, lineTotal: c.price * kg };
    }),
    total: cartTotal(),
  };

  const btn = $('#placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Placing order…';

  let delivered = false;
  try {
    const res = await api('/api/orders', { method: 'POST', body: JSON.stringify(order) });
    order.id = res.id || order.id;
    delivered = true;
  } catch {
    const orders = loadJSON(ORDERS_KEY, []);
    orders.push(order);
    saveJSON(ORDERS_KEY, orders);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Place order';
  }

  showConfirmation(order, delivered);
  cart = {};
  persistCart();
  $('#checkoutForm').reset();
});

$('#whatsappCartBtn').addEventListener('click', () => {
  const check = validateCheckout();
  const name = check.error ? 'Customer' : check.name;
  window.open(whatsappLink(buildOrderSummaryText(name)), '_blank', 'noopener');
});

function showConfirmation(order, delivered) {
  $('#confirmOrderId').textContent = order.id;
  $('#confirmSummary').innerHTML = '';
  const ul = document.createElement('ul');
  ul.style.cssText = 'margin:0;padding-left:1.1rem';
  for (const item of order.items) {
    const li = document.createElement('li');
    li.textContent = `${item.name} — ${formatKg(item.qtyKg)} kg (${formatINR(item.lineTotal)})`;
    ul.appendChild(li);
  }
  $('#confirmSummary').appendChild(ul);
  const total = document.createElement('p');
  total.style.cssText = 'margin:.5rem 0 0;font-weight:800';
  total.textContent = `Total: ${formatINR(order.total)}`;
  $('#confirmSummary').appendChild(total);

  $('#confirmNote').textContent = delivered
    ? 'We received your order on the server. We will call to confirm delivery slot and payment.'
    : 'Server not reachable — this order is saved on this device only. Send it on WhatsApp so we don’t miss it.';

  $('#confirmWhatsapp').href = whatsappLink(
    `${buildOrderSummaryText(order.customer.name)}\nOrder ID: ${order.id}\nAddress: ${order.customer.address}`
  );

  $('#confirmModal').hidden = false;
  closeCart();
  $('#confirmClose').focus();
}
function closeConfirmModal() { $('#confirmModal').hidden = true; }
$('#confirmClose').addEventListener('click', closeConfirmModal);
$('#confirmModal').addEventListener('click', (e) => { if (e.target.id === 'confirmModal') closeConfirmModal(); });

/* ════════════════════════════════════════════════════════════
   Sell your crop + farmer listings
   ════════════════════════════════════════════════════════════ */
$('#sellForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const note = $('#sellNote');
  note.classList.remove('error');
  note.textContent = '';

  const listing = {
    id: 'LS-' + Date.now().toString(36).toUpperCase(),
    submittedAt: new Date().toISOString(),
    farmerName: form.farmerName.value.trim(),
    farmerPhone: form.farmerPhone.value.trim(),
    cropName: form.cropName.value.trim(),
    category: form.category.value,
    quantityKg: Number(form.quantityKg.value),
    pricePerKg: Number(form.pricePerKg.value),
    village: form.village.value.trim(),
  };

  if (listing.farmerName.length < 2) return setSellError('Please enter your name.');
  if (!isValidIndianPhone(listing.farmerPhone)) return setSellError('Enter a valid 10-digit Indian mobile number.');
  if (listing.cropName.length < 2) return setSellError('Please name the crop.');
  if (!(listing.quantityKg > 0)) return setSellError('Quantity must be at least 1 kg.');
  if (!(listing.pricePerKg > 0)) return setSellError('Asking price must be more than ₹0.');
  if (listing.village.length < 2) return setSellError('Please enter your village or town.');

  function setSellError(msg) { note.textContent = msg; note.classList.add('error'); }

  let delivered = false;
  try {
    await api('/api/listings', { method: 'POST', body: JSON.stringify(listing) });
    delivered = true;
  } catch {
    const listings = loadJSON(LISTINGS_KEY, []);
    listings.push(listing);
    saveJSON(LISTINGS_KEY, listings);
  }

  note.textContent = delivered
    ? `Thanks, ${listing.farmerName.split(' ')[0]}! Your ${listing.cropName} listing was received — we'll call within 24 hours to verify and publish it.`
    : `Thanks, ${listing.farmerName.split(' ')[0]}! Server not reachable — your listing is saved on this device and will appear below.`;
  form.reset();
  await renderFarmerListings();
});

/** Public shape of a listing — phone number never rendered. */
function publicListing(l) {
  return { cropName: l.cropName, quantityKg: l.quantityKg, pricePerKg: l.pricePerKg, village: l.village, farmerName: l.farmerName, category: l.category };
}

async function renderFarmerListings() {
  const container = $('#farmerListings');
  const empty = $('#listingsEmpty');
  container.innerHTML = '';

  let serverListings = [];
  try {
    const res = await api('/api/listings');
    serverListings = Array.isArray(res.listings) ? res.listings : [];
  } catch { /* offline / static file:// — use localStorage only */ }
  const localListings = loadJSON(LISTINGS_KEY, []).map(publicListing);
  const all = [...serverListings, ...localListings].slice(0, 12);

  empty.hidden = all.length !== 0;
  for (const l of all) {
    const card = document.createElement('article');
    card.className = 'listing-card';
    const h = document.createElement('h3');
    h.textContent = l.cropName || 'Unnamed crop';
    const meta1 = document.createElement('p');
    meta1.className = 'listing-meta';
    meta1.textContent = `${Number(l.quantityKg).toLocaleString('en-IN')} kg available · ${l.village || 'Village withheld'}`;
    const meta2 = document.createElement('p');
    meta2.className = 'listing-meta';
    meta2.textContent = `Listed by ${l.farmerName || 'A farmer'} · ${l.category || 'other'}`;
    const price = document.createElement('p');
    price.className = 'listing-price';
    price.textContent = `${formatINR(l.pricePerKg)} / kg`;
    card.append(h, meta1, meta2, price);
    container.appendChild(card);
  }
}

/* ════════════════════════════════════════════════════════════
   Boot
   ════════════════════════════════════════════════════════════ */
renderFilters();
renderCatalog();
renderCart();
renderFarmerListings();
if (SHOP_WHATSAPP === '910000000000') {
  console.warn('[Harvest Direct] SHOP_WHATSAPP is still the placeholder. Edit js/app.js to set your number.');
}
