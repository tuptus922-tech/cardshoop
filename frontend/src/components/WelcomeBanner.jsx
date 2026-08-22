import React, { useState } from 'react';
import { IconClose, IconCheck } from './Icons.jsx';

export default function WelcomeBanner({ user }) {
  const [visible, setVisible] = useState(true);

  // Dynamiczny uzytkownik Telegrama, ktory w danej chwili otworzyl sklep
  const dynamicName = user?.first_name || (user?.username ? `@${user.username}` : 'Guest');

  if (!visible) return null;

  return (
    <div 
      className="mb-4 p-4 rounded-2xl border transition-all duration-200 anim-slide-up shadow-sm relative"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Top Row: Store Badge & Dismiss Trigger */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span 
            className="text-[10px] font-mono font-bold tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Digital License Store
          </span>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="w-5 h-5 rounded-full border flex items-center justify-center text-xs hover:opacity-75 transition-opacity touch-press cursor-pointer"
          style={{
            backgroundColor: 'var(--color-icon-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <IconClose className="w-3 h-3" />
        </button>
      </div>

      {/* Main Dynamic Welcome Heading */}
      <h3 
        className="text-sm font-bold tracking-tight mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Welcome, <span className="text-emerald-500">{dynamicName}</span>!
      </h3>
      <p 
        className="text-xs leading-relaxed font-normal mb-3"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Select a platform below to view available tiers. Payments are processed securely via <b>Telegram Stars</b> with instant delivery of login credentials directly to your chat.
      </p>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t text-[10px] font-mono" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
          <IconCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          <span className="truncate">1s Delivery</span>
        </div>
        <div className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
          <IconCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          <span className="truncate">Encrypted</span>
        </div>
        <div className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
          <IconCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          <span className="truncate">Stars Protocol</span>
        </div>
      </div>
    </div>
  );
}
