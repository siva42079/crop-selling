import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, formatPrice, getBrand, getCategory } from '../data';
import TopBar from './TopBar';
import CategoryMenu from './CategoryMenu';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

/** Logo mark — leaf badge + wordmark */
export function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Farmers Products — home">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-2xl shadow-md" aria-hidden="true">🌱</span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-xl font-extrabold tracking-tight text-brand-900 dark:text-brand-300 sm:text-2xl">
            Farmers<span className="text-accent-600"> Products</span>
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700/80 dark:text-brand-400 sm:block">Direct from farm · to farm</span>
        </span>
      )}
    </Link>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const { cartOpen, setCartOpen, loginOpen, setLoginOpen, totals, wishlist, user, logout, theme, toggleTheme, toast } = useShop();

  const [menuOpen, setMenuOpen] = useState(false);       // mobile category panel
  const [query, setQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [highlight, setHighlight] = useState(-1);        // keyboard-highlighted suggestion
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const searchRef = useRef(null);
  const listRef = useRef(null);

  // Live suggestions: match name, brand and category — max 6 hits
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (getBrand(p.brand)?.name || '').toLowerCase().includes(q) ||
      (getCategory(p.category)?.name || '').toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
    ).slice(0, 6);
  }, [query]);

  // Close dropdowns on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocus(false);
      if (!e.target.closest?.('[data-popover]')) { setLangOpen(false); setAccountOpen(false); }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const submitSearch = (e) => {
    e?.preventDefault();
    const q = query.trim();
    setSearchFocus(false);
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const onSearchKeyDown = (e) => {
    if (!suggestions.length) { if (e.key === 'Escape') setSearchFocus(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => (h + 1) % suggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1)); }
    else if (e.key === 'Enter' && highlight >= 0) { e.preventDefault(); setSearchFocus(false); navigate(`/product/${suggestions[highlight].id}`); }
    else if (e.key === 'Escape') { setSearchFocus(false); setHighlight(-1); }
  };

  // Voice search via Web Speech API when the browser supports it
  const startVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Voice search is not supported in this browser. Try Chrome.'); return; }
    try {
      const rec = new SR();
      rec.lang = lang.code === 'te' ? 'te-IN' : lang.code === 'hi' ? 'hi-IN' : 'en-IN';
      rec.interimResults = false;
      rec.onresult = (ev) => { const text = ev.results[0][0].transcript; setQuery(text); toast(`Heard: “${text}”`); };
      rec.onerror = () => toast('Could not hear you — please try again.');
      rec.start();
      toast('Listening… speak now');
    } catch { toast('Voice search unavailable.'); }
  };

  const showSuggestions = searchFocus && suggestions.length > 0;

  const searchBar = (id, extraClass = '') => (
    <form role="search" onSubmit={submitSearch} ref={searchRef} className={`relative ${extraClass}`}>
      <label htmlFor={id} className="sr-only">Search products, brands and categories</label>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z" /></svg>
      <input
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={showSuggestions}
        aria-controls="search-suggestions"
        aria-activedescendant={highlight >= 0 ? `suggestion-${highlight}` : undefined}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setHighlight(-1); setSearchFocus(true); }}
        onFocus={() => setSearchFocus(true)}
        onKeyDown={onSearchKeyDown}
        placeholder="Search seeds, fertilizers, sprayers, brands…"
        className="h-12 w-full rounded-full border-2 border-brand-700 bg-white pl-12 pr-24 text-sm font-medium text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-brand-500 dark:border-brand-600 dark:bg-stone-900 dark:text-stone-100"
      />
      {query && (
        <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      )}
      <button type="button" onClick={startVoiceSearch} aria-label="Voice search" title="Voice search" className="absolute right-12 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-brand-700 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-stone-800">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0M12 18v3m-3 0h6"/></svg>
      </button>
      <button type="submit" aria-label="Search" className="absolute right-1 top-1/2 flex h-10 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-700 text-white transition hover:bg-brand-800">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
      </button>

      {/* Live suggestions dropdown */}
      {showSuggestions && (
        <ul ref={listRef} id="search-suggestions" role="listbox" aria-label="Search suggestions" className="nice-scroll absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-2xl border border-stone-200 bg-white py-2 shadow-[var(--shadow-lift)] dark:border-stone-700 dark:bg-stone-900">
          {suggestions.map((p, i) => (
            <li key={p.id} role="option" id={`suggestion-${i}`} aria-selected={i === highlight}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => { setSearchFocus(false); navigate(`/product/${p.id}`); }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${i === highlight ? 'bg-brand-50 dark:bg-stone-800' : ''}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-lg dark:bg-stone-800" aria-hidden="true">🌱</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-stone-800 dark:text-stone-100">{p.name}</span>
                  <span className="block text-[11px] text-stone-400">{getBrand(p.brand)?.name} · {getCategory(p.category)?.name} · {formatPrice(p.price)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <TopBar />
      {/* Main bar */}
      <div className="border-b border-brand-100 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex h-16 items-center gap-2 sm:gap-4">
            {/* Hamburger (mobile) */}
            <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-controls="mobile-category-panel" aria-label="Toggle category menu" className="rounded-xl p-2 text-brand-900 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-stone-800 lg:hidden">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d={menuOpen ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
            </button>

            <Logo />

            {/* Search — desktop */}
            {searchBar('search-desktop', 'hidden flex-1 md:block')}

            {/* Actions */}
            <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
              {/* Language dropdown */}
              <div className="relative" data-popover>
                <button type="button" onClick={() => setLangOpen((v) => !v)} aria-expanded={langOpen} aria-haspopup="listbox" aria-label="Choose language" className="flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M3.5 9h17M3.5 15h17M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/></svg>
                  <span className="hidden sm:inline">{lang.native}</span>
                  <svg viewBox="0 0 24 24" className="hidden h-4 w-4 sm:block" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="M6 9l6 6 6-6"/></svg>
                </button>
                {langOpen && (
                  <ul role="listbox" aria-label="Languages" className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-stone-200 bg-white py-1 shadow-[var(--shadow-lift)] dark:border-stone-700 dark:bg-stone-900">
                    {LANGUAGES.map((l) => (
                      <li key={l.code} role="option" aria-selected={lang.code === l.code}>
                        <button type="button" onClick={() => { setLang(l); setLangOpen(false); toast(`Language switched to ${l.label} (demo)`); }} className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-brand-50 dark:hover:bg-stone-800 ${lang.code === l.code ? 'font-bold text-brand-800 dark:text-brand-300' : ''}`}>
                          {l.native}{lang.code === l.code && <span aria-hidden="true">✓</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Theme toggle */}
              <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} className="rounded-xl p-2 text-stone-600 transition hover:bg-stone-100 dark:text-amber-300 dark:hover:bg-stone-800">
                {theme === 'dark'
                  ? <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path strokeLinecap="round" d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M4.2 19.8L6 18M18 6l1.8-1.8"/></svg>
                  : <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>}
              </button>

              {/* Track order */}
              <Link to="/track" aria-label="Track your order" title="Track Order" className="hidden flex-col items-center rounded-xl px-2 py-1 text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 md:flex">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v10H3zM14 10h4l3 3v4h-7"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/></svg>
                <span className="text-[9px] font-bold">Track</span>
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`} title="Wishlist" className="relative flex-col items-center rounded-xl px-2 py-1 text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 hidden sm:flex">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.3l-.9-.8C6.6 15.9 3.5 12.9 3.5 9.3 3.5 6.8 5.5 4.8 8 4.8c1.6 0 3 .8 4 2 1-1.2 2.4-2 4-2 2.5 0 4.5 2 4.5 4.5 0 3.6-3.1 6.6-7.6 10.2l-.9.8z"/></svg>
                <span className="text-[9px] font-bold">Wishlist</span>
                {wishlist.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">{wishlist.length}</span>}
              </Link>

              {/* Login / account */}
              {user ? (
                <div className="relative" data-popover>
                  <button type="button" onClick={() => setAccountOpen((v) => !v)} aria-expanded={accountOpen} aria-haspopup="menu" className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition hover:bg-stone-100 dark:hover:bg-stone-800">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sm font-extrabold text-white" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
                    <span className="hidden max-w-[90px] truncate text-xs font-bold text-stone-700 dark:text-stone-200 lg:block">{user.name.split(' ')[0]}</span>
                  </button>
                  {accountOpen && (
                    <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-stone-200 bg-white p-3 shadow-[var(--shadow-lift)] dark:border-stone-700 dark:bg-stone-900">
                      <p className="text-sm font-extrabold text-stone-800 dark:text-stone-100">Namaste, {user.name.split(' ')[0]} 🙏</p>
                      <p className="truncate text-xs text-stone-400">{user.contact}</p>
                      <Link to="/wishlist" onClick={() => setAccountOpen(false)} role="menuitem" className="mt-2 block rounded-xl px-3 py-2 text-sm font-medium hover:bg-brand-50 dark:hover:bg-stone-800">My Wishlist</Link>
                      <Link to="/track" onClick={() => setAccountOpen(false)} role="menuitem" className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-brand-50 dark:hover:bg-stone-800">Track Order</Link>
                      <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); logout(); }} className="mt-1 block w-full rounded-xl bg-red-50 px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/40">Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => setLoginOpen(true)} className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800" aria-label="Login or register">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path strokeLinecap="round" d="M5 20.5a7.5 7.5 0 0114 0"/></svg>
                  <span className="hidden text-xs font-extrabold md:block">Login</span>
                </button>
              )}

              {/* Cart with badge — opens the drawer */}
              <button type="button" onClick={() => setCartOpen(!cartOpen)} aria-label={`Open cart, ${totals.count} items`} title="Cart" className="relative ml-0.5 flex h-11 items-center gap-2 rounded-2xl bg-brand-700 px-3 text-white shadow-md transition hover:bg-brand-800 active:scale-95">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4H17M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/></svg>
                <span className="hidden flex-col items-start leading-none sm:flex">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-brand-200">Cart</span>
                  <span className="text-xs font-extrabold">{formatPrice(totals.subtotal)}</span>
                </span>
                {totals.count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-white bg-accent-500 px-1.5 text-[11px] font-extrabold text-amber-950 dark:border-stone-950">{totals.count}</span>}
              </button>
            </div>
          </div>

          {/* Search — mobile row */}
          {searchBar('search-mobile', 'pb-2 md:hidden')}
        </div>
      </div>

      {/* Category nav (desktop) + mobile panel */}
      <CategoryMenu mobileOpen={menuOpen} onCloseMobile={() => setMenuOpen(false)} />
    </header>
  );
}
