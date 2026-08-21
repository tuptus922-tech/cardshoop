import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import ProductList from './components/ProductList.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import { useTelegramWebApp } from './hooks/useTelegramWebApp.js';

// Dynamic API URL for Vercel/local/Render
const API_BASE = import.meta.env.VITE_API_URL || 'https://cardshoop.onrender.com/api';

export default function App() {
  const { webApp, user, initData } = useTelegramWebApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (data.ok) {
        setProducts(data.result);
      } else {
        setError('Nie udało się pobrać listy produktów.');
      }
    } catch (err) {
      console.error(err);
      setError('Błąd połączenia z serwerem sklepu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectProduct = (product) => {
    webApp?.HapticFeedback?.impactOccurred('light');
    setSelectedProduct(product);
  };

  const handleBuyStars = async (product) => {
    if (!webApp) {
      alert('Otwórz sklep w aplikacji Telegram, aby dokonać zakupu.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/invoices/stars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData,
        },
        body: JSON.stringify({ product_id: product.id }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Błąd tworzenia faktury');

      // Open native Telegram Stars Invoice
      webApp.openInvoice(data.invoice_link, (status) => {
        setSelectedProduct(null);
        if (status === 'paid') {
          webApp.HapticFeedback?.notificationOccurred('success');
          setOrderSuccess({
            orderId: data.order_id,
            productName: product.name,
          });
        } else if (status === 'failed') {
          webApp.HapticFeedback?.notificationOccurred('error');
          webApp.showAlert('Płatność nie powiodła się.');
        }
      });
    } catch (err) {
      webApp.HapticFeedback?.notificationOccurred('error');
      webApp.showAlert('Błąd: ' + err.message);
    }
  };

  // Success screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-lg shadow-emerald-500/20">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
          Płatność zatwierdzona
        </span>
        <h2 className="text-2xl font-extrabold mb-2 tracking-tight">Dziękujemy za zakup!</h2>
        <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
          Konto <strong className="text-slate-200">{orderSuccess.productName}</strong> zostało przypisane. Bot wysłał dane logowania w wiadomości prywatnej.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full max-w-xs mb-6 text-xs text-left space-y-2.5">
          <div className="flex justify-between text-slate-400">
            <span>Numer zamówienia:</span>
            <span className="font-mono text-slate-200 font-bold">#{orderSuccess.orderId}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Metoda:</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <img src="/assets/stars.svg" alt="Stars" className="w-3.5 h-3.5 object-contain" />
              <span>Telegram Stars</span>
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Status:</span>
            <span className="text-emerald-400 font-bold">Zrealizowane</span>
          </div>
        </div>

        <button
          onClick={() => {
            webApp?.HapticFeedback?.impactOccurred('medium');
            setOrderSuccess(null);
          }}
          className="w-full max-w-xs py-3.5 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30"
        >
          Wróć do sklepu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto">
        {loading && (
          <div className="flex flex-col justify-center items-center h-72 gap-3">
            <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Ładowanie ofert...</span>
          </div>
        )}

        {error && (
          <div className="m-4 p-5 rounded-2xl bg-red-950/60 border border-red-800/60 text-center">
            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <p className="text-xs font-semibold text-red-300 mb-3">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-red-900/80 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {!loading && !error && (
          <ProductList
            products={products}
            onSelect={handleSelectProduct}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyStars={handleBuyStars}
        />
      )}
    </div>
  );
}
