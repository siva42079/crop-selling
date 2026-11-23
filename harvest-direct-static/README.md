# ðŸŒ¾ Harvest Direct â€” farmer crop marketplace

A lightweight marketplace where buyers order grains, pulses, spices and vegetables per-kg in â‚¹ directly from farmers, and farmers can submit their harvest for listing.

## Run it

**With the server (orders & listings are actually received):**

```bash
node server.cjs
# â†’ http://localhost:3000
# Admin (all orders + farmer phones):
# â†’ http://localhost:3000/admin?key=harvest-direct-admin
```

Orders are appended to `data/orders.json`, listings to `data/listings.json`.
Set `ADMIN_KEY` (and `PORT`) as environment variables before sharing the link:

```bash
ADMIN_KEY=my-secret PORT=3000 node server.cjs
```

**As a static page (no server):** open `index.html` in a browser. Everything works except server delivery â€” orders/listings are saved to the browser's `localStorage` on that device instead, and the confirmation tells you to send the order on WhatsApp. (Hosting the folder on GitHub Pages / Netlify / Vercel works the same way.)

## What's built

- Buyer catalog: 8 sample crops across grains / pulses / spices / vegetables, category filter pills, per-kg pricing in â‚¹, kg stepper (0.5 kg steps), cart with quantities and total
- Checkout: name + Indian phone validation + address â†’ order saved to server (or localStorage fallback) â†’ confirmation modal with order ID and a **"Send order on WhatsApp"** button (pre-filled message)
- "Sell your crop" form: crop, category, quantity (kg), asking price (â‚¹/kg), village, farmer name & phone â†’ saved to server, appears under "Straight from farmers" (phone numbers are never shown publicly)
- Admin view at `/admin?key=â€¦` listing all orders and listings with contact details

## Before this is "real"

Everything marked as sample must be swapped or wired up:

1. **WhatsApp number** â€” edit `SHOP_WHATSAPP` at the top of `js/app.js`.
2. **Crops, prices, farm names** â€” edit the `CROPS` array in `js/app.js` (â‚¹ per-kg, `en-IN` formatting).
3. **Photos** â€” cards currently use emoji in a gradient tile; add `<img>` tags with real farm photos.
4. **Real order delivery** â€” the built-in `server.cjs` saves to JSON on one machine. For a public launch, swap the `fetch` calls in `js/app.js` for a hosted backend / form service, or deploy `server.cjs` on a VPS. For WhatsApp-only ordering, skip the server entirely.
5. **Admin key** â€” set `ADMIN_KEY` env var; never share the admin URL publicly.
6. **Trust & safety** â€” add verification of farmer listings, delivery/payment terms, and a privacy notice before collecting real customer addresses.

## Files

```
index.html        markup (header, hero, catalog, sell form, listings, cart, modal)
css/styles.css    styling (Fraunces + Inter, deep green / marigold / cream)
js/app.js         catalog, cart, validation, API + localStorage fallback
server.cjs         zero-dependency Node server: static site + /api/orders + /api/listings + /admin
data/             created at runtime; holds orders.json and listings.json
```


