// ── Brands (10) ──────────────────────────────────────────────────────────────
export const BRANDS = [
  { slug: 'iffco',        name: 'IFFCO',        initials: 'IF', color: '#15803d', tagline: 'India’s fertilizer cooperative' },
  { slug: 'bayer',        name: 'Bayer',        initials: 'BA', color: '#0e7a3d', tagline: 'Science for a better harvest' },
  { slug: 'syngenta',     name: 'Syngenta',     initials: 'SY', color: '#1d4ed8', tagline: 'Grow more with less' },
  { slug: 'upl',          name: 'UPL',          initials: 'UP', color: '#b45309', tagline: 'OpenAg™ – better farming' },
  { slug: 'pioneer',      name: 'Pioneer',      initials: 'PI', color: '#dc2626', tagline: 'Seeds of innovation' },
  { slug: 'mahyco',       name: 'Mahyco',       initials: 'MH', color: '#7c3aed', tagline: 'Hybrid seed pioneer since 1964' },
  { slug: 'rallis',       name: 'Rallis',       initials: 'RA', color: '#0f766e', tagline: 'Growing with the farmer' },
  { slug: 'coromandel',   name: 'Coromandel',   initials: 'CO', color: '#c2410c', tagline: 'Rural life, enriched' },
  { slug: 'zuari',        name: 'Zuari',        initials: 'ZU', color: '#1e40af', tagline: 'Dhan Ki Baat' },
  { slug: 'sumitomo',     name: 'Sumitomo',     initials: 'SU', color: '#334155', tagline: 'Precision crop protection' },
];

export const getBrand = (slug) => BRANDS.find((b) => b.slug === slug);
