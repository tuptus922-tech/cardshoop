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
  default: <IconPackage className="w-6 h-6" />,
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md anim-fade-in transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-full max-w-md border-t sm:border rounded-t-[28px] sm:rounded-[24px] p-6 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl anim-modal-up"
        style={{
          backgroundColor: 'var(--color-modal-bg)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Mobile Pull Bar */}
        <div 
          className="w-10 h-1 rounded-full mx-auto mb-5 sm:hidden" 
          style={{ backgroundColor: 'var(--color-border-hover)' }}
        />

        {/* Header with Brand Icon and Title */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-xl border flex items-center justify-center p-2 flex-shrink-0"
              style={{
                backgroundColor: 'var(--color-icon-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              {brandIcon}
            </div>
            <div>
              <span 
                className="text-[10px] font-mono font-bold tracking-widest uppercase"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {product.category}
              </span>
              <h2 
                className="text-sm font-bold tracking-tight leading-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {product.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-7 h-7 rounded-full border flex items-center justify-center text-xs transition-colors touch-press"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <IconClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Itemized Breakdown Table */}
        <div 
          className="border rounded-xl p-4 mb-5 text-xs font-mono space-y-3"
          style={{
            backgroundColor: 'var(--color-modal-item)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex justify-between items-center" style={{ color: 'var(--color-text-muted)' }}>
            <span>PLATFORM</span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{product.category}</span>
          </div>
          <div className="flex justify-between items-center" style={{ color: 'var(--color-text-muted)' }}>
            <span>DELIVERY</span>
            <span className="text-emerald-500 font-bold">AUTOMATED (1S)</span>
          </div>
          <div className="flex justify-between items-center" style={{ color: 'var(--color-text-muted)' }}>
            <span>PROTOCOL</span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>TELEGRAM STARS</span>
          </div>
          <div 
            className="pt-3 border-t flex justify-between items-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>TOTAL PAYABLE</span>
            <div className="flex items-center gap-1.5">
              <IconStar className="w-4 h-4 text-amber-500" />
              <span className="text-base font-black font-mono" style={{ color: 'var(--color-text-primary)' }}>
                {product.price_stars} STARS
              </span>
            </div>
          </div>
        </div>

        {/* Specifications List */}
        <div className="space-y-2 mb-6 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          <div className="flex items-center gap-2">
            <IconCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
            <span>Credentials dispatched to direct chat upon confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
            <span>AES-256 encrypted license record</span>
          </div>
        </div>

        {/* Solid High-Contrast CTA Trigger */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider touch-press transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 shadow-md"
          style={{
            backgroundColor: 'var(--color-btn-bg)',
            color: 'var(--color-btn-text)',
          }}
        >
          {loading ? (
            <div 
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'var(--color-border)',
                borderTopColor: 'var(--color-btn-text)',
              }}
            />
          ) : (
            <span>Authorize Payment ({product.price_stars} Stars)</span>
          )}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full py-1.5 text-center text-[11px] font-mono hover:opacity-75 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
