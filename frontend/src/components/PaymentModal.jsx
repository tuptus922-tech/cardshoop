import React, { useState } from 'react';

const CRYPTO_ASSETS = [
  { id: 'USDT', label: 'USDT', emoji: '💵' },
  { id: 'TON', label: 'TON', emoji: '💫' },
  { id: 'BTC', label: 'Bitcoin', emoji: '₿' },
  { id: 'ETH', label: 'Ethereum', emoji: '🔷' },
];

export default function PaymentModal({ product, onClose, onBuyStars, onBuyCrypto }) {
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stars');

  const handleStars = async () => {
    setLoading(true);
    try {
      await onBuyStars(product);
    } finally {
      setLoading(false);
    }
  };

  const handleCrypto = async () => {
    setLoading(true);
    try {
      await onBuyCrypto(product, selectedAsset);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl p-6 pb-8 animate-slide-up"
        style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: 'var(--tg-theme-hint-color)' }} />

        {/* Informacje o produkcie */}
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--tg-theme-text-color)' }}>
          {product.name}
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--tg-theme-hint-color)' }}>
          {product.description}
        </p>

        {/* Taby metod platnosci */}
        <div className="flex rounded-xl overflow-hidden mb-4" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
          <button
            className="flex-1 py-2.5 text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === 'stars' ? 'var(--tg-theme-button-color)' : 'transparent',
              color: activeTab === 'stars' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-hint-color)',
            }}
            onClick={() => setActiveTab('stars')}
          >
            ⭐ Telegram Stars
          </button>
          <button
            className="flex-1 py-2.5 text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === 'crypto' ? 'var(--tg-theme-button-color)' : 'transparent',
              color: activeTab === 'crypto' ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-hint-color)',
            }}
            onClick={() => setActiveTab('crypto')}
          >
            💰 Kryptowaluta
          </button>
        </div>

        {/* Stars tab */}
        {activeTab === 'stars' && (
          <div>
            <div
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--tg-theme-hint-color)' }}>Cena:</span>
                <span className="font-bold text-xl" style={{ color: 'var(--tg-theme-text-color)' }}>
                  ⭐ {product.price_stars} Stars
                </span>
              </div>
            </div>
            <button
              className="w-full py-3.5 rounded-xl font-bold text-base transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
              onClick={handleStars}
              disabled={loading}
            >
              {loading ? 'Ladowanie...' : `Zaplac ${product.price_stars} ⭐`}
            </button>
          </div>
        )}

        {/* Crypto tab */}
        {activeTab === 'crypto' && (
          <div>
            {/* Wybor assetu */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {CRYPTO_ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  className="flex flex-col items-center p-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedAsset === asset.id ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-bg-color)',
                    color: selectedAsset === asset.id ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-hint-color)',
                    border: selectedAsset === asset.id ? '2px solid var(--tg-theme-button-color)' : '2px solid transparent',
                  }}
                  onClick={() => setSelectedAsset(asset.id)}
                >
                  <span className="text-lg mb-1">{asset.emoji}</span>
                  <span>{asset.label}</span>
                </button>
              ))}
            </div>
            <div
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--tg-theme-hint-color)' }}>Rownowartość:</span>
                <span className="font-bold text-xl" style={{ color: 'var(--tg-theme-text-color)' }}>
                  {product.price_usdt} {selectedAsset}
                </span>
              </div>
            </div>
            <button
              className="w-full py-3.5 rounded-xl font-bold text-base transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
              onClick={handleCrypto}
              disabled={loading}
            >
              {loading ? 'Ladowanie...' : `Zaplac ${product.price_usdt} ${selectedAsset}`}
            </button>
          </div>
        )}

        <button
          className="w-full py-3 mt-3 rounded-xl text-sm"
          style={{ color: 'var(--tg-theme-hint-color)' }}
          onClick={onClose}
        >
          Anuluj
        </button>
      </div>
    </div>
  );
}
