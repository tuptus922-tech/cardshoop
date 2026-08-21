import React, { useState } from 'react';
import ProductCard from './ProductCard.jsx';

const ALL = 'Wszystkie';

export default function ProductList({ products, onSelect }) {
  const categories = [ALL, ...new Set(products.map((p) => p.category))];
  const [activeCategory, setActiveCategory] = useState(ALL);

  const filtered = activeCategory === ALL
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="px-4 pb-6">
      {/* Filtry kategorii */}
      <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: activeCategory === cat ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
              color: activeCategory === cat ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-hint-color)',
            }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid produktow */}
      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--tg-theme-hint-color)' }}>
          Brak produktow w tej kategorii
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
