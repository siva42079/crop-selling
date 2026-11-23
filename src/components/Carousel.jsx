import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SLIDES, formatPrice } from '../data';
import ProductImage from './ProductImage';

/**
 * Auto-playing promo carousel (5s), arrows + dots, pauses on hover/focus.
 * Each slide: brand, headline, old → new price and a Buy Now CTA.
 */
export default function Carousel() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;
  const regionRef = useRef(null);

  const go = useCallback((dir) => setIndex((i) => (i + dir + count) % count), [count]);
  const goTo = (i) => setIndex(((i % count) + count) % count);

  // Autoplay — disabled while paused (hover/focus) or when tab hidden
  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(id);
  }, [paused, count]);

  // Arrow keys when the carousel region has focus
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  };

  return (
    <section
      ref={regionRef}
      aria-roledescription="carousel"
      aria-label="Featured offers"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-lift)] outline-none ring-accent-500 focus-visible:ring-4 sm:rounded-3xl"
    >
      {/* Slides */}
      <div className="relative h-52 w-full sm:h-64 md:h-80 lg:h-96">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${count}: ${slide.brand}`}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-500 ${i === index ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}
          >
            <ProductImage src={slide.image} alt={`${slide.brand} — ${slide.headline}`} className="absolute inset-0 h-full w-full object-cover" emoji="🌾" />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.tint}`} aria-hidden="true" />
            <div className="relative flex h-full max-w-xl flex-col justify-center gap-1.5 p-4 sm:gap-3 sm:p-7">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-stone-800 shadow sm:text-[11px]">
                <span className="h-2 w-2 rounded-full" style={{ background: slide.brandColor }} aria-hidden="true" />
                {slide.brand}
              </span>
              <h2 className="max-w-md text-lg font-extrabold leading-snug text-white drop-shadow sm:text-2xl lg:text-3xl">{slide.headline}</h2>
              <p className="hidden text-xs text-white/85 sm:block sm:text-sm">{slide.sub}</p>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-white">
                  <span className="mr-2 text-xs text-white/70 line-through sm:text-base">{formatPrice(slide.oldPrice)}</span>
                  <span className="text-xl font-extrabold sm:text-3xl">{formatPrice(slide.newPrice)}</span>
                </p>
                <button
                  type="button"
                  tabIndex={i === index ? 0 : -1}
                  onClick={() => navigate(`/product/${slide.productId}`)}
                  className="rounded-full bg-accent-500 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-amber-950 shadow-lg transition hover:bg-accent-400 active:scale-95 sm:px-6 sm:text-sm"
                >
                  {slide.cta} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur transition hover:bg-black/55 sm:left-4 sm:p-3">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <button type="button" onClick={() => go(1)} aria-label="Next slide" className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur transition hover:bg-black/55 sm:right-4 sm:p-3">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-3">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-accent-400' : 'w-2 bg-white/60 hover:bg-white'}`}
          />
        ))}
      </div>
    </section>
  );
}
