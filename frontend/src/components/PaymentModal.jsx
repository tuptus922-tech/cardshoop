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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md anim-fade-in transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-full max-w-md border-t sm:border rounded-t-[32px] sm:rounded-[26px] p-6 flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl anim-modal-up"
        style={{
          backgroundColor: 'var(--color-modal-bg)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Mobile Pull Bar with soft bounce */}
        <div 
          className="w-12 h-1.5 rounded-full mx-auto mb-5 sm:hidden transition-opacity" 
          style={{ backgroundColor: 'var(--color-border-hover)' }}
        />

        {/* Header with Brand Icon and Title */}
        <div className="flex items-start justify-between mb-5 anim-slide-up">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl border flex items-center justify-center p-2.5 flex-shrink-0 shadow-sm anim-float"
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
                className="text-base font-bold tracking-tight leading-tight mt-0.5"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {product.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-colors touch-press cursor-pointer"
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
          className="border rounded-2xl p-4 mb-5 text-xs font-mono space-y-3 shadow-inner anim-slide-up"
          style={{
            backgroundColor: 'var(--color-modal-item)',
            borderColor: 'var(--color-border)',
            animationDelay: '60ms',
          }}
        >
          <div className="flex justify-between items-center" style={{ color: 'var(--color-text-muted)' }}>
            <span>PLATFORM</span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{product.category}</span>
          </div>
          <div className="flex justify-between items-center" style={{ color: 'var(--color-text-muted)' }}>
            <span>DELIVERY SPEED</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              AUTOMATED (1S)
            </span>
          </div>
          <div className="flex justify-between items-center" style={{ color: 'var(--color-text-muted)' }}>
            <span>PROTOCOL</span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>TELEGRAM STARS</span>
          </div>
          <div 
            className="pt-3 border-t flex justify-between items-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="font-bold tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>TOTAL PAYABLE</span>
            <div className="flex items-center gap-1.5">
              <IconStar className="w-4 h-4 text-amber-500" />
              <span className="text-lg font-black font-mono tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                {product.price_stars} STARS
              </span>
            </div>
          </div>
        </div>

        {/* Specifications List */}
        <div 
          className="space-y-2 mb-6 text-[11px] anim-slide-up" 
          style={{ 
            color: 'var(--color-text-muted)',
            animationDelay: '100ms',
          }}
        >
          <div className="flex items-center gap-2">
            <IconCheck className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
            <span>Credentials dispatched to direct chat upon confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCheck className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
            <span>AES-256 encrypted license record</span>
          </div>
        </div>

        {/* Solid High-Contrast CTA Trigger with glowing pulse */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-4 px-4 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider touch-press transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 shadow-lg hover:shadow-xl cursor-pointer anim-slide-up"
          style={{
            backgroundColor: 'var(--color-btn-bg)',
            color: 'var(--color-btn-text)',
            animationDelay: '140ms',
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
            <span className="flex items-center gap-2">
              <IconStar className="w-4 h-4 text-amber-500" />
              Authorize Payment ({product.price_stars} Stars)
            </span>
          )}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full py-2 text-center text-[11px] font-mono hover:opacity-80 transition-opacity cursor-pointer"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
