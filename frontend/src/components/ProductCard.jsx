import React from 'react';

const BRAND_CONFIGS = {
  Spotify: {
    logo: '/assets/spotify.svg',
    accentColor: '#1DB954',
    bgGradient: 'from-emerald-950/60 via-slate-900 to-slate-900',
    borderHover: 'hover:border-emerald-500/50',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    btnGradient: 'from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400',
  },
  Netflix: {
    logo: '/assets/netflix.svg',
    accentColor: '#E50914',
    bgGradient: 'from-red-950/60 via-slate-900 to-slate-900',
    borderHover: 'hover:border-red-500/50',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
    btnGradient: 'from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400',
  },
  YouTube: {
    logo: '/assets/youtube.svg',
    accentColor: '#FF0000',
    bgGradient: 'from-red-950/50 via-slate-900 to-slate-900',
    borderHover: 'hover:border-red-500/50',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
    btnGradient: 'from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400',
  },
  Discord: {
    logo: '/assets/discord.svg',
    accentColor: '#5865F2',
    bgGradient: 'from-indigo-950/60 via-slate-900 to-slate-900',
    borderHover: 'hover:border-indigo-500/50',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    btnGradient: 'from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400',
  },
  default: {
    logo: null,
    accentColor: '#3B82F6',
    bgGradient: 'from-blue-950/50 via-slate-900 to-slate-900',
    borderHover: 'hover:border-blue-500/50',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    btnGradient: 'from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400',
  },
};

export default function ProductCard({ product, onSelect }) {
  const brand = BRAND_CONFIGS[product.category] || BRAND_CONFIGS.default;

  // Extract period if present (e.g. 1M, 3M, 6M)
  const matchPeriod = product.name.match(/\b(\d+[MYDmyd]|Miesiąc|Miesiące|Miesięcy|Rok)\b/i);
  const periodLabel = matchPeriod ? matchPeriod[0] : null;

  return (
    <div
      onClick={() => onSelect(product)}
      className={`relative group rounded-2xl p-4 bg-gradient-to-b ${brand.bgGradient} border border-slate-800/80 ${brand.borderHover} transition-all duration-200 shadow-lg shadow-black/40 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex flex-col justify-between overflow-hidden`}
    >
      {/* Subtle brand glow behind */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-10 blur-2xl pointer-events-none transition-opacity group-hover:opacity-25"
        style={{ backgroundColor: brand.accentColor }}
      />

      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            {/* SVG Logo icon */}
            <div className="w-11 h-11 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center p-2.5 shadow-inner">
              {brand.logo ? (
                <img src={brand.logo} alt={product.category} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xl">📦</span>
              )}
            </div>

            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${brand.badgeBg}`}>
                {product.category}
              </span>
              {periodLabel && (
                <span className="ml-1.5 text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded-md border border-slate-700/50">
                  {periodLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
            <span>⚡</span>
            <span>Automat</span>
          </div>
        </div>

        {/* Product Title & Description */}
        <h3 className="font-bold text-sm text-slate-100 mb-1 group-hover:text-white transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal">
          {product.description || 'Pełny dostęp do konta premium. Gwarancja działania i natychmiastowa wysyłka.'}
        </p>
      </div>

      {/* Card Footer: Price & Buy Button */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Cena</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base animate-star-glow">⭐</span>
            <span className="text-base font-extrabold text-amber-300 tracking-tight">
              {product.price_stars}
            </span>
            <span className="text-[11px] text-amber-400/80 font-medium">Stars</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${brand.btnGradient} shadow-md shadow-black/30 transition-all flex items-center gap-1.5`}
        >
          <span>Kup teraz</span>
          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
