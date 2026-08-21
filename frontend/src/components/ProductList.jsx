import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard.jsx';

const ALL = 'Wszystkie';

const CATEGORY_ICONS = {
  Wszystkie: '🔥',
  Spotify: '🎵',
  Netflix: '🎬',
  YouTube: '📺',
  Discord: '💬',
};

export default function ProductList({ products, onSelect, searchQuery }) {
  const [activeCategory, setActiveCategory] = useState(ALL);

  // Get distinct categories
  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return [ALL, ...unique];
  }, [products]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === ALL || product.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        product.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="px-4 pb-12 pt-2">
      {/* Guarantee banners */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass-card p-2 rounded-xl text-center flex flex-col items-center">
          <span className="text-base mb-0.5">⚡</span>
          <span className="text-[10px] font-bold text-slate-200">Dostawa 1s</span>
          <span className="text-[9px] text-slate-400">Automat w bocie</span>
        </div>
        <div className="glass-card p-2 rounded-xl text-center flex flex-col items-center">
          <span className="text-base mb-0.5">⭐</span>
          <span className="text-[10px] font-bold text-slate-200">Telegram Stars</span>
          <span className="text-[9px] text-slate-400">Bezpieczna płatność</span>
        </div>
        <div className="glass-card p-2 rounded-xl text-center flex flex-col items-center">
          <span className="text-base mb-0.5">🛡️</span>
          <span className="text-[10px] font-bold text-slate-200">Gwarancja</span>
          <span className="text-[9px] text-slate-400">Wsparcie 24/7</span>
        </div>
      </div>

      {/* Categories horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const icon = CATEGORY_ICONS[cat] || '📦';
          const count = cat === ALL ? products.length : products.filter((p) => p.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{icon}</span>
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of products */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center my-6">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-bold text-sm text-slate-200 mb-1">Brak produktów</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
            {searchQuery
              ? `Nie znaleziono produktów dla frazy "${searchQuery}".`
              : 'Aktualnie brak dostępnych ofert w tej kategorii.'}
          </p>
          {(searchQuery || activeCategory !== ALL) && (
            <button
              onClick={() => {
                setActiveCategory(ALL);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Pokaż wszystkie produkty
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
