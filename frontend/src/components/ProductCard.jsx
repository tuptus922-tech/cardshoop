import React from 'react';

const CATEGORY_COLORS = {
  Spotify: { bg: '#1DB954', text: '#000' },
  Netflix: { bg: '#E50914', text: '#fff' },
  YouTube: { bg: '#FF0000', text: '#fff' },
  default: { bg: '#5288c1', text: '#fff' },
};

export default function ProductCard({ product, onSelect }) {
  const colors = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.default;
  const emoji = {
    music: '🎵',
    film: '🎬',
    tv: '📺',
  }[product.image_emoji] || '📦';

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-transform active:scale-95"
      style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
      onClick={() => onSelect(product)}
    >
      {/* Naglowek karty */}
      <div className="p-4 flex items-center gap-3" style={{ backgroundColor: colors.bg }}>
        <span className="text-3xl">{emoji}</span>
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff' }}>
            {product.category}
          </span>
        </div>
      </div>
      {/* Tresc */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--tg-theme-text-color)' }}>
          {product.name}
        </h3>
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--tg-theme-hint-color)' }}>
          {product.description}
        </p>
        {/* Ceny */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
              ⭐ {product.price_stars} Stars
            </span>
            <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
              💰 {product.price_usdt} USDT
            </span>
          </div>
          <button
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            Kup teraz
          </button>
        </div>
      </div>
    </div>
  );
}
