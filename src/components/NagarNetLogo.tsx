import React from 'react';
import nagernetLogoImg from '../assets/images/nagernet_logo_1793901289370.jpg';

interface NagarNetLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  showBadge?: boolean;
  subtext?: string;
  className?: string;
  onClick?: () => void;
}

export const NAGERNET_LOGO_IMAGE_URL = nagernetLogoImg;

export const NagarNetLogo: React.FC<NagarNetLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = true,
  subtext = 'One City. One Platform. Every Problem Matters.',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7 rounded-lg',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-2xl',
    '2xl': 'w-32 h-32 rounded-3xl',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
    '2xl': 'text-4xl sm:text-5xl',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div
        className={`relative ${sizeClasses[size]} overflow-hidden shadow-md shadow-blue-500/25 border border-cyan-400/30 ring-1 ring-blue-500/30 bg-slate-950 shrink-0 group transition-all duration-300 hover:ring-cyan-400`}
      >
        <img
          src={nagernetLogoImg}
          alt="NagarNet Official Civic Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-300"
        />
        {/* Subtle high-tech ambient gloss overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {showText && (
        <div className="leading-tight shrink-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={`font-display-brand font-black text-slate-900 tracking-wide ${textSizes[size]}`}>
              Nagar<span className="text-blue-600">Net</span>
            </span>
            {showBadge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                Civic OS
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight whitespace-nowrap">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
