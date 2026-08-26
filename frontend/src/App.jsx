import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header.jsx';
import CategoryIndex from './components/CategoryIndex.jsx';
import ProductList from './components/ProductList.jsx';
import SupportSection from './components/SupportSection.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import { IconCheck } from './components/Icons.jsx';
import { useTelegramWebApp } from './hooks/useTelegramWebApp.js';

const API_BASE = import.meta.env.VITE_API_URL || 'https://cardshoop.onrender.com/api';

export default function App() {
  const { webApp, user, initData, colorScheme } = useTelegramWebApp();
  
  // Instant SWR caching from sessionStorage for 0ms initial render
  const [products, setProducts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('cs_products_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => products.length === 0);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // Fast background inventory revalidation
  const fetchProducts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      const items = Array.isArray(data.result) ? data.result : (Array.isArray(data.products) ? data.products : null);
      if (data.ok && items) {
        setProducts(items);
        try {
          sessionStorage.setItem('cs_products_cache', JSON.stringify(items));
        } catch {}
      } else if (!isSilent) {
        setError('Failed to retrieve inventory matrix.');
      }
    } catch (err) {
      if (!isSilent && products.length === 0) {
        setError('Connection failure with gateway server.');
      }
    } finally {
      setLoading(false);
    }
  }, [products.length]);

  useEffect(() => {
    // Initial fetch or silent refresh
    fetchProducts(products.length > 0);
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

  const handleSelectCategory = useCallback((category) => {
    webApp?.HapticFeedback?.impactOccurred('light');
    setActiveCategory(category);
  }, [webApp]);

  const handleSelectAll = useCallback(() => {
    webApp?.HapticFeedback?.impactOccurred('light');
    setActiveCategory('Wszystkie');
  }, [webApp]);

  const handleBackToIndex = useCallback(() => {
    webApp?.HapticFeedback?.impactOccurred('light');
    setActiveCategory(null);
    setSearchQuery('');
  }, [webApp]);

  const handleSelectProduct = useCallback((product) => {
    webApp?.HapticFeedback?.impactOccurred('medium');
    setSelectedProduct(product);
  }, [webApp]);

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
          // Refresh products to update stock instantly
          fetchProducts(true);
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
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans select-none anim-fade-in transition-colors duration-200"
        style={{
          backgroundColor: 'var(--color-canvas)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div 
          className="w-16 h-16 rounded-3xl border flex items-center justify-center text-emerald-500 mb-4 anim-pop-in shadow-lg"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border-hover)',
          }}
        >
          <IconCheck className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-500 uppercase mb-1">
          TRANSACTION FULFILLED
        </span>
        <h2 className="text-xl font-bold tracking-tight mb-2">
          License Dispatched
        </h2>
        <p 
          className="text-xs max-w-xs mb-6 font-mono leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Credentials for <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{orderSuccess.productName}</span> have been sent to your Telegram chat.
        </p>

        <div 
          className="border rounded-2xl p-4 w-full max-w-xs mb-6 text-xs font-mono text-left space-y-2.5 anim-slide-up"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
            <span>ORDER_ID</span>
            <span className="font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>#{orderSuccess.orderId}</span>
          </div>
          <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
            <span>METHOD</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>TELEGRAM STARS</span>
          </div>
          <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
            <span>STATUS</span>
            <span className="text-emerald-500 font-bold">DELIVERED</span>
          </div>
        </div>

        <button
          onClick={() => {
            webApp?.HapticFeedback?.impactOccurred('light');
            setOrderSuccess(null);
          }}
          className="w-full max-w-xs py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider touch-press transition-all shadow-md cursor-pointer"
          style={{
            backgroundColor: 'var(--color-btn-bg)',
            color: 'var(--color-btn-text)',
          }}
        >
          Return to Index
        </button>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col font-sans antialiased transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text-primary)',
      }}
    >
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
        {loading && products.length === 0 && (
          <div className="px-4 py-4 flex flex-col gap-3 anim-fade-in">
            <div className="h-4 w-28 rounded-md skeleton-shimmer mb-1" />
            <div className="h-16 w-full rounded-full skeleton-shimmer" />
            <div className="h-16 w-full rounded-full skeleton-shimmer" />
            <div className="h-16 w-full rounded-full skeleton-shimmer" />
          </div>
        )}

        {error && products.length === 0 && (
          <div 
            className="m-4 p-5 rounded-2xl border text-center anim-slide-up"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <p className="text-xs font-mono mb-3" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
            <button
              onClick={() => fetchProducts(false)}
              className="px-4 py-2 text-xs font-mono font-bold rounded-lg transition-colors touch-press border cursor-pointer"
              style={{
                backgroundColor: 'var(--color-badge-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {products.length > 0 && (
          <>
            {!activeCategory && !searchQuery ? (
              <>
                <CategoryIndex
                  user={user}
                  categories={categories}
                  products={products}
                  onSelectCategory={handleSelectCategory}
                  onSelectAll={handleSelectAll}
                />
                <SupportSection webApp={webApp} />
              </>
            ) : (
              <>
                <ProductList
                  products={products}
                  onSelect={handleSelectProduct}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  onBackToIndex={handleBackToIndex}
                  searchQuery={searchQuery}
                />
                <SupportSection webApp={webApp} />
              </>
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
