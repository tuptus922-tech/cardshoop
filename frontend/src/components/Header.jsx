import React from 'react';
import { IconSearch, IconClose } from './Icons.jsx';

export default function Header({ user, searchQuery, onSearchChange, onLogoClick }) {
  const displayName = user
    ? user.username
      ? `@${user.username}`
      : `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
    : 'DIRECT ACCESS';

  const userInitial = user
    ? (user.first_name || user.username || 'U')[0].toUpperCase()
    : 'U';

  return (
    <header 
      className="sticky top-0 z-20 px-4 pt-3 pb-2.5 backdrop-blur-md border-b transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-header-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Masthead Row */}
      <div className="flex items-center justify-between mb-2.5">
        {/* Brand Anchor */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 text-left touch-press group"
        >
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center font-mono font-black text-xs transition-colors shadow-sm"
            style={{
              backgroundColor: 'var(--color-btn-bg)',
              color: 'var(--color-btn-text)',
            }}
          >
            C
          </div>
          <span 
            className="font-mono text-xs font-black tracking-widest uppercase transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
          >
            CARDSHOOP
          </span>
        </button>

        {/* User Profile Pill with Avatar & Name */}
        {user ? (
          <div 
            className="flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-sm transition-all anim-fade-in"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {user.photo_url ? (
              <img 
                src={user.photo_url} 
                alt={displayName} 
                className="w-5 h-5 rounded-full object-cover border"
                style={{ borderColor: 'var(--color-border)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase font-mono shadow-inner"
                style={{
                  backgroundColor: 'var(--color-btn-bg)',
                  color: 'var(--color-btn-text)',
                }}
              >
                {userInitial}
              </div>
            )}
            <span 
              className="text-xs font-semibold font-mono max-w-[130px] truncate leading-none"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {displayName}
            </span>
          </div>
        ) : (
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>DIRECT ACCESS</span>
          </div>
        )}
      </div>

      {/* Ultra-Minimal Search Input */}
      <div className="relative">
        <div 
          className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <IconSearch className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter tiers..."
          className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs font-mono border focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center hover:opacity-75"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <IconClose className="w-3 h-3" />
          </button>
        )}
      </div>
    </header>
  );
}
