import React from 'react';
import { IconSearch, IconClose } from './Icons.jsx';

export default function Header({ user, searchQuery, onSearchChange, onLogoClick }) {
  return (
    <header className="sticky top-0 z-20 px-4 pt-3 pb-2.5 bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.06]">
      {/* Masthead Row */}
      <div className="flex items-center justify-between mb-2">
        {/* Brand Anchor */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 text-left touch-press group"
        >
          <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-950 font-mono font-black text-xs">
            C
          </div>
          <span className="font-mono text-xs font-black tracking-widest text-zinc-100 uppercase group-hover:text-white">
            CARDSHOOP
          </span>
        </button>

        {/* User Badge / Status Pill */}
        {user ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141417] border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] font-mono font-medium text-zinc-300 max-w-[100px] truncate">
              {user.first_name || user.username}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#141417] border border-white/[0.06] text-[10px] font-mono text-zinc-400">
            <span>DIRECT ACCESS</span>
          </div>
        )}
      </div>

      {/* Ultra-Minimal Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
          <IconSearch className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter tiers..."
          className="w-full pl-8 pr-7 py-1.5 bg-[#121215] border border-white/[0.06] rounded-lg text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-zinc-200"
          >
            <IconClose className="w-3 h-3" />
          </button>
        )}
      </div>
    </header>
  );
}
