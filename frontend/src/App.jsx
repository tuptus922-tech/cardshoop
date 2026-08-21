import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import ProductList from './components/ProductList.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import { useTelegramWebApp } from './hooks/useTelegramWebApp.js';

const API_BASE = '/api';

export default function App() {
  const { webApp, user, initData } = useTelegramWebApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Sprawdz czy powrot ze statusem=paid (CryptoBot callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'paid') {
      const orderId = params.get('order');
      setOrderSuccess({ orderId });
    }
  }, []);

  // Zaladuj produkty
  useEffect(() => {
    fetch(API_BASE + '/products')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setProducts(data.result);
        else setError('Blad ladowania produktow');
      })
      .catch(() => setError('Blad polaczenia z serwerem'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuyStars = async (product) => {
    if (!webApp) return alert('Otworz sklep w aplikacji Telegram');
    try {
      const res = await fetch(API_BASE + '/invoices/stars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData,
        },
        body: JSON.stringify({ product_id: product.id }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      // Otworz native invoice Telegrama
      webApp.openInvoice(data.invoice_link, (status) => {
        setSelectedProduct(null);
        if (status === 'paid') {
          setOrderSuccess({ orderId: data.order_id });
          webApp.HapticFeedback?.notificationOccurred('success');
        } else if (status === 'failed' || status === 'cancelled') {
          webApp.showAlert('Platnosc anulowana lub nieudana.');
        }
      });
    } catch (err) {
      webApp.showAlert('Blad: ' + err.message);
    }
  };

  const handleBuyCrypto = async (product, asset) => {
    if (!webApp) return alert('Otworz sklep w aplikacji Telegram');
    try {
      const res = await fetch(API_BASE + '/invoices/crypto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData,
        },
        body: JSON.stringify({ product_id: product.id, asset }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSelectedProduct(null);
      webApp.openLink(data.pay_url);
    } catch (err) {
      webApp.showAlert('Blad: ' + err.message);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>Dziekujemy za zakup!</h2>
        <p className="mb-6" style={{ color: 'var(--tg-theme-hint-color)' }}>Dane konta zostaly wyslane do Ciebie w wiadomosci prywatnej przez bota.</p>
        <button
          className="px-6 py-3 rounded-xl font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          onClick={() => setOrderSuccess(null)}
        >
          Wróc do sklepu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <Header user={user} />
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2" style={{ borderColor: 'var(--tg-theme-button-color)', borderTopColor: 'transparent' }} />
        </div>
      )}
      {error && (
        <div className="m-4 p-4 rounded-xl text-center" style={{ backgroundColor: '#ff4444', color: '#fff' }}>
          {error}
        </div>
      )}
      {!loading && !error && (
        <ProductList products={products} onSelect={setSelectedProduct} />
      )}
      {selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyStars={handleBuyStars}
          onBuyCrypto={handleBuyCrypto}
        />
      )}
    </div>
  );
}
