import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { ShopProvider } from './context/ShopContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LoginModal from './components/LoginModal';
import SupportChat from './components/SupportChat';
import Toasts from './components/Toasts';
import Home from './pages/Home';
import Listing from './pages/Listing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import TrackOrder from './pages/TrackOrder';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Reset scroll position on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// When the user opens the reset link from their email, Supabase fires PASSWORD_RECOVERY
function RecoveryListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('/reset-password', { replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);
  return null;
}

function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-7xl" role="img" aria-label="Plant">🌱</p>
      <h1 className="mt-4 text-3xl font-extrabold text-stone-800 dark:text-stone-100">404 — Field not found</h1>
      <p className="mt-2 text-sm text-stone-500">The page you sowed doesn’t exist. Let’s get you back to the harvest.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-3 font-extrabold text-white hover:bg-brand-800">Back to Home →</Link>
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      {/* HashRouter keeps the demo deployable from any static host / file path */}
      <HashRouter>
        <ScrollToTop />
        <RecoveryListener />
        <a
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('main')?.focus();
          }}
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-brand-800 focus:px-4 focus:py-3 focus:font-bold focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Listing />} />
            <Route path="/search" element={<Listing />} />
            <Route path="/deals" element={<Navigate to="/shop?deals=1" replace />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        {/* Global overlays */}
        <CartDrawer />
        <LoginModal />
        <SupportChat />
        <Toasts />
      </HashRouter>
    </ShopProvider>
  );
}