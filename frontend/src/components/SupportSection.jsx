import React, { useEffect, useState } from 'react';
import { IconArrowRight } from './Icons.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'https://cardshoop.onrender.com/api';

export default function SupportSection({ webApp }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/support`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.admins)) {
          setAdmins(data.admins);
        }
      })
      .catch((err) => console.warn('Support fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenContact = (admin) => {
    const tg = window.Telegram?.WebApp || webApp;
    tg?.HapticFeedback?.impactOccurred('light');

    const cleanUsername = admin.username ? admin.username.replace(/^@+/, '') : null;
    const directUrl = cleanUsername ? `https://t.me/${cleanUsername}` : admin.telegramUrl || 'https://t.me/cardshoop_bot';

    if (tg?.openTelegramLink) {
      try {
        tg.openTelegramLink(directUrl);
        return;
      } catch (err) {
        console.warn('openTelegramLink error:', err);
      }
    }

    if (tg?.openLink) {
      try {
        tg.openLink(directUrl);
        return;
      } catch (err) {
        console.warn('openLink error:', err);
      }
    }

    window.open(directUrl, '_blank');
  };

  if (loading && admins.length === 0) return null;
  if (admins.length === 0) return null;

  return (
    <div className="px-4 pt-6 pb-12 max-w-md mx-auto anim-fade-in">
      {/* Section Divider & Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <span 
          className="text-[11px] font-mono uppercase tracking-widest font-semibold"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Direct Support
        </span>
        <span 
          className="text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1"
          style={{
            backgroundColor: 'var(--color-badge-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          TELEGRAM DIRECT
        </span>
      </div>

      {/* Admin Cards Grid with stagger animation */}
      <div className="flex flex-col gap-2.5">
        {admins.map((admin, idx) => {
          const initial = (admin.name || admin.username || 'A')[0].toUpperCase();
          const displayHandle = admin.username ? `@${admin.username}` : admin.name;

          return (
            <button
              key={admin.id}
              onClick={() => handleOpenContact(admin)}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                animationDelay: `${idx * 80}ms`,
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border hover:scale-[1.015] touch-press transition-all duration-200 group shadow-sm text-left cursor-pointer anim-slide-up hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                {/* Admin Avatar with gentle hover scale */}
                <div className="relative flex-shrink-0">
                  {admin.photoUrl ? (
                    <img
                      src={admin.photoUrl}
                      alt={admin.name}
                      className="w-10 h-10 rounded-full object-cover border shadow-sm group-hover:scale-105 transition-transform duration-200"
                      style={{ borderColor: 'var(--color-border)' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm font-mono border shadow-inner group-hover:scale-105 transition-transform duration-200"
                      style={{
                        backgroundColor: 'var(--color-icon-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {initial}
                    </div>
                  )}
                </div>

                {/* Name & Subtitle */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="text-xs font-bold font-mono tracking-tight group-hover:text-emerald-400 transition-colors duration-200"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {displayHandle}
                    </span>
                  </div>
                  <span 
                    className="text-[11px] font-mono mt-0.5 group-hover:opacity-90 transition-opacity"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Tap to message on Telegram
                  </span>
                </div>
              </div>

              {/* Action Trailing Arrow with slide on hover */}
              <div 
                className="w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 group-hover:translate-x-1 group-hover:scale-110 flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-icon-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <IconArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
