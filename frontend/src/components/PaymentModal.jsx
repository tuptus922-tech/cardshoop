import React, { useState } from 'react';

const BRAND_CONFIGS = {
  Spotify: { logo: '/assets/spotify.svg', accent: '#1DB954', gradient: 'from-emerald-600 to-green-500' },
  Netflix: { logo: '/assets/netflix.svg', accent: '#E50914', gradient: 'from-red-600 to-rose-500' },
  YouTube: { logo: '/assets/youtube.svg', accent: '#FF0000', gradient: 'from-red-600 to-orange-500' },
  Discord: { logo: '/assets/discord.svg', accent: '#5865F2', gradient: 'from-indigo-600 to-blue-500' },
  default: { logo: null, accent: '#3B82F6', gradient: 'from-blue-600 to-indigo-500' },
};

export default function PaymentModal({ product, onClose, onBuyStars }) {
  const [loading, setLoading] = useState(false);
  const brand = BRAND_CONFIGS[product.category] || BRAND_CONFIGS.default;

  const handlePay = async () => {
    setLoading(true);
    try {
      await onBuyStars(product);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-700/70 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar"
        style={{
          boxShadow: `0 -10px 40px -10px rgba(0,0,0,0.8), 0 0 50px -15px ${brand.accent}25`,
        }}
      >
        {/* Modal Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header with Brand */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 p-2.5 flex items-center justify-center shadow-inner">
              {brand.logo ? (
                <img src={brand.logo} alt={product.category} className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                {product.category}
              </span>
              <h2 className="text-base font-bold text-white leading-tight">
                {product.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Product Details Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-4">
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {product.description || 'Pełny dostęp do konta premium. Gwarancja bezproblemowego działania.'}
          </p>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Do zapłaty:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl animate-star-glow">⭐</span>
              <span className="text-xl font-extrabold text-amber-300 tracking-tight">
                {product.price_stars}
              </span>
              <span className="text-xs font-bold text-amber-400/80">Stars</span>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="space-y-2.5 mb-5 text-xs text-slate-300 bg-slate-800/30 p-3.5 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
            <span>Natychmiastowe wysłanie danych na Twój czat z botem</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
            <span>Bezpieczna oficjalna płatność Telegram Stars</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
            <span>Gwarancja i wsparcie administratora</span>
          </div>
        </div>

        {/* Main CTA Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r ${brand.gradient} shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Otwieranie płatności...</span>
            </>
          ) : (
            <>
              <span>Zapłać {product.price_stars} ⭐</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </>
          )}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          Wróć do przeglądania
        </button>
      </div>
    </div>
  );
}
