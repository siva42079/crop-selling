import { useState } from 'react';

// Real-world product shots may fail offline — fall back to a labelled SVG tile
// so the layout never breaks and nothing renders as a broken image.
const fallback = (emoji, label) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240">
      <rect width="100%" height="100%" fill="#e9f7ee"/>
      <rect x="14" y="14" width="292" height="212" rx="18" fill="none" stroke="#15803d" stroke-opacity="0.35" stroke-width="3" stroke-dasharray="8 7"/>
      <text x="160" y="118" font-size="72" text-anchor="middle">${emoji}</text>
      <text x="160" y="168" font-size="19" font-family="sans-serif" font-weight="700" fill="#166534" text-anchor="middle">${label}</text>
    </svg>`
  );

export default function ProductImage({ src, alt, emoji = '🌱', className = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  const safeAlt = alt || 'Farmers Products';
  return (
    <img
      src={failed ? fallback(emoji, safeAlt.slice(0, 30)) : src}
      alt={safeAlt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
