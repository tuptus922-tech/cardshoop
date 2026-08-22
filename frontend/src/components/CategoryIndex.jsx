import React from 'react';
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

export default function CategoryIndex({ categories, products, onSelectCategory, onSelectAll }) {
  // Count items per category
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="px-4 py-4 flex flex-col gap-3.5 max-w-md mx-auto">
      {/* Index Masthead Title */}
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
          Platform Index
        </span>
        <button
          onClick={onSelectAll}
          className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          View All ({products.length}) →
        </button>
      </div>

      {/* Brand Action Pills Stack (16px row rhythm) */}
      {categories.map((cat) => {
        const meta = BRAND_META[cat] || {
          name: cat,
          subtext: 'Subscription License',
          tokenColor: '#71717a',
          icon: <IconPackage className="w-6 h-6 text-zinc-400" />,
        };
        const count = categoryCounts[cat] || 0;

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-full bg-[#121215] border border-white/[0.08] hover:border-white/[0.16] hover:bg-[#18181c] touch-press transition-all duration-100 group shadow-sm text-left"
          >
            {/* Left Typography Anchor */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-zinc-100 group-hover:text-white">
                  {meta.name}
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.04]">
                  {count} {count === 1 ? 'tier' : 'tiers'}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-normal tracking-normal mt-0.5">
                {meta.subtext}
              </span>
            </div>

            {/* Trailing Brand Emblem */}
            <div className="flex items-center gap-3 pl-3">
              <div className="w-9 h-9 rounded-full bg-[#09090b] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                {meta.icon}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
