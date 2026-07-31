"use client";

import React from 'react';

interface BylinesLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function BylinesLogo({ className = "", size = 32, showText = true }: BylinesLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Vector Logo Icon */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 hover:scale-105 transition-transform duration-300"
      >
        <defs>
          <linearGradient id="bg-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a"/>
            <stop offset="100%" stopColor="#020617"/>
          </linearGradient>

          <linearGradient id="gold-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#d97706"/>
          </linearGradient>

          <linearGradient id="indigo-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8"/>
            <stop offset="100%" stopColor="#4f46e5"/>
          </linearGradient>

          <filter id="glow-comp" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <rect width="120" height="120" rx="30" fill="url(#bg-grad-comp)" stroke="#1e293b" strokeWidth="2"/>
        <rect x="6" y="6" width="108" height="108" rx="24" stroke="url(#indigo-grad-comp)" strokeWidth="1.5" strokeOpacity="0.4"/>

        <g transform="translate(24, 22)">
          <rect x="14" y="10" width="8" height="56" rx="4" fill="url(#gold-grad-comp)"/>
          <path d="M 22 10 H 42 C 54 10 60 17 60 25 C 60 33 54 40 42 40 H 22 V 10 Z" 
                fill="none" stroke="url(#gold-grad-comp)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 22 40 H 46 C 58 40 65 47 65 56 C 65 65 58 72 46 72 H 22 V 40 Z" 
                fill="none" stroke="url(#gold-grad-comp)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 6 28 L -4 38 L 6 48" 
                fill="none" stroke="url(#indigo-grad-comp)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-comp)"/>
          <path d="M 66 28 L 76 38 L 66 48" 
                fill="none" stroke="url(#indigo-grad-comp)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-comp)"/>
          <circle cx="28" cy="40" r="3.5" fill="#ffffff"/>
        </g>
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex items-center tracking-tight font-extrabold uppercase font-sans">
          <span className="text-neutral-900 dark:text-neutral-50 text-base sm:text-lg">Bylines</span>
          <span className="text-editorial-accent dark:text-editorial-gold text-base sm:text-lg">.dev</span>
        </div>
      )}
    </div>
  );
}
