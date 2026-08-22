import React from 'react';
import { IconSpotify, IconNetflix, IconYouTube, IconDiscord, IconPackage, IconStar } from './Icons.jsx';

const BRAND_ICONS = {
  Spotify: <IconSpotify className="w-6 h-6" />,
  Netflix: <IconNetflix className="w-6 h-6" />,
  YouTube: <IconYouTube className="w-6 h-6" />,
  Discord: <IconDiscord className="w-6 h-6" />,
  default: <IconPackage className="w-6 h-6 text-zinc-400" />,
};

export default function ProductCard({ product, onSelect }) {
  const brandIcon = BRAND_ICONS[product.category] || BRAND_ICONS.default;

  // Extract period if present (e.g. 1M, 3M, 6M, 1 Rok)
  const matchPeriod = product.name.match(/\b(\d+[MYDmyd]|Miesiąc|Miesiące|Miesięcy|Rok)\b/i);
  const period = matchPeriod ? matchPeriod[0].toUpperCase() : null;

  return (
    <div
      onClick={() => onSelect(product)}
      className="swiss-card p-3.5 flex flex-col justify-between hover:bg-[#16161a] hover:border-white/[0.14] touch-press transition-all duration-100 cursor-pointer group select-none"
    >
      {/* Top Section: Brand Emblem & Duration Indicator */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#09090b] border border-white/[0.08] flex items-center justify-center p-1.5 flex-shrink-0">
            {brandIcon}
          </div>
          {period && (
            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 border border-white/[0.04]">
              {period}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-xs text-zinc-100 group-hover:text-white tracking-tight leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Concise Description */}
        <p className="text-[11px] text-zinc-500 line-clamp-2 font-normal leading-relaxed mb-3">
          {product.description || 'Instant digital license key with instant delivery.'}
        </p>
      </div>

      {/* Footer: Price Tier & Single-tap Action */}
      <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <IconStar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-sm font-bold font-mono tracking-tight text-zinc-100">
            {product.price_stars}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] font-bold tracking-tight touch-press transition-all shadow-sm flex items-center gap-1"
        >
          <span>Buy</span>
        </button>
      </div>
    </div>
  );
}
