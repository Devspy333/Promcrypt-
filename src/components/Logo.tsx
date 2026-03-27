import React from 'react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="screen-glare" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.1" />
          <stop offset="50%" stopColor="white" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Monitor Casing */}
      <rect x="20" y="30" width="160" height="130" rx="10" fill="#1a1a1a" stroke="currentColor" strokeWidth="4" />
      <rect x="30" y="40" width="140" height="110" rx="5" fill="#050505" />
      
      {/* Screen Glare */}
      <rect x="30" y="40" width="140" height="110" rx="5" fill="url(#screen-glare)" />

      {/* Monitor Stand */}
      <path d="M 80 160 L 120 160 L 130 180 L 70 180 Z" fill="#1a1a1a" stroke="currentColor" strokeWidth="4" />
      <line x1="60" y1="180" x2="140" y2="180" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

      {/* Glowing Elements inside Screen */}
      <g filter="url(#glow)" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {/* Padlock Body */}
        <rect x="75" y="90" width="50" height="40" rx="4" fill="currentColor" fillOpacity="0.2" />
        
        {/* Padlock Shackle */}
        <path d="M 85 90 V 75 A 15 15 0 0 1 115 75 V 90" />
        
        {/* Keyhole */}
        <circle cx="100" cy="105" r="4" fill="#050505" stroke="none" />
        <path d="M 98 108 L 96 118 L 104 118 L 102 108 Z" fill="#050505" stroke="none" />
        
        {/* Terminal Prompt */}
        <path d="M 40 55 L 50 65 L 40 75" strokeWidth="3" />
        <line x1="55" y1="75" x2="70" y2="75" strokeWidth="3" />
      </g>

      {/* Scanlines */}
      <g stroke="currentColor" strokeOpacity="0.1" strokeWidth="1">
        <line x1="30" y1="45" x2="170" y2="45" />
        <line x1="30" y1="55" x2="170" y2="55" />
        <line x1="30" y1="65" x2="170" y2="65" />
        <line x1="30" y1="75" x2="170" y2="75" />
        <line x1="30" y1="85" x2="170" y2="85" />
        <line x1="30" y1="95" x2="170" y2="95" />
        <line x1="30" y1="105" x2="170" y2="105" />
        <line x1="30" y1="115" x2="170" y2="115" />
        <line x1="30" y1="125" x2="170" y2="125" />
        <line x1="30" y1="135" x2="170" y2="135" />
        <line x1="30" y1="145" x2="170" y2="145" />
      </g>
    </svg>
  );
}
