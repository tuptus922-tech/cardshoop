import React from 'react';

const BRAND_CONFIGS = {
  Spotify: {
    logo: '/assets/spotify.svg',
    accentColor: '#1DB954',
    bgGradient: 'from-emerald-950/50 via-slate-900 to-slate-900',
    borderHover: 'hover:border-emerald-500/40',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    btnGradient: 'from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400',
  },
  Netflix: {
    logo: '/assets/netflix.svg',
    accentColor: '#E50914',
    bgGradient: 'from-red-950/50 via-slate-900 to-slate-900',
    borderHover: 'hover:border-red-500/40',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
    btnGradient: 'from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400',
  },
  YouTube: {
    logo: '/assets/youtube.svg',
    accentColor: '#FF0000',
    bgGradient: 'from-red-950/40 via-slate-900 to-slate-900',
    borderHover: 'hover:border-red-500/40',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
    btnGradient: 'from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400',
  },
  Discord: {
    logo: '/assets/discord.svg',
    accentColor: '#5865F2',
    bgGradient: 'from-indigo-950/50 via-slate-900 to-slate-900',
    borderHover: 'hover:border-indigo-500/40',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    btnGradient: 'from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400',
  },
  default: {
    logo: null,
    accentColor: '#3B82F6',
    bgGradient: 'from-blue-950/40 via-slate-900 to-slate-900',
    borderHover: 'hover:border-blue-500/40',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    btnGradient: 'from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400',
  },
};

export default function ProductCard({ product, onSelect }) {
  const brand = BRAND_CONFIGS[product.category] || BRAND_CONFIGS.default;

  const matchPeriod = product.name.match(/\b(\d+[MYDmyd]|Miesiąc|Miesiące|Miesięcy|Rok)\b/i);
  const periodLabel = matchPeriod ? matchPeriod[0] : null;

  return (
    <div
      onClick={() => onSelect(product)}
      className={`relative group rounded-2xl p-4 bg-gradient-to-b ${brand.bgGradient} border border-slate-800 ${brand.borderHover} transition-all duration-200 shadow-lg shadow-black/40 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex flex-col justify-between overflow-hidden`}
    >
      {/* Glow */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-10 blur-2xl pointer-events-none transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: brand.accentColor }}
      />

      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            {/* SVG Logo icon */}
            <div className="w-11 h-11 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-center p-2.5 shadow-inner">
              {brand.logo ? (
                <img src={brand.logo} alt={product.category} className="w-full h-full object-contain" />
              ) : (
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              )}
            </div>

            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${brand.badgeBg}`}>
                {product.category}
              </span>
              {periodLabel && (
                <span className="ml-1.5 text-[10px] font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-700">
                  {periodLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-800/30 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3 fill-current text-emerald-400" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span>Dostępne</span>
          </div>
        </div>

        <h3 className="font-bold text-sm text-slate-100 mb-1 group-hover:text-white transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal">
          {product.description || 'Pełny dostęp do konta premium. Gwarancja bezproblemowego działania.'}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Cena</span>
          <div className="flex items-center gap-1.5">
            <img src="/assets/stars.svg" alt="Stars" className="w-4 h-4 object-contain" />
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
