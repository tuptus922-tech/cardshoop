import React from 'react';
import { IconSpotify, IconNetflix, IconYouTube, IconDiscord, IconPackage, IconStar } from './Icons.jsx';

const BRAND_ICONS = {
  Spotify: <IconSpotify className="w-6 h-6" />,
  Netflix: <IconNetflix className="w-6 h-6" />,
  YouTube: <IconYouTube className="w-6 h-6" />,
  Discord: <IconDiscord className="w-6 h-6" />,
  default: <IconPackage className="w-6 h-6" />,
};

export default function ProductCard({ product, onSelect, index = 0 }) {
  const brandIcon = BRAND_ICONS[product.category] || BRAND_ICONS.default;

  const matchPeriod = product.name.match(/\b(\d+[MYDmyd]|Miesiąc|Miesiące|Miesięcy|Rok)\b/i);
  const period = matchPeriod ? matchPeriod[0].toUpperCase() : null;

  const inStock = product.stock && product.stock > 0;

  return (
    <div
      onClick={() => inStock && onSelect(product)}
      style={{ 
        animationDelay: `${index * 45}ms`,
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        opacity: inStock ? 1 : 0.6,
      }}
      className={`swiss-card p-3.5 flex flex-col justify-between group select-none anim-slide-up ${inStock ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      {/* Top Section: Brand Emblem, Period & Stock Indicator */}
      <div>
        <div className="flex items-start justify-between gap-1 mb-3">
          <div 
            className="w-9 h-9 rounded-xl border flex items-center justify-center p-1.5 flex-shrink-0 group-hover:scale-110 group-hover:rotate-[-3deg] transition-transform duration-300 ease-out shadow-sm"
            style={{
              backgroundColor: 'var(--color-icon-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            {brandIcon}
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              {period && (
                <span 
                  className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-md border group-hover:border-white/[0.2] transition-colors"
                  style={{
                    backgroundColor: 'var(--color-badge-bg)',
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {period}
                </span>
              )}
            </div>

            {/* Dynamic Stock Indicator Badge */}
            <span 
              className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md border flex items-center gap-1 transition-colors"
              style={{
                backgroundColor: inStock ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                borderColor: inStock ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                color: inStock ? '#10B981' : '#EF4444',
              }}
            >
              <span className={`w-1 h-1 rounded-full ${inStock ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {inStock ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 
          className="font-semibold text-xs tracking-tight leading-snug line-clamp-2 mb-1 group-hover:text-emerald-400 transition-colors duration-200"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {product.name}
        </h3>

        {/* Concise Description */}
        <p 
          className="text-[11px] line-clamp-2 font-normal leading-relaxed mb-3 transition-opacity group-hover:opacity-90"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {product.description || 'Instant digital license key with instant delivery.'}
        </p>
      </div>

      {/* Footer: Price Tier & Single-tap Action */}
      <div 
        className="pt-2.5 border-t flex items-center justify-between gap-2"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-200">
          <IconStar className="w-4 h-4 text-amber-500 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
          <span 
            className="text-sm font-bold font-mono tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {product.price_stars}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (inStock) onSelect(product);
          }}
          disabled={!inStock}
          className="px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-tight touch-press transition-all duration-150 shadow-sm flex items-center gap-1 group-hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: inStock ? 'var(--color-btn-bg)' : 'var(--color-surface)',
            color: inStock ? 'var(--color-btn-text)' : 'var(--color-text-muted)',
            border: inStock ? 'none' : '1px solid var(--color-border)',
          }}
        >
          <span>{inStock ? 'Buy' : 'Sold Out'}</span>
        </button>
      </div>
    </div>
  );
}
