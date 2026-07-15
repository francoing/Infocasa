import React from 'react';
import logoHome from '../../assets/img/imagotipo-horitonzal.png';

export default function Logo({ className = "" }) {
  return (
    <img
      src={logoHome}
      alt="Infocasa"
      className={`object-contain h-20 lg:h-28 ${className}`}
    />
  );
}
