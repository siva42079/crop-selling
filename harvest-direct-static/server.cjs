/* ══════════════════════════════════════════════════════════════
   Harvest Direct — zero-dependency server (Node ≥ 18)
   • Serves the static site (index.html, css/, js/)
   • POST /api/orders    → append to data/orders.json
   • POST /api/listings  → append to data/listings.json
   • GET  /api/listings  → public, sanitized (no phone numbers)
   • GET  /admin?key=…   → full orders + listings (needs ADMIN_KEY)
   Run:  node server.js     →  http://localhost:3000
   ══════════════════════════════════════════════════════════════ */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const ADMIN_KEY = process.env.ADMIN_KEY || 'harvest-direct-admin';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const MAX_BODY = 64 * 1024; // 64 KB cap — plenty for a marketplace form

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

fs.mkdirSync(DATA_DIR, { recursive: true });

/* ── JSON store helpers ─────────────────────────────────── */
function readStore(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return []; }
}
function appendStore(file, entry) {
  const items = readStore(file);
  items.push(entry);
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2));
  fs.renameSync(tmp, file); // atomic-ish on same filesystem
}

/* ── HTTP helpers ───────────────────────────────────────── */
function send(res, status, body, type = 'application/json; charset=utf-8') {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}
const sendJSON = (res, status, obj) => send(res, status, obj);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) { reject(new Error('Body too large')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const str = (v, max = 300) => String(v ?? '').trim().slice(0, max);
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const isValidPhone = (v) => /^(\+91|91)?[6-9]\d{9}$/.test(String(v).replace(/[\s\-()]/g, ''));
const escapeHTML = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

/* ── API handlers ───────────────────────────────────────── */
function handleCreateOrder(body) {
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const order = {
    id: str(body.id, 40) || 'HD-' + Date.now().toString(36).toUpperCase(),
    placedAt: new Date().toISOString(),
    customer: {
      name: str(body.customer?.name, 120),
      phone: str(body.customer?.phone, 20),
      address: str(body.customer?.address, 500),
    },
    items: items.map((i) => ({
      id: str(i.id, 60),
      name: str(i.name, 120),
      qtyKg: num(i.qtyKg),
      pricePerKg: num(i.pricePerKg),
      lineTotal: num(i.lineTotal),
    })),
    total: num(body.total),
  };
  if (order.customer.name.length < 2) return { error: 'Customer name missing' };
  if (!isValidPhone(order.customer.phone)) return { error: 'Invalid phone number' };
  if (order.customer.address.length < 10) return { error: 'Address too short' };
  if (!order.items.length) return { error: 'Order has no items' };
  appendStore(ORDERS_FILE, order);
  return { ok: true, id: order.id };
}

function handleCreateListing(body) {
  const listing = {
    id: str(body.id, 40) || 'LS-' + Date.now().toString(36).toUpperCase(),
    submittedAt: new Date().toISOString(),
    farmerName: str(body.farmerName, 120),
    farmerPhone: str(body.farmerPhone, 20),
    cropName: str(body.cropName, 120),
    category: str(body.category, 30) || 'other',
    quantityKg: num(body.quantityKg),
    pricePerKg: num(body.pricePerKg),
    village: str(body.village, 150),
  };
  if (listing.farmerName.length < 2) return { error: 'Farmer name missing' };
  if (!isValidPhone(listing.farmerPhone)) return { error: 'Invalid phone number' };
  if (listing.cropName.length < 2) return { error: 'Crop name missing' };
  if (listing.quantityKg <= 0) return { error: 'Quantity must be positive' };
  if (listing.pricePerKg <= 0) return { error: 'Price must be positive' };
  if (listing.village.length < 2) return { error: 'Village missing' };
  appendStore(LISTINGS_FILE, listing);
  return { ok: true, id: listing.id };
}

const publicListing = (l) => ({
  id: l.id, cropName: l.cropName, category: l.category,
  quantityKg: l.quantityKg, pricePerKg: l.pricePerKg,
  village: l.village, farmerName: l.farmerName, submittedAt: l.submittedAt,
});

/* ── Admin page (escapes all user data) ─────────────────── */
function renderAdmin() {
  const orders = readStore(ORDERS_FILE);
  const listings = readStore(LISTINGS_FILE);
  const orderRows = orders.slice().reverse().map((o) => `
    <tr><td>${escapeHTML(o.id)}</td><td>${escapeHTML(o.placedAt)}</td>
    <td>${escapeHTML(o.customer?.name)}<br><small>${escapeHTML(o.customer?.phone)}</small></td>
    <td>${escapeHTML(o.customer?.address)}</td>
    <td>${(o.items || []).map((i) => `${escapeHTML(i.name)} × ${escapeHTML(i.qtyKg)} kg`).join('<br>')}</td>
    <td>${formatINR(o.total)}</td></tr>`).join('');
  const listingRows = listings.slice().reverse().map((l) => `
    <tr><td>${escapeHTML(l.id)}</td><td>${escapeHTML(l.submittedAt)}</td>
    <td>${escapeHTML(l.farmerName)}<br><small>${escapeHTML(l.farmerPhone)}</small></td>
    <td>${escapeHTML(l.cropName)} (${escapeHTML(l.category)})</td>
    <td>${escapeHTML(l.quantityKg)} kg</td><td>${formatINR(l.pricePerKg)}</td>
    <td>${escapeHTML(l.village)}</td></tr>`).join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Harvest Direct — Admin</title>
<style>
  body{font-family:system-ui,sans-serif;margin:2rem;background:#faf6ec;color:#21312a}
  h1,h2{font-family:Georgia,serif;color:#14382a} table{border-collapse:collapse;width:100%;background:#fff;margin-bottom:2.5rem;font-size:.85rem}
  th,td{border:1px solid #e4ddd0;padding:.5rem .6rem;text-align:left;vertical-align:top} th{background:#1d5c3f;color:#fff}
  tr:nth-child(even){background:#fffdf2} small{color:#5f6f66}
</style></head><body>
<h1>🌾 Harvest Direct — Admin</h1>
<h2>Orders (${orders.length})</h2>
<table><thead><tr><th>ID</th><th>Placed</th><th>Customer</th><th>Address</th><th>Items</th><th>Total</th></tr></thead>
<tbody>${orderRows || '<tr><td colspan="6">No orders yet.</td></tr>'}</tbody></table>
<h2>Farmer listings (${listings.length})</h2>
<table><thead><tr><th>ID</th><th>Submitted</th><th>Farmer</th><th>Crop</th><th>Qty</th><th>Price/kg</th><th>Village</th></tr></thead>
<tbody>${listingRows || '<tr><td colspan="7">No listings yet.</td></tr>'}</tbody></table>
</body></html>`;
}

/* ── Static file serving (path-traversal safe) ──────────── */
function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden', 'text/plain');
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain');
    send(res, 200, data, MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
  });
}

/* ── Router ─────────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (req.method === 'POST' && pathname === '/api/orders') {
      const body = await readBody(req);
      const result = handleCreateOrder(body);
      return sendJSON(res, result.error ? 400 : 201, result);
    }
    if (req.method === 'POST' && pathname === '/api/listings') {
      const body = await readBody(req);
      const result = handleCreateListing(body);
      return sendJSON(res, result.error ? 400 : 201, result);
    }
    if (req.method === 'GET' && pathname === '/api/listings') {
      return sendJSON(res, 200, { listings: readStore(LISTINGS_FILE).map(publicListing).slice(-12).reverse() });
    }
    if (req.method === 'GET' && pathname === '/admin') {
      if (url.searchParams.get('key') !== ADMIN_KEY) {
        return send(res, 401, 'Unauthorized — append ?key=YOUR_ADMIN_KEY (set ADMIN_KEY env var)', 'text/plain');
      }
      return send(res, 200, renderAdmin(), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' || req.method === 'HEAD') {
      return serveStatic(req, res, pathname);
    }
    send(res, 405, 'Method not allowed', 'text/plain');
  } catch (err) {
    sendJSON(res, err.message === 'Body too large' ? 413 : 400, { error: err.message || 'Bad request' });
  }
});

server.listen(PORT, () => {
  console.log(`🌾 Harvest Direct running at http://localhost:${PORT}`);
  console.log(`   Admin view:  http://localhost:${PORT}/admin?key=${ADMIN_KEY}`);
  console.log(`   Orders saved to ${ORDERS_FILE}`);
  console.log(`   Listings saved to ${LISTINGS_FILE}`);
  if (ADMIN_KEY === 'harvest-direct-admin') {
    console.log('   ⚠  Using the default admin key. Set ADMIN_KEY=your-secret before sharing the link.');
  }
});
