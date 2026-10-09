import { useId } from 'react';

export default function BrandLogo({ className = '' }) {
  const gradientId = `brand-z-gradient-${useId().replace(/:/g, '')}`;
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="22" y1="35" x2="97" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#07B9F2" />
          <stop offset=".48" stopColor="#1355E9" />
          <stop offset="1" stopColor="#5016C8" />
        </linearGradient>
      </defs>
      <path d="M59 10C35 6 15 19 8 41c-4 12-3 24 1 33" stroke="#123BE8" strokeWidth="4" strokeLinecap="round" />
      <path d="M101 30c13 18 14 40 4 58" stroke="#123BE8" strokeWidth="4" strokeLinecap="round" />
      <path d="M36 108c18 8 39 5 54-7" stroke="#123BE8" strokeWidth="4" strokeLinecap="round" />
      <path d="M23 39c5-9 12-13 22-13h48L82 40H44l55 1c5 0 6 5 2 9L52 91h38c-5 9-12 13-22 13H27c-6 0-8-5-4-9l49-43H19c0-5 1-9 4-13Z" fill={`url(#${gradientId})`} />
      <path d="m29 33 8-7h17L44 39H26l3-6Z" fill="#19C9F5" />
      <path d="M26 88h7v7h-7zM19 95h7v7h-7zM26 102h7v7h-7zM33 95h7v7h-7z" fill="#3219D7" />
    </svg>
  );
}
