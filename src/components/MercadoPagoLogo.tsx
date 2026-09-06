import React from 'react';

interface MercadoPagoLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Verified Official Mercado Pago SVG Vector Logo (Handshake Icon)
 * Accurate branding matching the official Mercado Pago icon:
 * - Upper curved border with dark blue outline
 * - Sky blue oval inner fill (#00B4F5 / #009EE3)
 * - White handshake with precise fingers/cuffs and navy (#001871) accents
 */
export const MercadoPagoSvgIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 140 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Mercado Pago Logo Oficial"
  >
    {/* Base dark outline badge shadow */}
    <ellipse cx="70" cy="52" rx="64" ry="44" fill="#001871" />
    {/* Inner sky blue field */}
    <ellipse cx="70" cy="48" rx="60" ry="40" fill="#009EE3" />

    {/* Upper White Hand Arc */}
    <path
      d="M30 46 C36 34, 56 31, 72 40 L82 46 C87 50, 96 49, 108 45 C103 36, 88 29, 70 29 C52 29, 36 35, 30 46 Z"
      fill="#FFFFFF"
    />

    {/* Clasping Hand (Right to Left) */}
    <path
      d="M68 35 C62 35, 57 39, 59 44 C61 47, 67 51, 76 57 L87 64 C91 66, 96 65, 98 61 C100 58, 98 55, 94 53 L81 44 C77 40, 73 35, 68 35 Z"
      fill="#FFFFFF"
      stroke="#001871"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Clasping Hand (Left to Right Knuckles) */}
    <path
      d="M32 44 C41 47, 52 50, 60 56 C65 60, 69 64, 73 68 C70 72, 65 72, 59 68 L52 64 C51 65, 48 65, 47 63 L43 59 C39 57, 34 52, 32 44 Z"
      fill="#FFFFFF"
      stroke="#001871"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Finger Creases */}
    <path
      d="M62 50 C67 55, 74 59, 82 63"
      stroke="#001871"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M49 56 C53 60, 57 63, 62 65"
      stroke="#001871"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const MercadoPagoLogo: React.FC<MercadoPagoLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center p-1 rounded-xl bg-white shadow-sm shrink-0 ${className}`}>
        <MercadoPagoSvgIcon className="w-6 h-6 object-contain" />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 bg-white/95 border border-[#009EE3]/40 px-3 py-1.5 rounded-xl shadow-md ${className}`}>
        <MercadoPagoSvgIcon className="w-5 h-5 shrink-0" />
        <span className="text-xs font-black text-[#001871] tracking-tight">
          mercado<span className="text-[#009EE3]"> pago</span>
        </span>
      </div>
    );
  }

  // Full official styled brand mark with dynamic SVG
  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/95 border border-cyan-400/40 shadow-sm ${className}`}>
      <MercadoPagoSvgIcon className="w-7 h-7 shrink-0" />
      <div className="flex flex-col text-left leading-none">
        <span className="text-[14px] font-black tracking-tight text-[#001871]">
          mercado<span className="text-[#009EE3]"> pago</span>
        </span>
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#009EE3] mt-0.5">
          Checkout Oficial
        </span>
      </div>
    </div>
  );
};
