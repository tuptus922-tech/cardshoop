import React, { useMemo } from 'react';
import ProductCard from './ProductCard.jsx';
import { IconArrowLeft, IconSearch } from './Icons.jsx';

export default function ProductList({
  products,
  onSelect,
  activeCategory,
  onBackToIndex,
  searchQuery,
}) {
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = !activeCategory || activeCategory === 'Wszystkie' || product.category === activeCategory;
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
    <div className="px-4 pb-12 pt-2 max-w-2xl mx-auto anim-fade-in">
      {/* Category Header & Breadcrumb */}
      <div className="flex items-center justify-between mb-4 px-0.5">
        <div className="flex items-center gap-2.5">
          {onBackToIndex && (
            <button
              onClick={onBackToIndex}
              className="w-7 h-7 rounded-full border flex items-center justify-center touch-press transition-colors"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <IconArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div>
            <h2 
              className="text-sm font-bold tracking-tight uppercase font-mono transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {activeCategory ? activeCategory : 'Tier Matrix'}
            </h2>
          </div>
        </div>

        <span 
          className="text-[11px] font-mono"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {filteredProducts.length} {filteredProducts.length === 1 ? 'tier' : 'tiers'}
        </span>
      </div>

      {/* Strict 2-Column Symmetric Grid with 12px gutters */}
      {filteredProducts.length === 0 ? (
        <div 
          className="swiss-card p-10 text-center my-6 flex flex-col items-center justify-center anim-fade-in"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div 
            className="w-10 h-10 rounded-full border flex items-center justify-center mb-3"
            style={{
              backgroundColor: 'var(--color-badge-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <IconSearch className="w-5 h-5" />
          </div>
          <span 
            className="text-xs font-bold mb-1 font-mono uppercase tracking-wider"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            No Tiers Found
          </span>
          <p 
            className="text-[11px] max-w-xs mb-4"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {searchQuery
              ? `No subscription matching "${searchQuery}".`
              : 'No available licenses currently in stock for this platform.'}
          </p>
          {onBackToIndex && (
            <button
              onClick={onBackToIndex}
              className="px-4 py-2 rounded-full text-xs font-semibold touch-press transition-colors border"
              style={{
                backgroundColor: 'var(--color-badge-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              Return to Platform Index
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} onSelect={onSelect} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
