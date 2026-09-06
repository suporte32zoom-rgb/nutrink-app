import React from 'react';

interface NutrinKLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  withGlow?: boolean;
  className?: string;
}

export const NutrinKLogo: React.FC<NutrinKLogoProps> = ({
  size = 'md',
  showText = true,
  withGlow = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { iconSize: 24, textSize: 'text-base', gap: 'gap-2', iconClass: 'w-6 h-6' },
    md: { iconSize: 32, textSize: 'text-base sm:text-xl', gap: 'gap-2 sm:gap-2.5', iconClass: 'w-6 h-6 sm:w-8 sm:h-8' },
    lg: { iconSize: 48, textSize: 'text-3xl', gap: 'gap-3.5', iconClass: 'w-12 h-12' },
    xl: { iconSize: 72, textSize: 'text-5xl', gap: 'gap-4', iconClass: 'w-[72px] h-[72px]' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${currentSize.gap} select-none ${className}`}>
      {/* Monogram NK SVG */}
      <div className={`relative flex items-center justify-center shrink-0 flex-shrink-0 ${withGlow ? 'filter drop-shadow-[0_0_14px_rgba(217,70,239,0.85)]' : ''}`}>
        <svg
          width={currentSize.iconSize}
          height={currentSize.iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${currentSize.iconClass} transition-transform duration-300 hover:scale-105 shrink-0 flex-shrink-0`}
        >
          {/* Neon Gradient Definition */}
          <defs>
            <linearGradient id="nk-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FAF5FF" />
              <stop offset="100%" stopColor="#EDE9FE" />
            </linearGradient>
            <linearGradient id="nk-neon-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#E879F9" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>

          {/* Left Vertical Bar of N */}
          <path
            d="M 16 22 
               C 16 16, 26 16, 26 22 
               L 26 78 
               C 26 84, 16 84, 16 78 
               Z"
            fill="url(#nk-white-grad)"
          />

          {/* Diagonal ribbon of N extending upward into K */}
          <path
            d="M 26 22 
               L 49 66 
               L 49 22 
               C 49 16, 57 16, 57 22 
               L 57 78 
               C 57 84, 49 84, 49 78 
               L 26 34 
               Z"
            fill="url(#nk-white-grad)"
          />

          {/* Upper Diagonal Arm of K */}
          <path
            d="M 49 46 
               L 77 18 
               C 82 13, 89 19, 85 25 
               L 60 52 
               Z"
            fill="url(#nk-white-grad)"
          />

          {/* Lower Diagonal Leg of K */}
          <path
            d="M 54 48 
               L 83 78 
               C 88 83, 80 90, 74 86 
               L 46 56 
               Z"
            fill="url(#nk-white-grad)"
          />
        </svg>
      </div>

      {/* Brand Text: Nutrink */}
      {showText && (
        <span
          className={`font-black tracking-tight text-white ${currentSize.textSize} ${
            withGlow ? 'drop-shadow-[0_0_12px_rgba(217,70,239,0.7)]' : ''
          }`}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Nutrink
        </span>
      )}
    </div>
  );
};

export const NutrinKBanner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div 
    className={`rounded-2xl p-6 text-center text-white shadow-xl ${className}`}
    style={{
      background: 'linear-gradient(135deg, #45147C 0%, #620EAB 50%, #440974 100%)'
    }}
  >
    <img 
      src="https://i.ibb.co/6y40Fbd/nutrink-logo.png" 
      alt="NutrinK Logo" 
      className="w-40 mx-auto mb-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" 
    />
    <h2 className="text-[#15DEC0] font-black text-xl tracking-wide uppercase m-0">
      NUTRINK AI ECOSYSTEM
    </h2>
    <p className="text-[#1AD1BB] text-xs font-medium mt-1 mb-0">
      Tecnologia e Inteligência em Nutrição
    </p>
  </div>
);
