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
    webApp?.HapticFeedback?.impactOccurred('light');
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(admin.telegramUrl);
    } else {
      window.open(admin.telegramUrl, '_blank');
    }
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
          Direct Support & Help
        </span>
        <span 
          className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
          style={{
            backgroundColor: 'var(--color-badge-bg)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          24/7 ASSISTANCE
        </span>
      </div>

      {/* Admin Cards Grid */}
      <div className="flex flex-col gap-2.5">
        {admins.map((admin) => {
          const initial = (admin.name || admin.username || 'A')[0].toUpperCase();
          const displayHandle = admin.username ? `@${admin.username}` : admin.name;

          return (
            <button
              key={admin.id}
              onClick={() => handleOpenContact(admin)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border hover:scale-[1.01] touch-press transition-all duration-150 group shadow-sm text-left"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Admin Avatar */}
                <div className="relative flex-shrink-0">
                  {admin.photoUrl ? (
                    <img
                      src={admin.photoUrl}
                      alt={admin.name}
                      className="w-10 h-10 rounded-full object-cover border shadow-sm"
                      style={{ borderColor: 'var(--color-border)' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm font-mono border shadow-inner"
                      style={{
                        backgroundColor: 'var(--color-icon-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {initial}
                    </div>
                  )}
                  {/* Online Dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#09090b]"></span>
                </div>

                {/* Name & Role */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="text-xs font-bold font-mono tracking-tight group-hover:underline"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {displayHandle}
                    </span>
                  </div>
                  <span 
                    className="text-[11px] font-mono mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Official Administrator
                  </span>
                </div>
              </div>

              {/* Action Trailing Arrow */}
              <div 
                className="w-7 h-7 rounded-full border flex items-center justify-center transition-colors group-hover:scale-105 flex-shrink-0"
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
