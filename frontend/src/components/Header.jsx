import React from 'react';

export default function Header({ user, searchQuery, onSearchChange }) {
  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-20 px-4 pt-3 pb-3 glass-panel border-b border-slate-800">
      {/* Top row */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white">CardShoop</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Automatyczna wysyłka 24/7
            </p>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-full py-1 px-2.5 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {initial}
            </div>
            <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate">
              {user.first_name || user.username}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 rounded-full py-1 px-2.5 text-xs text-slate-400">
            <span>⭐</span>
            <span>Telegram Stars</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Szukaj subskrypcji (Spotify, Netflix, YouTube...)"
          className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </header>
  );
}
