import React from 'react';
import logoSrc from '../../assets/img/imagotipo-horitonzal-monocromatico.png';

export default function FooterLogo({ className = "", size = "text-2xl" }) {
  const heightClass = size.includes('text-3xl') ? 'h-10' : size.includes('text-xl') ? 'h-7' : 'h-24';

  return (
    <img
      src={logoSrc}
      alt="Infocasa"
      className={`object-contain ${heightClass} ${className}`}
      style={{ filter: 'brightness(0) invert(1)' }}
    />
  );
}
