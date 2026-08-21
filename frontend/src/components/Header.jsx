import React from 'react';

export default function Header({ user }) {
  return (
    <header className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🛒</span>
        <div>
          <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--tg-theme-text-color)' }}>CardShoop</h1>
          <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Konta Premium</p>
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {user.first_name}
          </span>
        </div>
      )}
    </header>
  );
}
