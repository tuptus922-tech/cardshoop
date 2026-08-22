import React from 'react';
import WelcomeBanner from './WelcomeBanner.jsx';
import { IconSpotify, IconNetflix, IconYouTube, IconDiscord, IconPackage } from './Icons.jsx';

const BRAND_META = {
  Spotify: {
    name: 'Spotify',
    subtext: 'Premium Music & Podcasts',
    tokenColor: '#1DB954',
    icon: <IconSpotify className="w-7 h-7" />,
  },
  Netflix: {
    name: 'Netflix',
    subtext: '4K Ultra HD & Spatial Audio',
    tokenColor: '#E50914',
    icon: <IconNetflix className="w-7 h-7" />,
  },
  YouTube: {
    name: 'YouTube',
    subtext: 'Ad-free & YouTube Music',
    tokenColor: '#FF0000',
    icon: <IconYouTube className="w-7 h-7" />,
  },
  Discord: {
    name: 'Discord',
    subtext: 'Nitro & Server Boosts',
    tokenColor: '#5865F2',
    icon: <IconDiscord className="w-7 h-7" />,
  },
};

export default function CategoryIndex({ user, categories, products, onSelectCategory, onSelectAll }) {
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="px-4 py-3 flex flex-col gap-3 max-w-md mx-auto anim-fade-in">
      {/* Onboarding Welcome Banner with Explanation */}
      <WelcomeBanner user={user} />

      {/* Index Masthead Title */}
      <div className="flex items-center justify-between px-1 mb-0.5">
        <span 
          className="text-[11px] font-mono uppercase tracking-widest font-semibold"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Platform Index
        </span>
        <button
          onClick={onSelectAll}
          className="text-[11px] font-mono uppercase tracking-wider hover:opacity-80 transition-opacity touch-press"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          View All ({products.length}) →
        </button>
      </div>

      {/* Brand Action Pills Stack */}
      {categories.map((cat, index) => {
        const meta = BRAND_META[cat] || {
          name: cat,
          subtext: 'Subscription License',
          tokenColor: '#71717a',
          icon: <IconPackage className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />,
        };
        const count = categoryCounts[cat] || 0;

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            style={{ 
              animationDelay: `${index * 50}ms`,
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
            className="w-full flex items-center justify-between px-5 py-4 rounded-full border hover:scale-[1.005] touch-press transition-all duration-150 group shadow-sm text-left anim-slide-up"
          >
            {/* Left Typography Anchor */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span 
                  className="text-base font-bold tracking-tight transition-colors"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {meta.name}
                </span>
                <span 
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border"
                  style={{ 
                    backgroundColor: 'var(--color-badge-bg)',
                    color: 'var(--color-text-muted)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {count} {count === 1 ? 'tier' : 'tiers'}
                </span>
              </div>
              <span 
                className="text-[11px] font-normal tracking-normal mt-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {meta.subtext}
              </span>
            </div>

            {/* Trailing Brand Emblem */}
            <div className="flex items-center gap-3 pl-3">
              <div 
                className="w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                style={{
                  backgroundColor: 'var(--color-icon-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {meta.icon}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
