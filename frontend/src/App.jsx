import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header.jsx';
import CategoryIndex from './components/CategoryIndex.jsx';
import ProductList from './components/ProductList.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import { IconCheck } from './components/Icons.jsx';
import { useTelegramWebApp } from './hooks/useTelegramWebApp.js';

const API_BASE = import.meta.env.VITE_API_URL || 'https://cardshoop.onrender.com/api';

export default function App() {
  const { webApp, user, initData } = useTelegramWebApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (data.ok) {
        setProducts(data.result);
      } else {
        setError('Failed to retrieve inventory matrix.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure with gateway server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  // Telegram native BackButton handling
  useEffect(() => {
    if (!webApp?.BackButton) return;

    if (activeCategory || searchQuery) {
      webApp.BackButton.show();
      const handleBack = () => {
        webApp.HapticFeedback?.impactOccurred('light');
        setActiveCategory(null);
        setSearchQuery('');
      };
      webApp.BackButton.onClick(handleBack);
      return () => {
        webApp.BackButton.offClick(handleBack);
      };
    } else {
      webApp.BackButton.hide();
    }
  }, [activeCategory, searchQuery, webApp]);

  const handleSelectCategory = (category) => {
    webApp?.HapticFeedback?.impactOccurred('light');
    setActiveCategory(category);
  };

  const handleSelectAll = () => {
    webApp?.HapticFeedback?.impactOccurred('light');
    setActiveCategory('Wszystkie');
  };

  const handleBackToIndex = () => {
    webApp?.HapticFeedback?.impactOccurred('light');
    setActiveCategory(null);
    setSearchQuery('');
  };

  const handleSelectProduct = (product) => {
    webApp?.HapticFeedback?.impactOccurred('medium');
    setSelectedProduct(product);
  };

  const handleBuyStars = async (product) => {
    if (!webApp) {
      alert('Launch within Telegram client to authorize transaction.');
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
      if (!data.ok) throw new Error(data.error || 'Invoice generation error');

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
          webApp.showAlert('Payment rejected or cancelled.');
        }
      });
    } catch (err) {
      webApp.HapticFeedback?.notificationOccurred('error');
      webApp.showAlert('Error: ' + err.message);
    }
  };

  // Success Confirmation View
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center text-zinc-100 font-sans select-none anim-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-white/[0.06] border border-white/[0.14] flex items-center justify-center text-emerald-400 mb-4 anim-pop-in shadow-lg">
          <IconCheck className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase mb-1">
          TRANSACTION FULFILLED
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          License Dispatched
        </h2>
        <p className="text-xs text-zinc-400 max-w-xs mb-6 font-mono leading-relaxed">
          Credentials for <span className="text-zinc-200 font-bold">{orderSuccess.productName}</span> have been sent to your Telegram chat.
        </p>

        <div className="bg-[#121215] border border-white/[0.08] rounded-2xl p-4 w-full max-w-xs mb-6 text-xs font-mono text-left space-y-2.5 anim-slide-up">
          <div className="flex justify-between text-zinc-400">
            <span>ORDER_ID</span>
            <span className="text-zinc-100 font-bold font-mono">#{orderSuccess.orderId}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>METHOD</span>
            <span className="text-zinc-200">TELEGRAM STARS</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>STATUS</span>
            <span className="text-emerald-400 font-bold">DELIVERED</span>
          </div>
        </div>

        <button
          onClick={() => {
            webApp?.HapticFeedback?.impactOccurred('light');
            setOrderSuccess(null);
          }}
          className="w-full max-w-xs py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 touch-press transition-all shadow-md"
        >
          Return to Index
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans antialiased">
      <Header
        user={user}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q && !activeCategory) setActiveCategory('Wszystkie');
        }}
        onLogoClick={handleBackToIndex}
      />

      <main className="flex-1 max-w-md w-full mx-auto py-2">
        {loading && (
          <div className="px-4 py-4 flex flex-col gap-3 anim-fade-in">
            <div className="h-4 w-28 bg-[#141417] rounded-md skeleton-shimmer mb-1" />
            <div className="h-16 w-full rounded-full skeleton-shimmer" />
            <div className="h-16 w-full rounded-full skeleton-shimmer" />
            <div className="h-16 w-full rounded-full skeleton-shimmer" />
          </div>
        )}

        {error && (
          <div className="m-4 p-5 rounded-2xl bg-[#141417] border border-white/[0.08] text-center anim-slide-up">
            <p className="text-xs font-mono text-zinc-400 mb-3">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 text-xs font-mono font-bold rounded-lg transition-colors touch-press"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {!activeCategory && !searchQuery ? (
              <CategoryIndex
                categories={categories}
                products={products}
                onSelectCategory={handleSelectCategory}
                onSelectAll={handleSelectAll}
              />
            ) : (
              <ProductList
                products={products}
                onSelect={handleSelectProduct}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onBackToIndex={handleBackToIndex}
                searchQuery={searchQuery}
              />
            )}
          </>
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
