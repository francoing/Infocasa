import React from 'react';

export default function Logo({ className = "", size = "text-2xl", showDotCom = true }) {
  // Map text size classes to image height classes
  const heightClass = size.includes('text-3xl') ? 'h-10' : size.includes('text-xl') ? 'h-7' : 'h-8';
  
  return (
    <img 
      src="/img/Infocasa.png" 
      alt="Infocasa" 
      className={`object-contain ${heightClass} ${className}`}
      style={{ filter: 'none' }}
    />
  );
}
