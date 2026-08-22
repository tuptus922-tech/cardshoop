import React from 'react';

export function IconSpotify({ className = "w-6 h-6", color = "#1DB954" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill={color} />
      <path
        d="M17.2 16.8c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.8-9.3-1-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 4.1-.9 7.5-.6 10.4 1.1.3.2.4.6.2.9zm1.3-2.9c-.3.4-.8.5-1.2.3-2.9-1.8-7.3-2.3-10.7-1.3-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.9-1.2 8.8-.6 12.1 1.4.4.1.5.7.3 1.1zm.1-3c-3.4-2-9.1-2.2-12.4-1.2-.5.2-1.1-.1-1.2-.6-.2-.5.1-1.1.6-1.2 3.8-1.2 10.1-.9 14.1 1.4.5.3.6.9.3 1.4-.3.4-.9.5-1.4.2z"
        fill="#09090b"
      />
    </svg>
  );
}

export function IconNetflix({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#09090b" />
      <path d="M5.5 3.5h3.2v17H5.5z" fill="#831010" />
      <path d="M15.3 3.5h3.2v17h-3.2z" fill="#831010" />
      <path d="M5.5 3.5h3.2l9.8 17h-3.2z" fill="#E50914" />
    </svg>
  );
}

export function IconYouTube({ className = "w-6 h-6", color = "#FF0000" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z"
        fill={color}
      />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#FFFFFF" />
    </svg>
  );
}

export function IconDiscord({ className = "w-6 h-6", color = "#5865F2" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill={color} />
      <path
        d="M17.4 6.8a12.8 12.8 0 00-3.2-1 .3.3 0 00-.3.1c-.2.3-.4.8-.5 1.1a12 12 0 00-3.6 0c-.2-.4-.4-.8-.6-1.1 0-.1-.2-.2-.3-.1a12.8 12.8 0 00-3.3 1 .3.3 0 00-.1.2C3.5 9.8 2.9 12.7 3.2 15.6a.4.4 0 00.1.2 12.9 12.9 0 004 2 .3.3 0 00.4-.1c.3-.4.6-.9.8-1.4 0-.1 0-.3-.2-.3a8.4 8.4 0 01-1.3-.6.3.3 0 010-.4c.1 0 .2-.1.3-.2a9.2 9.2 0 007.8 0c.1.1.2.1.3.2a.3.3 0 010 .4 8.5 8.5 0 01-1.3.6c-.2.1-.2.2-.2.4.3.5.5 1 .8 1.4 0 .1.2.2.4.1a12.8 12.8 0 004-2 .3.3 0 00.1-.2c.4-3.5-.6-6.4-2.5-9a.3.3 0 00-.2-.2zM8.5 13.7c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.6-1.4 1.6zm6.8 0c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.6-1.4 1.6z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function IconStar({ className = "w-4 h-4", color = "#F59E0B" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function IconArrowRight({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export function IconArrowLeft({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

export function IconClose({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function IconCheck({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function IconSearch({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

export function IconPackage({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}
