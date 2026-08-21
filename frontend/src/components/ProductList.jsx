import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard.jsx';

const ALL = 'Wszystkie';

const CATEGORY_LOGOS = {
  Spotify: '/assets/spotify.svg',
  Netflix: '/assets/netflix.svg',
  YouTube: '/assets/youtube.svg',
  Discord: '/assets/discord.svg',
};

export default function ProductList({ products, onSelect, searchQuery }) {
  const [activeCategory, setActiveCategory] = useState(ALL);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return [ALL, ...unique];
  }, [products]);

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
      {/* Guarantee banners with clean SVG icons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass-card p-2.5 rounded-xl text-center flex flex-col items-center">
          <div className="w-5 h-5 mb-1 text-amber-400 flex items-center justify-center">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-slate-200">Dostawa 1s</span>
          <span className="text-[9px] text-slate-400">Automat w bocie</span>
        </div>

        <div className="glass-card p-2.5 rounded-xl text-center flex flex-col items-center">
          <div className="w-5 h-5 mb-1 flex items-center justify-center">
            <img src="/assets/stars.svg" alt="Stars" className="w-4 h-4 object-contain" />
          </div>
          <span className="text-[10px] font-bold text-slate-200">Telegram Stars</span>
          <span className="text-[9px] text-slate-400">Oficjalna płatność</span>
        </div>

        <div className="glass-card p-2.5 rounded-xl text-center flex flex-col items-center">
          <div className="w-5 h-5 mb-1 text-blue-400 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-slate-200">Gwarancja</span>
          <span className="text-[9px] text-slate-400">Wsparcie 24/7</span>
        </div>
      </div>

      {/* Categories horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const logo = CATEGORY_LOGOS[cat];
          const count = cat === ALL ? products.length : products.filter((p) => p.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat === ALL ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : logo ? (
                <img src={logo} alt={cat} className="w-3.5 h-3.5 object-contain" />
              ) : (
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              )}
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
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-sm text-slate-200 mb-1">Brak produktów</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
            {searchQuery
              ? `Nie znaleziono produktów dla frazy "${searchQuery}".`
              : 'Aktualnie brak dostępnych ofert w tej kategorii.'}
          </p>
          {(searchQuery || activeCategory !== ALL) && (
            <button
              onClick={() => setActiveCategory(ALL)}
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
