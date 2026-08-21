import React, { useState } from 'react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';

function PaymentModal({ product, onClose, onPaymentComplete }) {
  const { openInvoice, tg } = useTelegramWebApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStarsPayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const initData = tg.initData;
      if (!initData) {
        throw new Error('Aplikacja musi byc uruchomiona wewnatrz Telegrama');
      }

      // 1. Zgloszenie do backendu o checi zakupu za gwiazdki
      const response = await fetch('/api/invoices/stars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ product_id: product.id })
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Blad generowania faktury');

      // 2. Otwarcie natywnego okna Telegrama do zaplaty Starsami
      openInvoice(data.invoice_link, (status) => {
        if (status === 'paid') {
          onPaymentComplete(data.order_id);
        } else if (status === 'failed') {
          setError('Platnosc odrzucona lub anulowana.');
        } else {
          onClose(); // cancelled lub inne
        }
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Wystapil problem z platnoscia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--tg-theme-bg-color)] w-full max-w-sm rounded-xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b border-[var(--tg-theme-hint-color)] opacity-20">
          <h3 className="text-xl font-bold text-[var(--tg-theme-text-color)] text-center">
            Finalizacja zakupu
          </h3>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <span className="text-4xl mb-3">{product.image_emoji}</span>
          <h4 className="text-lg font-medium text-[var(--tg-theme-text-color)] text-center mb-1">
            {product.name}
          </h4>
          <p className="text-sm text-[var(--tg-theme-hint-color)] text-center mb-6">
            Płacisz całkowicie bezpiecznie przez natywny portfel Telegrama.
          </p>
          
          {error && (
            <div className="w-full bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <div className="w-full bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-[var(--tg-theme-text-color)]">Kwota do zapłaty:</span>
            <div className="flex items-center gap-1 font-bold text-lg text-[var(--tg-theme-text-color)]">
              <span>⭐️</span>
              <span>{product.price_stars}</span>
            </div>
          </div>

          <button 
            onClick={handleStarsPayment}
            disabled={loading}
            className="w-full py-3 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded-lg font-medium text-lg disabled:opacity-70 mb-3 transition-opacity"
          >
            {loading ? 'Przetwarzanie...' : `Kup za ${product.price_stars} Stars`}
          </button>

          <button 
            onClick={onClose}
            className="w-full py-2 text-[var(--tg-theme-hint-color)] font-medium text-sm hover:underline"
          >
            Anuluj powrót do sklepu
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
