import React, { useState } from 'react';
import {
  IconSpotify,
  IconNetflix,
  IconYouTube,
  IconDiscord,
  IconPackage,
  IconStar,
  IconClose,
  IconCheck,
} from './Icons.jsx';

const BRAND_ICONS = {
  Spotify: <IconSpotify className="w-6 h-6" />,
  Netflix: <IconNetflix className="w-6 h-6" />,
  YouTube: <IconYouTube className="w-6 h-6" />,
  Discord: <IconDiscord className="w-6 h-6" />,
  default: <IconPackage className="w-6 h-6 text-zinc-400" />,
};

export default function PaymentModal({ product, onClose, onBuyStars }) {
  const [loading, setLoading] = useState(false);
  const brandIcon = BRAND_ICONS[product.category] || BRAND_ICONS.default;

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-[#111114] border-t sm:border border-white/[0.1] rounded-t-[28px] sm:rounded-[24px] p-6 text-zinc-100 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
      >
        {/* Mobile Pull Bar */}
        <div className="w-10 h-1 bg-white/[0.12] rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header with Brand Icon and Title */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#09090b] border border-white/[0.08] flex items-center justify-center p-2 flex-shrink-0">
              {brandIcon}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                {product.category}
              </span>
              <h2 className="text-sm font-bold tracking-tight text-white leading-tight">
                {product.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors"
          >
            <IconClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Itemized Breakdown Table */}
        <div className="bg-[#09090b] border border-white/[0.06] rounded-xl p-4 mb-5 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center text-zinc-400">
            <span>PLATFORM</span>
            <span className="text-zinc-200 font-bold">{product.category}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>DELIVERY</span>
            <span className="text-emerald-400 font-bold">AUTOMATED (1S)</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>PROTOCOL</span>
            <span className="text-zinc-200 font-bold">TELEGRAM STARS</span>
          </div>
          <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center">
            <span className="text-zinc-400 font-bold">TOTAL PAYABLE</span>
            <div className="flex items-center gap-1.5">
              <IconStar className="w-4 h-4 text-amber-400" />
              <span className="text-base font-black text-white font-mono">
                {product.price_stars} STARS
              </span>
            </div>
          </div>
        </div>

        {/* Specifications List */}
        <div className="space-y-2 mb-6 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <IconCheck className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
            <span>Credentials dispatched to direct chat upon confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCheck className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
            <span>AES-256 encrypted license record</span>
          </div>
        </div>

        {/* Solid High-Contrast CTA Trigger */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 touch-press transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 shadow-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
          ) : (
            <span>Authorize Payment ({product.price_stars} Stars)</span>
          )}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full py-1.5 text-center text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
